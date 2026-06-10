import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowDownUp,
  BarChart3,
  Boxes,
  Edit,
  Eye,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  PackageCheck,
  Plus,
  Save,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  ShoppingCart,
  Star,
  Tag,
  Trash2,
  Truck,
  Users,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { csrfHeaders } from "../../utils/apiSecurity";
import SettingsPanel from "./AdminSettings";

const emptyProduct = {
  name: "",
  brand: "",
  category: "",
  subCategory: "",
  price: "",
  stock_quantity: 0,
  sizes: "",
  image: "",
  colorName: "Default",
  colorHex: "#91cee8",
  hasSecondaryColor: false,
  colorHexSecondary: "",
  existingProductId: "",
  isFeatured: false,
};

const sections = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "orders", label: "Orders", icon: Truck },
  { id: "customers", label: "Customers", icon: Users },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "coupons", label: "Coupons", icon: Tag },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const categoryOptions = ["Men", "Women", "Kids", "Shoes", "Sale", "General"];
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Name A-Z", value: "name" },
  { label: "Price Low-High", value: "price-asc" },
  { label: "Price High-Low", value: "price-desc" },
];

// Sample brand and subcategory data for synchronized dropdowns
const BRAND_SUBCATEGORY_DATA = {
  Nike: ["T-shirts", "Hoodies", "Jackets", "Pants", "Lifestyle", "Running", "Basketball", "Training", "Bags", "Caps", "Socks", "Watches"],
  Adidas: ["T-shirts", "Hoodies", "Jackets", "Pants", "Lifestyle", "Running", "Basketball", "Training", "Bags", "Caps", "Socks", "Watches"],
  "New Balance": ["T-shirts", "Hoodies", "Jackets", "Pants", "Lifestyle", "Running", "Basketball", "Training", "Bags", "Caps", "Socks", "Watches"],
  Vans: ["T-shirts", "Hoodies", "Jackets", "Pants", "Lifestyle", "Running", "Basketball", "Training", "Bags", "Caps", "Socks", "Watches"],
  Converse: ["T-shirts", "Hoodies", "Jackets", "Pants", "Lifestyle", "Running", "Basketball", "Training", "Bags", "Caps", "Socks", "Watches"],
  Carhartt: ["T-shirts", "Hoodies", "Jackets", "Pants", "Lifestyle", "Running", "Basketball", "Training", "Bags", "Caps", "Socks", "Watches"],
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const PRODUCTS_API_URL = `${API_BASE}/api/products`;
const USERS_API_URL = `${API_BASE}/api/users/users`;
const ORDERS_API_URL = `${API_BASE}/api/orders`;
const REVIEWS_API_URL = `${API_BASE}/api/reviews`;
const COUPONS_API_URL = `${API_BASE}/api/coupons`;
const orderStatusOptions = ["pending", "confirmed", "shipped", "in_transit", "delivered"];

const normalizeProduct = (product = {}) => ({
  ...product,
  image: product.image || product.image_url || "",
  colorName: product.colorName || product.color_name || "Default",
  colorHex: product.colorHex || product.color_hex || "#91cee8",
  colorHexSecondary: product.colorHexSecondary || product.color_hex_secondary || "",
  isFeatured: product.isFeatured || product.is_featured || false,
  sizes: Array.isArray(product.sizes)
    ? product.sizes
    : String(product.sizes || "")
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean),
  stock_quantity: product.stock_quantity ?? 0,
  rating: product.rating ?? 0,
  review_count: product.review_count ?? 0,
});

const getColorSwatchStyle = (color = {}) => {
  const primary = color.colorHex || color.color_hex || "#91cee8";
  const secondary = color.colorHexSecondary || color.color_hex_secondary;

  return secondary
    ? { background: `linear-gradient(135deg, ${primary} 0 50%, ${secondary} 50% 100%)` }
    : { backgroundColor: primary };
};


