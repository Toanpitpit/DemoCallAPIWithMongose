import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDishById } from '../api/dishApi';
import { getImageUrl } from '../api/axiosConfig';

export default function DishDetail() {
  const { id } = useParams();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDishById(id)
      .then((res) => setDish(res.data.data))
      .catch(() => setError('Dish not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-page">{error}</div>;

  return (
    <div className="dish-detail-page">
      <Link to="/" className="back-link">&larr; Back to Menu</Link>
      <div className="dish-detail">
        <div className="dish-detail-image">
          {dish.image ? (
            <img src={getImageUrl(dish.image)} alt={dish.title} />
          ) : (
            <div className="no-image large">No Image</div>
          )}
        </div>
        <div className="dish-detail-info">
          <div className="dish-detail-header">
            <h1>{dish.title}</h1>
            {dish.is_signature && <span className="badge-signature">Signature Dish</span>}
          </div>
          <p className="dish-detail-price">{formatPrice(dish.price)}</p>
          <div className="dish-detail-rating">
            <span className="stars">{'★'.repeat(Math.round(dish.rating))}{'☆'.repeat(5 - Math.round(dish.rating))}</span>
            <span>{dish.rating} / 5</span>
          </div>
          <p className="dish-detail-desc">{dish.description}</p>

          <div className="dish-detail-meta">
            <div className="meta-section">
              <h3>Category</h3>
              <p>{dish.category?.name}</p>
              <p className="meta-desc">{dish.category?.description}</p>
            </div>
            <div className="meta-section">
              <h3>Chef</h3>
              <p>{dish.chef?.fullname} — {dish.chef?.rank}</p>
              <p className="meta-desc">{dish.chef?.nationality}</p>
            </div>
          </div>

          {dish.ingredients?.length > 0 && (
            <div className="dish-detail-ingredients">
              <h3>Ingredients</h3>
              <ul>
                {dish.ingredients.map((ing) => (
                  <li key={ing._id}>
                    <strong>{ing.name}</strong> — {ing.description}
                    <span className="ingredient-origin">({ing.origin})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
