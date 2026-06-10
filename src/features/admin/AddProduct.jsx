import { useState } from "react";

// Category data from header component
const CATEGORY_DATA = {
  Men: {
    Clothing: ["T-Shirts", "Hoodies", "Pants", "Jackets", "Tracksuits"],
    Shoes: ["Lifestyle", "Running", "Basketball", "Training"],
    Accessories: ["Bags", "Caps", "Socks", "Watches"],
  },
  Women: {
    Clothing: ["Tops", "Dresses", "Leggings", "Outerwear", "Skirts"],
    Shoes: ["Lifestyle", "Running", "Training", "Sandals"],
    Accessories: ["Handbags", "Jewelry", "Socks", "Headwear"],
  },
  Kids: {
    Clothing: ["T-Shirts", "Sets", "Jackets", "Pants"],
    Shoes: ["Lifestyle", "Running", "Sandals"],
  },
  Shoes: {
    Categories: ["Lifestyle", "Running", "Basketball", "Training", "Football", "Skateboarding"],
    Brands: ["Nike", "Adidas", "New Balance", "Vans", "Converse"],
  },
  Sale: {
    Offers: ["Clearance", "Last Chance", "Seasonal Sale", "Flash Sale"],
    Discounts: ["20% Off", "30% Off", "50% Off"],
  },
};

// Extract all subcategories from CATEGORY_DATA
const getSubCategoriesByCategory = (category) => {
  if (!category) return [];
  const catObj = CATEGORY_DATA[category];
  if (!catObj) return [];
  let subs = [];
  Object.keys(catObj).forEach(key => {
    if (key === 'Brands') return;
    const val = catObj[key];
    if (Array.isArray(val)) {
      subs = subs.concat(val);
    }
  });
  // Remove duplicates and sort alphabetically
  return [...new Set(subs)].sort();
};

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    subCategory: "",
    price: "",
    sizes: "",
    image: "",
    isFeatured: false, // Checkbox for featured product
  });
  const [preview, setPreview] = useState(null);
  const availableSubCategories = getSubCategoriesByCategory(formData.category);

   const handleChange = (e) => {
     const { name, value, type, checked } = e.target;
     // Handle category change to reset subcategory
     if (name === "category") {
       setFormData(prev => ({
         ...prev,
         category: value,
         subCategory: ""
       }));
     } else if (type === "checkbox") {
       setFormData(prev => ({
         ...prev,
         [name]: checked
       }));
     } else {
       setFormData(prev => ({
         ...prev,
         [name]: value
       }));
     }
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

      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Product name"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Brand</label>
        <input
          name="brand"
          type="text"
          value={formData.brand}
          onChange={handleChange}
          placeholder="Brand"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <input
          name="category"
          type="text"
          value={formData.category}
          onChange={handleChange}
          placeholder="Category"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

       <div>
         <label className="block text-sm font-medium mb-1">Subcategory</label>
         <select
           name="subCategory"
           value={formData.subCategory}
           onChange={handleChange}
           className="w-full rounded-lg border border-gray-300 px-3 py-2"
         >
           <option value="">Select subcategory</option>
            {availableSubCategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
         </select>
       </div>

      <div>
        <label className="block text-sm font-medium mb-1">Price</label>
        <input
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Sizes</label>
        <input
          name="sizes"
          type="text"
          value={formData.sizes}
          onChange={handleChange}
          placeholder="sizes (S, M, L, XL)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt="Product preview"
            className="h-32 w-32 rounded-lg object-contain"
          />
        </div>
      )}

      
    </form>
  );
}
