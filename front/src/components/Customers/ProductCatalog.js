import React, { useState } from "react";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const ProductCatalog = ({ products }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleShowModal = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setShowModal(true);
        setError(null);
        setSuccess(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setError(null);
        setSuccess(false);
    };

    const handleAddToCart = async () => {
        if (!selectedProduct) return;
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("You need to be logged in to add to cart.");
                setLoading(false);
                return;
            }

            const response = await axios.post(
                "http://localhost:8000/api/cart",
                {
                    product_id: selectedProduct.id,
                    quantity: quantity,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setSuccess(true);
            setTimeout(() => {
                handleCloseModal();
            }, 1500);

        } catch (error) {
            console.error("Error adding to cart:", error.response || error);
            setError(error.response?.data?.message || "Failed to add item to cart. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const getAvailabilityStatus = (inventory) => {
        if (inventory === 0) return { status: "Out of Stock", color: "error", icon: "❌" };
        if (inventory < 5) return { status: "Low Stock", color: "warning", icon: "⚠️" };
        return { status: "In Stock", color: "success", icon: "✅" };
    };

    const getMaterialIcon = (material) => {
        const materials = {
            'wood': '🌳',
            'metal': '⚙️',
            'fabric': '🧵',
            'leather': '🐄',
            'plastic': '🔧',
            'glass': '🪟'
        };
        return materials[material?.toLowerCase()] || '🪑';
    };

    return (
        <div>
            {/* Products Grid */}
            <motion.div 
                className="furniture-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                {products.map((product, index) => {
                    const availability = getAvailabilityStatus(product.inventory || 0);
                    
                    return (
                        <motion.div
                            key={product.id}
                            className="furniture-card"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -8 }}
                        >
                            {/* Product Image */}
                            <div className="relative">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="furniture-card-image"
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDMwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjhGNkYwIi8+CjxwYXRoIGQ9Ik0xNTAgMTI1QzE2Ni41NjkgMTI1IDE4MCAxMTEuNTY5IDE4MCA5NUMxODAgNzguNDMxNSAxNjYuNTY5IDY1IDE1MCA2NUMxMzMuNDMxIDY1IDEyMCA3OC40MzE1IDEyMCA5NUMxMjAgMTExLjU2OSAxMzMuNDMxIDEyNSAxNTAgMTI1WiIgZmlsbD0iIzhCNDUxMyIvPgo8cGF0aCBkPSJNMTUwIDE0NUM5MS43MDEgMTQ1IDQ1IDE5MS43MDEgNDUgMjUwSDI1NUMyNTUgMTkxLjcwMSAyMDguMjk5IDE0NSAxNTAgMTQ1WiIgZmlsbD0iIzhCNDUxMyIvPgo8L3N2Zz4K';
                                        }}
                                    />
                                ) : (
                                    <div className="furniture-card-image flex items-center justify-center bg-background-secondary">
                                        <span className="text-6xl">{getMaterialIcon(product.material)}</span>
                                    </div>
                                )}
                                
                                {/* Availability Badge */}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-${availability.color}-color bg-${availability.color}-light`}>
                                        {availability.icon} {availability.status}
                                    </span>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="flex-1">
                                <h3 className="furniture-card-title">{product.name}</h3>
                                
                                {/* Price */}
                                <div className="furniture-card-price">
                                    {formatPrice(product.price)}
                                </div>

                                {/* Material & Dimensions */}
                                <div className="flex gap-2 mb-4">
                                    {product.material && (
                                        <span className="category-pill text-xs">
                                            {getMaterialIcon(product.material)} {product.material}
                                        </span>
                                    )}
                                    {product.dimensions && (
                                        <span className="category-pill text-xs">
                                            📏 {product.dimensions}
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                <p className="furniture-card-description">
                                    {product.description?.length > 120 
                                        ? `${product.description.substring(0, 120)}...`
                                        : product.description || "Handcrafted furniture piece designed for modern living."
                                    }
                                </p>

                                {/* Action Buttons */}
                                <div className="flex gap-3 mt-auto">
                                    <button
                                        className="btn-primary-furniture flex-1"
                                        onClick={() => handleShowModal(product)}
                                        disabled={availability.status === "Out of Stock"}
                                    >
                                        🛒 Add to Cart
                                    </button>
                                    <button
                                        className="btn-secondary-furniture px-4"
                                        onClick={() => handleShowModal(product)}
                                    >
                                        👁️ Details
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Enhanced Product Modal */}
            <AnimatePresence>
                {showModal && selectedProduct && (
                    <Modal 
                        show={showModal} 
                        onHide={handleCloseModal} 
                        size="lg"
                        backdrop="static"
                        className="furniture-modal"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Modal.Header closeButton className="border-0 pb-0">
                                <div className="w-full">
                                    <Modal.Title className="furniture-card-title mb-2">
                                        {selectedProduct.name}
                                    </Modal.Title>
                                    <div className="flex items-center gap-4">
                                        <span className="furniture-card-price">
                                            {formatPrice(selectedProduct.price)}
                                        </span>
                                        {(() => {
                                            const availability = getAvailabilityStatus(selectedProduct.inventory || 0);
                                            return (
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold text-${availability.color}-color bg-${availability.color}-light`}>
                                                    {availability.icon} {availability.status}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </Modal.Header>

                            <Modal.Body className="pt-3">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Product Image */}
                                    <div>
                                        {selectedProduct.image_url ? (
                                            <img
                                                src={selectedProduct.image_url}
                                                alt={selectedProduct.name}
                                                className="w-full h-80 object-cover rounded-xl"
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDMwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjhGNkYwIi8+CjxwYXRoIGQ9Ik0xNTAgMTI1QzE2Ni41NjkgMTI1IDE4MCAxMTEuNTY5IDE4MCA5NUMxODAgNzguNDMxNSAxNjYuNTY5IDY1IDE1MCA2NUMxMzMuNDMxIDY1IDEyMCA3OC40MzE1IDEyMCA5NUMxMjAgMTExLjU2OSAxMzMuNDMxIDEyNSAxNTAgMTI1WiIgZmlsbD0iIzhCNDUxMyIvPgo8cGF0aCBkPSJNMTUwIDE0NUM5MS43MDEgMTQ1IDQ1IDE5MS43MDEgNDUgMjUwSDI1NUMyNTUgMTkxLjcwMSAyMDguMjk5IDE0NSAxNTAgMTQ1WiIgZmlsbD0iIzhCNDUxMyIvPgo8L3N2Zz4K';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-80 bg-background-secondary rounded-xl flex items-center justify-center">
                                                <span className="text-8xl">{getMaterialIcon(selectedProduct.material)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="space-y-4">
                                        {/* Description */}
                                        <div>
                                            <h5 className="text-h6 mb-2">Description</h5>
                                            <p className="text-body text-secondary">
                                                {selectedProduct.description || "This handcrafted furniture piece is designed for modern living spaces, combining functionality with elegant aesthetics."}
                                            </p>
                                        </div>

                                        {/* Specifications */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedProduct.material && (
                                                <div>
                                                    <h6 className="form-label-furniture">Material</h6>
                                                    <p className="text-body">
                                                        {getMaterialIcon(selectedProduct.material)} {selectedProduct.material}
                                                    </p>
                                                </div>
                                            )}
                                            {selectedProduct.dimensions && (
                                                <div>
                                                    <h6 className="form-label-furniture">Dimensions</h6>
                                                    <p className="text-body">📏 {selectedProduct.dimensions}</p>
                                                </div>
                                            )}
                                            {selectedProduct.category && (
                                                <div>
                                                    <h6 className="form-label-furniture">Category</h6>
                                                    <p className="text-body">🏷️ {selectedProduct.category}</p>
                                                </div>
                                            )}
                                            <div>
                                                <h6 className="form-label-furniture">Inventory</h6>
                                                <p className="text-body">📦 {selectedProduct.inventory || 0} units</p>
                                            </div>
                                        </div>

                                        {/* Quantity Selector */}
                                        <div>
                                            <label className="form-label-furniture">Quantity</label>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    className="btn-secondary-furniture px-3 py-2"
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    disabled={quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    className="form-input-furniture text-center"
                                                    style={{ width: '80px' }}
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                    min="1"
                                                    max={selectedProduct.inventory || 1}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn-secondary-furniture px-3 py-2"
                                                    onClick={() => setQuantity(Math.min((selectedProduct.inventory || 1), quantity + 1))}
                                                    disabled={quantity >= (selectedProduct.inventory || 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Total Price */}
                                        <div className="bg-background-secondary p-4 rounded-xl">
                                            <div className="flex justify-between items-center">
                                                <span className="text-body font-semibold">Total Price:</span>
                                                <span className="text-h5 text-primary-color font-bold">
                                                    {formatPrice(selectedProduct.price * quantity)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Error/Success Messages */}
                                        {error && (
                                            <motion.div 
                                                className="furniture-toast error"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                ❌ {error}
                                            </motion.div>
                                        )}

                                        {success && (
                                            <motion.div 
                                                className="furniture-toast success"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                ✅ Successfully added to cart!
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </Modal.Body>

                            <Modal.Footer className="border-0 pt-0">
                                <div className="flex gap-3 w-full">
                                    <Button 
                                        variant="outline-secondary" 
                                        onClick={handleCloseModal}
                                        className="btn-secondary-furniture"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="btn-primary-furniture flex-1"
                                        onClick={handleAddToCart}
                                        disabled={loading || selectedProduct.inventory === 0 || success}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="furniture-spinner w-4 h-4 mr-2"></div>
                                                Adding...
                                            </>
                                        ) : success ? (
                                            "✅ Added to Cart!"
                                        ) : (
                                            "🛒 Add to Cart"
                                        )}
                                    </Button>
                                </div>
                            </Modal.Footer>
                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductCatalog;
