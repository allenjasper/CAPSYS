import React, { useEffect, useState } from "react";
import axios from "axios";

const OrderPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await axios.get("http://localhost:8000/api/orders");
    setOrders(res.data);
  };

  const updateStatus = async (id, status) => {
    await axios.put(`http://localhost:8000/api/orders/${id}/status`, {
      status,
    });
    fetchOrders();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Order Management</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Items</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>
                {order.items.map((i) => (
                  <div key={i.id}>{i.product?.name || i.product_id} x {i.qty}</div>
                ))}
              </td>
              <td>{order.status}</td>
              <td>
                <select
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  value={order.status}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderPage;
