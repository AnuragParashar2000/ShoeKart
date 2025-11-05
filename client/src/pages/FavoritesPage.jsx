import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Axios from '../Axios';
import useAuth from '../../hooks/useAuth';
import TriangleLoader from '../components/TriangleLoader';
import { toast } from 'react-toastify';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { HiShoppingCart } from 'react-icons/hi';
import '../styles/favorites.css';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { auth, setAuth } = useAuth();

  const fetchFavorites = async () => {
    try {
      const response = await Axios.get('/api/v1/favorites', {
        headers: {
          Authorization: localStorage.getItem('jwt'),
        },
      });
      
      if (response.data.success) {
        setFavorites(response.data.favorites);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (productId) => {
    try {
      const response = await Axios.delete(`/api/v1/favorites/remove/${productId}`, {
        headers: {
          Authorization: localStorage.getItem('jwt'),
        },
      });
      
      if (response.data.success) {
        setFavorites(favorites.filter(fav => String(fav.productId._id) !== String(productId)));
        toast.success('Product removed from favorites');
      }
    } catch (error) {
      toast.error('Failed to remove from favorites');
    }
  };

  const addToCart = async (productId, size = 7) => {
    try {
      const response = await Axios.post(
        '/api/v1/cart/add',
        { productId, size, qty: 1 },
        {
          headers: {
            Authorization: localStorage.getItem('jwt'),
          },
        }
      );
      
      if (response.data.message === 'Product added to cart successfully') {
        toast.success('Product added to cart successfully');
        setAuth({ ...auth, cartSize: auth.cartSize + 1 });
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  useEffect(() => {
    if (localStorage.getItem('jwt') === null) {
      setLoading(false);
      return;
    }
    fetchFavorites();
  }, []);

  if (loading) return <TriangleLoader height="500px" />;

  if (!auth) {
    return (
      <div className="favorites-container">
        <div className="favorites-empty">
          <h2>Please login to view your favorites</h2>
          <Link to="/login" className="login-btn">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1>My Favorites</h1>
        <p>{favorites.length} {favorites.length === 1 ? 'item' : 'items'} in your favorites</p>
      </div>

      {favorites.length === 0 ? (
        <div className="favorites-empty">
          <AiOutlineHeart size={80} color="#ccc" />
          <h2>No favorites yet</h2>
          <p>Start adding products to your favorites to see them here</p>
          <Link to="/" className="shop-btn">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((favorite) => (
            <div key={favorite._id} className="favorite-item">
              <div className="favorite-image">
                <Link to={`/product/${favorite.productId.slug}`}>
                  <img src={favorite.productId.image} alt={favorite.productId.name} />
                </Link>
                <button
                  className="remove-favorite-btn"
                  onClick={() => removeFromFavorites(favorite.productId._id)}
                  title="Remove from favorites"
                >
                  <AiFillHeart color="#ff4757" />
                </button>
              </div>
              
              <div className="favorite-info">
                <h3>{favorite.productId.brand} {favorite.productId.name}</h3>
                <p className="favorite-price">₹ {favorite.productId.price}</p>
                <p className="favorite-date">
                  Added on {new Date(favorite.addedAt).toLocaleDateString()}
                </p>
                
                <div className="favorite-actions">
                  <Link 
                    to={`/product/${favorite.productId.slug}`}
                    className="view-product-btn"
                  >
                    View Product
                  </Link>
                  <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(favorite.productId._id)}
                  >
                    <HiShoppingCart />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
