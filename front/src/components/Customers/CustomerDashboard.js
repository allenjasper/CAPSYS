import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import ProductCatalog from "./ProductCatalog";

const CustomerDashboard = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState("name");

    const categories = [
        { id: "all", name: "All Furniture", icon: "🏠" },
        { id: "living", name: "Living Room", icon: "🛋️" },
        { id: "bedroom", name: "Bedroom", icon: "🛏️" },
        { id: "dining", name: "Dining Room", icon: "🍽️" },
        { id: "office", name: "Office", icon: "💼" },
        { id: "outdoor", name: "Outdoor", icon: "🌳" }
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8000/api/products", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error.response || error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
    };

    const handleSortChange = (sortOption) => {
        setSortBy(sortOption);
    };

    const filteredAndSortedProducts = products
        .filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                product.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === "all" || 
                                  product.category?.toLowerCase().includes(selectedCategory);
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "price_low":
                    return a.price - b.price;
                case "price_high":
                    return b.price - a.price;
                case "name":
                default:
                    return a.name.localeCompare(b.name);
            }
        });

    const getProductStats = () => {
        return {
            total: products.length,
            categories: [...new Set(products.map(p => p.category))].length,
            priceRange: products.length > 0 ? {
                min: Math.min(...products.map(p => p.price)),
                max: Math.max(...products.map(p => p.price))
            } : { min: 0, max: 0 }
        };
    };

    const stats = getProductStats();

    return (
        <motion.div 
            className="furniture-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            {/* Hero Header */}
            <motion.div 
                className="furniture-dashboard-header"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <h1 className="furniture-dashboard-title">
                    🪑 Premium Furniture Collection
                </h1>
                <p className="furniture-dashboard-subtitle">
                    Discover handcrafted furniture pieces that transform your space into a sanctuary
                </p>
                
                {/* Quick Stats */}
                <div className="flex justify-center gap-8 mt-8">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary-color">{stats.total}</div>
                        <div className="text-sm text-muted">Products</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary-color">{stats.categories}</div>
                        <div className="text-sm text-muted">Categories</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary-color">
                            ${stats.priceRange.min} - ${stats.priceRange.max}
                        </div>
                        <div className="text-sm text-muted">Price Range</div>
                    </div>
                </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div 
                className="furniture-search-container"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Search Input */}
                    <div className="flex-1">
                        <label className="form-label-furniture">Search Products</label>
                        <input
                            type="text"
                            placeholder="Search for furniture, materials, styles..."
                            className="furniture-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Sort Options */}
                    <div className="min-w-[200px]">
                        <label className="form-label-furniture">Sort By</label>
                        <select
                            className="form-input-furniture"
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                        >
                            <option value="name">Name (A-Z)</option>
                            <option value="price_low">Price (Low to High)</option>
                            <option value="price_high">Price (High to Low)</option>
                        </select>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-3 mt-6">
                    {categories.map((category) => (
                        <motion.button
                            key={category.id}
                            className={`category-pill ${selectedCategory === category.id ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(category.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="mr-2">{category.icon}</span>
                            {category.name}
                        </motion.button>
                    ))}
                </div>

                {/* Results Summary */}
                <div className="mt-4 text-center">
                    <span className="text-body-sm text-muted">
                        Showing {filteredAndSortedProducts.length} of {products.length} products
                        {selectedCategory !== "all" && (
                            <span> in {categories.find(c => c.id === selectedCategory)?.name}</span>
                        )}
                        {searchTerm && (
                            <span> matching "{searchTerm}"</span>
                        )}
                    </span>
                </div>
            </motion.div>

            {/* Loading State */}
            {loading && (
                <div className="furniture-loading">
                    <div className="furniture-spinner"></div>
                    <span className="ml-4">Loading premium furniture...</span>
                </div>
            )}

            {/* Products Grid */}
            {!loading && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    {filteredAndSortedProducts.length > 0 ? (
                        <ProductCatalog products={filteredAndSortedProducts} />
                    ) : (
                        <motion.div 
                            className="text-center py-16"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-h3 mb-2 text-muted">No products found</h3>
                            <p className="text-body text-muted mb-6">
                                Try adjusting your search criteria or explore different categories
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedCategory("all");
                                }}
                                className="btn-primary-furniture"
                            >
                                Clear Filters
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* Featured Categories Section */}
            {!loading && searchTerm === "" && selectedCategory === "all" && (
                <motion.div
                    className="mt-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <div className="text-center mb-12">
                        <h2 className="text-h2 mb-4">Shop by Room</h2>
                        <p className="text-body-lg text-secondary">
                            Explore our curated collections designed for every space in your home
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.slice(1).map((category) => (
                            <motion.div
                                key={category.id}
                                className="furniture-grid-item text-center cursor-pointer"
                                onClick={() => handleCategoryChange(category.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="text-4xl mb-3">{category.icon}</div>
                                <h4 className="text-h6 text-primary">{category.name}</h4>
                                <p className="text-caption text-muted mt-1">
                                    {products.filter(p => p.category?.toLowerCase().includes(category.id)).length} items
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default CustomerDashboard;