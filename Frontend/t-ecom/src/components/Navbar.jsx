import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";
import AppContext from "../Context/Context";

const Navbar = ({ onSelectCategory }) => {
  const getInitialTheme = () => localStorage.getItem("theme") || "light-theme";

  const [theme,           setTheme]           = useState(getInitialTheme());
  const [input,           setInput]           = useState("");
  const [isNavCollapsed,  setIsNavCollapsed]  = useState(true);
  const [isLoading,       setIsLoading]       = useState(false);
  const [showNoResults,   setShowNoResults]   = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditModal,   setShowEditModal]   = useState(false);

  const navbarRef  = useRef(null);
  const profileRef = useRef(null);
  const navigate   = useNavigate();

  const { cart, refreshData } = useContext(AppContext);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const userEmail     = localStorage.getItem("userEmail")  || "";
  const userRole      = localStorage.getItem("userRole")   || "USER";
  const firstName     = localStorage.getItem("firstName")  || "";
  const isSuperAdmin  = userRole === "SUPER_ADMIN";
  const initials      = firstName ? firstName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase();
  // Display name: use firstName if available, else part before @ in email
  const displayName   = firstName || userEmail.split("@")[0] || "User";

  // Edit profile state
  const [editName,  setEditName]  = useState(firstName || displayName);
  const [editEmail, setEditEmail] = useState(userEmail);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navbarRef.current  && !navbarRef.current.contains(e.target))  setIsNavCollapsed(true);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { document.body.className = theme; }, [theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setShowNoResults(false);
    setIsLoading(true);
    setIsNavCollapsed(true);
    try {
      const res = await api.get(`/api/products/search?keyword=${input}`);
      if (res.data.length === 0) setShowNoResults(true);
      else navigate("/search-results", { state: { searchData: res.data } });
    } catch {
      setShowNoResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    window.dispatchEvent(new StorageEvent("storage", { key: "userEmail", newValue: null }));
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("firstName");
    setShowProfileMenu(false);
    navigate("/login");
  };

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError,   setSaveError]   = useState("");

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSaveLoading(true);
    setSaveError("");
    try {
      // PUT /hello/profile — JWT token auto-attached by axios interceptor
      const response = await api.put("/hello/profile", {
        firstName: editName.trim(),
      });
      // Update localStorage with the name saved in DB
      localStorage.setItem("firstName", response.data.firstName);
      setShowEditModal(false);
      window.location.reload(); // reload so navbar shows new name
    } catch (err) {
      console.error("Profile update failed:", err);
      setSaveError("Failed to update. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const goHome = () => {
    setIsNavCollapsed(true);
    if (window.location.pathname === "/home") { refreshData(); window.location.reload(); }
    else navigate("/home");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg fixed-top bg-white shadow-sm" ref={navbarRef}>
        <div className="container-fluid px-4">

          {/* Brand */}
          <span className="navbar-brand fw-bold" style={{ cursor: "pointer", fontFamily: "Georgia,serif", letterSpacing: "-0.5px" }}
            onClick={goHome}>
            CheapMart.co
          </span>

          {/* Mobile toggle */}
          <button className="navbar-toggler border-0" type="button" onClick={() => setIsNavCollapsed((v) => !v)}>
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`${isNavCollapsed ? "collapse" : ""} navbar-collapse`}>
            {/* Nav links */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <span className="nav-link fw-medium" style={{ cursor: "pointer" }} onClick={goHome}>
                  Home
                </span>
              </li>
              {isSuperAdmin && (
                <li className="nav-item">
                  <span className="nav-link fw-medium" style={{ cursor: "pointer" }}
                    onClick={() => { navigate("/add_product"); setIsNavCollapsed(true); }}>
                    Add Product
                  </span>
                </li>
              )}
              <li className="nav-item">
                <span className="nav-link fw-medium" style={{ cursor: "pointer" }}
                  onClick={() => { navigate("/orders"); setIsNavCollapsed(true); }}>
                  {isSuperAdmin ? "All Orders" : "My Orders"}
                </span>
              </li>
            </ul>

            {/* Right side */}
            <div className="d-flex align-items-center gap-3">

              {/* Cart — USER only */}
              {!isSuperAdmin && (
                <span style={{ cursor: "pointer", position: "relative", display: "inline-flex", alignItems: "center", gap: 4 }}
                  onClick={() => { navigate("/cart"); setIsNavCollapsed(true); }}>
                  <i className="bi bi-cart fs-5 text-dark"></i>
                  <span className="fw-medium" style={{ color: "#212529", fontSize: "0.9rem" }}>Cart</span>
                  {cartCount > 0 && (
                    <span style={{
                      position: "absolute", top: -8, right: -10,
                      background: "#dc3545", color: "#fff",
                      borderRadius: "50%", width: 18, height: 18,
                      fontSize: "0.62rem", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </span>
              )}

              {/* Search */}
              <form className="d-flex position-relative" onSubmit={handleSubmit}>
                <input className="form-control me-2" type="search" placeholder="Type to search"
                  value={input} onChange={(e) => { setInput(e.target.value); setShowNoResults(false); }}
                  style={{ minWidth: 180 }} />
                {isLoading
                  ? <button className="btn btn-outline-success" type="button" disabled>
                      <span className="spinner-border spinner-border-sm"></span>
                    </button>
                  : <button className="btn btn-outline-success" type="submit">Search</button>
                }
                {showNoResults && (
                  <div className="alert alert-warning position-absolute mb-0 py-2 px-3"
                    style={{ top: "110%", right: 0, zIndex: 1000, whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                    No products found.
                  </div>
                )}
              </form>

              {/* Username */}
              <span style={{
                fontSize: "0.82rem", fontWeight: 600, color: "#374151",
                maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {displayName}
              </span>

              {/* Profile Avatar */}
              <div style={{ position: "relative" }} ref={profileRef}>
                <div onClick={() => setShowProfileMenu((v) => !v)} title={userEmail}
                  style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "#0c1a12", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: "1rem",
                    cursor: "pointer", userSelect: "none", flexShrink: 0,
                    border: "2px solid #2d9259",
                  }}>
                  {initials}
                </div>

                {/* Dropdown */}
                {showProfileMenu && (
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 10px)",
                    background: "#fff", border: "1px solid #e5e7eb",
                    borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
                    minWidth: 240, zIndex: 9999, overflow: "hidden",
                  }}>
                    {/* Profile header */}
                    <div style={{ padding: "1rem 1.25rem", background: "#0c1a12", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: "#2d9259", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: "1.1rem", flexShrink: 0,
                      }}>
                        {initials}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {displayName}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {userEmail}
                        </div>

                      </div>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: "0.4rem 0" }}>
                      <MenuItem icon="bi-house" label="Home" onClick={() => { setShowProfileMenu(false); goHome(); }} />

                      {/* Edit Profile */}
                      <MenuItem icon="bi-person-gear" label="Edit Profile"
                        onClick={() => { setEditName(firstName || displayName); setEditEmail(userEmail); setShowProfileMenu(false); setShowEditModal(true); }} />

                      {isSuperAdmin ? (
                        <>
                          <MenuItem icon="bi-plus-square" label="Add Product"
                            onClick={() => { navigate("/add_product"); setShowProfileMenu(false); }} />
                          <MenuItem icon="bi-list-ul" label="All Orders"
                            onClick={() => { navigate("/orders"); setShowProfileMenu(false); }} />
                        </>
                      ) : (
                        <>
                          <div onClick={() => { navigate("/cart"); setShowProfileMenu(false); }}
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.55rem 1.25rem", cursor: "pointer", fontSize: "0.875rem", color: "#374151" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              <i className="bi bi-cart" style={{ fontSize: "1rem", color: "#6b7280" }}></i>My Cart
                            </div>
                            {cartCount > 0 && (
                              <span style={{ background: "#dc3545", color: "#fff", borderRadius: 12, padding: "1px 8px", fontSize: "0.72rem", fontWeight: 700 }}>
                                {cartCount}
                              </span>
                            )}
                          </div>
                          <MenuItem icon="bi-bag" label="My Orders"
                            onClick={() => { navigate("/orders"); setShowProfileMenu(false); }} />
                        </>
                      )}

                      <div style={{ height: "0.5px", background: "#f3f4f6", margin: "0.4rem 0" }} />

                      {/* Logout */}
                      <div onClick={handleLogout}
                        style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.55rem 1.25rem", cursor: "pointer", fontSize: "0.875rem", color: "#dc2626", fontWeight: 500 }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <i className="bi bi-box-arrow-right" style={{ fontSize: "1rem" }}></i>Logout
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Edit Profile Modal ── */}
      {showEditModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div style={{
            background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420,
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden",
          }}>
            {/* Modal header */}
            <div style={{ background: "#0c1a12", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", background: "#2d9259",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: "1rem",
                }}>
                  {initials}
                </div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>Edit Profile</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem" }}>{userEmail}</div>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "1.2rem", cursor: "pointer", lineHeight: 1 }}>
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", marginBottom: "0.4rem" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your name"
                  style={{
                    width: "100%", padding: "0.65rem 0.875rem",
                    border: "1px solid #d1d5db", borderRadius: 8,
                    fontFamily: "inherit", fontSize: "0.9rem",
                    color: "#111827", outline: "none", boxSizing: "border-box",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#1a6b3c"}
                  onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", marginBottom: "0.4rem" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  readOnly
                  style={{
                    width: "100%", padding: "0.65rem 0.875rem",
                    border: "1px solid #e5e7eb", borderRadius: 8,
                    fontFamily: "inherit", fontSize: "0.9rem",
                    color: "#6b7280", background: "#f9fafb",
                    cursor: "not-allowed", boxSizing: "border-box",
                  }}
                />
                <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: "0.3rem" }}>
                  Email cannot be changed.
                </p>
              </div>

              {saveError && (
                <p style={{ fontSize: "0.78rem", color: "#dc2626", marginBottom: "0.75rem", textAlign: "center" }}>
                  {saveError}
                </p>
              )}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button onClick={() => { setShowEditModal(false); setSaveError(""); }}
                  disabled={saveLoading}
                  style={{
                    flex: 1, padding: "0.65rem", border: "1px solid #e5e7eb",
                    borderRadius: 8, background: "#fff", fontFamily: "inherit",
                    fontSize: "0.875rem", cursor: "pointer", color: "#6b7280",
                  }}>
                  Cancel
                </button>
                <button onClick={handleSaveProfile}
                  disabled={saveLoading}
                  style={{
                    flex: 1, padding: "0.65rem", border: "none",
                    borderRadius: 8, background: "#0c1a12", color: "#fff",
                    fontFamily: "inherit", fontSize: "0.875rem",
                    fontWeight: 600, cursor: saveLoading ? "not-allowed" : "pointer",
                    opacity: saveLoading ? 0.75 : 1,
                  }}>
                  {saveLoading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const MenuItem = ({ icon, label, onClick }) => (
  <div onClick={onClick}
    style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.55rem 1.25rem", cursor: "pointer", fontSize: "0.875rem", color: "#374151" }}
    onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
    <i className={`bi ${icon}`} style={{ fontSize: "1rem", color: "#6b7280" }}></i>
    {label}
  </div>
);

export default Navbar;