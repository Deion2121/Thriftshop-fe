import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import productService from "./productService";

export default function ProductTable() {

  useAuth();

  const [products, setProducts] = useState([]);

  useEffect(() => {

    const fetchProducts = async () => {

      const products = await productService.getProducts();
      setProducts(products);
    };

    fetchProducts();

  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow">

      <h1 className="text-xl font-bold mb-6">
        Product Management
      </h1>

      <table className="w-full text-sm">

        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Name</th>
            <th>Price</th>
            <th>Brand</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {products.map(p => (
            <tr key={p.id} className="border-b hover:bg-gray-50">

              <td className="p-2">{p.name}</td>
              <td>₱{p.price}</td>
              <td>{p.brand}</td>

              <td>
                <button className="text-red-500">
                  Delete
                </button>
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}
