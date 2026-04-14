import React, { useState } from "react";
import { Modal, Button, Form, Toast, ToastContainer } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../axios";

const CheckoutPopup = ({ show, handleClose, cartItems, totalPrice }) => {
  const navigate = useNavigate();

  // Auto-fill from localStorage — ensures order.email always matches userEmail
  // so per-user order filtering works correctly
  const loggedInEmail     = localStorage.getItem("userEmail") || "";
  const loggedInFirstName = localStorage.getItem("firstName") || "";

  const [name,        setName]        = useState(loggedInFirstName);
  const [email,       setEmail]       = useState(loggedInEmail);
  const [validated,   setValidated]   = useState(false);
  const [showToast,   setShowToast]   = useState(false);
  const [toastMsg,    setToastMsg]    = useState("");
  const [toastVariant,setToastVariant]= useState("success");
  const [isSubmitting,setIsSubmitting]= useState(false);

  const convertBase64ToDataURL = (base64, mimeType = "image/jpeg") => {
    if (!base64) return "/fallback-image.jpg";
    if (base64.startsWith("data:") || base64.startsWith("http")) return base64;
    return `data:${mimeType};base64,${base64}`;
  };

  const handleConfirm = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
    setValidated(true);
    setIsSubmitting(true);

    const data = {
      customerName: name,
      email:        email,   // always the logged-in user's email
      items: cartItems.map((item) => ({
        productId: item.id,
        quantity:  item.quantity,
      })),
    };

    try {
      await api.post("/api/orders/place", data);
      setToastVariant("success");
      setToastMsg("Order placed successfully!");
      setShowToast(true);
      localStorage.removeItem(`cart_${loggedInEmail}`);
      setTimeout(() => navigate("/orders"), 2000);
    } catch (err) {
      console.error("Order error:", err);
      setToastVariant("danger");
      setToastMsg("Failed to place order. Please try again.");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Order</Modal.Title>
        </Modal.Header>

        <Form noValidate validated={validated} onSubmit={handleConfirm}>
          <Modal.Body>
            {/* Order summary */}
            <div className="mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="d-flex mb-3 border-bottom pb-3">
                  <img
                    src={convertBase64ToDataURL(item.imageData)}
                    alt={item.name}
                    className="me-3 rounded"
                    style={{ width: 70, height: 70, objectFit: "cover" }}
                    onError={(e) => { e.target.src = "/fallback-image.jpg"; }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{item.name}</h6>
                    <p className="mb-1 small text-muted">Qty: {item.quantity}</p>
                    <p className="mb-0 small fw-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}

              <div className="text-center py-2 bg-light rounded mb-3">
                <h5 className="mb-0 fw-bold">Total: ₹{totalPrice.toFixed(2)}</h5>
              </div>
            </div>

            {/* Customer name */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide your name.
              </Form.Control.Feedback>
            </Form.Group>

            {/* Email — pre-filled & locked to logged-in email */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                readOnly
                style={{ background: "#f9fafb", cursor: "not-allowed" }}
              />
              <Form.Text className="text-muted">
                Orders are linked to your account email.
              </Form.Text>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : "Confirm Order"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1070 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg={toastVariant}>
          <Toast.Header closeButton>
            <strong className="me-auto">Order Status</strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === "success" ? "text-white" : ""}>
            {toastMsg}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default CheckoutPopup;