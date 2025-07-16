import React, { useState, useEffect } from "react";
import axios from "axios";

const CartTable = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [contact, setContact] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [address, setAddress] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedQuantity, setEditedQuantity] = useState(1);


  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated.");

        const response = await axios.get("http://localhost:8000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCartItems(response.data || []);
      } catch (err) {
        setError("Failed to load cart items.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleRemoveItem = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User not authenticated.");
        return;
      }

      const response = await axios.delete(
        `http://localhost:8000/api/cart/${itemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        alert("Item removed from cart.");
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.id !== itemId)
        );
      } else {
        console.error("Error response:", response.data);
        alert("Failed to remove item.");
      }
    } catch (err) {
      console.error("Remove item error:", err.response?.data || err.message);
      alert("Failed to remove item.");
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (!address.trim()) {
      alert("Please enter your address.");
      return;
    }
    if (!contact.trim()) {
      alert("Please enter your contact number.");
      return;
    }
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User not authenticated.");
        return;
      }

      const response = await axios.post(
        "http://localhost:8000/api/checkout",
        { address, contact, paymentMethod, items: cartItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        alert("Checkout successful! Order ID: " + response.data.order_id);
        setCartItems([]);
        setShowSummary(false);
        setCheckoutStep(1);
        setAddress("");
        setContact("");
        setPaymentMethod("");
      } else {
        alert(response.data.message || "Failed to checkout.");
      }
    } catch (error) {
      alert(error.response?.data?.message || "An error occurred during checkout.");
    }
  };

  const handleEditSave = async (itemId) => {
  if (editedQuantity < 1) {
    alert("Quantity must be at least 1.");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("User not authenticated.");
      return;
    }

    const response = await axios.put(
      `http://localhost:8000/api/cart/${itemId}`,
      { quantity: editedQuantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 200) {
      alert("Cart item updated.");
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: editedQuantity } : item
        )
      );
      setEditingItemId(null);
    } else {
      alert("Failed to update item.");
    }
  } catch (error) {
    alert(error.response?.data?.message || "An error occurred during update.");
  }
};


  if (loading) return <p>Loading cart...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div>
      <h5>Total Items in Cart: {totalItems}</h5>
      <div className="table-responsive">
  <table className="table table-bordered text-center cart-table-woodcraft">

        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>₱{item.price}</td>
                <td>
                  {editingItemId === item.id ? (
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={editedQuantity}
                      onChange={(e) => setEditedQuantity(parseInt(e.target.value))}
                    />
                  ) : (
                    item.quantity
                  )}
                </td>

                <td>₱{item.price * item.quantity}</td>
                <td>
                <td>
  {editingItemId === item.id ? (
    <button
      className="btn btn-success me-2"
      onClick={() => handleEditSave(item.id)}
    >
      Save
    </button>
  ) : (
    <button
      className="btn btn-warning me-2"
      onClick={() => {
        setEditingItemId(item.id);
        setEditedQuantity(item.quantity);
      }}
    >
      Edit
    </button>
  )}
  <button className="btn btn-danger" onClick={() => handleRemoveItem(item.id)}>
    Remove
  </button>
</td>

                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                Your cart is empty.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      {cartItems.length > 0 && (
        <button
          className="btn btn-primary mt-3"
          onClick={() => setShowSummary(true)}
        >
          Checkout
        </button>
      )}

      {showSummary && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Order Summary</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSummary(false)}
                ></button>
              </div>
              <div className="modal-body">
                {checkoutStep === 1 ? (
                  <>
                    <p>Total Items: {totalItems}</p>
                    <p>Total Price: ₱{totalPrice}</p>
                  </>
                ) : (
                  <>
                    <label>Enter your Location:</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />

                    <label>Contact Number:</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      required
                    />

                    <label>Payment Method:</label>
                    <select
                      className="form-control mb-2"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select a payment method</option>
                      <option value="CashOnDelivery">Cash On Delivery</option>
                      <option value="Gcash">Gcash</option>
                      <option value="Maya">Maya</option>
                      <option value="Credit/Debit Card">Credit/Debit Card</option>
                    </select>
                  </>
                )}
              </div>
              <div className="modal-footer">
                {checkoutStep === 1 ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => setCheckoutStep(2)}
                  >
                    Next
                  </button>
                ) : (
                  <button className="btn btn-success" onClick={handleCheckout}>
                    Checkout
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowSummary(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        /* Modal Styling */
        .modal-content {
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 90%;
          margin: 20px auto;
          padding: 20px;
        }

        /* Modal Header */
        .modal-header {
          background-color: #e74c3c;
          color: #fff;
          border-radius: 12px 12px 0 0;
          padding: 15px;
          text-align: center;
        }

        .modal-title {
          font-size: 1.8rem;
          font-weight: bold;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        /* Close Button */
        .btn-close {
          color: white;
          background-color: transparent;
          border: none;
          font-size: 1.5rem;
          font-weight: bold;
          cursor: pointer;
        }

        .btn-close:hover {
          color: #f39c12;
        }

        /* Modal Body */
        .modal-body {
          font-size: 1.1rem;
          color: #34495e;
          padding: 15px;
          text-align: center;
        }

        /* Form Elements */
        input[type="text"],
        select {
          background-color: #f7f7f7;
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 10px;
          width: 100%;
          margin-bottom: 15px;
          font-size: 1rem;
        }

        input[type="text"]:focus,
        select:focus {
          outline: none;
          border-color: #e74c3c;
          box-shadow: 0 0 5px rgba(231, 76, 60, 0.5);
        }

        /* Buttons */
        .btn-primary,
        .btn-secondary,
        .btn-success {
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: bold;
          text-transform: uppercase;
          transition: background 0.3s ease;
        }

        .btn-primary {
          background-color: #e74c3c;
          color: white;
        }

        .btn-primary:hover {
          background-color: #c0392b;
        }

        .btn-secondary {
          background-color: #95a5a6;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #7f8c8d;
        }

        .btn-success {
          background-color: #27ae60;
          color: white;
        }

        .btn-success:hover {
          background-color: #2ecc71;
        }

        /* Modal Responsiveness */
        @media (max-width: 768px) {
          .modal-content {
            width: 100%;
          }

          .modal-header {
            font-size: 1.5rem;
          }
        
        /* Woodcraft-Inspired Table Styling */
        .cart-table-woodcraft {
          background-color: #fcf8f3;
          border-color: #a97457;
          
        }

        .cart-table-woodcraft th {
          background-color: #a97457;
          color: white;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 0.95rem;
          
        }

        .cart-table-woodcraft td {
          vertical-align: middle;
          color: #5e4b3c;
        }

        .cart-table-woodcraft td button {
          background-color: #d35400;
          border: none;
          padding: 6px 12px;
          color: white;
          font-weight: bold;
          border-radius: 6px;
        }

        .cart-table-woodcraft td button:hover {
          background-color: #e67e22;
        }

        }
      `}</style>
    </div>
  );
};

export default CartTable;