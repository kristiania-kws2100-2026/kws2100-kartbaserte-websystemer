import React, { type ReactNode, useContext, useState } from "react";
import {
  LanguageContext,
  LanguageContextProvider,
} from "./languageContextProvider.js";

function ProductCategoryRow({ category }: { category: string }) {
  return (
    <tr>
      <th colSpan={2}>{category}</th>
    </tr>
  );
}

function ProductRow({ product }: { product: Product }) {
  const name = product.stocked ? (
    product.name
  ) : (
    <span style={{ color: "red" }}>{product.name}</span>
  );

  return (
    <tr>
      <td>{name}</td>
      <td>{product.price}</td>
    </tr>
  );
}

function ProductTable({
  products,
  filterText,
  onlyShowInStock,
}: {
  products: Product[];
  filterText: string;
  onlyShowInStock?: boolean;
}) {
  const { applicationText } = useContext(LanguageContext);
  const rows: ReactNode[] = [];
  let lastCategory: ReactNode = null;

  products.forEach((product) => {
    if (product.name.indexOf(filterText) === -1) return;
    if (onlyShowInStock && !product.stocked) return;
    if (product.category !== lastCategory) {
      rows.push(
        <ProductCategoryRow
          category={product.category}
          key={product.category}
        />,
      );
    }
    rows.push(<ProductRow product={product} key={product.name} />);
    lastCategory = product.category;
  });

  return (
    <table>
      <thead>
        <tr>
          <th>{applicationText.productTableNameHeader}</th>
          <th>{applicationText.productTablePriceHeader}</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function SearchBar({
  filterText,
  onFilterTextChange,
  onlyShowInStock,
  onOnlyShowInStockChange,
}: {
  filterText: string;
  onFilterTextChange(s: string): void;
  onlyShowInStock?: boolean;
  onOnlyShowInStockChange: (value: boolean) => void;
}) {
  const { language, applicationText } = useContext(LanguageContext);
  return (
    <form>
      <input
        type="text"
        placeholder={applicationText.searchInputPlaceholder}
        value={filterText}
        onChange={(e) => onFilterTextChange(e.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={onlyShowInStock}
          onChange={(e) => onOnlyShowInStockChange(e.target.checked)}
        />{" "}
        {applicationText.onlyShowInStockLabel}
      </label>
    </form>
  );
}

function FilterableProductTable({ products }: { products: Product[] }) {
  const [filterText, setFilterText] = useState("");
  const [onlyShowInStock, setOnlyShowInStock] = useState(false);
  return (
    <div>
      <SearchBar
        filterText={filterText}
        onFilterTextChange={setFilterText}
        onlyShowInStock={onlyShowInStock}
        onOnlyShowInStockChange={setOnlyShowInStock}
      />
      <ProductTable
        products={products}
        filterText={filterText}
        onlyShowInStock={onlyShowInStock}
      />
    </div>
  );
}

const PRODUCTS = [
  { category: "Fruits", price: "$1", stocked: true, name: "Apple" },
  { category: "Fruits", price: "$1", stocked: true, name: "Dragonfruit" },
  { category: "Fruits", price: "$2", stocked: false, name: "Passionfruit" },
  { category: "Vegetables", price: "$2", stocked: true, name: "Spinach" },
  { category: "Vegetables", price: "$4", stocked: false, name: "Pumpkin" },
  { category: "Vegetables", price: "$1", stocked: true, name: "Peas" },
];
type Product = (typeof PRODUCTS)[number];

export default function App() {
  return (
    <LanguageContextProvider>
      <FilterableProductTable products={PRODUCTS} />
    </LanguageContextProvider>
  );
}
