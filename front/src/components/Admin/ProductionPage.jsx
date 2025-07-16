import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductionPage = () => {
  const [productions, setProductions] = useState([]);
  const [product_id, setProductId] = useState("");
  const [output_qty, setOutputQty] = useState("");

  useEffect(() => {
    fetchProduction();
  }, []);

  const fetchProduction = async () => {
    const res = await axios.get("http://localhost:8000/api/production");
    setProductions(res.data);
  };

  const addProduction = async () => {
    await axios.post("http://localhost:8000/api/production", {
      product_id,
      date: new Date().toISOString().slice(0, 10),
      output_qty,
    });
    fetchProduction();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Production Tracking</h2>
      <input
        value={product_id}
        onChange={(e) => setProductId(e.target.value)}
        placeholder="Product ID"
        className="border p-2 mr-2"
      />
      <input
        value={output_qty}
        onChange={(e) => setOutputQty(e.target.value)}
        placeholder="Output Qty"
        type="number"
        className="border p-2 mr-2"
      />
      <button onClick={addProduction} className="bg-green-500 text-white p-2">
        Add
      </button>

      <table className="w-full mt-4 border">
        <thead>
          <tr>
            <th>Product</th>
            <th>Date</th>
            <th>Output Qty</th>
          </tr>
        </thead>
        <tbody>
          {productions.map((item) => (
            <tr key={item.id}>
              <td>{item.product?.name || item.product_id}</td>
              <td>{item.date}</td>
              <td>{item.output_qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductionPage;
