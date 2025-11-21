// apps/studio/app/products/page.tsx
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const products = [
    { id: "1", sku: "TIDE-110G", name: "Tide 110g", price: 2.50, unit: "pc", brand: "Tide", vendor: "Iffco" },
    { id: "2", sku: "MASAFI-200TK", name: "Masafi Tissues 200s", price: 6.50, unit: "pc", brand: "Masafi", vendor: "GASJ" },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}