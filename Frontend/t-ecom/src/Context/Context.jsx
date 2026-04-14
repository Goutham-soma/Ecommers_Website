import api from "../axios";
import { useState, useEffect, createContext, useCallback } from "react";

const AppContext = createContext({
  data: [],
  isError: "",
  cart: [],
  addToCart: (product) => {},
  removeFromCart: (productId) => {},
  refreshData: () => {},
  clearCart: () => {},
});

export const AppProvider = ({ children }) => {
  const [data,    setData]    = useState([]);
  const [isError, setIsError] = useState("");

  // Always get the key fresh — never cache it at module level
  const getCartKey = () => {
    const email = localStorage.getItem("userEmail");
    if (!email) return null; // no user logged in
    return `cart_${email}`;
  };

  const readCartFromStorage = () => {
    const key = getCartKey();
    if (!key) return []; // not logged in → empty cart
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };

  const writeCartToStorage = (updatedCart) => {
    const key = getCartKey();
    if (!key) return; // not logged in → don't save
    localStorage.setItem(key, JSON.stringify(updatedCart));
  };

  // Start with empty cart — will be populated after userEmail is set in localStorage
  const [cart, setCart] = useState([]);

  // ── Listen for userEmail changes (login / logout / user switch) ────────────
  useEffect(() => {
    // Load the correct cart immediately
    setCart(readCartFromStorage());

    // Also listen for storage events (other tabs or login redirect)
    const handleStorage = (e) => {
      if (e.key === "userEmail" || e.key === getCartKey()) {
        setCart(readCartFromStorage());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ── Poll for userEmail every 300ms until it appears (handles login redirect) ─
  // This is needed because after navigate("/home"), localStorage.userEmail
  // is already set but the Context was mounted before login.
  useEffect(() => {
    const interval = setInterval(() => {
      const key = getCartKey();
      if (key) {
        setCart(readCartFromStorage());
        clearInterval(interval);
      }
    }, 300);

    // Stop polling after 5 seconds max
    const timeout = setTimeout(() => clearInterval(interval), 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.id === product.id);
      const updated = idx !== -1
        ? prev.map((item, i) =>
            i === idx ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [...prev, { ...product, quantity: 1 }];
      writeCartToStorage(updated);
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.id !== productId);
      writeCartToStorage(updated);
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    const key = getCartKey();
    if (key) localStorage.removeItem(key);
    setCart([]);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const response = await api.get("/api/products");
      setData(response.data);
      setIsError("");
    } catch (error) {
      console.error("Error fetching products:", error.message);
      setIsError(error.message);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <AppContext.Provider
      value={{ data, isError, cart, addToCart, removeFromCart, refreshData, clearCart }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;