import pg from "pg";
import fs from "fs";
import stream from "stream/promises";
import AdmZip from "adm-zip";
import { exec } from "child_process";
import os from "os";
import { join } from "node:path";
import { tmpdir } from "node:os";

export async function downloadZipToPostgresql(
  conn: pg.PoolClient,
  prefix: string,
  url: string,
  connectionString: string,
  key: string = prefix,
) {
  const existingSchemas = (
    await conn.query(
      "select schema_name from information_schema.schemata where schema_name like $1",
      [prefix + "%"],
    )
  ).rows.map((r) => r.schema_name);
  const { rows } = await conn.query(
    "select * from sysadm.downloads where key = $1 and lastLoad is not null",
    [key],
  );
  if (rows.length > 1) throw Error("whops!");

  await conn.query(
    "insert into sysadm.downloads (key) values ($1) on conflict do nothing",
    [key],
  );
  const tmpDir = fs.mkdtempSync(join(tmpdir(), "load-" + key));
  const file = `${tmpDir}/${key}.zip`;
  const etag = rows[0]?.etag;
  console.log(`Downloading ${file} with etag ${etag}`);
  const res = await fetch(url, { headers: { "If-None-Match": etag } });
  if (res.status === 304) {
    console.log(`${file} is up-to-date: ${url}`);
    return false;
  }
  if (!res.ok) {
    throw Error(`Failed to download ${url}: ${res.status}`);
  }
  await stream.pipeline(
    res.body!,
    fs.createWriteStream(file, { autoClose: true }),
  );
  for (const schema of existingSchemas) {
    console.log(`drop schema ${schema} cascade`);
    await conn.query(`drop schema ${schema} cascade`);
  }
  await conn.query(
    "update sysadm.downloads set etag = $2, lastdownload = $3 where key = $1",
    [key, res.headers.get("etag"), new Date()],
  );

  const zipFile = new AdmZip(file);
  const result: Promise<unknown>[] = [];
  zipFile.forEach((entry) => {
    console.log(file + ": " + entry.entryName);
    zipFile.extractEntryTo(entry, `${tmpDir}`);
    const command =
      os.platform() === "win32"
        ? `cmd /c "docker exec -i kws2100 /usr/bin/psql --user postgres < ${tmpDir}/${entry.entryName}"`
        : `/usr/bin/psql ${connectionString} < ${tmpDir}/${entry.entryName}`;
    console.log("executing " + command);
    const proc = exec(command);
    proc.stdout?.on("data", (data) => console.log(data));
    const promise = new Promise<void>((resolve, reject) => {
      proc.on("exit", (exitCode) => {
        fs.unlinkSync(`${tmpDir}/${entry.entryName}`);
        if (exitCode === 0) return resolve();
        reject(new Error("psql failed with " + exitCode));
      });
    });
    result.push(promise);
  });
  await Promise.all(result);
  await conn.query(
    "update sysadm.downloads set lastLoad = now() where key = $1",
    [key],
  );
  fs.unlinkSync(file);
  return true;
}
export async function setupSysadm(conn: pg.PoolClient) {
  // language=PostgreSQL
  await conn.query(
    `
      create extension if not exists postgis;

      create schema if not exists sysadm;
      create table if not exists sysadm.downloads
      (
        key           varchar primary key,
        etag          varchar,
        lastDownload  timestamp,
        lastLoad      timestamp,
        lastTransform timestamp
      );

      create schema if not exists staging;
    `,
  );
}

export async function getSchemaName(conn: pg.PoolClient, prefix: string) {
  const { rows } = await conn.query(
    `select schema_name from information_schema.schemata where schema_name like $1`,
    [prefix + "%"],
  );
  if (rows.length !== 1) {
    throw Error(`${rows.length} schemas matching ${prefix}%`);
  }
  return rows[0].schema_name;
}
