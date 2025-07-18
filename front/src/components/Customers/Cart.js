import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CartTable from "./CartTable";
import OrderTable from "../OrderTable";

const Cart = () => {
    const [view, setView] = useState("cart");
    const [showSummary, setShowSummary] = useState(false);
    const navigate = useNavigate();

    const handleCheckout = async () => {
        // Add some animation before showing success
        setShowSummary(false);
        
        // Show success message with delay
        setTimeout(() => {
            alert("🎉 Order placed successfully! Thank you for choosing our furniture.");
        }, 300);
    };

    const getViewIcon = (viewType) => {
        return viewType === "cart" ? "🛒" : "📦";
    };

    const getViewTitle = (viewType) => {
        return viewType === "cart" ? "Shopping Cart" : "Order History";
    };

    const getViewDescription = (viewType) => {
        return viewType === "cart" 
            ? "Review your selected furniture pieces before checkout"
            : "Track your furniture orders and delivery status";
    };

    return (
        <motion.div
            className="furniture-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            {/* Header Section */}
            <motion.div
                className="furniture-dashboard-header"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <h1 className="furniture-dashboard-title">
                    {getViewIcon(view)} {getViewTitle(view)}
                </h1>
                <p className="furniture-dashboard-subtitle">
                    {getViewDescription(view)}
                </p>

                {/* Navigation Tabs */}
                <div className="flex justify-center gap-4 mt-6">
                    <motion.button
                        className={`category-pill px-6 py-3 text-base ${view === "cart" ? "active" : ""}`}
                        onClick={() => setView("cart")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        🛒 Shopping Cart
                    </motion.button>
                    <motion.button
                        className={`category-pill px-6 py-3 text-base ${view === "orders" ? "active" : ""}`}
                        onClick={() => setView("orders")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        📦 Order History
                    </motion.button>
                </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
                className="furniture-grid-item"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {view === "cart" ? (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-h4">🛒 Your Cart Items</h3>
                                    <div className="flex gap-3">
                                        <button
                                            className="btn-secondary-furniture"
                                            onClick={() => navigate(-1)}
                                        >
                                            ← Continue Shopping
                                        </button>
                                    </div>
                                </div>
                                <CartTable />
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-h4">📦 Your Orders</h3>
                                    <div className="text-body-sm text-muted">
                                        Track and manage your furniture orders
                                    </div>
                                </div>
                                <OrderTable />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Order Summary Modal */}
            <AnimatePresence>
                {showSummary && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowSummary(false)}
                    >
                        <motion.div
                            className="bg-surface rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-light">
                                <div>
                                    <h2 className="text-h3 mb-2">📋 Order Summary</h2>
                                    <p className="text-body text-secondary">
                                        Review your order before confirming
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowSummary(false)}
                                    className="btn-secondary-furniture px-4 py-2"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Order Content */}
                            <div className="mb-8">
                                <CartTable summaryMode={true} />
                            </div>

                            {/* Modal Actions */}
                            <div className="flex gap-4 justify-end pt-4 border-t border-border-light">
                                <button
                                    className="btn-secondary-furniture px-6"
                                    onClick={() => setShowSummary(false)}
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    className="btn-primary-furniture px-8"
                                    onClick={handleCheckout}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    🎉 Confirm Order
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Actions Footer */}
            <motion.div
                className="furniture-grid-item mt-8"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
            >
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">🚚</div>
                        <div>
                            <h4 className="text-h6 mb-1">Free Delivery</h4>
                            <p className="text-body-sm text-muted">On orders over $500</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">🔒</div>
                        <div>
                            <h4 className="text-h6 mb-1">Secure Checkout</h4>
                            <p className="text-body-sm text-muted">SSL encrypted payment</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">↩️</div>
                        <div>
                            <h4 className="text-h6 mb-1">Easy Returns</h4>
                            <p className="text-body-sm text-muted">30-day return policy</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Back Button */}
            <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
            >
                <button
                    onClick={() => navigate(-1)}
                    className="btn-secondary-furniture px-8"
                >
                    ← Back to Shopping
                </button>
            </motion.div>
        </motion.div>
    );
};

export default Cart;
