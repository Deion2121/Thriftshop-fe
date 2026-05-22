import { useState } from "react";

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    subCategory: "",
    price: "",
    sizes: "",
    image: "",
  });
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  return (
    <form className="space-y-4 bg-white p-6 rounded-xl border border-gray-200">
      <h1 className="text-xl font-bold">Add Product</h1>

      {["name", "brand", "category", "subCategory", "price", "sizes"].map((field) => (
        <input
          key={field}
          name={field}
          type={field === "price" ? "number" : "text"}
          value={formData[field]}
          onChange={handleChange}
          placeholder={field === "sizes" ? "sizes (S, M, L, XL)" : field}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      ))}

      <input type="file" accept="image/*" onChange={handleImageChange} />

      {preview && (
        <img
          src={preview}
          alt="Product preview"
          className="h-32 w-32 rounded-lg object-contain"
        />
      )}
    </form>
  );
}
