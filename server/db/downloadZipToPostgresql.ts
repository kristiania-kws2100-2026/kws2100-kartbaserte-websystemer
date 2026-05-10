import pg from "pg";
import fs from "fs";
import stream from "stream/promises";
import AdmZip from "adm-zip";
import { exec } from "child_process";
import os from "os";
export async function downloadZipToPostgresql(
  conn: pg.PoolClient,
  prefix: string,
  url: string,
  connectionString: string,
) {
  const existingSchemas = (
    await conn.query(
      "select schema_name from information_schema.schemata where schema_name like $1",
      [prefix + "%"],
    )
  ).rows.map((r) => r.schema_name);
  if (existingSchemas.length === 0) {
    await conn.query("delete from sysadm.downloads where key = $1", [prefix]);
  }

  const { rows } = await conn.query(
    "select * from sysadm.downloads where key = $1 and lastLoad is not null",
    [prefix],
  );
  if (rows.length > 1) throw Error("whops!");

  const file = `./tmp/${prefix}.zip`;
  console.log(`Downloading ${file}`);
  const res = await fetch(url, { headers: { "If-None-Match": rows[0]?.etag } });
  if (res.status === 304) {
    console.log(`${file} is up-to-date: ${url}`);
    return false;
  }
  if (!res.ok) {
    throw Error(`Failed to download ${url}: ${res.status}`);
  }
  if (!fs.existsSync("./tmp")) fs.mkdirSync("./tmp");
  await stream.pipeline(
    res.body!,
    fs.createWriteStream(file, { autoClose: true }),
  );
  for (const schema of existingSchemas) {
    console.log(`drop schema ${schema} cascade`);
    await conn.query(`drop schema ${schema} cascade`);
  }
  await conn.query("delete from sysadm.downloads where key = $1", [prefix]);
  await conn.query(
    "insert into sysadm.downloads (key, etag, lastdownload) values ($1, $2, $3)",
    [prefix, res.headers.get("etag"), new Date()],
  );

  const zipFile = new AdmZip(file);
  const result: Promise<unknown>[] = [];
  zipFile.forEach((entry) => {
    console.log(file + ": " + entry.entryName);
    zipFile.extractEntryTo(entry, "./tmp/.");
    const command =
      os.platform() === "win32"
        ? `cmd /c "docker exec -i kws2100 /usr/bin/psql --user postgres < ./tmp/${entry.entryName}"`
        : `/usr/bin/psql ${connectionString} < ./tmp/${entry.entryName}`;
    console.log("executing " + command);
    const proc = exec(command);
    proc.stdout?.on("data", (data) => console.log(data));
    const promise = new Promise<void>((resolve, reject) => {
      proc.on("exit", (exitCode) => {
        fs.unlinkSync(`./tmp/${entry.entryName}`);
        if (exitCode === 0) return resolve();
        reject(new Error("psql failed with " + exitCode));
      });
    });
    result.push(promise);
  });
  await Promise.all(result);
  await conn.query(
    "update sysadm.downloads set lastLoad = now() where key = $1",
    [prefix],
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
