import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bar, Doughnut, Line } from "react-chartjs-2";
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
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from "chart.js";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AdminDashboard = () => {
  const [productStats, setProductStats] = useState([]);
  const [inventoryForecast, setInventoryForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    recentOrders: 0
  });

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

      // Calculate dashboard statistics
      const products = productRes.data;
      const totalProducts = products.length;
      const totalRevenue = products.reduce((sum, p) => sum + (p.price * (p.sold || 0)), 0);
      const lowStockItems = products.filter(p => (p.inventory || 0) < 5).length;

      setDashboardStats({
        totalProducts,
        totalRevenue,
        lowStockItems,
        recentOrders: Math.floor(Math.random() * 50) + 10 // Mock data
      });

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

  const exportToPDF = async () => {
    const element = chartRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("Furniture_Dashboard_Report.pdf");
  };

  // Chart data configurations
  const productChartData = {
    labels: productStats.map(p => p.name?.substring(0, 15) + "..." || 'Product'),
    datasets: [
      {
        label: 'Inventory',
        data: productStats.map(p => p.inventory || 0),
        backgroundColor: 'rgba(139, 69, 19, 0.8)',
        borderColor: 'rgba(139, 69, 19, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Price ($)',
        data: productStats.map(p => p.price || 0),
        backgroundColor: 'rgba(212, 175, 55, 0.8)',
        borderColor: 'rgba(212, 175, 55, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const materialDistributionData = {
    labels: [...new Set(productStats.map(p => p.material || 'Unknown'))],
    datasets: [
      {
        data: [...new Set(productStats.map(p => p.material || 'Unknown'))].map(material =>
          productStats.filter(p => (p.material || 'Unknown') === material).length
        ),
        backgroundColor: [
          'rgba(139, 69, 19, 0.8)',
          'rgba(212, 175, 55, 0.8)',
          'rgba(160, 82, 45, 0.8)',
          'rgba(101, 67, 33, 0.8)',
          'rgba(244, 227, 156, 0.8)',
          'rgba(184, 134, 11, 0.8)'
        ],
        borderColor: [
          'rgba(139, 69, 19, 1)',
          'rgba(212, 175, 55, 1)',
          'rgba(160, 82, 45, 1)',
          'rgba(101, 67, 33, 1)',
          'rgba(244, 227, 156, 1)',
          'rgba(184, 134, 11, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [12000, 19000, 15000, 25000, 22000, 30000], // Mock data
        borderColor: 'rgba(139, 69, 19, 1)',
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(139, 69, 19, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#2C1810'
        }
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#2C1810'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(224, 224, 224, 0.5)'
        },
        ticks: {
          color: '#5D4037'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#5D4037'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="furniture-dashboard">
        <div className="furniture-loading">
          <div className="furniture-spinner"></div>
          <span className="ml-4">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="furniture-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Dashboard Header */}
      <motion.div
        className="furniture-dashboard-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h1 className="furniture-dashboard-title">
          📊 Admin Dashboard
        </h1>
        <p className="furniture-dashboard-subtitle">
          Monitor your furniture business performance and inventory insights
        </p>

        {/* Export Button */}
        <div className="mt-6">
          <button
            onClick={exportToPDF}
            className="btn-primary-furniture"
          >
            📄 Export Report
          </button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="stat-card-furniture">
          <span className="stat-number">🪑 {dashboardStats.totalProducts}</span>
          <span className="stat-label">Total Products</span>
        </div>
        <div className="stat-card-furniture">
          <span className="stat-number">💰 ${dashboardStats.totalRevenue.toLocaleString()}</span>
          <span className="stat-label">Total Revenue</span>
        </div>
        <div className="stat-card-furniture">
          <span className="stat-number">⚠️ {dashboardStats.lowStockItems}</span>
          <span className="stat-label">Low Stock Items</span>
        </div>
        <div className="stat-card-furniture">
          <span className="stat-number">📦 {dashboardStats.recentOrders}</span>
          <span className="stat-label">Recent Orders</span>
        </div>
      </motion.div>

      {/* Charts Section */}
      <div ref={chartRef}>
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Product Inventory Chart */}
          <div className="furniture-grid-item">
            <h3 className="text-h4 mb-6 text-center">📈 Product Inventory & Pricing</h3>
            <div style={{ height: '400px' }}>
              <Bar
                data={productChartData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: 'Inventory Levels vs Product Prices'
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Material Distribution */}
          <div className="furniture-grid-item">
            <h3 className="text-h4 mb-6 text-center">🌳 Material Distribution</h3>
            <div style={{ height: '400px' }}>
              <Doughnut
                data={materialDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        font: {
                          size: 12,
                          weight: 'bold'
                        },
                        color: '#2C1810'
                      }
                    },
                    title: {
                      display: true,
                      text: 'Products by Material Type',
                      font: {
                        size: 16,
                        weight: 'bold'
                      },
                      color: '#2C1810'
                    }
                  }
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Revenue Trend */}
        <motion.div
          className="furniture-grid-item mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h3 className="text-h4 mb-6 text-center">💹 Revenue Trend (6 Months)</h3>
          <div style={{ height: '300px' }}>
            <Line
              data={revenueData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Monthly Revenue Performance'
                  }
                }
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Inventory Forecast */}
      {inventoryForecast.length > 0 && (
        <motion.div
          className="furniture-grid-item"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <h3 className="text-h4 mb-6 text-center">🔮 Inventory Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryForecast.map((item, index) => (
              <motion.div
                key={index}
                className="bg-background-secondary p-6 rounded-xl border border-border-light"
                whileHover={{ scale: 1.02 }}
              >
                <h4 className="text-h6 mb-2 text-primary-color capitalize">
                  🏗️ {item.material}
                </h4>
                <p className="text-body text-secondary">
                  Forecast: <span className="font-semibold">{item.forecast}</span>
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        className="furniture-grid-item"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <h3 className="text-h4 mb-6 text-center">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="btn-secondary-furniture p-4 flex flex-col items-center gap-2">
            <span className="text-2xl">➕</span>
            <span className="text-sm">Add Product</span>
          </button>
          <button className="btn-secondary-furniture p-4 flex flex-col items-center gap-2">
            <span className="text-2xl">📦</span>
            <span className="text-sm">Manage Inventory</span>
          </button>
          <button className="btn-secondary-furniture p-4 flex flex-col items-center gap-2">
            <span className="text-2xl">📋</span>
            <span className="text-sm">View Orders</span>
          </button>
          <button className="btn-secondary-furniture p-4 flex flex-col items-center gap-2">
            <span className="text-2xl">📊</span>
            <span className="text-sm">Generate Report</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
