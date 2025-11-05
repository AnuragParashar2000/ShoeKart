import { useNavigate, useParams } from "react-router-dom";
import "../styles/productDetails.css";
import { useEffect, useState } from "react";
import Axios from "../Axios";
import { toast } from "react-toastify";
import TriangleLoader from "../components/TriangleLoader";
import useAuth from "../../hooks/useAuth";
import Star from "../components/Star";
import RatingContainer from "../components/RatingContainer";

const ProductDetails = () => {
  const { slug } = useParams();
  const [data, setData] = useState([]);
  const [size, setSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await Axios.get(`/api/v1/product/${slug}`);
        setData(response.data.data);
        console.log(response.data.data);
        setLoading(false);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Something went wrong", {
          position: "bottom-right",
        });
        navigate("/404");
      }
    };
    fetchProduct();
  }, []);

  const handleAddToCart = async () => {
    try {
      if (!auth) {
        toast.error("Login required");
        navigate("/login");
        return;
      }

      if (!size) {
        toast.error("Please select a size");
        return;
      }
      const token = localStorage.getItem("jwt");
      const response = await Axios.post(
        "/api/v1/cart/add",
        {
          productId: data._id,
          qty: 1,
          size: Number(size),
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      toast.success(response?.data?.message);
      setAuth({ ...auth, cartSize: auth.cartSize + 1 });
    } catch (error) {
      toast.error("Something went wrong", {
        position: "bottom-right",
      });
      console.log(error);
    }
  };

  const handlePincodeCheck = async () => {
    if (!pincode) {
      toast.error("Please enter a PIN code");
      return;
    }

    if (pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit PIN code");
      return;
    }

    setCheckingDelivery(true);
    try {
      const response = await Axios.post("/api/v1/delivery/check", {
        pincode: pincode
      });

      if (response.data.success) {
        setDeliveryInfo(response.data.data);
        toast.success(`Delivery available to ${response.data.data.city}`);
      } else {
        setDeliveryInfo(null);
        toast.error(response.data.message);
      }
    } catch (error) {
      setDeliveryInfo(null);
      toast.error(error?.response?.data?.message || "Failed to check delivery");
    } finally {
      setCheckingDelivery(false);
    }
  };

  if (loading) return <TriangleLoader height="500px" />;
  return (
    <section className="product-bg">
      <div className="prod-images-cont">
        <div className="prod-image">
          <img src={data.image} alt="img" />
        </div>
        <div className="pRow">
          <img src={data.image} alt="img" />
          <img src={data.image} alt="img" />
          <img src={data.image} alt="img" />
        </div>
      </div>
      <div className="prod-details-cont">
        <h1 className="ptitle">{data.brand + " " + data.name.toLowerCase()}</h1>
        <h3 className="pprize">
          ₹ {data.price} <span>3000 </span>
        </h3>
        <div className="pStar">
          <Star rating={data.ratingScore / data.ratings.length || 0} />
        </div>
        <select
          name="size"
          id="size"
          value={size}
          disabled={data.sizeQuantity.length === 0}
          onChange={(e) => setSize(e.target.value)}
        >
          <option value="">Select Size</option>
          {data.sizeQuantity &&
            data.sizeQuantity
              .filter((data) => data.quantity > 0)
              .map((data) => (
                <option key={data.size} value={data.size}>
                  {data.size}
                </option>
              ))}
        </select>

        <button
          disabled={data.sizeQuantity.length === 0}
          className="add-to-carts"
          onClick={handleAddToCart}
        >
          Add to cart
        </button>
        {data.sizeQuantity.length === 0 && (
          <p className="outOfStock">
            Unfortunately, this product is currently out of stock.
          </p>
        )}
        <h3 className="pDescTitle">Product Details</h3>
        <p>{data.description}</p>
        <h3 className="pDescTitle">
          Color:{" "}
          <p style={{ fontWeight: "normal", display: "inline" }}>
            {data.color}
          </p>
        </h3>
        <h3 className="pDescTitle">
          Material:{" "}
          <p style={{ fontWeight: "normal", display: "inline" }}>
            {data.material}
          </p>
        </h3>
        <h3 className="pDescTitle">Features:</h3>
        <div style={{ marginLeft: "15px" }}>
          {data.features && data.features.length > 0 ? (
            <ol>
              {data.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ol>
          ) : (
            <p style={{ color: "#666", fontStyle: "italic" }}>
              No features available for this product.
            </p>
          )}
        </div>
        <h3 className="pDescTitle">Delivery Option</h3>
        <div>
          <div>
            <input
              type="number"
              name="pincode"
              max={999999}
              min={0}
              placeholder="Enter Pincode"
              value={pincode}
              onChange={(e) => {
                const value = e.target.value.slice(0, 6);
                setPincode(value);
              }}
              onInput={(e) => {
                e.target.value = Math.max(0, parseInt(e.target.value))
                  .toString()
                  .slice(0, 6);
              }}
            />
            <button 
              className="pincode-check" 
              onClick={handlePincodeCheck}
              disabled={checkingDelivery}
            >
              {checkingDelivery ? "Checking..." : "Check"}
            </button>
          </div>
          
          {deliveryInfo ? (
            <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f0f8ff", borderRadius: "5px" }}>
              <h5 style={{ color: "#0066cc", margin: "0 0 5px 0" }}>
                ✅ Delivery Available to {deliveryInfo.city}
              </h5>
              <p style={{ margin: "5px 0", fontSize: "14px" }}>
                <strong>Delivery Time:</strong> {deliveryInfo.deliveryTime}
              </p>
              <p style={{ margin: "5px 0", fontSize: "14px" }}>
                <strong>Pay on Delivery:</strong> {deliveryInfo.codAvailable ? "✅ Available" : "❌ Not Available"}
              </p>
            </div>
          ) : (
            <h5>
              Please enter PIN code to check delivery time & Pay on Delivery
              Availability
            </h5>
          )}
          
          <ul type="none">
            <li>100% Original Products</li>
            <li>Pay on delivery might be available</li>
            <li>Easy 30 days returns and exchanges</li>
            <li>Try & Buy might be available</li>
          </ul>
        </div>
        <h3 className="pDescTitle">Offers</h3>
        <ul type="none">
          <li>Use &apos;SUMILSUTHAR197&apos; to avail flat 20% Off</li>
        </ul>
        <RatingContainer ratings={data.ratings} />
      </div>
    </section>
  );
};
export default ProductDetails;
