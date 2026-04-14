import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Field = ({ label, type = "text", name, value, onChange, placeholder, error, showToggle, onToggle, visible }) => (
  <div style={{ marginBottom: "1rem" }}>
    <label style={styles.label}>{label}</label>
    <div style={{ position: "relative" }}>
      <input
        type={showToggle ? (visible ? "text" : "password") : type}
        name={name} value={value} onChange={onChange} placeholder={placeholder}
        style={{ ...styles.input, borderColor: error ? "#dc2626" : "#d1d5db", paddingRight: showToggle ? "3.5rem" : "0.875rem" }}
      />
      {showToggle && (
        <button type="button" onClick={onToggle} style={styles.eyeBtn}>
          {visible ? "hide" : "show"}
        </button>
      )}
    </div>
    {error && <p style={styles.errorText}>{error}</p>}
  </div>
);

const validateLogin = ({ emailOrPhone, password }) => {
  const errs = {};
  if (!emailOrPhone) errs.emailOrPhone = "Email or phone is required.";
  if (!password)     errs.password     = "Password is required.";
  else if (password.length < 6) errs.password = "Password must be at least 6 characters.";
  return errs;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]               = useState({ emailOrPhone: "", password: "" });
  const [errors, setErrors]           = useState({});
  const [passVisible, setPassVisible] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: "" }));
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateLogin(form);
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    setServerError("");

    try {
      const response = await api.post("/hello/login", {
        emailOrPhone: form.emailOrPhone,
        password:     form.password,
      });

      const { message, token, role, email, firstName } = response.data;

      if (message === "Login Successful") {
        // Save all auth info
        localStorage.setItem("token",      token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail",  email);
        localStorage.setItem("userRole",   role);
        localStorage.setItem("firstName",  firstName || "");

        // Fire a storage event so Context.jsx picks up the new userEmail
        // immediately and loads THIS user's cart (not a previous user's cart)
        window.dispatchEvent(new StorageEvent("storage", {
          key:      "userEmail",
          newValue: email,
        }));

        navigate("/home");
      }
    } catch (err) {
      if (err.response) {
        const msg = err.response.data?.message || err.response.data || "";
        if (msg.toLowerCase().includes("not found"))    setServerError("No account found with this email or phone.");
        else if (msg.toLowerCase().includes("invalid")) setServerError("Incorrect password. Please try again.");
        else                                            setServerError("Login failed. Please check your credentials.");
      } else {
        setServerError("Cannot connect to server. Make sure your backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div>
          <div style={styles.brand}>CheapMart.co</div>
          <h1 style={styles.headline}>
            The smarter way<br />to shop <em style={{ color: "#6fcf97", fontStyle: "normal" }}>online.</em>
          </h1>
          <p style={styles.leftBody}>
            Sign in to browse thousands of products, add to cart, and place orders — all in one place.
          </p>
        </div>

        <div style={styles.statsGrid}>
          {[
            { num: "2M+", label: "Products" },
            { num: "98%", label: "Satisfaction" },
            { num: "₹0",  label: "Hidden fees" },
            { num: "24/7",label: "Support" },
          ].map(({ num, label }) => (
            <div key={label} style={styles.stat}>
              <div style={styles.statNum}>{num}</div>
              <div style={styles.statLabel}>{label}</div>
            </div>
          ))}
        </div>
        <div style={styles.deco1} /><div style={styles.deco2} />
      </div>

      <div style={styles.right}>
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={styles.eyebrow}>Member access</div>
          <h2 style={styles.formTitle}>Sign in to your account</h2>
        </div>

        {serverError && <div style={styles.errorBanner}>⚠ {serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <Field
            label="Email address or Phone number" type="text" name="emailOrPhone"
            value={form.emailOrPhone} onChange={handleChange}
            placeholder="you@example.com or 9876543210" error={errors.emailOrPhone}
          />
          <Field
            label="Password" name="password" value={form.password} onChange={handleChange}
            placeholder="Enter your password" error={errors.password}
            showToggle visible={passVisible} onToggle={() => setPassVisible((v) => !v)}
          />

          <div style={styles.row}>
            <label style={styles.remember}>
              <input type="checkbox" style={{ accentColor: "#1a6b3c", width: 14, height: 14 }} />
              Keep me signed in
            </label>
            <a href="#" style={styles.forgotLink}>Forgot password?</a>
          </div>

          <button type="submit" disabled={loading} style={{
            ...styles.btnMain,
            opacity: loading ? 0.75 : 1,
            cursor:  loading ? "not-allowed" : "pointer",
          }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>or continue with</span>
            <span style={styles.dividerLine} />
          </div>

          <div style={styles.socialRow}>
            <button type="button" style={styles.socialBtn}><GoogleIcon /> Google</button>
            <button type="button" style={styles.socialBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877f2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          <p style={styles.footerNote}>
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              style={{ color: "#1a6b3c", fontWeight: 500, cursor: "pointer", fontSize: "0.73rem" }}
            >
              Create account
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page:        { minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", fontFamily: "'DM Sans','Inter',sans-serif" },
  left:        { background: "#0c1a12", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "3rem 2.75rem", position: "relative", overflow: "hidden" },
  brand:       { fontFamily: "Georgia,serif", fontSize: "1.3rem", color: "#fff", letterSpacing: "-0.3px", marginBottom: "2.5rem" },
  headline:    { fontFamily: "Georgia,serif", fontSize: "2.25rem", fontWeight: 400, color: "#fff", lineHeight: 1.25, marginBottom: "1rem" },
  leftBody:    { fontSize: "0.85rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 300 },
  statsGrid:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden", marginTop: "2rem" },
  stat:        { background: "#0c1a12", padding: "0.9rem 1rem" },
  statNum:     { fontFamily: "Georgia,serif", fontSize: "1.4rem", color: "#fff", marginBottom: 2 },
  statLabel:   { fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.5px", textTransform: "uppercase" },
  deco1:       { position: "absolute", bottom: -40, right: -40, width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", pointerEvents: "none" },
  deco2:       { position: "absolute", bottom: -80, right: -80, width: 280, height: 280, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.03)", pointerEvents: "none" },
  right:       { display: "flex", flexDirection: "column", justifyContent: "center", padding: "3rem 2.75rem", background: "#fff" },
  eyebrow:     { fontSize: "0.72rem", fontWeight: 500, letterSpacing: "2px", textTransform: "uppercase", color: "#9ca3af", marginBottom: "0.5rem" },
  formTitle:   { fontFamily: "Georgia,serif", fontSize: "1.75rem", fontWeight: 400, color: "#111827", lineHeight: 1.2, margin: 0 },
  errorBanner: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "0.65rem 0.875rem", fontSize: "0.82rem", marginBottom: "1.25rem" },
  label:       { display: "block", fontSize: "0.75rem", fontWeight: 500, color: "#6b7280", marginBottom: "0.35rem" },
  input:       { width: "100%", padding: "0.625rem 0.875rem", border: "1px solid #d1d5db", borderRadius: 8, fontFamily: "inherit", fontSize: "0.875rem", color: "#111827", background: "#fff", outline: "none", boxSizing: "border-box" },
  eyeBtn:      { position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "0.78rem", color: "#9ca3af", fontFamily: "inherit", padding: 0 },
  errorText:   { fontSize: "0.73rem", color: "#dc2626", marginTop: "0.3rem" },
  row:         { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", marginTop: "-0.25rem" },
  remember:    { display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "#6b7280", cursor: "pointer" },
  forgotLink:  { fontSize: "0.78rem", color: "#1a6b3c", textDecoration: "none", fontWeight: 500 },
  btnMain:     { width: "100%", padding: "0.7rem", background: "#0c1a12", color: "#fff", border: "none", borderRadius: 8, fontFamily: "inherit", fontSize: "0.875rem", fontWeight: 500, marginBottom: "1.1rem" },
  divider:     { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.1rem" },
  dividerLine: { flex: 1, height: "0.5px", background: "#e5e7eb", display: "block" },
  dividerText: { fontSize: "0.75rem", color: "#9ca3af", whiteSpace: "nowrap" },
  socialRow:   { display: "flex", gap: "0.6rem", marginBottom: "1.25rem" },
  socialBtn:   { flex: 1, padding: "0.6rem 0.5rem", border: "0.5px solid #d1d5db", borderRadius: 8, background: "#fff", fontFamily: "inherit", fontSize: "0.8rem", fontWeight: 500, color: "#111827", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
  footerNote:  { fontSize: "0.73rem", color: "#9ca3af", textAlign: "center", lineHeight: 1.6 },
};