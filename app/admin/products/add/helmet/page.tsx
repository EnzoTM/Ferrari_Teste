import ProductForm from "@/components/admin/product-form"

export default function AddHelmetPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Add Helmet Miniature</h1>
      <ProductForm category="helmets" title="Add New Helmet Miniature" />
    </div>
  )
}
