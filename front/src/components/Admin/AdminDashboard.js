import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import api from "../../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [productStats, setProductStats] = useState([]);
  const [inventoryForecast, setInventoryForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  const chartRef = useRef();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productRes, reportRes] = await Promise.all([
        api.get("/products"),
        api.get("/reports")
      ]);

      setProductStats(productRes.data);

      const forecastObj = reportRes.data.material_forecast || {};
      const forecastArr = Object.entries(forecastObj).map(([material, forecast]) => ({
        material,
        forecast
      }));
      setInventoryForecast(forecastArr);
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const input = chartRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
    pdf.save("unick_dashboard_graphs.pdf");
  };

  const stockChart = {
    labels: productStats.map(p => p.name),
    datasets: [
      {
        label: "Stock",
        data: productStats.map(p => p.stock),
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
    ],
  };

  const forecastChart = {
    labels: inventoryForecast.map(i => i.material),
    datasets: [
      {
        label: "Predicted Usage (Next Day)",
        data: inventoryForecast.map(i => i.forecast),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
  };

  return (
    <div className="container mt-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-gray-800">📊 Unick Furniture Dashboard</h2>
        </div>

        {loading ? (
          <div className="text-center">Loading dashboard...</div>
        ) : (
          <>
            <div ref={chartRef}>
              <div className="card p-4 mb-5 shadow">
                <h4 className="mb-3">🪑 Product Stock Overview</h4>
                <Bar data={stockChart} options={{ ...options, title: { text: "Product Stocks" } }} />
              </div>

              <div className="card p-4 shadow">
                <h4 className="mb-3">📦 Inventory Usage Forecast</h4>
                <Bar data={forecastChart} options={{ ...options, title: { text: "Predicted Usage" } }} />
              </div>
            </div>

            <div className="text-center mt-4">
              <button
                onClick={handleDownloadPDF}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded shadow"
              >
                📤 Export Graphs as PDF
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
