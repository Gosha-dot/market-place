import ProductCard from '@/components/ProductCard';

export default function ProductGrid({ products, onAdd }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} onAdd={onAdd} />
      ))}
    </div>
  );
}
