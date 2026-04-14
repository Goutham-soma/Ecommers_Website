import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext from "../Context/Context";
import api from "../axios";
import { toast } from "react-toastify";

const Product = () => {
  const { id } = useParams();
  const { addToCart, removeFromCart, refreshData } = useContext(AppContext);
  const [product,  setProduct]  = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  const userRole     = localStorage.getItem("userRole") || "USER";
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/api/product/${id}`);
        setProduct(response.data);
        if (response.data.imageName) fetchImage();
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    const fetchImage = async () => {
      try {
        const response = await api.get(`/api/product/${id}/image`, { responseType: "blob" });
        setImageUrl(URL.createObjectURL(response.data));
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchProduct();
  }, [id]);

  const deleteProduct = async () => {
    try {
      await api.delete(`/api/product/${id}`);
      removeFromCart(id);
      toast.success("Product deleted successfully");
      refreshData();
      navigate("/home");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    toast.success("Product added to cart");
  };

  // Stock display helper — never show negative
  const stockCount   = Math.max(0, product?.stockQuantity ?? 0);
  const isOutOfStock = stockCount === 0 || !product?.productAvailable;

  if (!product) {
    return (
      <div className="container mt-5 pt-5">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5">
      <div className="row">

        {/* Product Image */}
        <div className="col-md-6 mb-4">
          <div className="card border-0">
            <img
              src={imageUrl || "/fallback-image.jpg"}
              alt={product.name}
              className="card-img-top img-fluid"
              style={{ maxHeight: "500px", objectFit: "contain" }}
              onError={(e) => { e.target.src = "/fallback-image.jpg"; }}
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="col-md-6">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="badge bg-secondary">{product.category}</span>
            <small className="text-muted">
              Listed: {new Date(product.releaseDate).toLocaleDateString()}
            </small>
          </div>

          <h2 className="text-capitalize mb-1">{product.name}</h2>
          <p className="text-muted fst-italic mb-4">~ {product.brand}</p>

          <div className="mb-4">
            <h5 className="mb-2">Product Description:</h5>
            <p>{product.description}</p>
          </div>

          <h3 className="fw-bold mb-3">₹ {product.price}</h3>

          {/* Stock status */}
          <p className="mb-4 d-flex align-items-center gap-2">
            <span>Stock Available:</span>
            {isOutOfStock ? (
              <span className="badge bg-danger fs-6">Out of Stock</span>
            ) : (
              <span className="fw-bold text-success fs-6">{stockCount}</span>
            )}
          </p>

          {/* USER: Add to Cart */}
          {!isSuperAdmin && (
            <div className="d-grid gap-2 mb-3">
              <button
                className={`btn btn-lg ${isOutOfStock ? "btn-secondary" : "btn-primary"}`}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          )}

          {/* SUPER_ADMIN: Edit & Delete */}
          {isSuperAdmin && (
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate(`/product/update/${id}`)}
              >
                <i className="bi bi-pencil me-1"></i>Update
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={deleteProduct}
              >
                <i className="bi bi-trash me-1"></i>Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;