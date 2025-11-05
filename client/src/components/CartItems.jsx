import { AiFillDelete, AiFillHeart } from "react-icons/ai";
import { HiMinusCircle, HiPlusCircle } from "react-icons/hi";
import { Link } from "react-router-dom";
import { memo, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Axios from "../Axios";
import useAuth from "../../hooks/useAuth";

const CartItems = ({ cartId, data, qty, size, deleteItem, updateData }) => {
  const [currentQty, setCurrentQty] = useState(qty);
  const [debounceQty, setDebounceQty] = useState(null);
  const [isMovingToFavorites, setIsMovingToFavorites] = useState(false);
  const { auth, setAuth } = useAuth();
  const firstUpdate = useRef(true);
  useEffect(() => {
    const handler = setTimeout(() => {
      console.log("debounce");
      if (firstUpdate.current) {
        firstUpdate.current = false;
        return;
      }
      setDebounceQty(currentQty);
    }, 450);
    return () => {
      clearTimeout(handler);
    };
  }, [currentQty]);
  const changeQty = async () => {
    try {
      const response = await Axios.put(
        `/api/v1/cart/update/${cartId}`,
        {
          qty: debounceQty,
        },
        {
          headers: {
            Authorization: localStorage.getItem("jwt"),
          },
        }
      );
      console.log(response.data);
      updateData(response.data.cart);
      // if (response.data.success === true) {
      toast.success("Quantity updated successfully");
      setAuth({ ...auth, cartSize: auth.cartSize - qty + debounceQty });
      // }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };
  useEffect(() => {
    if (debounceQty !== null) {
      changeQty();
    }
  }, [debounceQty]);

  const moveToFavorites = async () => {
    setIsMovingToFavorites(true);
    try {
      const response = await Axios.post(
        `/api/v1/favorites/move-from-cart/${cartId}`,
        {},
        {
          headers: {
            Authorization: localStorage.getItem("jwt"),
          },
        }
      );
      
      if (response.data.success) {
        toast.success("Product added to favorites successfully!");
        // Don't update cart data or cart size since item stays in cart
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to move to favorites");
    } finally {
      setIsMovingToFavorites(false);
    }
  };
  return (
    <tr>
      <td>
        <div className="cart-product-cont">
          <div className="cart-image-cont">
            <Link
              to={`/product/${data.slug}`}
              style={{ textDecoration: "none" }}
            >
              <img src={data.image} alt="cart-img" />
            </Link>
          </div>
          <div className="cart-name-cont">
            <p style={{ textAlign: "left" }}>
              {data.brand} {data.name}
            </p>
            <div className="cart-name-cont-btn">
              <button onClick={deleteItem}>
                <AiFillDelete /> delete item
              </button>
              <button 
                onClick={moveToFavorites}
                disabled={isMovingToFavorites}
                style={{ 
                  opacity: isMovingToFavorites ? 0.6 : 1,
                  cursor: isMovingToFavorites ? 'not-allowed' : 'pointer'
                }}
              >
                <AiFillHeart /> {isMovingToFavorites ? 'Adding...' : 'Add to favorites'}
              </button>
            </div>
          </div>
        </div>
        <div className="cart-mobile-info">
          <p>Size: {size}</p>
          <p>Quantity: {size}</p>
          <p>Price: ₹ {data.price}/item</p>
        </div>
      </td>
      <td className="cart-subheader">
        <p>{size}</p>
      </td>
      <td className="td-qty cart-subheader">
        <div>
          <button
            onClick={() =>
              setCurrentQty((prev) => (prev > 0 ? prev - 1 : prev))
            }
          >
            <HiMinusCircle />
          </button>
          <p>{currentQty}</p>
          <button onClick={() => setCurrentQty((prev) => prev + 1)}>
            <HiPlusCircle />
          </button>
        </div>
      </td>
      <td className="cart-subheader">
        <p>₹ {qty * data.price}</p>
      </td>
    </tr>
  );
};

export default memo(CartItems);
