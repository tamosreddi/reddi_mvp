import ProductDetailView from "@/components/inventario/product-detail-view";

// Define el tipo como Promise
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params; // Resuelve la Promise
  return <ProductDetailView productId={id} />;
}
