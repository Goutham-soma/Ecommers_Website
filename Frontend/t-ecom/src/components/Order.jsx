import React, { useEffect, useState } from "react";
import api from "../axios";

const Order = () => {
  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const userRole     = localStorage.getItem("userRole")  || "USER";
  const userEmail    = localStorage.getItem("userEmail") || "";
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response  = await api.get("/api/orders");
        const allOrders = response.data;

        if (isSuperAdmin) {
          // Admin sees ALL orders
          setOrders(allOrders);
        } else {
          // User sees ONLY orders where order.email matches their login email
          // Trim + lowercase both sides to avoid whitespace/case mismatch
          const myOrders = allOrders.filter(
            (order) =>
              order.email?.trim().toLowerCase() === userEmail?.trim().toLowerCase()
          );
          setOrders(myOrders);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrder = (orderId) =>
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));

  const getStatusBadge = (status) => {
    const map = {
      PLACED:    "bg-info text-dark",
      SHIPPED:   "bg-primary",
      DELIVERED: "bg-success",
      CANCELLED: "bg-danger",
    };
    return map[status] || "bg-secondary";
  };

  const fmt = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 2,
    }).format(amount);

  const total = (items) => items.reduce((s, i) => s + i.totalPrice, 0);

  if (loading) {
    return (
      <div className="container mt-5 pt-5">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 pt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5">

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="mb-0">{isSuperAdmin ? "All Orders" : "My Orders"}</h2>
        {!isSuperAdmin && userEmail && (
          <span className="badge bg-light text-dark border" style={{ fontSize: "0.78rem" }}>
            Showing orders for: <strong>{userEmail}</strong>
          </span>
        )}
      </div>

      {/* Empty state */}
      {orders.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-bag-x fs-1 text-muted"></i>
          <h5 className="mt-3 text-muted">
            {isSuperAdmin ? "No orders found." : "You haven't placed any orders yet."}
          </h5>
        </div>
      ) : (
        <div className="card shadow mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              {isSuperAdmin ? "All Orders" : "My Orders"} ({orders.length})
            </h5>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-center">Items</th>
                    <th>Total</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <React.Fragment key={order.orderId}>
                      <tr>
                        <td>
                          <span className="fw-bold text-primary" style={{ fontSize: "0.85rem" }}>
                            {order.orderId}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold">{order.customerName}</div>
                          <div className="text-muted small">{order.email}</div>
                        </td>
                        <td>{new Date(order.orderDate).toLocaleDateString("en-IN")}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="text-center">{order.items.length}</td>
                        <td className="fw-bold">{fmt(total(order.items))}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => toggleOrder(order.orderId)}
                          >
                            {expandedOrder === order.orderId ? "Hide" : "View"}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded items row */}
                      {expandedOrder === order.orderId && (
                        <tr>
                          <td colSpan="7" className="p-0">
                            <div className="bg-light p-3 border-top">
                              <h6 className="mb-3 text-secondary fw-semibold">Order Items</h6>
                              <table className="table table-sm table-bordered mb-0 bg-white">
                                <thead className="table-secondary">
                                  <tr>
                                    <th>Product</th>
                                    <th className="text-center">Qty</th>
                                    <th className="text-end">Price</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.items.map((item, idx) => (
                                    <tr key={idx}>
                                      <td>{item.productName}</td>
                                      <td className="text-center">{item.quantity}</td>
                                      <td className="text-end">{fmt(item.totalPrice)}</td>
                                    </tr>
                                  ))}
                                  <tr className="table-info fw-bold">
                                    <td colSpan="2" className="text-end">Total</td>
                                    <td className="text-end">{fmt(total(order.items))}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;