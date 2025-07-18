import React, { useState, useEffect } from "react";
import AdminProductsTable from "./AdminProductsTable";
import OrdersTable from "./OrdersTable";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { useNavigate } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProductPage = () => {
    const [view, setView] = useState("products");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ 
        name: "", 
        description: "", 
        price: "", 
        inventory: "", 
        material: "",
        category: "",
        dimensions: "",
        image_url: "" 
    });
    const [loading, setLoading] = useState(false);
    const [refreshProducts, setRefreshProducts] = useState(false);
    const [productStats, setProductStats] = useState([]);
    const [loadingReport, setLoadingReport] = useState(true);

    const navigate = useNavigate();

    const materialOptions = [
        { value: "wood", label: "🌳 Wood", icon: "🌳" },
        { value: "metal", label: "⚙️ Metal", icon: "⚙️" },
        { value: "fabric", label: "🧵 Fabric", icon: "🧵" },
        { value: "leather", label: "🐄 Leather", icon: "🐄" },
        { value: "glass", label: "🪟 Glass", icon: "🪟" },
        { value: "plastic", label: "🔧 Plastic", icon: "🔧" }
    ];

    const categoryOptions = [
        { value: "living", label: "🛋️ Living Room", icon: "🛋️" },
        { value: "bedroom", label: "🛏️ Bedroom", icon: "🛏️" },
        { value: "dining", label: "🍽️ Dining Room", icon: "🍽️" },
        { value: "office", label: "💼 Office", icon: "💼" },
        { value: "outdoor", label: "🌳 Outdoor", icon: "🌳" },
        { value: "storage", label: "📦 Storage", icon: "📦" }
    ];

    useEffect(() => {
        fetchProductStats();
    }, [refreshProducts]);

    const fetchProductStats = async () => {
        setLoadingReport(true);
        try {
            const res = await axios.get("http://localhost:8000/api/products");
            setProductStats(res.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoadingReport(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value });
    };

    const handleAddProduct = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        try {
            await axios.post(
                "http://localhost:8000/api/products",
                {
                    ...newProduct,
                    price: parseFloat(newProduct.price),
                    inventory: parseInt(newProduct.inventory)
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setShowAddModal(false);
            setNewProduct({ 
                name: "", 
                description: "", 
                price: "", 
                inventory: "", 
                material: "",
                category: "",
                dimensions: "",
                image_url: "" 
            });
            setRefreshProducts(!refreshProducts);
            
            // Show success message
            alert("🎉 Product added successfully!");
            
        } catch (error) {
            console.error("Error adding product:", error);
            alert("❌ Error adding product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const chartData = {
        labels: productStats.slice(0, 10).map(p => p.name?.substring(0, 15) + "..." || 'Product'),
        datasets: [
            {
                label: 'Inventory',
                data: productStats.slice(0, 10).map(p => p.inventory || 0),
                backgroundColor: 'rgba(139, 69, 19, 0.8)',
                borderColor: 'rgba(139, 69, 19, 1)',
                borderWidth: 2,
                borderRadius: 8,
            },
            {
                label: 'Price ($)',
                data: productStats.slice(0, 10).map(p => p.price || 0),
                backgroundColor: 'rgba(212, 175, 55, 0.8)',
                borderColor: 'rgba(212, 175, 55, 1)',
                borderWidth: 2,
                borderRadius: 8,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: { size: 12, weight: 'bold' },
                    color: '#2C1810'
                }
            },
            title: {
                display: true,
                text: 'Product Overview',
                font: { size: 16, weight: 'bold' },
                color: '#2C1810'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(224, 224, 224, 0.5)' },
                ticks: { color: '#5D4037' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#5D4037' }
            }
        }
    };

    const getViewIcon = (viewType) => {
        switch(viewType) {
            case "products": return "🪑";
            case "orders": return "📦";
            case "analytics": return "📊";
            default: return "🪑";
        }
    };

    const getViewTitle = (viewType) => {
        switch(viewType) {
            case "products": return "Product Management";
            case "orders": return "Order Management";
            case "analytics": return "Analytics Dashboard";
            default: return "Product Management";
        }
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
                    Manage your furniture inventory, orders, and business analytics
                </p>

                {/* Navigation Tabs */}
                <div className="flex justify-center gap-4 mt-6">
                    <motion.button
                        className={`category-pill px-6 py-3 text-base ${view === "products" ? "active" : ""}`}
                        onClick={() => setView("products")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        🪑 Products
                    </motion.button>
                    <motion.button
                        className={`category-pill px-6 py-3 text-base ${view === "orders" ? "active" : ""}`}
                        onClick={() => setView("orders")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        📦 Orders
                    </motion.button>
                    <motion.button
                        className={`category-pill px-6 py-3 text-base ${view === "analytics" ? "active" : ""}`}
                        onClick={() => setView("analytics")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        📊 Analytics
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
                        {view === "products" && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-h4">🪑 Product Inventory</h3>
                                    <motion.button
                                        className="btn-primary-furniture"
                                        onClick={() => setShowAddModal(true)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        ➕ Add New Product
                                    </motion.button>
                                </div>
                                <AdminProductsTable refreshTrigger={refreshProducts} />
                            </div>
                        )}

                        {view === "orders" && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-h4">📦 Order Management</h3>
                                    <div className="text-body-sm text-muted">
                                        Track and manage customer orders
                                    </div>
                                </div>
                                <OrdersTable />
                            </div>
                        )}

                        {view === "analytics" && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-h4">📊 Business Analytics</h3>
                                    <div className="text-body-sm text-muted">
                                        Monitor performance and trends
                                    </div>
                                </div>
                                
                                {loadingReport ? (
                                    <div className="furniture-loading">
                                        <div className="furniture-spinner"></div>
                                        <span className="ml-4">Loading analytics...</span>
                                    </div>
                                ) : (
                                    <div style={{ height: '400px' }}>
                                        <Bar data={chartData} options={chartOptions} />
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Add Product Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            className="bg-surface rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-light">
                                <div>
                                    <h2 className="text-h3 mb-2">➕ Add New Product</h2>
                                    <p className="text-body text-secondary">
                                        Create a new furniture piece for your catalog
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="btn-secondary-furniture px-4 py-2"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Form Content */}
                            <div className="space-y-6">
                                {/* Product Name */}
                                <div>
                                    <label className="form-label-furniture">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newProduct.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Modern Oak Dining Table"
                                        className="form-input-furniture"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="form-label-furniture">Description</label>
                                    <textarea
                                        name="description"
                                        value={newProduct.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe the furniture piece, its features, and style..."
                                        className="form-input-furniture"
                                        rows="3"
                                        required
                                    />
                                </div>

                                {/* Price and Inventory */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label-furniture">Price ($)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={newProduct.price}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            className="form-input-furniture"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label-furniture">Inventory</label>
                                        <input
                                            type="number"
                                            name="inventory"
                                            value={newProduct.inventory}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                            min="0"
                                            className="form-input-furniture"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Material and Category */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label-furniture">Material</label>
                                        <select
                                            name="material"
                                            value={newProduct.material}
                                            onChange={handleInputChange}
                                            className="form-input-furniture"
                                            required
                                        >
                                            <option value="">Select Material</option>
                                            {materialOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label-furniture">Category</label>
                                        <select
                                            name="category"
                                            value={newProduct.category}
                                            onChange={handleInputChange}
                                            className="form-input-furniture"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categoryOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Dimensions */}
                                <div>
                                    <label className="form-label-furniture">Dimensions</label>
                                    <input
                                        type="text"
                                        name="dimensions"
                                        value={newProduct.dimensions}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 120cm x 80cm x 75cm"
                                        className="form-input-furniture"
                                    />
                                </div>

                                {/* Image URL */}
                                <div>
                                    <label className="form-label-furniture">Image URL</label>
                                    <input
                                        type="url"
                                        name="image_url"
                                        value={newProduct.image_url}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/product-image.jpg"
                                        className="form-input-furniture"
                                    />
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex gap-4 justify-end pt-6 mt-6 border-t border-border-light">
                                <button
                                    className="btn-secondary-furniture px-6"
                                    onClick={() => setShowAddModal(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    className="btn-primary-furniture px-8"
                                    onClick={handleAddProduct}
                                    disabled={loading || !newProduct.name || !newProduct.price}
                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                >
                                    {loading ? (
                                        <>
                                            <div className="furniture-spinner w-4 h-4 mr-2"></div>
                                            Adding...
                                        </>
                                    ) : (
                                        "✨ Add Product"
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                    ← Back to Dashboard
                </button>
            </motion.div>
        </motion.div>
    );
};

export default ProductPage;