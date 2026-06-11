import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Trash2, X, CreditCard } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { orderService } from "../orders/orderService";
import OrderTrackingModal from "../orders/OrderTrackingModal";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

const normalize = (value) => String(value || "").trim().toLowerCase();
const getCartItemKey = (item) => {
  const productName = normalize(item?.title || item?.name);
  return productName;
};

const getColorSwatchStyle = (variant = {}) => {
  const primary = variant.colorHex || "#111111";
  const secondary = variant.colorHexSecondary;

  return secondary
    ? { background: `linear-gradient(135deg, ${primary} 0 50%, ${secondary} 50% 100%)` }
    : { backgroundColor: primary };
};

const CartModal = ({ isOpen, onClose, cartItems, setCartItems, openShop, onOrderCreated }) => {
  const { currentUser } = useAuth();
  const [shippingAddress, setShippingAddress] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressFields, setAddressFields] = useState({ fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "" });

  const subtotal = cartItems.reduce((acc, item) => acc + Number(item.price || 0) * item.quantity, 0);
  const shipping = subtotal > 0 && subtotal < 250 ? 45 : 0;
  const total = subtotal + shipping;

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackedOrderNumber, setTrackedOrderNumber] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const removeItem = (cartKey) => {
    setCartItems((prev) => prev.filter((item) => getCartItemKey(item) !== cartKey));
  };

  const updateQuantity = (cartKey, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          getCartItemKey(item) === cartKey
            ? { ...item, quantity: Math.min(20, Math.max(0, item.quantity + delta)) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const selectVariant = (cartKey, variant) => {
    setCartItems((prev) =>
      prev.map((item) =>
        getCartItemKey(item) === cartKey
          ? { ...item, selectedVariant: variant }
          : item
      )
    );
  };

     const handleCheckout = async () => {
    if (!currentUser) {
      alert("Please log in to complete your purchase.");
      onClose();
      return;
    }

    if (!shippingAddress.trim() && !addressFields.addressLine1.trim()) {
      setCheckoutError("Please enter a shipping address.");
      return;
    }

    const fullAddress = shippingAddress ||
      `${addressFields.fullName}, ${addressFields.phone}, ${addressFields.addressLine1}${addressFields.addressLine2 ? ", " + addressFields.addressLine2 : ""}, ${addressFields.city}, ${addressFields.state} ${addressFields.postalCode}`;

    setCheckoutError(null);
    setCheckoutSuccess(null);
    setIsCheckoutLoading(true);

    try {
      const orderItems = cartItems.map((item) => ({
        product_id: item.selectedVariant?.productId || item.id,
        quantity: Math.min(20, Math.max(1, Number(item.quantity || 1))),
        variant: item.selectedVariant?.colorName || "Default",
      }));

      const orderData = {
        items: orderItems,
        shipping_address: fullAddress.trim(),
      };

      const result = await orderService.createOrder(orderData);

      setTrackedOrderNumber(result.order_number);
      onOrderCreated?.(result.order_number);
      setIsPaying(true);
    } catch (err) {
      console.error("Checkout error:", err);
      setCheckoutError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!trackedOrderNumber) return;
    setIsPaying(true);
    setCheckoutError(null);

    try {
      const paymentRes = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/payments/create-payment-intent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ amount: Number(total || 0) }),
        }
      );

      if (!paymentRes.ok) {
        const err = await paymentRes.json().catch(() => ({}));
        throw new Error(err.message || "Payment setup failed");
      }

      const { clientSecret } = await paymentRes.json();

      setCheckoutSuccess(`Order ${trackedOrderNumber} is ready for payment.`);
      setCartItems([]);
      setTimeout(() => {
        setTrackingModalOpen(true);
        setCheckoutSuccess(null);
        setIsPaying(false);
      }, 1500);
    } catch (err) {
      console.error("Payment error:", err);
      setCheckoutError(err.message || "Something went wrong. Please try again.");
      setIsPaying(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 z-[300] backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-[301] flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-zinc-950 dark:text-zinc-100"
            >
              <div className="flex items-center justify-between border-b p-6 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={20} />
                  <h2 className="font-black uppercase tracking-tighter text-xl">Your Bag [{cartItems.length}]</h2>
                </div>
                <button type="button" onClick={onClose} className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-white/10">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <p className="text-gray-400 uppercase text-[10px] font-black tracking-[0.2em]">Your bag is empty</p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        openShop?.("All", "All", "All");
                      }}
                      className="text-xs font-bold underline uppercase tracking-widest"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => {
                    const variantName = item.selectedVariant?.colorName || "Default";
                    const cartKey = getCartItemKey(item);
                    const variants =
                      item.variants?.length > 0
                        ? item.variants
                        : [{ image: item.img, colorName: "Default", colorHex: "#111111" }];

                    return (
                      <div key={cartKey} className="flex gap-4 border-b border-gray-100 pb-6 dark:border-white/10">
                        <div className="h-32 w-24 shrink-0 bg-gray-100 dark:bg-zinc-900">
                          <img
                            src={item.selectedVariant?.image || item.img}
                            alt={item.title}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
                          <div>
                            <div className="flex justify-between gap-3">
                              <h3 className="text-[11px] font-black uppercase tracking-tight break-words">{item.title}</h3>
                              <button type="button" onClick={() => removeItem(cartKey)}>
                                <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                              </button>
                            </div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">{item.brand}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span
                                className="h-3.5 w-3.5 rounded-full border border-black/10 ring-1 ring-black/10"
                                style={getColorSwatchStyle(item.selectedVariant)}
                              />
                              <p className="text-[10px] font-medium">Color: {variantName}</p>
                            </div>

                            {variants.length > 1 && (
                              <div
                                className="mt-3 flex flex-wrap gap-2"
                                role="radiogroup"
                                aria-label={`${item.title} color`}
                              >
                                {variants.map((variant) => {
                                  const isSelected = variantName === variant.colorName;

                                  return (
                                    <button
                                      key={variant.colorName}
                                      type="button"
                                      onClick={() => selectVariant(cartKey, variant)}
                                      role="radio"
                                      aria-checked={isSelected}
                                      title={variant.colorName}
                                      aria-label={`Choose ${variant.colorName}`}
                                      className={`flex h-7 w-7 items-center justify-center rounded-full border bg-white transition dark:bg-zinc-900 ${
                                        isSelected
                                          ? "border-black ring-2 ring-black/20 ring-offset-1"
                                          : "border-black/10 hover:border-black/50"
                                      }`}
                                    >
                                      <span
                                        className="h-4 w-4 rounded-full border border-black/10"
                                        style={getColorSwatchStyle(variant)}
                                      />
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            <div className="mt-3 inline-flex items-center border border-gray-200 dark:border-white/10">
                              <button
                                type="button"
                                onClick={() => updateQuantity(cartKey, -1)}
                                className="h-8 w-8 text-sm hover:bg-gray-100 dark:hover:bg-white/10"
                              >
                                -
                              </button>
                              <span className="w-9 text-center text-xs font-bold">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(cartKey, 1)}
                                className="h-8 w-8 text-sm hover:bg-gray-100 dark:hover:bg-white/10"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <p className="text-[12px] font-black italic">
                            PHP {(Number(item.price || 0) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

               {cartItems.length > 0 && (
                 <div className="space-y-4 bg-gray-50 p-8 dark:bg-zinc-900">
                   <div className="space-y-3">
                     <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                       <span>Subtotal</span>
                       <span>PHP {subtotal.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                       <span>Shipping</span>
                       <span>{shipping === 0 ? "Free" : `PHP ${shipping.toLocaleString()}`}</span>
                     </div>
                     <div className="flex items-end justify-between border-t border-gray-200 pt-4 dark:border-white/10">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Total</span>
                       <span className="text-xl font-black italic">PHP {total.toLocaleString()}</span>
                     </div>
                   </div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed">
                      Free shipping starts at PHP 250. Taxes are calculated at checkout.
                    </p>

                   <div className="space-y-3">
                     <label className="block">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Shipping Address *</span>
                       {!showAddressForm ? (
                         <button
                           type="button"
                           onClick={() => setShowAddressForm(true)}
                           className="mt-2 w-full border border-gray-200 bg-white px-4 py-3 text-left text-xs font-medium text-gray-600 transition hover:border-black"
                         >
                           {shippingAddress || "Click to add shipping address"}
                         </button>
                       ) : (
                         <div className="mt-2 space-y-2 border border-gray-200 bg-white p-4 rounded-lg">
                           <input
                             type="text"
                             placeholder="Full Name *"
                             value={addressFields.fullName}
                             onChange={(e) => setAddressFields((prev) => ({ ...prev, fullName: e.target.value }))}
                             className="h-10 w-full border border-gray-200 px-3 text-xs outline-none focus:border-black"
                           />
                           <input
                             type="text"
                             placeholder="Phone Number *"
                             value={addressFields.phone}
                             onChange={(e) => setAddressFields((prev) => ({ ...prev, phone: e.target.value }))}
                             className="h-10 w-full border border-gray-200 px-3 text-xs outline-none focus:border-black"
                           />
                           <input
                             type="text"
                             placeholder="Address Line 1 *"
                             value={addressFields.addressLine1}
                             onChange={(e) => setAddressFields((prev) => ({ ...prev, addressLine1: e.target.value }))}
                             className="h-10 w-full border border-gray-200 px-3 text-xs outline-none focus:border-black"
                           />
                           <input
                             type="text"
                             placeholder="Address Line 2 (optional)"
                             value={addressFields.addressLine2}
                             onChange={(e) => setAddressFields((prev) => ({ ...prev, addressLine2: e.target.value }))}
                             className="h-10 w-full border border-gray-200 px-3 text-xs outline-none focus:border-black"
                           />
                           <div className="grid grid-cols-2 gap-2">
                             <input
                               type="text"
                               placeholder="City *"
                               value={addressFields.city}
                               onChange={(e) => setAddressFields((prev) => ({ ...prev, city: e.target.value }))}
                               className="h-10 w-full border border-gray-200 px-3 text-xs outline-none focus:border-black"
                             />
                             <input
                               type="text"
                               placeholder="State/Province *"
                               value={addressFields.state}
                               onChange={(e) => setAddressFields((prev) => ({ ...prev, state: e.target.value }))}
                               className="h-10 w-full border border-gray-200 px-3 text-xs outline-none focus:border-black"
                             />
                           </div>
                           <input
                             type="text"
                             placeholder="Postal Code *"
                             value={addressFields.postalCode}
                             onChange={(e) => setAddressFields((prev) => ({ ...prev, postalCode: e.target.value }))}
                             className="h-10 w-full border border-gray-200 px-3 text-xs outline-none focus:border-black"
                           />
                         </div>
                       )}
                     </label>
                   </div>

                    {checkoutError && (
                      <p className="text-[11px] text-red-600 bg-red-50 p-3 rounded-lg font-medium">
                        {checkoutError}
                      </p>
                    )}

                   {checkoutSuccess && (
                     <p className="text-[11px] text-green-600 bg-green-50 p-3 rounded-lg font-medium">
                       {checkoutSuccess}
                     </p>
                   )}

                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={isCheckoutLoading}
                      className={`flex w-full items-center justify-center gap-3 bg-black py-5 text-[11px] font-black uppercase tracking-[0.3em] text-white transition-colors ${
                        isCheckoutLoading
                          ? "bg-zinc-400 cursor-not-allowed"
                          : "hover:bg-zinc-800"
                      }`}
                    >
                      {isCheckoutLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          >
                            <X size={14} className="opacity-50" />
                          </motion.div>
                          Processing...
                        </>
                      ) : (
                        <>
                          Checkout Now <ArrowRight size={14} />
                        </>
                      )}
                    </button>

                    {trackedOrderNumber && (
                      <button
                        type="button"
                        onClick={handlePayNow}
                        className="mt-3 flex w-full items-center justify-center gap-3 border border-black bg-white py-4 text-[11px] font-black uppercase tracking-[0.3em] text-black transition hover:bg-black hover:text-white"
                      >
                        <CreditCard size={14} /> Pay Now
                      </button>
                    )}
                 </div>
               )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Order Tracking Modal - shows after successful checkout */}
      <OrderTrackingModal
        isOpen={trackingModalOpen}
        onClose={() => {
          setTrackingModalOpen(false);
          onClose();
        }}
        orderNumber={trackedOrderNumber}
        recentOrder={trackedOrderNumber}
        currentUser={currentUser}
      />
    </>
  );
  };

export default CartModal;