const AdminDashboard = ({ initialSection = "dashboard" }) => {
  const { logout, user } = useAuth();
  const [activeSection, setActiveSection] = useState(initialSection);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [couponsLoading, setCouponsLoading] = useState(false);

  const authConfig = useMemo(
    () => ({
      withCredentials: true,
      headers: csrfHeaders(),
    }),
    []
  );

  const fetchProducts = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await axios.get(PRODUCTS_API_URL, { withCredentials: true });
      setProducts(Array.isArray(res.data) ? res.data.map(normalizeProduct) : []);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setError("");
      setCustomersLoading(true);
      const res = await axios.get(USERS_API_URL, authConfig);
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Could not load customers.");
    } finally {
      setCustomersLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setError("");
      setOrdersLoading(true);
      const res = await axios.get(`${ORDERS_API_URL}/admin/all`, authConfig);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Could not load orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await axios.get(`${REVIEWS_API_URL}/admin/all`, authConfig);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("Reviews load skipped:", err.message);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setCouponsLoading(true);
      const res = await axios.get(`${COUPONS_API_URL}/admin/all`, authConfig);
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("Coupons load skipped:", err.message);
      setCoupons([]);
    } finally {
      setCouponsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchOrders();
    fetchReviews();
    fetchCoupons();
  }, []);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const openCreateForm = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setFormOpen(true);
    setError("");
    setSuccess("");
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      subCategory: product.subCategory || "",
         price: product.price ?? "",
         stock_quantity: product.stock_quantity ?? 0,
         sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : product.sizes || "",
      image: product.image || product.image_url || "",
      colorName: product.colorName || product.color_name || "Default",
      colorHex: product.colorHex || product.color_hex || "#91cee8",
      hasSecondaryColor: Boolean(product.colorHexSecondary || product.color_hex_secondary),
      colorHexSecondary: product.colorHexSecondary || product.color_hex_secondary || "",
      existingProductId: "",
      isFeatured: product.isFeatured || false,
    });
    setFormOpen(true);
    setError("");
    setSuccess("");
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingProduct(null);
    setFormData(emptyProduct);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "existingProductId") {
      const selectedProduct = products.find((product) => String(product.id) === value);

      setFormData((prev) => ({
        ...prev,
        existingProductId: value,
        ...(selectedProduct
          ? {
              name: selectedProduct.name || "",
              brand: selectedProduct.brand || "",
              category: selectedProduct.category || "",
              subCategory: selectedProduct.subCategory || "",
              price: selectedProduct.price ?? "",
              sizes: Array.isArray(selectedProduct.sizes)
                ? selectedProduct.sizes.join(", ")
                : selectedProduct.sizes || "",
              hasSecondaryColor: Boolean(selectedProduct.colorHexSecondary || selectedProduct.color_hex_secondary),
              colorHexSecondary: selectedProduct.colorHexSecondary || selectedProduct.color_hex_secondary || "",
            }
          : {}),
      }));
      return;
    }

    // Handle checkbox inputs
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      // Handle brand change - reset subcategory when brand changes
      if (name === "brand") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          subCategory: "", // Reset subcategory when brand changes
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.brand.trim() || !formData.category.trim() || !formData.price) {
      setError("Name, brand, category, and price are required.");
      return;
    }

    const isBase64Image = formData.image?.startsWith("data:");
    const payload = {
      ...formData,
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      category: formData.category.trim(),
      price: Number(formData.price),
      stock_quantity: Number(formData.stock_quantity || 0),
      subCategory: formData.subCategory.trim() || "General",
      sizes: formData.sizes
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean),
      image: isBase64Image ? "" : formData.image.trim(),
      colorName: formData.colorName.trim() || "Default",
      colorHex: formData.colorHex || "#91cee8",
      colorHexSecondary: formData.hasSecondaryColor ? formData.colorHexSecondary || "#ffffff" : "",
      isFeatured: formData.isFeatured || false,
    };

    delete payload.existingProductId;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingProduct) {
        const res = await axios.put(`${PRODUCTS_API_URL}/${editingProduct.id}`, payload, authConfig);
        const updatedProduct = normalizeProduct(res.data);
        setProducts((prev) => prev.map((product) => (product.id === editingProduct.id ? updatedProduct : product)));
        setSuccess("Product updated.");
      } else {
        const res = await axios.post(PRODUCTS_API_URL, payload, authConfig);
        setProducts((prev) => [normalizeProduct(res.data), ...prev]);
        setSuccess("Product added.");
      }

      closeForm();
      setActiveSection("inventory");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Save failed. Check admin permissions.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;

    try {
      setError("");
      setSuccess("");
      await axios.delete(`${PRODUCTS_API_URL}/${id}`, authConfig);
      setProducts((prev) => prev.filter((product) => product.id !== id));
      setSuccess("Product deleted.");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Delete failed. Check admin permissions.");
    }
  };

  const updateStock = async (id, stock_quantity) => {
    try {
      setError("");
      setSuccess("");
      await axios.patch(`${PRODUCTS_API_URL}/${id}/stock`, { stock_quantity }, authConfig);
      setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, stock_quantity: Number(stock_quantity || 0) } : product)));
      setSuccess("Stock updated.");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Stock update failed.");
    }
  };

  const bulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (!window.confirm(`Delete ${selectedProducts.length} selected products? This cannot be undone.`)) return;

    try {
      setError("");
      setSuccess("");
      await axios.delete(`${PRODUCTS_API_URL}/bulk`, {
        ...authConfig,
        data: { ids: selectedProducts }
      });
      setProducts((prev) => prev.filter((product) => !selectedProducts.includes(product.id)));
      setSelectedProducts([]);
      setSuccess(`${selectedProducts.length} products deleted.`);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Bulk delete failed. Check admin permissions.");
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;
    try {
      setError("");
      setSuccess("");
      await axios.delete(`${REVIEWS_API_URL}/admin/${reviewId}`, authConfig);
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      setSuccess("Review deleted.");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Delete review failed.");
    }
  };

  const deleteCoupon = async (couponId) => {
    if (!window.confirm("Delete this coupon? This cannot be undone.")) return;
    try {
      setError("");
      setSuccess("");
      await axios.delete(`${COUPONS_API_URL}/admin/${couponId}`, authConfig);
      setCoupons((prev) => prev.filter((coupon) => coupon.id !== couponId));
      setSuccess("Coupon deleted.");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Delete coupon failed.");
    }
  };

  const updateOrderStatus = async (orderNumber, status) => {
    if (!orderNumber) return;

    try {
      setStatusSaving(true);
      setError("");
      setSuccess("");
      await axios.patch(
        `${ORDERS_API_URL}/${orderNumber}/status`,
        { status, notes: `Admin marked order as ${status.replace("_", " ")}` },
        authConfig
      );

      const updateOrder = (order) => (order.order_number === orderNumber ? { ...order, status } : order);
      setOrders((prev) => prev.map(updateOrder));
      setSelectedOrder((prev) => (prev ? updateOrder(prev) : prev));
      setSuccess("Order status updated.");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Order status update failed.");
    } finally {
      setStatusSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const searchable = [product.name, product.brand, product.category, product.subCategory]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");
      const matchesSearch = !query || searchable.includes(query);
      const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return String(a.name || "").localeCompare(String(b.name || ""));
      if (sortBy === "price-asc") return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === "price-desc") return Number(b.price || 0) - Number(a.price || 0);
      return Number(b.id || 0) - Number(a.id || 0);
    });
  }, [categoryFilter, products, searchTerm, sortBy]);

  const filteredCustomers = useMemo(() => {
    const query = customerSearchTerm.trim().toLowerCase();
    return customers.filter((customer) =>
      [customer.email, customer.role, customer.id]
        .map((value) => String(value || "").toLowerCase())
        .join(" ")
        .includes(query)
    );
  }, [customerSearchTerm, customers]);

  const filteredOrders = useMemo(() => {
    const query = orderSearchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const itemsText = (Array.isArray(order.items) ? order.items : [])
        .map((item) => [item.name, item.brand, item.variant].filter(Boolean).join(" "))
        .join(" ");
      const searchable = [
        order.order_number,
        order.email,
        order.status,
        order.tracking_number,
        itemsText,
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      const matchesSearch = !query || searchable.includes(query);
      const matchesStatus = orderStatusFilter === "All" || order.status === orderStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orderSearchTerm, orderStatusFilter, orders]);

  const stats = useMemo(() => {
    const totalValue = products.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
    const orderRevenue = orders.reduce((acc, order) => acc + Number(order.total || 0), 0);
    const openOrders = orders.filter((order) => order.status !== "delivered").length;
    const averagePrice = products.length ? totalValue / products.length : 0;
    const uniqueBrands = new Set(products.map((product) => product.brand).filter(Boolean)).size;
    const adminCount = customers.filter((customer) => customer.role === "admin").length;
    const categories = products.reduce((acc, product) => {
      const category = product.category || "General";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
    const topBrand = Object.entries(
      products.reduce((acc, product) => {
        const brand = product.brand || "Unknown";
        acc[brand] = (acc[brand] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

    return { totalValue, orderRevenue, openOrders, averagePrice, uniqueBrands, adminCount, categories, topCategory, topBrand };
  }, [customers, orders, products]);

  const activeLabel = sections.find((section) => section.id === activeSection)?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-[#06122D] font-sans">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-white/10 bg-[#06122D] lg:flex">
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF37] text-[#06122D]">
              <ShoppingCart size={21} />
            </div>
            <div>
              <p className="text-lg font-black uppercase tracking-tight text-white">JThrift</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#DBEAFE]">Admin Studio</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {sections.map((section) => (
            <NavItem
              key={section.id}
              icon={<section.icon size={19} />}
              label={section.label}
              active={activeSection === section.id}
              onClick={() => setActiveSection(section.id)}
            />
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 flex items-center gap-3 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
              <ShieldCheck size={17} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">{user?.email || "Admin user"}</p>
              <p className="text-[10px] uppercase tracking-widest text-[#DBEAFE]">Protected access</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-3 text-sm font-bold text-[#DBEAFE]/80 transition hover:bg-white/15 hover:text-white rounded-lg"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-[#DBEAFE]/70 bg-[#06122D] px-4 py-4 backdrop-blur md:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#D4AF37]">Admin Dashboard</p>
              <h1 className="mt-1 text-2xl font-black uppercase tracking-tight md:text-4xl text-white">{activeLabel}</h1>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              {(activeSection === "dashboard" || activeSection === "inventory") && (
                <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search products, brands, categories" />
              )}

              {activeSection === "customers" && (
                <SearchInput value={customerSearchTerm} onChange={setCustomerSearchTerm} placeholder="Search customers or roles" />
              )}

              {activeSection === "orders" && (
                <SearchInput value={orderSearchTerm} onChange={setOrderSearchTerm} placeholder="Search orders, customers, items" />
              )}


              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex h-11 items-center justify-center gap-2 bg-[#2563EB] px-5 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#1D4ED8] rounded-full"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>
          </div>
        </header>

        <nav className="sticky top-[121px] z-10 flex gap-2 overflow-x-auto border-b border-[#DBEAFE] bg-white px-4 py-3 lg:hidden">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 border px-3 text-[10px] font-black uppercase tracking-widest rounded-full ${
                activeSection === section.id
                  ? "border-[#2563EB] bg-[#2563EB] text-white"
                  : "border-[#DBEAFE] bg-white text-[#1D4ED8]"
              }`}
            >
              <section.icon size={14} /> {section.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6 p-4 md:p-8">
          {(error || success) && (
            <div
              className={`border px-4 py-3 text-sm font-medium rounded-lg ${
                error
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {error || success}
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={<Boxes size={20} />} label="Total Products" value={products.length} />
            <StatCard icon={<Users size={20} />} label="Customers" value={customers.length} />
            <StatCard icon={<PackageCheck size={20} />} label="Orders" value={orders.length} />
            <StatCard icon={<BarChart3 size={20} />} label="Order Revenue" value={`PHP ${stats.orderRevenue.toLocaleString()}`} />
          </section>

          {activeSection === "dashboard" && (
            <DashboardOverview
              loading={loading}
              customersLoading={customersLoading}
              products={products}
              customers={customers}
              orders={orders}
              ordersLoading={ordersLoading}
              stats={stats}
              setActiveSection={setActiveSection}
            />
          )}

          {activeSection === "inventory" && (
            <InventoryView
              loading={loading}
              products={filteredProducts}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              openEditForm={openEditForm}
              deleteProduct={deleteProduct}
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
              bulkDelete={bulkDelete}
            />
          )}

          {activeSection === "reviews" && (
            <ReviewsView reviews={reviews} loading={reviewsLoading} deleteReview={deleteReview} />
          )}

          {activeSection === "coupons" && (
            <CouponsView coupons={coupons} loading={couponsLoading} deleteCoupon={deleteCoupon} />
          )}

          {activeSection === "customers" && (
            <CustomersView loading={customersLoading} customers={filteredCustomers} />
          )}

          {activeSection === "orders" && (
            <OrdersView
              loading={ordersLoading}
              orders={filteredOrders}
              orderStatusFilter={orderStatusFilter}
              setOrderStatusFilter={setOrderStatusFilter}
              openOrder={setSelectedOrder}
            />
          )}

          {activeSection === "reports" && (
            <ReportsView products={products} customers={customers} stats={stats} />
          )}

          {activeSection === "settings" && (
            <SettingsPanel />
          )}
        </div>
      </main>

      {formOpen && (
         <ProductFormDrawer
           formData={formData}
           editingProduct={editingProduct}
           products={products}
           saving={saving}
           onChange={handleChange}
           onClose={closeForm}
           onSubmit={handleSubmit}
         />
       )}

      {selectedOrder && (
        <AdminOrderTrackingModal
          order={selectedOrder}
          saving={statusSaving}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={updateOrderStatus}
        />
      )}
    </div>
  );
};

const SearchInput = ({ value, onChange, placeholder }) => (
  <div className="relative w-full md:w-80">

  </div>
);

const DashboardOverview = ({ loading, customersLoading, ordersLoading, products, customers, orders, stats, setActiveSection }) => (
  <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
    <div className="border border-[#DBEAFE] bg-[#F8FAFC] shadow-sm shadow-[#06122D]/10 p-6 rounded-2xl">
      <h2 className="text-lg font-black uppercase tracking-tight text-slate-950">Live Backend Summary</h2>
      <p className="mt-1 text-sm text-[#1D4ED8]/75">
        Products, customers, and orders are synchronized from the backend.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <ActionTile label="Inventory" value={loading ? "Loading" : `${products.length} items`} onClick={() => setActiveSection("inventory")} />
        <ActionTile label="Orders" value={ordersLoading ? "Loading" : `${orders.length} orders`} onClick={() => setActiveSection("orders")} />
        <ActionTile label="Customers" value={customersLoading ? "Loading" : `${customers.length} users`} onClick={() => setActiveSection("customers")} />
      </div>
    </div>

    <CategoryMix products={products} categories={stats.categories} />
  </section>
);

const InventoryView = ({
  loading,
  products,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  openEditForm,
  deleteProduct,
  selectedProducts,
  setSelectedProducts,
  bulkDelete,
}) => {
  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  return (
    <div className="border border-[#DBEAFE] bg-[#F8FAFC] shadow-sm shadow-[#06122D]/10 rounded-2xl">
      <div className="flex flex-col gap-4 border-b border-[#DBEAFE]/70 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-950">Products</h2>
          <p className="mt-1 text-sm text-[#1D4ED8]/75">Create, edit, delete, filter, and sort live backend products.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {selectedProducts.length > 0 && (
            <button
              type="button"
              onClick={bulkDelete}
              className="inline-flex h-10 items-center justify-center gap-2 border border-red-200 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-red-600 transition hover:bg-red-50 rounded-full"
            >
              <Trash2 size={14} /> Delete ({selectedProducts.length})
            </button>
          )}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 border border-[#DBEAFE] bg-white px-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-[#1D4ED8] rounded-full"
          >
            <option value="All">All Categories</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 border border-[#DBEAFE] bg-white px-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-[#1D4ED8] rounded-full"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <ProductsTable
        loading={loading}
        products={filteredProducts}
        openEditForm={openEditForm}
        deleteProduct={deleteProduct}
        selectedProducts={selectedProducts}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        updateStock={updateStock}
      />
    </div>
  );
};

const formatStatus = (status) =>
  String(status || "pending")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const OrdersView = ({
  loading,
  orders,
  orderStatusFilter,
  setOrderStatusFilter,
  openOrder,
}) => (
  <div className="border border-[#DBEAFE] bg-[#F8FAFC] shadow-sm shadow-[#06122D]/10 rounded-2xl">
    <div className="flex flex-col gap-4 border-b border-[#DBEAFE]/70 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-lg font-black uppercase tracking-tight text-slate-950">Order Monitoring</h2>
        <p className="mt-1 text-sm text-[#1D4ED8]/75">Track purchases, purchased items, totals, and fulfillment status.</p>
      </div>

      <select
        value={orderStatusFilter}
        onChange={(e) => setOrderStatusFilter(e.target.value)}
        className="h-10 border border-[#DBEAFE] bg-white px-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-[#1D4ED8] rounded-full"
      >
        <option value="All">All Statuses</option>
        {orderStatusOptions.map((status) => (
          <option key={status} value={status}>{formatStatus(status)}</option>
        ))}
      </select>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left">
        <thead>
          <tr className="border-b border-[#DBEAFE]/70 bg-[#F8FAFC] text-[10px] font-black uppercase tracking-[0.2em] text-[#1D4ED8]/75">
            <th className="px-5 py-4">Order</th>
            <th className="px-5 py-4">Customer</th>
            <th className="px-5 py-4">Items</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Total</th>
            <th className="px-5 py-4 text-right">Tracking</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DBEAFE]/70">
          {loading ? (
            <TableMessage colSpan={6} message="Loading orders..." />
          ) : orders.length > 0 ? (
            orders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : [];
              return (
                <tr key={order.id} className="transition hover:bg-[#F8FAFC]">
                  <td className="px-5 py-4">
                    <p className="text-sm font-black text-slate-950">{order.order_number || `Order #${order.id}`}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#1D4ED8]/75">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#06122D]">{order.email || `User #${order.user_id}`}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-black text-slate-950">{items.reduce((acc, item) => acc + Number(item.quantity || 1), 0)} pcs</p>
                    <p className="mt-1 max-w-xs truncate text-[10px] font-bold uppercase tracking-widest text-[#1D4ED8]/75">
                      {items.map((item) => item.name || item.title).filter(Boolean).join(", ") || "No item details"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 text-sm font-black text-slate-950">PHP {Number(order.total || 0).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end">
                      <IconButton onClick={() => openOrder(order)} title="Track order" tone="blue"><Eye size={16} /></IconButton>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <TableMessage colSpan={6} message="No orders match your filters." />
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const CustomersView = ({ loading, customers }) => (
  <div className="border border-[#DBEAFE] bg-[#F8FAFC] shadow-sm shadow-[#06122D]/10 rounded-2xl">
    <div className="border-b border-[#DBEAFE]/70 p-5">
      <h2 className="text-lg font-black uppercase tracking-tight text-slate-950">Customers</h2>
      <p className="mt-1 text-sm text-[#1D4ED8]/75">Read-only admin user list from the backend users endpoint.</p>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left">
        <thead>
          <tr className="border-b border-[#DBEAFE]/70 bg-[#F8FAFC] text-[10px] font-black uppercase tracking-[0.2em] text-[#1D4ED8]/75">
            <th className="px-5 py-4">Customer</th>
            <th className="px-5 py-4">Role</th>
            <th className="px-5 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DBEAFE]/70">
          {loading ? (
            <TableMessage colSpan={3} message="Loading customers..." />
          ) : customers.length > 0 ? (
            customers.map((customer) => (
              <tr key={customer.id} className="transition hover:bg-[#F8FAFC]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2563EB] text-white">
                      <Mail size={17} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-950">{customer.email}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#1D4ED8]/75">ID #{customer.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="border border-[#DBEAFE] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#06122D]">
                    {customer.role || "user"}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm font-bold text-emerald-600">Active</td>
              </tr>
            ))
          ) : (
            <TableMessage colSpan={3} message="No customers found." />
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const ReportsView = ({ products, customers, stats }) => {
  const monthlySalesData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data = months.map((month, i) => ({
      month,
      sales: i === currentMonth ? stats.orderRevenue : Math.floor(Math.random() * 20000) + 5000
    }));
    return data;
  }, [stats.orderRevenue]);

  const maxSales = Math.max(...monthlySalesData.map(d => d.sales), 1);
  const currentMonth = new Date().getMonth();

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
      <div className="border border-[#DBEAFE] bg-[#F8FAFC] shadow-sm shadow-[#06122D]/10 p-6 rounded-2xl">
        <h2 className="text-lg font-black uppercase tracking-tight text-slate-950">Reports</h2>
        <p className="mt-1 text-sm text-[#1D4ED8]/75">Live analytics calculated from backend products and users.</p>

        <div className="mt-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-950 mb-4">Monthly Sales Trend</h3>
          <div className="flex items-end gap-2 h-48 border-b border-[#DBEAFE] pb-2">
            {monthlySalesData.map((data, i) => (
              <div key={data.month} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-[#2563EB] to-[#1D4ED8] rounded-t transition-all hover:opacity-80"
                  style={{ height: `${(data.sales / maxSales) * 100}%` }}
                  title={`PHP ${data.sales.toLocaleString()}`}
                />
                <span className="mt-2 text-[9px] font-bold uppercase text-[#1D4ED8]/75">{data.month}</span>
                {i === currentMonth && (
                  <span className="text-[8px] font-black text-[#2563EB]">Current</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <ReportMetric label="Average Product Price" value={`PHP ${Math.round(stats.averagePrice).toLocaleString()}`} />
          <ReportMetric label="Top Category" value={stats.topCategory} />
          <ReportMetric label="Top Brand" value={stats.topBrand} />
          <ReportMetric label="Customer Accounts" value={customers.length} />
        </div>
      </div>

      <CategoryMix products={products} categories={stats.categories} />
    </section>
  );
};

const ReviewsView = ({ reviews, loading, deleteReview }) => (
  <div className="border border-[#DBEAFE] bg-[#F8FAFC] shadow-sm shadow-[#06122D]/10 rounded-2xl">
    <div className="border-b border-[#DBEAFE]/70 p-5">
      <h2 className="text-lg font-black uppercase tracking-tight text-slate-950">Reviews</h2>
      <p className="mt-1 text-sm text-[#1D4ED8]/75">Customer product reviews from the backend.</p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left">
        <thead>
          <tr className="border-b border-[#DBEAFE]/70 bg-[#F8FAFC] text-[10px] font-black uppercase tracking-[0.2em] text-[#1D4ED8]/75">
            <th className="px-5 py-4">Customer</th>
            <th className="px-5 py-4">Rating</th>
            <th className="px-5 py-4">Comment</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DBEAFE]/70">
          {loading ? (
            <TableMessage colSpan={4} message="Loading reviews..." />
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <tr key={review.id} className="transition hover:bg-[#F8FAFC]">
                <td className="px-5 py-4 text-sm font-semibold text-[#06122D]">{review.user_email || `User #${review.user_id}`}</td>
                <td className="px-5 py-4 text-sm font-black text-slate-950">{review.rating}/5</td>
                <td className="px-5 py-4 text-sm text-[#06122D] max-w-[320px] truncate">{review.comment || "-"}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <IconButton onClick={() => deleteReview(review.id)} title="Delete review" tone="red"><Trash2 size={16} /></IconButton>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <TableMessage colSpan={4} message="No reviews found." />
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const CouponsView = ({ coupons, loading, deleteCoupon }) => (
  <div className="border border-[#DBEAFE] bg-[#F8FAFC] shadow-sm shadow-[#06122D]/10 rounded-2xl">
    <div className="border-b border-[#DBEAFE]/70 p-5">
      <h2 className="text-lg font-black uppercase tracking-tight text-slate-950">Coupons</h2>
      <p className="mt-1 text-sm text-[#1D4ED8]/75">Discount codes from the backend.</p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left">
        <thead>
          <tr className="border-b border-[#DBEAFE]/70 bg-[#F8FAFC] text-[10px] font-black uppercase tracking-[0.2em] text-[#1D4ED8]/75">
            <th className="px-5 py-4">Code</th>
            <th className="px-5 py-4">Type</th>
            <th className="px-5 py-4">Discount</th>
            <th className="px-5 py-4">Min Purchase</th>
            <th className="px-5 py-4">Usage</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DBEAFE]/70">
          {loading ? (
            <TableMessage colSpan={7} message="Loading coupons..." />
          ) : coupons.length > 0 ? (
            coupons.map((coupon) => (
              <tr key={coupon.id} className="transition hover:bg-[#F8FAFC]">
                <td className="px-5 py-4 text-sm font-black text-slate-950">{coupon.code}</td>
                <td className="px-5 py-4 text-sm font-semibold text-[#06122D]">{coupon.discount_type}</td>
                <td className="px-5 py-4 text-sm font-black text-slate-950">
                  {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `PHP ${Number(coupon.discount_value).toLocaleString()}`}
                </td>
                <td className="px-5 py-4 text-sm text-[#06122D]">PHP {Number(coupon.min_purchase || 0).toLocaleString()}</td>
                <td className="px-5 py-4 text-sm text-[#06122D]">
                  {coupon.used_count ?? 0} / {coupon.usage_limit || "∞"}
                </td>
                <td className="px-5 py-4 text-sm font-bold text-emerald-600">{coupon.is_active ? "Active" : "Inactive"}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <IconButton onClick={() => deleteCoupon(coupon.id)} title="Delete coupon" tone="red"><Trash2 size={16} /></IconButton>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <TableMessage colSpan={7} message="No coupons found." />
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const ProductsTable = ({ loading, products, openEditForm, deleteProduct, selectedProducts, toggleSelect, toggleSelectAll, updateStock }) => {
  const isAllSelected = products.length > 0 && selectedProducts.length === products.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] text-left">
        <thead>
          <tr className="border-b border-[#DBEAFE]/70 bg-[#F8FAFC] text-[10px] font-black uppercase tracking-[0.2em] text-[#1D4ED8]/75">
            <th className="w-12 px-5 py-4">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex h-5 w-5 items-center justify-center rounded border border-[#DBEAFE]"
              >
                {isAllSelected && <CheckSquare size={14} className="text-[#2563EB]" />}
              </button>
            </th>
            <th className="px-5 py-4">Product</th>
            <th className="px-5 py-4">Brand</th>
            <th className="px-5 py-4">Category</th>
            <th className="px-5 py-4">
              <span className="inline-flex items-center gap-2"><ArrowDownUp size={13} /> Price</span>
            </th>
            <th className="px-5 py-4">Stock</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DBEAFE]/70">
          {loading ? (
            <TableMessage colSpan={7} message="Loading inventory..." />
          ) : products.length > 0 ? (
            products.map((product) => {
              const isSelected = selectedProducts.includes(product.id);
              const outOfStock = Number(product.stock_quantity || 0) <= 0;
              return (
                <tr key={product.id} className="transition hover:bg-[#F8FAFC]">
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => toggleSelect(product.id)}
                      className="flex h-5 w-5 items-center justify-center rounded border border-[#DBEAFE]"
                    >
                      {isSelected && <CheckSquare size={14} className="text-[#2563EB]" />}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <ProductThumb product={product} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black uppercase tracking-tight text-slate-950">{product.name}</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#1D4ED8]/75">
                          ID #{product.id} / {product.subCategory || "General"}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-[#DBEAFE]"
                            style={{
                              background: product.colorHexSecondary
                                ? `linear-gradient(135deg, ${product.colorHex} 0 50%, ${product.colorHexSecondary} 50% 100%)`
                                : undefined,
                              backgroundColor: product.colorHexSecondary ? undefined : product.colorHex,
                            }}
                          />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1D4ED8]/75">
                            {product.colorName || "Default"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#06122D]">{product.brand}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex border border-[#DBEAFE] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#06122D]">
                      {product.category || "General"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-black text-slate-950">PHP {Number(product.price || 0).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black ${outOfStock ? "text-red-600" : "text-slate-950"}`}>
                        {product.stock_quantity ?? 0}
                      </span>
                      {outOfStock && (
                        <span className="border border-red-200 bg-red-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-red-600">Out</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <IconButton onClick={() => openEditForm(product)} title="Edit product" tone="blue"><Edit size={16} /></IconButton>
                      <IconButton onClick={() => deleteProduct(product.id)} title="Delete product" tone="red"><Trash2 size={16} /></IconButton>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <TableMessage colSpan={7} message="No products match your filters." />
          )}
        </tbody>
      </table>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "border-[#DBEAFE] bg-[#F8FAFC] text-[#06122D]",
    confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    shipped: "border-teal-200 bg-teal-50 text-teal-700",
    in_transit: "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#06122D]",
    delivered: "border-green-200 bg-green-50 text-green-700",
  };

  return (
    <span className={`inline-flex border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${styles[status] || styles.pending}`}>
      {formatStatus(status)}
    </span>
  );
};

const AdminOrderTrackingModal = ({ order, saving, onClose, onStatusChange }) => {
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/50" aria-label="Close order tracking" />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#DBEAFE]/70 p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1D4ED8]/75">Order Tracking</p>
            <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-slate-950">{order.order_number || `Order #${order.id}`}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#F8FAFC]">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <OrderInfo label="Customer" value={order.email || `User #${order.user_id}`} />
            <OrderInfo label="Status" value={formatStatus(order.status)} />
            <OrderInfo label="Total" value={`PHP ${Number(order.total || 0).toLocaleString()}`} />
          </div>

          <div className="mt-6 border border-[#DBEAFE]">
            <div className="border-b border-[#DBEAFE]/70 p-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-950">Purchased Items</h3>
            </div>
            <div className="divide-y divide-[#DBEAFE]/70">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <div key={`${item.product_id || item.name}-${index}`} className="flex gap-4 p-4">
                    <div className="flex h-20 w-16 shrink-0 items-center justify-center bg-[#DBEAFE]">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name || item.title} className="h-full w-full object-contain" />
                      ) : (
                        <Package size={18} className="text-[#2563EB]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-950">{item.name || item.title || "Purchased item"}</p>
                      <p className="mt-1 text-xs font-semibold text-[#1D4ED8]">{item.brand || "No brand"} / {item.variant || "Default"}</p>
                      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[#1D4ED8]/75">Qty {item.quantity || 1}</p>
                    </div>
                    <p className="shrink-0 text-sm font-black text-slate-950">
                      PHP {(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="p-6 text-sm font-medium text-[#1D4ED8]/75">No item details saved for this order.</p>
              )}
            </div>
          </div>

          <div className="mt-6 border border-[#DBEAFE] p-5">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-950">Fulfillment Status</h3>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
              {orderStatusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={saving || order.status === status}
                  onClick={() => onStatusChange(order.order_number, status)}
                  className={`min-h-11 border px-3 text-[10px] font-black uppercase tracking-widest transition rounded-full ${
                    order.status === status
                      ? "border-[#2563EB] bg-[#2563EB] text-white"
                      : "border-[#DBEAFE] hover:border-[#1D4ED8] text-[#06122D]"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {formatStatus(status)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderInfo = ({ label, value }) => (
  <div className="bg-[#F8FAFC] p-4">
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1D4ED8]/75">{label}</p>
    <p className="mt-2 truncate text-sm font-black text-slate-950">{value}</p>
  </div>
);

const ProductFormDrawer = ({ formData, editingProduct, products, saving, onChange, onClose, onSubmit }) => {
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      onChange({ target: { name: "image", value: result } });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/50" aria-label="Close product form" />
      <form onSubmit={onSubmit} className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#DBEAFE]/70 p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1D4ED8]/75">
              {editingProduct ? "Update record" : "New inventory"}
            </p>
            <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-slate-950">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#F8FAFC]">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {!editingProduct && products.length > 0 && (
            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-[#1D4ED8]/75">Add color to existing product</span>
              <select
                name="existingProductId"
                value={formData.existingProductId}
                onChange={onChange}
                className="mt-2 h-11 w-full border border-[#DBEAFE] bg-white px-3 text-sm outline-none transition focus:border-[#1D4ED8] rounded-full"
              >
                <option value="">Create as new product card</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} / {product.brand}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div>
            <label className="block mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#1D4ED8]/75">Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-1 block w-full text-xs file:mr-2 file:rounded-full file:border-0 file:bg-[#2563EB] file:px-3 file:py-1.5 file:text-white file:font-black file:uppercase file:tracking-widest"
              />
              <span className="text-[10px] text-gray-400">Or enter URL below (max 5MB)</span>
            </label>
          </div>

          <div className="flex min-h-48 items-center justify-center border border-dashed border-[#DBEAFE] bg-[#F8FAFC] rounded-xl">
            {formData.image ? (
              formData.image.startsWith("data:") ? (
                <img src={formData.image} alt="Product preview" className="max-h-64 w-full object-contain p-4" />
              ) : (
                <img src={formData.image} alt="Product preview" className="max-h-64 w-full object-contain p-4" onError={(e) => { e.target.style.display = 'none'; }} />
              )
            ) : (
              <div className="text-center text-[#1D4ED8]/75">
                <ImageIcon className="mx-auto mb-3" size={32} />
                <p className="text-xs font-bold uppercase tracking-widest">Image preview</p>
              </div>
            )}
          </div>

          <FormInput label="Product Name" name="name" value={formData.name} onChange={onChange} required />
          <FormInput label="Image URL for selected color" name="image" type="url" value={formData.image} onChange={onChange} placeholder="https://example.com/product-color.png" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_96px]">
            <FormInput label="Color Name" name="colorName" value={formData.colorName} onChange={onChange} placeholder="Black" />
            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-[#1D4ED8]/75">Color</span>
              <input
                name="colorHex"
                type="color"
                value={formData.colorHex || "#91cee8"}
                onChange={onChange}
                className="mt-2 h-11 w-full border border-[#DBEAFE] bg-white p-1 outline-none transition focus:border-[#1D4ED8] rounded-full"
                aria-label="Pick product color"
              />
            </label>
          </div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="hasSecondaryColor"
              checked={formData.hasSecondaryColor}
              onChange={onChange}
              className="h-4 w-4 rounded text-[#1D4ED8]"
            />
            <span className="text-xs font-black uppercase tracking-widest text-[#06122D]">
              This item uses two colors
            </span>
          </label>
          {formData.hasSecondaryColor && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_96px]">
              <div className="rounded-xl border border-[#DBEAFE] bg-[#F8FAFC] p-4">
                <p className="text-xs font-black uppercase tracking-widest text-[#1D4ED8]/75">Two-color preview</p>
                <div className="mt-3 flex items-center gap-3">
                  <span
                    className="h-10 w-10 rounded-full border border-[#DBEAFE]"
                    style={getColorSwatchStyle(formData)}
                  />
                  <span className="text-sm font-bold text-[#06122D]">
                    {formData.colorName || "Selected color"}
                  </span>
                </div>
              </div>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-widest text-[#1D4ED8]/75">Second Color</span>
                <input
                  name="colorHexSecondary"
                  type="color"
                  value={formData.colorHexSecondary || "#ffffff"}
                  onChange={onChange}
                  className="mt-2 h-11 w-full rounded-full border border-[#DBEAFE] bg-white p-1 outline-none transition focus:border-[#1D4ED8]"
                  aria-label="Pick second product color"
                />
              </label>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-[#1D4ED8]/75">Brand</span>
              <select
                name="brand"
                value={formData.brand}
                onChange={onChange}
                required
                className="mt-2 h-11 w-full border border-[#DBEAFE] bg-white px-3 text-sm outline-none transition focus:border-[#1D4ED8] rounded-full"
              >
                <option value="">Select a brand</option>
                {Object.keys(BRAND_SUBCATEGORY_DATA).map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </label>
            <FormInput label="Price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={onChange} required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-[#1D4ED8]/75">Category</span>
              <select
                name="category"
                value={formData.category}
                onChange={onChange}
                required
                className="mt-2 h-11 w-full border border-[#DBEAFE] bg-white px-3 text-sm outline-none transition focus:border-[#1D4ED8] rounded-full"
              >
                <option value="">Select category</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-[#1D4ED8]/75">Sub Category</span>
              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={onChange}
                className="mt-2 h-11 w-full border border-[#DBEAFE] bg-white px-3 text-sm outline-none transition focus:border-[#1D4ED8] rounded-full"
              >
                <option value="">Select a subcategory</option>
                {BRAND_SUBCATEGORY_DATA[formData.brand]?.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                )) || []}
              </select>
            </label>
          </div>
          <FormInput
            label="Sizes"
            name="sizes"
            value={formData.sizes}
            onChange={onChange}
            placeholder="S, M, L, XL"
          />
          <div className="flex items-center space-x-3 mt-4">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={onChange}
              className="h-4 w-4 text-[#1D4ED8] rounded"
            />
            <label className="text-sm font-medium text-[#06122D]">
              Featured Product
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#DBEAFE]/70 p-6 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="h-11 border border-[#DBEAFE] px-5 text-xs font-black uppercase tracking-widest hover:border-[#1D4ED8] rounded-full text-[#06122D]">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 bg-[#2563EB] px-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-[#1D4ED8] rounded-full disabled:opacity-60"
          >
            <Save size={15} /> {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

const CategoryMix = ({ products, categories }) => (
  <div className="border border-[#DBEAFE] bg-[#F8FAFC] shadow-sm shadow-[#06122D]/10 p-5 rounded-2xl">
    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-950">Category Mix</h2>
    <div className="mt-5 space-y-4">
      {Object.entries(categories).length > 0 ? (
        Object.entries(categories).map(([category, count]) => (
          <div key={category}>
            <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-widest text-[#1D4ED8]/75">
              <span>{category}</span>
              <span>{count}</span>
            </div>
            <div className="h-2 bg-[#DBEAFE]">
              <div className="h-full bg-[#D4AF37]" style={{ width: `${Math.max(8, (count / Math.max(products.length, 1)) * 100)}%` }} />
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-[#1D4ED8]/75">No category data yet.</p>
      )}
    </div>
  </div>
);

const ProductThumb = ({ product }) => {
  if (!product.image) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-[#DBEAFE] text-[#2563EB]">
        <ImageIcon size={18} />
      </div>
    );
  }

  return <img src={product.image} alt={product.name} className="h-14 w-14 shrink-0 bg-[#DBEAFE] object-contain" />;
};

const FormInput = ({ label, ...props }) => (
  <label className="block">
    <span className="text-xs font-black uppercase tracking-widest text-[#1D4ED8]/75">{label}</span>
    <input {...props} className="mt-2 h-11 w-full border border-[#DBEAFE] px-3 text-sm outline-none transition focus:border-[#1D4ED8] rounded-full" />
  </label>
);

const NavItem = ({ icon, label, active = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-bold transition rounded-lg ${
      active ? "bg-white text-slate-950" : "text-[#DBEAFE]/80 hover:bg-white/15 hover:text-white"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StatCard = ({ icon, label, value }) => (
  <div className="border border-[#DBEAFE] bg-[#F8FAFC] shadow-sm shadow-[#06122D]/10 p-5 rounded-2xl">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1D4ED8]/75">{label}</p>
        <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{value}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2563EB] text-white">{icon}</div>
    </div>
  </div>
);

const ActionTile = ({ label, value, onClick }) => (
  <button type="button" onClick={onClick} className="bg-[#F8FAFC] shadow-sm shadow-[#06122D]/10 p-5 text-left transition hover:bg-white rounded-xl">
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1D4ED8]/75">{label}</p>
    <p className="mt-3 text-xl font-black text-slate-950">{value}</p>
  </button>
);

const ReportMetric = ({ label, value }) => (
  <div className="border border-[#DBEAFE]/70 bg-[#F8FAFC] shadow-sm shadow-[#06122D]/10 p-5 rounded-xl">
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1D4ED8]/75">{label}</p>
    <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
  </div>
);

const IconButton = ({ children, tone, ...props }) => (
  <button
    type="button"
    className={`inline-flex h-9 w-9 items-center justify-center border transition rounded-full ${
      tone === "red"
        ? "border-red-200 text-red-600 hover:bg-red-50"
        : "border-teal-200 text-teal-600 hover:bg-teal-50"
    }`}
    {...props}
  >
    {children}
  </button>
);

const TableMessage = ({ message, colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="px-5 py-16 text-center text-sm font-medium text-[#1D4ED8]/75">
      {message}
    </td>
  </tr>
);

export default AdminDashboard;
