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
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Truck,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { csrfHeaders } from "../../utils/apiSecurity";

const emptyProduct = {
  name: "",
  brand: "",
  category: "",
  subCategory: "",
  price: "",
  image: "",
};

const sections = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "orders", label: "Orders", icon: Truck },
  { id: "customers", label: "Customers", icon: Users },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

const categoryOptions = ["Men", "Women", "Kids", "Shoes", "Sale", "General"];
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Name A-Z", value: "name" },
  { label: "Price Low-High", value: "price-asc" },
  { label: "Price High-Low", value: "price-desc" },
];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const PRODUCTS_API_URL = `${API_BASE}/api/products`;
const USERS_API_URL = `${API_BASE}/api/users/users`;
const ORDERS_API_URL = `${API_BASE}/api/orders`;
const orderStatusOptions = ["pending", "confirmed", "shipped", "in_transit", "delivered"];

const normalizeProduct = (product = {}) => ({
  ...product,
  image: product.image || product.image_url || "",
});

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
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

  const refreshCurrentSection = () => {
    if (activeSection === "customers") {
      fetchCustomers();
      return;
    }

    if (activeSection === "orders") {
      fetchOrders();
      return;
    }

    if (activeSection === "reports" || activeSection === "dashboard") {
      fetchProducts();
      fetchCustomers();
      fetchOrders();
      return;
    }

    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchOrders();
  }, []);

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
      image: product.image || product.image_url || "",
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.brand.trim() || !formData.category.trim() || !formData.price) {
      setError("Name, brand, category, and price are required.");
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      category: formData.category.trim(),
      price: Number(formData.price),
      subCategory: formData.subCategory.trim() || "General",
      image: formData.image.trim(),
    };

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

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
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
    <div className="min-h-screen bg-[#f4f5f7] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-white/10 bg-slate-950 text-white lg:flex">
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-white text-black">
              <ShoppingCart size={21} />
            </div>
            <div>
              <p className="text-lg font-black uppercase tracking-tight">JThrift</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Admin Studio</p>
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
            <div className="flex h-9 w-9 items-center justify-center bg-white/10">
              <ShieldCheck size={17} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold">{user?.email || "Admin user"}</p>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Protected access</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-3 text-sm font-bold text-white/55 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-black/5 bg-white/90 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Admin Dashboard</p>
              <h1 className="mt-1 text-2xl font-black uppercase tracking-tight md:text-4xl">{activeLabel}</h1>
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
                onClick={refreshCurrentSection}
                className="inline-flex h-11 items-center justify-center gap-2 border border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-[0.18em] transition hover:border-black"
              >
                <RefreshCcw size={15} /> Refresh
              </button>

              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex h-11 items-center justify-center gap-2 bg-black px-5 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-slate-800"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>
          </div>
        </header>

        <nav className="sticky top-[121px] z-10 flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 border px-3 text-[10px] font-black uppercase tracking-widest ${
                activeSection === section.id
                  ? "border-black bg-black text-white"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              <section.icon size={14} /> {section.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6 p-4 md:p-8">
          {(error || success) && (
            <div
              className={`border px-4 py-3 text-sm font-medium ${
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
            />
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
        </div>
      </main>

      {formOpen && (
         <ProductFormDrawer
           formData={formData}
           editingProduct={editingProduct}
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
    <Search className="absolute left-3 top-3 text-slate-400" size={17} />
    <input
      type="text"
      placeholder={placeholder}
      className="h-11 w-full border border-slate-200 bg-white pl-10 pr-9 text-sm outline-none transition focus:border-black"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        className="absolute right-3 top-3 text-slate-400 hover:text-black"
        aria-label="Clear search"
      >
        <X size={16} />
      </button>
    )}
  </div>
);

const DashboardOverview = ({ loading, customersLoading, ordersLoading, products, customers, orders, stats, setActiveSection }) => (
  <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
    <div className="border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-black uppercase tracking-tight">Live Backend Summary</h2>
      <p className="mt-1 text-sm text-slate-500">
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
}) => (
  <div className="border border-slate-200 bg-white">
    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-lg font-black uppercase tracking-tight">Products</h2>
        <p className="mt-1 text-sm text-slate-500">Create, edit, delete, filter, and sort live backend products.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 border border-slate-200 bg-white px-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-black"
        >
          <option value="All">All Categories</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-10 border border-slate-200 bg-white px-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-black"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>

    <ProductsTable loading={loading} products={products} openEditForm={openEditForm} deleteProduct={deleteProduct} />
  </div>
);

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
  <div className="border border-slate-200 bg-white">
    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-lg font-black uppercase tracking-tight">Order Monitoring</h2>
        <p className="mt-1 text-sm text-slate-500">Track purchases, purchased items, totals, and fulfillment status.</p>
      </div>

      <select
        value={orderStatusFilter}
        onChange={(e) => setOrderStatusFilter(e.target.value)}
        className="h-10 border border-slate-200 bg-white px-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-black"
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
          <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <th className="px-5 py-4">Order</th>
            <th className="px-5 py-4">Customer</th>
            <th className="px-5 py-4">Items</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Total</th>
            <th className="px-5 py-4 text-right">Tracking</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <TableMessage colSpan={6} message="Loading orders..." />
          ) : orders.length > 0 ? (
            orders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : [];
              return (
                <tr key={order.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="text-sm font-black">{order.order_number || `Order #${order.id}`}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-600">{order.email || `User #${order.user_id}`}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-black">{items.reduce((acc, item) => acc + Number(item.quantity || 1), 0)} pcs</p>
                    <p className="mt-1 max-w-xs truncate text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {items.map((item) => item.name || item.title).filter(Boolean).join(", ") || "No item details"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 text-sm font-black">PHP {Number(order.total || 0).toLocaleString()}</td>
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
  <div className="border border-slate-200 bg-white">
    <div className="border-b border-slate-100 p-5">
      <h2 className="text-lg font-black uppercase tracking-tight">Customers</h2>
      <p className="mt-1 text-sm text-slate-500">Read-only admin user list from the backend users endpoint.</p>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <th className="px-5 py-4">Customer</th>
            <th className="px-5 py-4">Role</th>
            <th className="px-5 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <TableMessage colSpan={3} message="Loading customers..." />
          ) : customers.length > 0 ? (
            customers.map((customer) => (
              <tr key={customer.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center bg-slate-950 text-white">
                      <Mail size={17} />
                    </div>
                    <div>
                      <p className="text-sm font-black">{customer.email}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">ID #{customer.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="border border-slate-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest">
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

const ReportsView = ({ products, customers, stats }) => (
  <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
    <div className="border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-black uppercase tracking-tight">Reports</h2>
      <p className="mt-1 text-sm text-slate-500">Live analytics calculated from backend products and users.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ReportMetric label="Average Product Price" value={`PHP ${Math.round(stats.averagePrice).toLocaleString()}`} />
        <ReportMetric label="Top Category" value={stats.topCategory} />
        <ReportMetric label="Top Brand" value={stats.topBrand} />
        <ReportMetric label="Customer Accounts" value={customers.length} />
      </div>
    </div>

    <CategoryMix products={products} categories={stats.categories} />
  </section>
);

const ProductsTable = ({ loading, products, openEditForm, deleteProduct }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[860px] text-left">
      <thead>
        <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <th className="px-5 py-4">Product</th>
          <th className="px-5 py-4">Brand</th>
          <th className="px-5 py-4">Category</th>
          <th className="px-5 py-4">
            <span className="inline-flex items-center gap-2"><ArrowDownUp size={13} /> Price</span>
          </th>
          <th className="px-5 py-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {loading ? (
          <TableMessage colSpan={5} message="Loading inventory..." />
        ) : products.length > 0 ? (
          products.map((product) => (
            <tr key={product.id} className="transition hover:bg-slate-50">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <ProductThumb product={product} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black uppercase tracking-tight">{product.name}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      ID #{product.id} / {product.subCategory || "General"}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-sm font-semibold text-slate-600">{product.brand}</td>
              <td className="px-5 py-4">
                <span className="inline-flex border border-slate-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
                  {product.category || "General"}
                </span>
              </td>
              <td className="px-5 py-4 text-sm font-black">PHP {Number(product.price || 0).toLocaleString()}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <IconButton onClick={() => openEditForm(product)} title="Edit product" tone="blue"><Edit size={16} /></IconButton>
                  <IconButton onClick={() => deleteProduct(product.id)} title="Delete product" tone="red"><Trash2 size={16} /></IconButton>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <TableMessage colSpan={5} message="No products match your filters." />
        )}
      </tbody>
    </table>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "border-slate-200 bg-slate-50 text-slate-600",
    confirmed: "border-blue-100 bg-blue-50 text-blue-700",
    shipped: "border-violet-100 bg-violet-50 text-violet-700",
    in_transit: "border-amber-100 bg-amber-50 text-amber-700",
    delivered: "border-emerald-100 bg-emerald-50 text-emerald-700",
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
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Order Tracking</p>
            <h2 className="mt-1 text-2xl font-black uppercase tracking-tight">{order.order_number || `Order #${order.id}`}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center hover:bg-slate-50">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <OrderInfo label="Customer" value={order.email || `User #${order.user_id}`} />
            <OrderInfo label="Status" value={formatStatus(order.status)} />
            <OrderInfo label="Total" value={`PHP ${Number(order.total || 0).toLocaleString()}`} />
          </div>

          <div className="mt-6 border border-slate-200">
            <div className="border-b border-slate-100 p-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">Purchased Items</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <div key={`${item.product_id || item.name}-${index}`} className="flex gap-4 p-4">
                    <div className="flex h-20 w-16 shrink-0 items-center justify-center bg-slate-100">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name || item.title} className="h-full w-full object-contain" />
                      ) : (
                        <Package size={18} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">{item.name || item.title || "Purchased item"}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{item.brand || "No brand"} / {item.variant || "Default"}</p>
                      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Qty {item.quantity || 1}</p>
                    </div>
                    <p className="shrink-0 text-sm font-black">
                      PHP {(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="p-6 text-sm font-medium text-slate-400">No item details saved for this order.</p>
              )}
            </div>
          </div>

          <div className="mt-6 border border-slate-200 p-5">
            <h3 className="text-sm font-black uppercase tracking-[0.2em]">Fulfillment Status</h3>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
              {orderStatusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={saving || order.status === status}
                  onClick={() => onStatusChange(order.order_number, status)}
                  className={`min-h-11 border px-3 text-[10px] font-black uppercase tracking-widest transition ${
                    order.status === status
                      ? "border-black bg-black text-white"
                      : "border-slate-200 hover:border-black"
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
  <div className="bg-slate-50 p-4">
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{label}</p>
    <p className="mt-2 truncate text-sm font-black">{value}</p>
  </div>
);

const ProductFormDrawer = ({ formData, editingProduct, saving, onChange, onClose, onSubmit }) => (
  <div className="fixed inset-0 z-50">
    <button type="button" onClick={onClose} className="absolute inset-0 bg-black/50" aria-label="Close product form" />
    <form onSubmit={onSubmit} className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            {editingProduct ? "Update record" : "New inventory"}
          </p>
          <h2 className="mt-1 text-2xl font-black uppercase tracking-tight">
            {editingProduct ? "Edit Product" : "Add Product"}
          </h2>
        </div>
        <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center hover:bg-slate-50">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        <div className="flex min-h-48 items-center justify-center border border-dashed border-slate-200 bg-slate-50">
          {formData.image ? (
             <img src={formData.image} alt="Product preview" className="max-h-64 w-full object-contain p-4" />
           ) : (
             <div className="text-center text-slate-400">
               <ImageIcon className="mx-auto mb-3" size={32} />
               <p className="text-xs font-bold uppercase tracking-widest">Image preview</p>
             </div>
           )}
        </div>

        <FormInput label="Product Name" name="name" value={formData.name} onChange={onChange} required />
        <FormInput label="Image URL" name="image" type="url" value={formData.image} onChange={onChange} placeholder="https://example.com/product.png" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput label="Brand" name="brand" value={formData.brand} onChange={onChange} required />
          <FormInput label="Price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={onChange} required />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Category</span>
            <select
              name="category"
              value={formData.category}
              onChange={onChange}
              required
              className="mt-2 h-11 w-full border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-black"
            >
              <option value="">Select category</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
          <FormInput label="Sub Category" name="subCategory" value={formData.subCategory} onChange={onChange} />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 p-6 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="h-11 border border-slate-200 px-5 text-xs font-black uppercase tracking-widest hover:border-black">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center justify-center gap-2 bg-black px-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          <Save size={15} /> {saving ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
  </div>
);

const CategoryMix = ({ products, categories }) => (
  <div className="border border-slate-200 bg-white p-5">
    <h2 className="text-sm font-black uppercase tracking-[0.2em]">Category Mix</h2>
    <div className="mt-5 space-y-4">
      {Object.entries(categories).length > 0 ? (
        Object.entries(categories).map(([category, count]) => (
          <div key={category}>
            <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
              <span>{category}</span>
              <span>{count}</span>
            </div>
            <div className="h-2 bg-slate-100">
              <div className="h-full bg-black" style={{ width: `${Math.max(8, (count / Math.max(products.length, 1)) * 100)}%` }} />
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-slate-500">No category data yet.</p>
      )}
    </div>
  </div>
);

const ProductThumb = ({ product }) => {
  if (!product.image) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-slate-100 text-slate-400">
        <ImageIcon size={18} />
      </div>
    );
  }

  return <img src={product.image} alt={product.name} className="h-14 w-14 shrink-0 bg-slate-100 object-contain" />;
};

const FormInput = ({ label, ...props }) => (
  <label className="block">
    <span className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</span>
    <input {...props} className="mt-2 h-11 w-full border border-slate-200 px-3 text-sm outline-none transition focus:border-black" />
  </label>
);

const NavItem = ({ icon, label, active = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-bold transition ${
      active ? "bg-white text-black" : "text-white/50 hover:bg-white/10 hover:text-white"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StatCard = ({ icon, label, value }) => (
  <div className="border border-slate-200 bg-white p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{label}</p>
        <p className="mt-3 text-2xl font-black tracking-tight">{value}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center bg-slate-950 text-white">{icon}</div>
    </div>
  </div>
);

const ActionTile = ({ label, value, onClick }) => (
  <button type="button" onClick={onClick} className="bg-slate-50 p-5 text-left transition hover:bg-slate-100">
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{label}</p>
    <p className="mt-3 text-xl font-black">{value}</p>
  </button>
);

const ReportMetric = ({ label, value }) => (
  <div className="border border-slate-100 bg-slate-50 p-5">
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{label}</p>
    <p className="mt-3 text-2xl font-black">{value}</p>
  </div>
);

const IconButton = ({ children, tone, ...props }) => (
  <button
    type="button"
    className={`inline-flex h-9 w-9 items-center justify-center border transition ${
      tone === "red"
        ? "border-red-100 text-red-600 hover:bg-red-50"
        : "border-blue-100 text-blue-600 hover:bg-blue-50"
    }`}
    {...props}
  >
    {children}
  </button>
);

const TableMessage = ({ message, colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="px-5 py-16 text-center text-sm font-medium text-slate-400">
      {message}
    </td>
  </tr>
);

export default AdminDashboard;
