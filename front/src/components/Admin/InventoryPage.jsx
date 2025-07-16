import React, { useEffect, useState } from "react";
import axios from "axios";

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const res = await axios.get("http://localhost:8000/api/inventory");
    setInventory(res.data);
  };

  const addInventory = async () => {
    await axios.post("http://localhost:8000/api/inventory", {
      material,
      quantity,
    });
    setMaterial("");
    setQuantity("");
    fetchInventory();
  };

  const deleteInventory = async (id) => {
    await axios.delete(`http://localhost:8000/api/inventory/${id}`);
    fetchInventory();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Inventory Management</h2>
      <input
        value={material}
        onChange={(e) => setMaterial(e.target.value)}
        placeholder="Material"
        className="border p-2 mr-2"
      />
      <input
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="Quantity"
        type="number"
        className="border p-2 mr-2"
      />
      <button onClick={addInventory} className="bg-blue-500 text-white p-2">
        Add
      </button>

      <table className="w-full mt-4 border">
        <thead>
          <tr>
            <th>Material</th>
            <th>Quantity</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>{item.material}</td>
              <td>{item.quantity}</td>
              <td>
                <button
                  onClick={() => deleteInventory(item.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryPage;
