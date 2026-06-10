import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Package,
  Package2,
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  X,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { orderService } from "./orderService";

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Package2 },
  { key: "in_transit", label: "In Transit", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

const STATUS_COLORS = {
  pending: "bg-gray-200 text-gray-600 border-gray-300",
  confirmed: "bg-blue-100 text-blue-700 border-blue-300",
  shipped: "bg-purple-100 text-purple-700 border-purple-300",
  in_transit: "bg-orange-100 text-orange-700 border-orange-300",
  delivered: "bg-green-100 text-green-700 border-green-300",
};

const STATUS_ICONS_BG = {
  pending: "bg-gray-100",
  confirmed: "bg-blue-50",
  shipped: "bg-purple-50",
  in_transit: "bg-orange-50",
  delivered: "bg-green-50",
};

function StatusTimeline({ statusHistory, currentStatus }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const currentIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);
    setActiveStep(currentIndex >= 0 ? currentIndex : 0);
  }, [currentStatus]);

  return (
    <div className="relative">
      {/* Vertical connector line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />

      {STATUS_STEPS.map((step, index) => {
        const Icon = step.icon;
        const isActive = index <= activeStep;
        const isPast = index < activeStep;

        return (
          <div key={step.key} className="relative flex items-start gap-4 py-3">
            {/* Connector dot */}
            <div
              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                isActive
                  ? `${STATUS_COLORS[step.key]} border-current scale-110`
                  : "bg-white text-gray-300 border-gray-200"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
            </div>

            <div className="flex-1 pt-1">
              <p
                className={`text-sm font-semibold transition-colors ${
                  isActive ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>

              {isPast && statusHistory && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {(() => {
                    const entry = statusHistory.find((h) => h.status === step.key);
                    if (!entry) return "Completed";
                    const date = new Date(entry.created_at);
                    return `Completed ${date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })} at ${date.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`;
                  })()}
                </p>
              )}

              {index === activeStep && statusHistory && (
                <p className="text-xs text-gray-500 mt-0.5 animate-pulse">
                  {(() => {
                    const entry = statusHistory.find((h) => h.status === step.key);
                    return entry?.notes || "Processing...";
                  })()}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderDetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-[11px] text-gray-500 uppercase tracking-widest">{label}</span>
      <span className="text-[12px] font-medium text-gray-800">{value}</span>
    </div>
  );
}

const OrderTrackingModal = ({
  isOpen,
  onClose,
  orderNumber,
  currentUser,
  recentOrder,
}) => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualOrderNumber, setManualOrderNumber] = useState("");
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(false);

  useEffect(() => {
    if (isOpen && orderNumber) {
      fetchOrder(orderNumber);
    } else if (isOpen && !orderNumber) {
      setOrderData(null);
      setError(null);
    }

    if (isOpen && currentUser?.id) {
      fetchRecentOrders();
    }
  }, [isOpen, orderNumber]);

  const fetchOrder = async (orderNum) => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.trackOrderByNumber(orderNum);
      setOrderData(data);
    } catch (err) {
      setError(err.message || "Order not found");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    setRecentOrdersLoading(true);
    try {
      const orders = await orderService.getUserOrders(currentUser.id);
      setRecentOrders(Array.isArray(orders) ? orders : []);
    } catch (err) {
      console.warn("Recent orders fetch failed:", err.message);
    } finally {
      setRecentOrdersLoading(false);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (manualOrderNumber.trim()) {
      fetchOrder(manualOrderNumber.trim());
    }
  };

  const formatStatus = (status) => {
    return status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const orderStatusConfig = STATUS_STEPS.find((s) => s.key === (orderData?.status || ""));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[400] backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[401] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package2 size={20} />
                <h2 className="font-black uppercase tracking-tighter text-xl">
                  Order Tracking
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Manual Order Number Input */}
              {!orderData && !loading && (
                <div className="mb-6">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                    Enter your order number
                  </p>
                  <form onSubmit={handleManualSearch} className="flex gap-2">
                    <input
                      type="text"
                      value={manualOrderNumber}
                      onChange={(e) => setManualOrderNumber(e.target.value)}
                      placeholder="e.g. ORD-1A2B3C4D5E6F7890"
                      className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                    />
                    <button
                      type="submit"
                      className="bg-black text-white px-4 py-3 rounded-lg text-[11px] font-black uppercase tracking-wider hover:bg-zinc-800 transition"
                    >
                      Track
                    </button>
                  </form>
                  {orderNumber && (
                    <button
                      type="button"
                      onClick={() => fetchOrder(orderNumber)}
                      className="mt-2 w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition"
                    >
                      <ArrowRight size={12} />
                      Track Recent Order {orderNumber}
                    </button>
                  )}
                </div>
              )}

              {!orderData && !loading && currentUser && (
                <div className="mb-6 border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                      Your Purchases
                    </h3>
                    <button
                      type="button"
                      onClick={fetchRecentOrders}
                      className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black"
                    >
                      Refresh
                    </button>
                  </div>

                  {recentOrdersLoading ? (
                    <p className="py-4 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      Loading orders...
                    </p>
                  ) : recentOrders.length > 0 ? (
                    <div className="space-y-2">
                      {recentOrders.slice(0, 5).map((order) => (
                        <button
                          key={order.id}
                          type="button"
                          onClick={() => fetchOrder(order.order_number)}
                          className="flex w-full items-center justify-between gap-3 bg-white px-3 py-3 text-left transition hover:bg-gray-100"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-black">{order.order_number || `Order #${order.id}`}</p>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                              {new Date(order.created_at).toLocaleDateString()} / {formatStatus(order.status || "pending")}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs font-black italic">
                            PHP {Number(order.total || 0).toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      No purchases yet
                    </p>
                  )}
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 size={32} className="animate-spin text-black" />
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest">
                    Fetching order details...
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <AlertCircle size={36} className="text-red-400" />
                  <p className="text-sm font-semibold text-red-500 text-center px-4">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setOrderData(null);
                    }}
                    className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Order Details */}
              {orderData && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Order Summary Card */}
                  <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                        Order Number
                      </span>
                      <span className="text-sm font-bold">
                        {orderData.order_number}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                        Status
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          STATUS_COLORS[orderData.status] || "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {formatStatus(orderData.status)}
                      </span>
                    </div>
                    {orderData.tracking_number && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                          Tracking Number
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {orderData.tracking_number}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                        Placed On
                      </span>
                      <span className="text-sm font-medium">
                        {new Date(orderData.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">
                      Tracking Timeline
                    </h3>
                    <StatusTimeline
                      statusHistory={orderData.status_history || []}
                      currentStatus={orderData.status}
                    />
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {(Array.isArray(orderData.items)
                        ? orderData.items
                        : [orderData.items]
                      ).map((item, index) => (
                        <div
                          key={index}
                          className="flex gap-3 border-b border-gray-100 pb-3"
                        >
                          <div className="w-16 h-20 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.name || item.title}
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold truncate">
                              {item.name || item.title}
                            </h4>
                            {item.variant && (
                              <p className="text-xs text-gray-400">
                                {item.variant}
                              </p>
                            )}
                            <p className="text-xs font-bold text-gray-600">
                              Qty: {item.quantity || 1}
                            </p>
                          </div>
                          <p className="text-sm font-black italic shrink-0">
                            PHP{" "}
                            {(
                              Number(item.price || 0) * (item.quantity || 1)
                            ).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Totals */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium">
                        PHP {Number(orderData.subtotal).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="font-medium">
                        {Number(orderData.shipping) === 0
                          ? "Free"
                          : `PHP ${Number(orderData.shipping).toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        Total
                      </span>
                      <span className="text-xl font-black italic">
                        PHP {Number(orderData.total).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Estimated Delivery */}
                  {orderData.status !== "delivered" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle
                        size={18}
                        className="text-amber-500 shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="text-sm font-bold text-amber-800">
                          Estimated Delivery
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          {orderData.status === "pending" || orderData.status === "confirmed"
                            ? "Your order is being processed. Expected delivery in 3-5 business days after shipping."
                            : orderData.status === "shipped"
                            ? "Your order has been shipped! Expected delivery within 2-4 business days."
                            : orderData.status === "in_transit"
                            ? "Your order is on its way! Expected delivery within 1-2 business days."
                            : "Delivery soon!"}
                        </p>
                      </div>
                    </div>
                  )}

                  {orderData.status === "delivered" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                      <CheckCircle2
                        size={18}
                        className="text-green-500 shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="text-sm font-bold text-green-800">
                          Delivered!
                        </p>
                        <p className="text-xs text-green-700 mt-0.5">
                          Your order has been successfully delivered. Thank you
                          for shopping with us!
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {!orderData && !loading && !error && (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <Package size={40} className="text-gray-300" />
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest text-center">
                    Enter an order number above
                    <br />
                    or select a recent purchase
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OrderTrackingModal;
