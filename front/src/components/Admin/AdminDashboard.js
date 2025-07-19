import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import api from "../../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { 
  Package, 
  Factory, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  DollarSign,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react';

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
  const [productionData, setProductionData] = useState([]);
  const [orderAnalytics, setOrderAnalytics] = useState({});
  const [reorderAlerts, setReorderAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    recentOrders: 0,
    todayProduction: 0,
    productionEfficiency: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  const chartRef = useRef();

  useEffect(() => {
    fetchData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all dashboard data in parallel
      const [
        productsRes,
        inventoryRes,
        forecastRes,
        productionRes,
        ordersRes,
        reorderRes,
        productionDashboard
      ] = await Promise.all([
        api.get('/products'),
        api.get('/inventory'),
        api.get('/inventory/forecast'),
        api.get('/productions'),
        api.get('/orders/analytics'),
        api.get('/inventory/reorder-alerts'),
        api.get('/productions/dashboard')
      ]);

      // Process products data
      setProductStats(productsRes.data.data || []);

      // Process inventory forecast
      setInventoryForecast(forecastRes.data.data || []);

      // Process production data
      setProductionData(productionRes.data.data || []);

      // Process order analytics
      setOrderAnalytics(ordersRes.data.data || {});

      // Process reorder alerts
      setReorderAlerts(reorderRes.data.data || []);

      // Calculate dashboard stats
      const totalProducts = productsRes.data.data?.length || 0;
      const totalRevenue = ordersRes.data.data?.summary?.total_revenue || 0;
      const lowStockItems = reorderRes.data.count || 0;
      const recentOrders = ordersRes.data.data?.summary?.today_orders || 0;
      const todayProduction = productionDashboard.data.data?.today?.total_output || 0;
      const productionEfficiency = productionDashboard.data.data?.today?.avg_efficiency || 0;
      const pendingOrders = ordersRes.data.data?.by_status?.find(s => s.status === 'pending')?.count || 0;
      const completedOrders = ordersRes.data.data?.by_status?.find(s => s.status === 'delivered')?.count || 0;

      setDashboardStats({
        totalProducts,
        totalRevenue,
        lowStockItems,
        recentOrders,
        todayProduction,
        productionEfficiency,
        pendingOrders,
        completedOrders
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const element = chartRef.current;
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF();
      pdf.setFontSize(20);
      pdf.text('Unick Enterprises - Production & Inventory Report', 20, 20);
      
      pdf.setFontSize(12);
      const reportDate = new Date().toLocaleDateString();
      pdf.text(`Generated on: ${reportDate}`, 20, 35);
      
      // Add statistics
      pdf.text(`Total Products: ${dashboardStats.totalProducts}`, 20, 50);
      pdf.text(`Total Revenue: $${dashboardStats.totalRevenue.toFixed(2)}`, 20, 60);
      pdf.text(`Low Stock Items: ${dashboardStats.lowStockItems}`, 20, 70);
      pdf.text(`Today's Production: ${dashboardStats.todayProduction} units`, 20, 80);
      pdf.text(`Production Efficiency: ${dashboardStats.productionEfficiency.toFixed(1)}%`, 20, 90);
      
      // Add chart
      pdf.addImage(imgData, 'PNG', 20, 100, 170, 100);
      
      pdf.save(`unick-enterprises-report-${reportDate}.pdf`);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  // Chart configurations with wood theme colors
  const inventoryChartData = {
    labels: inventoryForecast.slice(0, 10).map(item => item.name || item.sku),
    datasets: [{
      label: 'Current Stock',
      data: inventoryForecast.slice(0, 10).map(item => item.current_stock),
      backgroundColor: 'rgba(139, 69, 19, 0.8)',
      borderColor: '#8B4513',
      borderWidth: 2
    }, {
      label: 'Reorder Point',
      data: inventoryForecast.slice(0, 10).map(item => item.reorder_point),
      backgroundColor: 'rgba(210, 105, 30, 0.6)',
      borderColor: '#D2691E',
      borderWidth: 2
    }]
  };

  const productionStatusData = {
    labels: ['Completed', 'In Progress', 'Planned', 'Paused'],
    datasets: [{
      data: [
        productionData.filter(p => p.status === 'completed').length,
        productionData.filter(p => p.status === 'in_progress').length,
        productionData.filter(p => p.status === 'planned').length,
        productionData.filter(p => p.status === 'paused').length
      ],
      backgroundColor: [
        '#2E7D32', // Green for completed
        '#D2691E', // Orange for in progress  
        '#8B4513', // Brown for planned
        '#F57C00'  // Amber for paused
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const orderTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Orders',
      data: [12, 19, 15, 25, 22, 30],
      borderColor: '#8B4513',
      backgroundColor: 'rgba(139, 69, 19, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#654321',
          font: {
            family: 'Lato, sans-serif',
            weight: '600'
          }
        }
      },
      title: {
        display: true,
        color: '#654321',
        font: {
          family: 'Playfair Display, serif',
          size: 16,
          weight: '700'
        }
      }
    },
    scales: {
      y: {
        ticks: {
          color: '#654321'
        },
        grid: {
          color: 'rgba(139, 69, 19, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#654321'
        },
        grid: {
          color: 'rgba(139, 69, 19, 0.1)'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-wood">
        <div className="container">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="spinner-wood mx-auto mb-4"></div>
              <p className="text-wood-dark">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wood">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-wood-dark mb-2">
                Production & Inventory Dashboard
              </h1>
              <p className="text-wood-secondary">
                Unick Enterprises Inc. - Comprehensive Management System
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={fetchData}
                className="btn-wood-outline flex items-center gap-2"
                disabled={loading}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                onClick={generateReport}
                className="btn-wood flex items-center gap-2"
              >
                <Download size={16} />
                Export Report
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-wood-primary">
                  {dashboardStats.totalProducts}
                </h3>
                <p className="text-wood-secondary">Total Products</p>
              </div>
              <Package className="text-wood-primary" size={32} />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-success">
                  ${dashboardStats.totalRevenue.toFixed(2)}
                </h3>
                <p className="text-wood-secondary">Total Revenue</p>
              </div>
              <DollarSign className="text-success" size={32} />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-warning">
                  {dashboardStats.lowStockItems}
                </h3>
                <p className="text-wood-secondary">Reorder Alerts</p>
              </div>
              <AlertTriangle className="text-warning" size={32} />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-info">
                  {dashboardStats.todayProduction}
                </h3>
                <p className="text-wood-secondary">Today's Production</p>
              </div>
              <Factory className="text-info" size={32} />
            </div>
          </div>
        </motion.div>

        {/* Production & Order Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-wood-primary">
                  {dashboardStats.productionEfficiency.toFixed(1)}%
                </h3>
                <p className="text-wood-secondary">Production Efficiency</p>
              </div>
              <TrendingUp className="text-wood-primary" size={32} />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-warning">
                  {dashboardStats.pendingOrders}
                </h3>
                <p className="text-wood-secondary">Pending Orders</p>
              </div>
              <Clock className="text-warning" size={32} />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-success">
                  {dashboardStats.completedOrders}
                </h3>
                <p className="text-wood-secondary">Completed Orders</p>
              </div>
              <CheckCircle className="text-success" size={32} />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-info">
                  {dashboardStats.recentOrders}
                </h3>
                <p className="text-wood-secondary">Today's Orders</p>
              </div>
              <ShoppingCart className="text-info" size={32} />
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div ref={chartRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          >
            {/* Inventory Status Chart */}
            <div className="card-wood">
              <div className="card-wood-header">
                <h3 className="text-lg font-semibold">Inventory Status (MRP)</h3>
              </div>
              <div className="card-wood-body">
                <Bar 
                  data={inventoryChartData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: 'Current Stock vs Reorder Points'
                      }
                    }
                  }} 
                />
              </div>
            </div>

            {/* Production Status Chart */}
            <div className="card-wood">
              <div className="card-wood-header">
                <h3 className="text-lg font-semibold">Production Status</h3>
              </div>
              <div className="card-wood-body">
                <Doughnut 
                  data={productionStatusData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: 'Production by Status'
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </motion.div>

          {/* Order Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-wood mb-8"
          >
            <div className="card-wood-header">
              <h3 className="text-lg font-semibold">Order Trends</h3>
            </div>
            <div className="card-wood-body">
              <Line 
                data={orderTrendData} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: 'Monthly Order Trends'
                    }
                  }
                }} 
              />
            </div>
          </motion.div>
        </div>

        {/* Reorder Alerts */}
        {reorderAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-wood"
          >
            <div className="card-wood-header">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle size={20} />
                Reorder Alerts ({reorderAlerts.length})
              </h3>
            </div>
            <div className="card-wood-body">
              <div className="overflow-x-auto">
                <table className="table-wood w-full">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Item Name</th>
                      <th>Current Stock</th>
                      <th>Reorder Point</th>
                      <th>Recommended Order</th>
                      <th>Days Until Stockout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reorderAlerts.slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td className="font-medium">{item.sku}</td>
                        <td>{item.name}</td>
                        <td>
                          <span className="badge-wood badge-warning">
                            {item.stock}
                          </span>
                        </td>
                        <td>{item.reorder_point}</td>
                        <td>{item.recommended_order_qty}</td>
                        <td>
                          {item.days_until_stockout ? (
                            <span className="badge-wood badge-error">
                              {item.days_until_stockout} days
                            </span>
                          ) : (
                            <span className="text-error">Critical</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
