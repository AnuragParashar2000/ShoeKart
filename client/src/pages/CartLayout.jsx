import "../styles/cartlayout.css";
import CartItems from "../components/CartItems";
import { useCallback, useEffect, useState } from "react";
import Axios from "../Axios";
import useAuth from "../../hooks/useAuth";
import TriangleLoader from "../components/TriangleLoader";
import { toast } from "react-toastify";
import EmptyImage from "../Images/empty-cart.png";
import CheckoutModal from "../components/CheckoutModal";

const CartLayout = () => {
  const { auth, setAuth } = useAuth();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const token = localStorage.getItem("jwt");
  const updateData = useCallback(async (e) => {
    setData(e);
  }, []);
  const deleteItem = async (id, qty) => {
    try {
      const response = await Axios.delete(`/cart/delete/${id}`, {
        headers: {
          Authorization: token,
        },
      });
      if (response.data.success === true) {
        toast.success("Product removed from cart successfully");
        setData(response.data.cart);
        setAuth({ ...auth, cartSize: auth.cartSize - qty });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const fetchData = async () => {
    try {
      const response = await Axios.get("/cart", {
        headers: {
          Authorization: token,
        },
      });
      console.log(response.data);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  const handleCheckout = () => {
    if (!data || data?.items.length <= 0 || !auth) {
      toast.error("Please add items to cart and login to checkout");
      return;
    }
    setShowCheckoutModal(true);
  };
  const applyCoupon = async (coupon) => {
    if (!data || data.length <= 0) return toast.error("Cart is empty.");
    if (!coupon.trim()) return toast.error("Please enter a coupon code.");
    
    try {
      // Validate coupon with Stripe
      const response = await Axios.get(`/admin/coupons`, {
        headers: { Authorization: localStorage.getItem("jwtAdmin") }
      });
      
      if (response.data.success) {
        const validCoupons = response.data.data;
        const couponToCheck = coupon.toUpperCase().trim();
        const matchedCoupon = validCoupons.find(c => c.id === couponToCheck);
        
        if (matchedCoupon) {
          setCouponCode(coupon);
          setAppliedCoupon(true);
          setCouponDiscount(matchedCoupon.percent_off || 0);
          toast.success(`Coupon applied successfully! ${matchedCoupon.percent_off}% off`);
        } else {
          toast.error("Invalid coupon code.");
        }
      } else {
        toast.error("Unable to validate coupon. Please try again.");
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      // Fallback to hardcoded coupons if API fails
      const hardcodedCoupons = {
        "SUMILSUTHAR197": 20,
        "NIKE2024": 15
      };
      const couponToCheck = coupon.toUpperCase();
      if (hardcodedCoupons[couponToCheck]) {
        setCouponCode(coupon);
        setAppliedCoupon(true);
        setCouponDiscount(hardcodedCoupons[couponToCheck]);
        toast.success(`Coupon applied successfully! ${hardcodedCoupons[couponToCheck]}% off`);
      } else {
        toast.error("Invalid coupon code.");
      }
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(false);
    setCouponDiscount(0);
    toast.success("Coupon removed successfully!");
  };

  useEffect(() => {
    if (localStorage.getItem("jwt") === null) {
      setLoading(false);
      return;
    }
    console.log("cart layout");
    fetchData();
  }, []);
  if (loading) return <TriangleLoader height="500px" />;
  return (
    <div className="cartMainContainer">
      <h1 className="cHeader">Shopping Cart</h1>
      <div className="cartContainer">
        <div className="cart-container-1">
          <table className="cart-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Product</th>
                <th className="cart-subheader">Size</th>
                <th className="cart-subheader">Quantity</th>
                <th className="cart-subheader">Total Price</th>
              </tr>
            </thead>
            <tbody className="cart-table-tbody">
              {data &&
                data.items.map((item) => {
                  return (
                    <CartItems
                      key={item._id}
                      cartId={item._id}
                      data={item.productId}
                      qty={item.qty}
                      size={item.size}
                      updateData={updateData}
                      deleteItem={() => deleteItem(item._id, item.qty)}
                    />
                  );
                })}
            </tbody>
          </table>
          {(!data || data.items.length <= 0) && (
            <div className="empty-cart">
              <img src={EmptyImage} alt="empty-cart" />
              <p>Looks like you haven't added any items to the cart yet.</p>
            </div>
          )}
        </div>
        <div className="cart-container-2">
          <div className="cartSummary">
            <h3 className="summaryHeader">Order Summary</h3>
            <div className="summaryInfo">
              <p>
                <span>Sub Total</span>
                <span>
                  ₹{" "}
                  {(data?.totalPrice - data?.totalPrice * 0.12 || 0).toFixed(2)}
                </span>
              </p>
              <p>
                <span>Tax</span>
                <span>₹ {(data?.totalPrice * 0.12 || 0).toFixed(2)}</span>
              </p>
              <p>
                <span>Shipping Charge</span>
                <span>Free</span>
              </p>
              <p>
                <span>Giftcard/Discount code</span>
                {appliedCoupon && couponDiscount > 0 ? (
                  <span style={{ color: '#28a745' }}>
                    - ₹ {((data?.totalPrice || 0) * (couponDiscount / 100)).toFixed(2)}
                  </span>
                ) : (
                  <span>- ₹ 0</span>
                )}
              </p>
              <div className="couponInput">
                <input
                  type="text"
                  name="couponCode"
                  id="couponCode"
                  value={couponCode}
                  disabled={appliedCoupon}
                  className={appliedCoupon ? "disabled" : ""}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon Code"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    className="remove-coupon-btn"
                    onClick={removeCoupon}
                    style={{ 
                      backgroundColor: '#dc3545', 
                      color: 'white', 
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => applyCoupon(couponCode)}
                    style={{ 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Apply
                  </button>
                )}
              </div>
              <p className="cart-total">
                <span>Total</span>
                <span>
                  ₹ {appliedCoupon && couponDiscount > 0 
                    ? ((data?.totalPrice || 0) * (1 - couponDiscount / 100)).toFixed(2)
                    : (data?.totalPrice || 0).toFixed(2)
                  }
                </span>
              </p>
            </div>
            <button
              onClick={handleCheckout}
              type="submit"
              className={
                !data || data?.items.length <= 0 || !auth
                  ? "checkout-btn disabled"
                  : "checkout-btn"
              }
              disabled={!data || data?.items.length <= 0 || !auth}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
      
      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cartData={data}
        totalPrice={appliedCoupon && couponDiscount > 0 
          ? (data?.totalPrice || 0) * (1 - couponDiscount / 100)
          : data?.totalPrice || 0
        }
        appliedCoupon={appliedCoupon}
        couponCode={couponCode}
        couponDiscount={couponDiscount}
      />
    </div>
  );
};

export default CartLayout;
