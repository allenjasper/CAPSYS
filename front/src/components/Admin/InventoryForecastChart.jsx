import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const InventoryForecastChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    const res = await axios.get("http://localhost:8000/api/reports");
    const forecast = res.data.material_forecast || {};
    const formatted = Object.keys(forecast).map((material) => ({
      material,
      forecast: forecast[material],
    }));
    setData(formatted);
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-2">📊 Inventory Forecast (Next Day Usage)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="material" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="forecast" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InventoryForecastChart;
