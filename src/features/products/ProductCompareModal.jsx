import React from "react";
import { X, BarChart3 } from "lucide-react";

const ProductCompareModal = ({ products = [], onClose, onClear, onRemove }) => {
  if (products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/50" aria-label="Close comparison" />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-4xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Compare Products</p>
            <h2 className="mt-1 text-2xl font-black uppercase tracking-tight">{products.length} Items Selected</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-50">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Feature</th>
                {products.map((product) => (
                  <th key={product.id} className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-20 w-16 bg-gray-100 flex items-center justify-center overflow-hidden">
                        {product.img ? (
                          <img src={product.img} alt={product.title} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <BarChart3 size={24} className="text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs font-black uppercase">{product.title}</p>
                      <button
                        type="button"
                        onClick={() => onRemove?.(product.id)}
                        className="text-[9px] font-bold text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Brand</td>
                {products.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-sm font-semibold">{p.brand}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Category</td>
                {products.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-sm">{p.category}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Sub Category</td>
                {products.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-sm">{p.subCategory}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Price</td>
                {products.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-sm font-black">PHP {p.price?.toLocaleString()}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Sizes</td>
                {products.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-sm">{p.sizes?.join(", ") || "N/A"}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 p-6 flex justify-between">
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-bold text-gray-500 hover:underline"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest"
          >
            Done Comparing
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCompareModal;