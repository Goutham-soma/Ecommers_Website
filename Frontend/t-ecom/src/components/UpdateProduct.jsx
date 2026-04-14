import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../axios";
import { toast } from "react-toastify";

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateProduct, setUpdateProduct] = useState({
    id: null, name: "", description: "", brand: "",
    price: "", category: "", releaseDate: "",
    productAvailable: false, stockQuantity: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/api/product/${id}`);
        setUpdateProduct(response.data);

        const responseImage = await api.get(`/api/product/${id}/image`, { responseType: "blob" });
        const imageFile = new File([responseImage.data], response.data.imageName, { type: responseImage.data.type });
        setImage(imageFile);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImageChanged(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (imageChanged && image) {
      formData.append("imageFile", image);
      const { imageData, imageType, imageName, ...productData } = updateProduct;
      formData.append("product", new Blob([JSON.stringify(productData)], { type: "application/json" }));
    } else {
      formData.append("product", new Blob([JSON.stringify(updateProduct)], { type: "application/json" }));
    }

    try {
      await api.put(`/api/product/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product updated successfully");
      navigate("/home");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!updateProduct.id) {
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

  return (
    <div className="container mt-5 pt-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="text-center mb-4">Update Product</h2>
              <form className="row g-3" onSubmit={handleSubmit}>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Name</label>
                  <input type="text" className="form-control" name="name"
                    value={updateProduct.name} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Brand</label>
                  <input type="text" className="form-control" name="brand"
                    value={updateProduct.brand} onChange={handleChange} required />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold">Description</label>
                  <textarea className="form-control" name="description" rows="3"
                    value={updateProduct.description} onChange={handleChange} required />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">Price</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input type="number" className="form-control" name="price"
                      value={updateProduct.price} onChange={handleChange} min="0.01" step="0.01" required />
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">Category</label>
                  <select className="form-select" name="category"
                    value={updateProduct.category} onChange={handleChange} required>
                    <option value="">Select category</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Headphone">Headphone</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Toys">Toys</option>
                    <option value="Fashion">Fashion</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">Stock Quantity</label>
                  <input type="number" className="form-control" name="stockQuantity"
                    value={updateProduct.stockQuantity} onChange={handleChange} min="0" required />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Release Date</label>
                  <input type="date" className="form-control" name="releaseDate"
                    value={updateProduct.releaseDate ? updateProduct.releaseDate.slice(0, 10) : ""}
                    onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Image</label>
                  {image && (
                    <div className="mb-2">
                      <img src={URL.createObjectURL(image)} alt="preview"
                        className="img-fluid rounded mb-2"
                        style={{ height: "150px", objectFit: "contain" }} />
                    </div>
                  )}
                  <input className="form-control" type="file"
                    onChange={handleImageChange} accept="image/png, image/jpeg" />
                  <div className="form-text">Leave empty to keep current image</div>
                </div>

                <div className="col-12">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" name="productAvailable"
                      checked={updateProduct.productAvailable}
                      onChange={(e) => setUpdateProduct((prev) => ({ ...prev, productAvailable: e.target.checked }))} />
                    <label className="form-check-label">Product Available</label>
                  </div>
                </div>

                <div className="col-12 mt-4">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : "Update Product"}
                  </button>
                  <button type="button" className="btn btn-outline-secondary ms-2"
                    onClick={() => navigate("/home")}>
                    Cancel
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

export default UpdateProduct;