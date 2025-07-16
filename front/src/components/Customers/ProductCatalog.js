import React, { useState } from "react";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import axios from "axios";
import { motion } from "framer-motion";
import './product_catalog.css';

const ProductCatalog = ({ products }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleShowModal = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setError(null);
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

            console.log("Added to cart:", response.data);
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="row">
            {products.length === 0 ? (
                <p>No products found.</p>
            ) : (
                products.map((product) => (
                    <motion.div
                        key={product.id}
                        className="col-md-4 mb-4"
                        whileHover={{ scale: 1.03 }}
                    >
                        <div className="product-card">
                            <div className="position-relative">
                                <img
                                    src={`http://localhost:8000/${product.image}`}
                                    alt={product.name}
                                    className="card-img-top product-image"
                                />
                                {product.isNew && (
                                    <Badge bg="success" className="position-absolute top-0 start-0 m-2">
                                        New
                                    </Badge>
                                )}
                                {product.isBestSeller && (
                                    <Badge bg="warning" className="position-absolute top-0 end-0 m-2">
                                        Best Seller
                                    </Badge>
                                )}
                            </div>
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title text-primary">{product.name}</h5>
                                <p className="card-text text-muted">{product.description.slice(0, 70)}...</p>
                                <h5 className="text-danger mb-3">₱{product.price}</h5>
                                <Button
                                    variant="outline-primary"
                                    onClick={() => handleShowModal(product)}
                                    className="mt-auto"
                                >
                                    Add to Cart
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))
            )}

            {/* Modal for adding to cart */}
            {selectedProduct && (
                <Modal
                show={showModal}
                onHide={handleCloseModal}
                dialogClassName="minimal-modal"
              >
              
                    <Modal.Header closeButton>
                        <Modal.Title>{selectedProduct.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <img
                            src={`http://localhost:8000/${selectedProduct.image}`}
                            className="img-fluid mb-3"
                            alt={selectedProduct.name}
                        />
                        <p>{selectedProduct.description}</p>
                        <p><strong>Price:</strong> ₱{selectedProduct.price}</p>
                        <p><strong>Stock:</strong> {selectedProduct.stock}</p>
                        {error && <p className="text-danger">{error}</p>}
                        <Form>
                            <Form.Group controlId="quantity">
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleAddToCart} disabled={loading}>
                            {loading ? "Adding..." : "Add to Cart"}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default ProductCatalog;
