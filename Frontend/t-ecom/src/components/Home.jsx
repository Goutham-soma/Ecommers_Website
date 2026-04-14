import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";

const Home = ({ selectedCategory }) => {
  const { data, isError, addToCart, refreshData } = useContext(AppContext);
  const [addedIds,     setAddedIds]     = useState([]);
  const [toastProduct, setToastProduct] = useState(null);
  const navigate = useNavigate();

  const userRole     = localStorage.getItem("userRole") || "USER";
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  useEffect(() => { refreshData(); }, []);

  const b64 = (s, m = "image/jpeg") => {
    if (!s) return unplugged;
    if (s.startsWith("data:") || s.startsWith("http")) return s;
    return `data:${m};base64,${s}`;
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product);
    setToastProduct(product);
    setAddedIds((p) => [...p, product.id]);
    setTimeout(() => {
      setAddedIds((p) => p.filter((i) => i !== product.id));
      setToastProduct(null);
    }, 2000);
  };

  const filtered = selectedCategory
    ? data.filter((p) => p.category === selectedCategory)
    : data;

  if (isError) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
      <img src={unplugged} width="64" style={{ opacity:0.35 }} alt="error" />
      <p style={{ color:"#888", fontSize:"0.9rem" }}>Could not load products.</p>
    </div>
  );

  return (
    <>
      <style>{`
        .cm-page { background:#f7f7f5; min-height:100vh; padding:80px 0 60px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .cm-inner { max-width:1160px; margin:0 auto; padding:0 28px; }

        /* header */
        .cm-header { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:32px; padding-bottom:16px; border-bottom:2px solid #1a1a1a; }
        .cm-title  { font-size:1.5rem; font-weight:700; color:#1a1a1a; letter-spacing:-0.3px; margin:0; }
        .cm-count  { font-size:0.78rem; color:#888; }

        /* grid */
        .cm-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); gap:20px; }

        /* card */
        .cm-card {
          background:#fff;
          border:1px solid #e4e4e4;
          border-radius:6px;
          overflow:hidden;
          cursor:pointer;
          transition:box-shadow .2s, border-color .2s;
        }
        .cm-card:hover { box-shadow:0 4px 20px rgba(0,0,0,0.08); border-color:#ccc; }
        .cm-card:hover .cm-img { transform:scale(1.03); }

        /* image */
        .cm-img-wrap { height:220px; background:#f2f2f0; overflow:hidden; position:relative; }
        .cm-img { width:100%; height:100%; object-fit:cover; transition:transform .4s ease; display:block; }
        .cm-cat-tag {
          position:absolute; bottom:10px; left:10px;
          background:rgba(255,255,255,0.9);
          color:#444;
          font-size:0.62rem; font-weight:600;
          letter-spacing:1.5px; text-transform:uppercase;
          padding:4px 8px; border:1px solid #ddd; border-radius:3px;
        }
        .cm-oos-tag {
          position:absolute; top:10px; right:10px;
          background:#1a1a1a; color:#fff;
          font-size:0.6rem; font-weight:600;
          letter-spacing:1px; text-transform:uppercase;
          padding:4px 8px; border-radius:3px;
        }

        /* body */
        .cm-body  { padding:16px; }
        .cm-name  { font-size:1rem; font-weight:600; color:#1a1a1a; margin:0 0 3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .cm-brand { font-size:0.75rem; color:#999; margin:0 0 14px; }
        .cm-row   { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .cm-price { font-size:1.1rem; font-weight:700; color:#1a1a1a; }
        .cm-stock { font-size:0.72rem; color:#888; display:flex; align-items:center; gap:5px; }
        .cm-dot   { width:7px; height:7px; border-radius:50%; flex-shrink:0; }

        /* buttons */
        .cm-btn {
          width:100%; padding:10px;
          font-family:inherit; font-size:0.8rem; font-weight:600;
          letter-spacing:0.5px; border:none; border-radius:4px;
          cursor:pointer; transition:background .15s, transform .1s;
        }
        .cm-btn:active { transform:scale(0.98); }
        .cm-btn-dark  { background:#1a1a1a; color:#fff; }
        .cm-btn-dark:hover { background:#333; }
        .cm-btn-added { background:#1a6b3c; color:#fff; }
        .cm-btn-oos   { background:#efefed; color:#aaa; cursor:not-allowed; }

        .cm-admin-row { display:flex; gap:8px; }
        .cm-admin-btn {
          flex:1; padding:9px;
          font-family:inherit; font-size:0.75rem; font-weight:600;
          letter-spacing:0.5px; border-radius:4px; cursor:pointer; transition:all .15s;
          background:transparent;
        }
        .cm-edit { border:1.5px solid #1a1a1a; color:#1a1a1a; }
        .cm-edit:hover { background:#1a1a1a; color:#fff; }
        .cm-del  { border:1.5px solid #c0392b; color:#c0392b; }
        .cm-del:hover { background:#c0392b; color:#fff; }

        /* toast */
        .cm-toast {
          position:fixed; bottom:28px; right:28px; z-index:9999;
          background:#1a1a1a; color:#fff;
          padding:12px 16px; border-radius:6px;
          display:flex; align-items:center; gap:12px;
          box-shadow:0 8px 24px rgba(0,0,0,0.18);
          animation:cmSlide .25s ease;
          min-width:220px;
        }
        @keyframes cmSlide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .cm-toast img { width:40px; height:40px; object-fit:cover; border-radius:4px; flex-shrink:0; }
        .cm-toast-name { font-size:0.85rem; font-weight:600; margin-bottom:2px; }
        .cm-toast-sub  { font-size:0.7rem; color:rgba(255,255,255,0.5); }

        .cm-empty { grid-column:1/-1; text-align:center; padding:60px; color:#aaa; font-size:0.95rem; }
      `}</style>

      {/* Toast */}
      {toastProduct && (
        <div className="cm-toast">
          <img src={b64(toastProduct.imageData)} alt="" onError={(e)=>{e.target.src=unplugged}} />
          <div>
            <div className="cm-toast-name">{toastProduct.name}</div>
            <div className="cm-toast-sub">Added to cart</div>
          </div>
        </div>
      )}

      <div className="cm-page">
        <div className="cm-inner">

          {/* Header */}
          <div className="cm-header">
            <h1 className="cm-title">{selectedCategory || "All Products"}</h1>
            <span className="cm-count">{filtered?.length || 0} items</span>
          </div>

          {/* Grid */}
          <div className="cm-grid">
            {!filtered || filtered.length === 0 ? (
              <div className="cm-empty">No products available.</div>
            ) : (
              filtered.map((product) => {
                const { id, brand, name, price, productAvailable, imageData, stockQuantity } = product;
                const stock      = Math.max(0, stockQuantity ?? 0);
                const outOfStock = !productAvailable || stock === 0;
                const justAdded  = addedIds.includes(id);

                return (
                  <div key={id} className="cm-card" onClick={() => navigate(`/product/${id}`)}>

                    {/* Image */}
                    <div className="cm-img-wrap" style={{ opacity: outOfStock ? 0.6 : 1 }}>
                      <img className="cm-img" src={b64(imageData)} alt={name}
                        onError={(e)=>{e.target.src=unplugged}} />
                      <span className="cm-cat-tag">{product.category}</span>
                      {outOfStock && <span className="cm-oos-tag">Out of Stock</span>}
                    </div>

                    {/* Body */}
                    <div className="cm-body">
                      <div className="cm-name" title={name}>{name}</div>
                      <div className="cm-brand">{brand}</div>

                      <div className="cm-row">
                        <span className="cm-price">₹{Number(price).toLocaleString("en-IN")}</span>
                        <span className="cm-stock">
                          <span className="cm-dot" style={{ background: outOfStock ? "#ccc" : "#16a34a" }} />
                          {outOfStock ? "Out of stock" : `${stock} left`}
                        </span>
                      </div>

                      {/* USER */}
                      {!isSuperAdmin && (
                        <button
                          className={`cm-btn ${outOfStock ? "cm-btn-oos" : justAdded ? "cm-btn-added" : "cm-btn-dark"}`}
                          onClick={(e) => !outOfStock && handleAddToCart(e, product)}
                          disabled={outOfStock}
                        >
                          {justAdded ? "✓  Added to Cart" : outOfStock ? "Unavailable" : "Add to Cart"}
                        </button>
                      )}

                      {/* ADMIN */}
                      {isSuperAdmin && (
                        <div className="cm-admin-row">
                          <button className="cm-admin-btn cm-edit"
                            onClick={(e)=>{e.stopPropagation();navigate(`/product/update/${id}`);}}>
                            Edit
                          </button>
                          <button className="cm-admin-btn cm-del"
                            onClick={(e)=>{e.stopPropagation();navigate(`/product/${id}`);}}>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Home;