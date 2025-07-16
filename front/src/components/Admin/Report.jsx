import React, { useEffect, useState } from "react";
import axios from "axios";

const Report = () => {
  const [report, setReport] = useState({ orders: [], production: [], inventory: [] });

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    const res = await axios.get("http://localhost:8000/api/reports");
    setReport(res.data);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">Reports</h2>

      <section>
        <h3 className="font-semibold">Orders</h3>
        <ul>
          {report.orders.map((o) => (
            <li key={o.id}>Order #{o.id} - {o.status}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-semibold">Inventory</h3>
        <ul>
          {report.inventory.map((i) => (
            <li key={i.id}>{i.material} - {i.quantity}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-semibold">Production</h3>
        <ul>
          {report.production.map((p) => (
            <li key={p.id}>{p.product?.name || p.product_id} - {p.output_qty}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Report;
