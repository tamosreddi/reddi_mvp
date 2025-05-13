import ProductDetailView from "@/components/inventario/product-detail-view"

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return <ProductDetailView productId={params.id} />
}
