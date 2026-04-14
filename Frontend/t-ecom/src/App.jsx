import React, { useState } from "react";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider } from "./Context/Context";
import UpdateProduct from "./components/UpdateProduct";
import Order from "./components/Order";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SearchResults from "./components/SearchResults";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ToastContainer } from "react-toastify";

// ── Auth guard ────────────────────────────────────────────────────────────────
function ProtectedRoute({ children, adminOnly = false }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole   = localStorage.getItem("userRole") || "USER";

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (adminOnly && userRole !== "SUPER_ADMIN") return <Navigate to="/home" replace />;
  return children;
}

// ── Hide navbar on auth pages ─────────────────────────────────────────────────
function Layout({ children, onSelectCategory }) {
  const location = useLocation();
  const hideNavbar = ["/login", "/register"].includes(location.pathname);
  return (
    <>
      {!hideNavbar && <Navbar onSelectCategory={onSelectCategory} />}
      <div className={hideNavbar ? "" : "min-vh-100 bg-light"}>
        {children}
      </div>
    </>
  );
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState("");

  return (
    <AppProvider>
      <BrowserRouter>
        <ToastContainer autoClose={2000} hideProgressBar={true} />
        <Layout onSelectCategory={(cat) => setSelectedCategory(cat)}>
          <Routes>

            {/* Public */}
            <Route path="/"         element={<Navigate to="/login" replace />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected — any logged-in user */}
            <Route path="/home" element={
              <ProtectedRoute>
                <Home selectedCategory={selectedCategory} />
              </ProtectedRoute>
            } />
            <Route path="/product" element={
              <ProtectedRoute><Product /></ProtectedRoute>
            } />
            <Route path="/product/:id" element={
              <ProtectedRoute><Product /></ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute><Cart /></ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute><Order /></ProtectedRoute>
            } />
            <Route path="/search-results" element={
              <ProtectedRoute><SearchResults /></ProtectedRoute>
            } />

            {/* Protected — SUPER_ADMIN only */}
            <Route path="/add_product" element={
              <ProtectedRoute adminOnly={true}><AddProduct /></ProtectedRoute>
            } />
            <Route path="/product/update/:id" element={
              <ProtectedRoute adminOnly={true}><UpdateProduct /></ProtectedRoute>
            } />

          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;