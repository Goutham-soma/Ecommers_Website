import React, { useState } from "react";
import api from "../axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AddProduct = () => {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: "",
    productAvailable: false,
  });

  const [image, setImage]             = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [errors, setErrors]           = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) { setImage(null); setImagePreview(null); return; }

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: "Please select a valid image file (JPEG or PNG)" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image size should be less than 5MB" }));
      return;
    }

    setImage(file);
    setErrors((prev) => ({ ...prev, image: null }));

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!product.name.trim())        newErrors.name        = "Product name is required";
    if (!product.brand.trim())       newErrors.brand       = "Brand is required";
    if (!product.description.trim()) newErrors.description = "Description is required";
    if (!product.price || parseFloat(product.price) <= 0)
                                     newErrors.price       = "Price must be greater than zero";
    if (!product.category)           newErrors.category    = "Please select a category";
    if (product.stockQuantity === "" || parseInt(product.stockQuantity) < 0)
                                     newErrors.stockQuantity = "Stock quantity cannot be negative";
    if (!product.releaseDate)        newErrors.releaseDate = "Release date is required";
    if (!image)                      newErrors.image       = "Product image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("imageFile", image);
    formData.append(
      "product",
      new Blob([JSON.stringify(product)], { type: "application/json" })
    );

    try {
      await api.post("/api/product", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product added successfully!");

      // Reset form
      setProduct({
        name: "", brand: "", description: "", price: "",
        category: "", stockQuantity: "", releaseDate: "", productAvailable: false,
      });
      setImage(null);
      setImagePreview(null);
      setErrors({});

      navigate("/home");
    } catch (error) {
      console.error("Error adding product:", error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        toast.error("Error adding product. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 pt-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Add New Product</h2>

              <form onSubmit={submitHandler} className="row g-3" noValidate>

                {/* Name */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Name</label>
                  <input type="text" name="name" className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    value={product.name} onChange={handleInputChange} placeholder="Product name" />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                {/* Brand */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Brand</label>
                  <input type="text" name="brand" className={`form-control ${errors.brand ? "is-invalid" : ""}`}
                    value={product.brand} onChange={handleInputChange} placeholder="Brand name" />
                  {errors.brand && <div className="invalid-feedback">{errors.brand}</div>}
                </div>

                {/* Description */}
                <div className="col-12">
                  <label className="form-label fw-bold">Description</label>
                  <textarea name="description" rows="3"
                    className={`form-control ${errors.description ? "is-invalid" : ""}`}
                    value={product.description} onChange={handleInputChange}
                    placeholder="Product description" />
                  {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                </div>

                {/* Price */}
                <div className="col-md-4">
                  <label className="form-label fw-bold">Price (₹)</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input type="number" name="price" min="0.01" step="0.01"
                      className={`form-control ${errors.price ? "is-invalid" : ""}`}
                      value={product.price} onChange={handleInputChange} placeholder="0.00" />
                    {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                  </div>
                </div>

                {/* Category */}
                <div className="col-md-4">
                  <label className="form-label fw-bold">Category</label>
                  <select name="category"
                    className={`form-select ${errors.category ? "is-invalid" : ""}`}
                    value={product.category} onChange={handleInputChange}>
                    <option value="">Select category</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Headphone">Headphone</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Toys">Toys</option>
                    <option value="Fashion">Fashion</option>
                  </select>
                  {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                </div>

                {/* Stock Quantity */}
                <div className="col-md-4">
                  <label className="form-label fw-bold">Stock Quantity</label>
                  <input type="number" name="stockQuantity" min="0"
                    className={`form-control ${errors.stockQuantity ? "is-invalid" : ""}`}
                    value={product.stockQuantity} onChange={handleInputChange} placeholder="0" />
                  {errors.stockQuantity && <div className="invalid-feedback">{errors.stockQuantity}</div>}
                </div>

                {/* Release Date */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Release Date</label>
                  <input type="date" name="releaseDate"
                    className={`form-control ${errors.releaseDate ? "is-invalid" : ""}`}
                    value={product.releaseDate} onChange={handleInputChange} />
                  {errors.releaseDate && <div className="invalid-feedback">{errors.releaseDate}</div>}
                </div>

                {/* Product Available */}
                <div className="col-md-6 d-flex align-items-end pb-1">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox"
                      name="productAvailable" id="productAvailable"
                      checked={product.productAvailable} onChange={handleInputChange} />
                    <label className="form-check-label fw-bold" htmlFor="productAvailable">
                      Product Available
                    </label>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="col-12">
                  <label className="form-label fw-bold">Product Image</label>
                  <input type="file" accept="image/jpeg, image/png"
                    className={`form-control ${errors.image ? "is-invalid" : ""}`}
                    onChange={handleImageChange} />
                  {errors.image && <div className="invalid-feedback">{errors.image}</div>}
                  {imagePreview && (
                    <div className="mt-3 text-center">
                      <img src={imagePreview} alt="Preview"
                        className="img-thumbnail"
                        style={{ maxHeight: "200px", objectFit: "contain" }} />
                      <p className="text-muted small mt-1">Image preview</p>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="col-12 d-flex gap-2 justify-content-end mt-2">
                  <button type="button" className="btn btn-outline-secondary"
                    onClick={() => navigate("/home")}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Adding...
                      </>
                    ) : "Add Product"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;