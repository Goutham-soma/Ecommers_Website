import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";

// ── Field Component ───────────────────────────────────────────────────────────
const Field = ({
  label, type = "text", name, value, onChange,
  placeholder, error, showToggle, onToggle, visible,
}) => (
  <div style={{ marginBottom: "1rem" }}>
    <label style={styles.label}>{label}</label>
    <div style={{ position: "relative" }}>
      <input
        type={showToggle ? (visible ? "text" : "password") : type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          ...styles.input,
          borderColor: error ? "#dc2626" : "#d1d5db",
          paddingRight: showToggle ? "3.5rem" : "0.875rem",
        }}
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

// ── Validation ────────────────────────────────────────────────────────────────
const validate = ({ firstName, lastName, email, mobile, password, confirmPassword }) => {
  const errs = {};
  if (!firstName.trim())        errs.firstName = "First name is required.";
  if (!lastName.trim())         errs.lastName  = "Last name is required.";
  if (!email)                   errs.email     = "Email is required.";
  else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email.";
  if (!mobile)                  errs.mobile    = "Mobile number is required.";
  else if (!/^\d{10}$/.test(mobile))    errs.mobile = "Enter a valid 10-digit mobile number.";
  if (!password)                errs.password  = "Password is required.";
  else if (password.length < 8) errs.password  = "Password must be at least 8 characters.";
  if (!confirmPassword)              errs.confirmPassword = "Please confirm your password.";
  else if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match.";
  return errs;
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    mobile: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors]         = useState({});
  const [passVisible, setPassVisible]       = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess]       = useState(false);

  const handleChange = (e) => {
    if (e.target.name === "mobile") {
      // Only allow digits, max 10
      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
      setForm((p) => ({ ...p, mobile: val }));
      if (errors.mobile) setErrors((p) => ({ ...p, mobile: "" }));
      return;
    }
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: "" }));
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    setServerError("");

    try {
      // POST to /hello/register with registerRequest fields
      await api.post("/hello/register", {
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        mobile:    form.mobile,
        password:  form.password,
      });

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      if (err.response) {
        const msg = err.response.data?.message || err.response.data || "";
        if (msg.toLowerCase().includes("exists") || msg.toLowerCase().includes("duplicate")) {
          setServerError("An account with this email or mobile already exists.");
        } else {
          setServerError("Registration failed. Please try again.");
        }
      } else {
        setServerError("Cannot connect to server. Make sure your backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* ── Left Panel ── */}
      <div style={styles.left}>
        <div>
          <div style={styles.brand}>CheapMart.co</div>
          <h1 style={styles.headline}>
            Join thousands<br />
            of smart <em style={{ color: "#6fcf97", fontStyle: "normal" }}>shoppers.</em>
          </h1>
          <p style={styles.leftBody}>
            Create your free account to browse products, manage your cart, and place orders instantly.
          </p>
        </div>

        <div style={styles.stepsBox}>
          <div style={styles.stepsTitle}>Get started in 3 steps</div>
          {[
            { num: "01", text: "Create your account" },
            { num: "02", text: "Browse & add to cart" },
            { num: "03", text: "Place your order" },
          ].map(({ num, text }) => (
            <div key={num} style={styles.step}>
              <div style={styles.stepNum}>{num}</div>
              <div style={styles.stepText}>{text}</div>
            </div>
          ))}
        </div>

        <div style={styles.deco1} />
        <div style={styles.deco2} />
      </div>

      {/* ── Right Panel ── */}
      <div style={styles.right}>
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={styles.eyebrow}>New member</div>
          <h2 style={styles.formTitle}>Create your account</h2>
          <p style={styles.formSub}>
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              style={styles.linkText}
            >
              Sign in
            </span>
          </p>
        </div>

        {/* Success banner */}
        {success && (
          <div style={styles.successBanner}>
            ✓ Account created successfully! Redirecting to login…
          </div>
        )}

        {/* Error banner */}
        {serverError && (
          <div style={styles.errorBanner}>⚠ {serverError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* First & Last name */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field
              label="First name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Arjun"
              error={errors.firstName}
            />
            <Field
              label="Last name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Sharma"
              error={errors.lastName}
            />
          </div>

          <Field
            label="Email address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            error={errors.email}
          />

          <Field
            label="Mobile number"
            type="tel"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            placeholder="9876543210"
            error={errors.mobile}
            maxLength={10}   
          />

          <Field
            label="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimum 8 characters"
            error={errors.password}
            showToggle
            visible={passVisible}
            onToggle={() => setPassVisible((v) => !v)}
          />

          <Field
            label="Confirm password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            error={errors.confirmPassword}
            showToggle
            visible={confirmVisible}
            onToggle={() => setConfirmVisible((v) => !v)}
          />

          <button
            type="submit"
            disabled={loading || success}
            style={{
              ...styles.btnMain,
              opacity: loading || success ? 0.75 : 1,
              cursor: loading || success ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p style={styles.terms}>
            By registering you agree to our{" "}
            <a href="#" style={styles.footerLink}>Terms of Service</a>{" "}
            and{" "}
            <a href="#" style={styles.footerLink}>Privacy Policy</a>.
          </p>
        </form>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    fontFamily: "'DM Sans', 'Inter', sans-serif",
  },
  left: {
    background: "#0c1a12",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "3rem 2.75rem",
    position: "relative",
    overflow: "hidden",
  },
  brand: {
    fontFamily: "Georgia, serif",
    fontSize: "1.3rem",
    color: "#fff",
    letterSpacing: "-0.3px",
    marginBottom: "2.5rem",
  },
  headline: {
    fontFamily: "Georgia, serif",
    fontSize: "2.25rem",
    fontWeight: 400,
    color: "#fff",
    lineHeight: 1.25,
    marginBottom: "1rem",
  },
  leftBody: {
    fontSize: "0.85rem",
    color: "rgba(255,255,255,0.45)",
    lineHeight: 1.7,
    maxWidth: 300,
  },
  stepsBox: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: "1.25rem 1.5rem",
    marginTop: "2rem",
  },
  stepsTitle: {
    fontSize: "0.72rem",
    fontWeight: 600,
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.35)",
    marginBottom: "1rem",
  },
  step: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "0.85rem",
  },
  stepNum: {
    fontFamily: "Georgia, serif",
    fontSize: "1.1rem",
    color: "#6fcf97",
    minWidth: 28,
  },
  stepText: {
    fontSize: "0.875rem",
    color: "rgba(255,255,255,0.7)",
  },
  deco1: {
    position: "absolute", bottom: -40, right: -40,
    width: 180, height: 180, borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.05)", pointerEvents: "none",
  },
  deco2: {
    position: "absolute", bottom: -80, right: -80,
    width: 280, height: 280, borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.03)", pointerEvents: "none",
  },

  // Right panel
  right: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "3rem 2.75rem",
    background: "#fff",
    overflowY: "auto",
  },
  eyebrow: {
    fontSize: "0.72rem",
    fontWeight: 500,
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#9ca3af",
    marginBottom: "0.5rem",
  },
  formTitle: {
    fontFamily: "Georgia, serif",
    fontSize: "1.75rem",
    fontWeight: 400,
    color: "#111827",
    lineHeight: 1.2,
    margin: "0 0 0.35rem 0",
  },
  formSub: {
    fontSize: "0.82rem",
    color: "#9ca3af",
    margin: 0,
  },
  linkText: {
    color: "#1a6b3c",
    fontWeight: 500,
    cursor: "pointer",
    textDecoration: "none",
  },
  successBanner: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#15803d",
    borderRadius: 8,
    padding: "0.65rem 0.875rem",
    fontSize: "0.82rem",
    marginBottom: "1.25rem",
    lineHeight: 1.5,
  },
  errorBanner: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: 8,
    padding: "0.65rem 0.875rem",
    fontSize: "0.82rem",
    marginBottom: "1.25rem",
    lineHeight: 1.5,
  },
  label: {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "#6b7280",
    marginBottom: "0.35rem",
  },
  input: {
    width: "100%",
    padding: "0.625rem 0.875rem",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontFamily: "inherit",
    fontSize: "0.875rem",
    color: "#111827",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .15s, box-shadow .15s",
  },
  eyeBtn: {
    position: "absolute",
    right: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.78rem",
    color: "#9ca3af",
    fontFamily: "inherit",
    padding: 0,
  },
  errorText: {
    fontSize: "0.73rem",
    color: "#dc2626",
    marginTop: "0.3rem",
  },
  btnMain: {
    width: "100%",
    padding: "0.7rem",
    background: "#0c1a12",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontFamily: "inherit",
    fontSize: "0.875rem",
    fontWeight: 500,
    transition: "background .2s",
    marginBottom: "1rem",
    marginTop: "0.25rem",
  },
  terms: {
    fontSize: "0.73rem",
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 1.6,
    margin: 0,
  },
  footerLink: {
    color: "#1a6b3c",
    fontWeight: 500,
    textDecoration: "none",
    fontSize: "0.73rem",
  },
};