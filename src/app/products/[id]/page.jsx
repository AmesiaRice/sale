import ProductDetailPage from "@/components/ProductDetailPage";

export default async function Page({ params }) {
  const { id } = await params;
  return <ProductDetailPage productId={id} />;
}