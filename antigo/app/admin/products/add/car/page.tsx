import ProductForm from "@/components/admin/product-form"

export default function AddCarPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Add Car Miniature</h1>
      <ProductForm category="cars" title="Add New Car Miniature" />
    </div>
  )
}
