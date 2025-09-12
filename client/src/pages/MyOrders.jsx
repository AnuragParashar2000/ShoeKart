import "../styles/order.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import TriangleLoader from "../components/TriangleLoader";
import EmptyImage from "../Images/empty-cart.png";
import Axios from "../Axios";
import FormReviews from "../components/FormReviews";
import { toast } from "react-toastify";

const MyOrders = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const navigate = useNavigate();
  const fetchData = async () => {
    try {
      const response = await Axios.get("/orders", {
        headers: {
          Authorization: localStorage.getItem("jwt"),
        },
      });
      console.log(response.data.orders);
      setData(response.data.orders);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  const openReviewModal = (status, id1, id2) => {
    if (status.toLowerCase() !== "delivered") {
      toast.error("You can only review delivered products.");
      return;
    }
    setShowModal(true);
    setCurrentProductId(id1);
    setCurrentOrderId(id2);
  };
  const submitReview = async (review, productId, orderId) => {
    try {
      console.log({
        rating: review.rating,
        review: review.opinion,
        productId,
        orderId,
      });
      const response = await Axios.put(
        "product/review",
        { rating: review.rating, review: review.opinion, productId, orderId },
        {
          headers: {
            Authorization: localStorage.getItem("jwt"),
          },
        }
      );
      if (response.data.success) {
        fetchData();
      }
      setShowModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  const openCancelModal = (orderId) => {
    console.log('Order ID received:', orderId);
    console.log('Order ID type:', typeof orderId);
    if (!orderId) {
      toast.error("Order ID is missing. Cannot cancel order.");
      return;
    }
    setCancellingOrderId(orderId);
    setShowCancelModal(true);
  };

  const cancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    console.log('Cancelling order with ID:', cancellingOrderId);
    console.log('Cancel reason:', cancelReason);

    setIsCancelling(true);
    try {
      const response = await Axios.put(
        `/orders/${cancellingOrderId}/cancel`,
        { reason: cancelReason },
        {
          headers: {
            Authorization: localStorage.getItem("jwt"),
          },
        }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");
        fetchData();
        setShowCancelModal(false);
        setCancelReason("");
        setCancellingOrderId(null);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancelOrder = (order) => {
    return order.delivered?.toLowerCase() === 'pending' || order.delivered?.toLowerCase() === 'processing';
  };
  useEffect(() => {
    fetchData();
  }, []);
  if (loading) return <TriangleLoader height="500px" />;
  return (
    <div className="orderMainContainer">
      <h1 className="cHeader">My Orders</h1>
      <div className="orderContainer" style={{flexDirection:"column"}}>
        <table className="order-table">
          <thead>
            <tr>
              <th
                className="order-subheader order-th"
                style={{ textAlign: "left" }}
              >
                Product Details
              </th>
              <th className="order-subheader order-th">Order Date</th>
              <th className="order-subheader order-th">Status</th>
              <th className="order-subheader order-th">Total Price</th>
              <th className="order-subheader order-th">Actions</th>
            </tr>
          </thead>
          <tbody className="order-table-tbody">
            {data.map((item, index) => (
              <tr key={index}>
                <td className="order-td">
                  {item.items.map((product, i) => (
                    <div key={i} className="order-td-div">
                      <div className="cart-product-cont">
                        <div className="cart-image-cont">
                          <img
                            src={product.image}
                            alt="product"
                            className="cart-image"
                          />
                        </div>
                        <div className="cart-product-details">
                          <p
                            className="cart-name-cont"
                            style={{
                              width: "13rem",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {product.name}
                          </p>
                          <p className="cart-desc-cont">
                            {product.color}, UK {product.size}, {product.qty}{" "}
                            unit
                          </p>
                        </div>
                      </div>
                      <div className="order-btn-cont">
                        <button
                          className="cart-delete-btn"
                          disabled={product.isReviewed}
                          style={
                            product.isReviewed
                              ? { cursor: "not-allowed", opacity: "0.5" }
                              : {}
                          }
                          onClick={() =>
                            openReviewModal(item.delivered, product.id, item.id)
                          }
                        >
                          {product.isReviewed ? "Reviewed" : "Review"}
                        </button>
                        <button
                          className="cart-delete-btn"
                          onClick={() => navigate(`/product/${product.slug}`)}
                        >
                          Buy Again
                        </button>
                      </div>
                    </div>
                  ))}
                </td>
                <td className="order-td">
                  {new Date(item.createdAt).toDateString()}
                </td>
                <td className="order-td">
                  <span className={`status-badge status-${item.delivered?.toLowerCase() || 'pending'}`}>
                    {item.delivered?.charAt(0).toUpperCase() + item.delivered?.slice(1) || 'Pending'}
                  </span>
                  {item.delivered?.toLowerCase() === 'cancelled' && item.cancellation && (
                    <div className="cancellation-info">
                      <small>Cancelled on: {new Date(item.cancellation.cancelledAt).toDateString()}</small>
                      {item.cancellation.cancellationReason && (
                        <small>Reason: {item.cancellation.cancellationReason}</small>
                      )}
                    </div>
                  )}
                </td>
                <td className="order-td">₹{item.totalPrice}</td>
                <td className="order-td">
                  {canCancelOrder(item) && (
                    <button
                      className="cancel-order-btn"
                      onClick={() => openCancelModal(item.id || item._id)}
                    >
                      Cancel Order
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!data || data.length <= 0) && (
          <div className="empty-cart">
            <img src={EmptyImage} alt="empty-cart" />
            <p>Looks like you haven't purchased any items yet.</p>
          </div>
        )}
      </div>

      {showModal && (
        <FormReviews
          onClose={() => setShowModal(false)}
          onSubmit={(review) =>
            submitReview(review, currentProductId, currentOrderId)
          }
        />
      )}

      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content cancel-modal">
            <h3>Cancel Order</h3>
            <p>Are you sure you want to cancel this order? This action cannot be undone.</p>
            <div className="form-group">
              <label htmlFor="cancelReason">Reason for cancellation:</label>
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this order..."
                rows="3"
                required
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setCancellingOrderId(null);
                }}
                disabled={isCancelling}
              >
                Keep Order
              </button>
              <button
                className="btn-danger"
                onClick={cancelOrder}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
