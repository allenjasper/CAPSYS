import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Cart from "./components/Customers/Cart";
import ProductPage from "./components/Admin/ProductPage"; 
import ProductionPage from "./components/Admin/ProductionPage"; 
import InventoryPage from "./components/Admin/InventoryPage"; // 
import OrderPage from "./components/Admin/OrderPage"; //  
import Report from "./components/Admin/Report"; //  


const isAuthenticated = () => !!localStorage.getItem("token");

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route path="/cart" element={isAuthenticated() ? <Cart /> : <Navigate to="/login" />} />
                <Route path="/dashboard" element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/inventory" element={isAuthenticated() ? <InventoryPage /> : <Navigate to="/login" />} /> {/* ✅ Inventory */}
                <Route path="/product" element={isAuthenticated() ? <ProductPage /> : <Navigate to="/login" />} /> {/* ✅ Product */} 
                <Route path="/productions" element={isAuthenticated() ? <ProductionPage /> : <Navigate to="/login" />} /> {/* ✅ Production */}
                <Route path="/orders" element={isAuthenticated() ? <OrderPage /> : <Navigate to="/login" />} /> {/* ✅ Order */}
                <Route path="/reports" element={isAuthenticated() ? <Report /> : <Navigate to="/login" />} /> {/* ✅ Report */}

                
      
                {/* Redirect unknown routes */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
