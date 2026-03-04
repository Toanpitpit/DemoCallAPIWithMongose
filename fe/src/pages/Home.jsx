import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDishes } from '../api/dishApi';
import { getCategories } from '../api/categoryApi';
import { getImageUrl } from '../api/axiosConfig';

export default function Home() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDishes(), getCategories()])
      .then(([dishRes, catRes]) => {
        setDishes(dishRes.data.data);
        setCategories(catRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredDishes =
    selectedCategory === 'all'
      ? dishes
      : dishes.filter((d) => d.category?._id === selectedCategory);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) return <div className="loading">Loading dishes...</div>;

  return (
    <div className="home-page">
      <div className="hero">
        <h1>Our Menu</h1>
        <p>Discover exquisite dishes crafted by our world-class chefs</p>
      </div>

      <div className="category-filter">
        <button
          className={selectedCategory === 'all' ? 'active' : ''}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={selectedCategory === cat._id ? 'active' : ''}
            onClick={() => setSelectedCategory(cat._id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="dishes-grid">
        {filteredDishes.map((dish) => (
          <Link to={`/dishes/${dish._id}`} key={dish._id} className="dish-card">
            <div className="dish-image">
              {dish.image ? (
                <img src={getImageUrl(dish.image)} alt={dish.title} />
              ) : (
                <div className="no-image">No Image</div>
              )}
              {dish.is_signature && <span className="badge-signature">Signature</span>}
            </div>
            <div className="dish-info">
              <h3>{dish.title}</h3>
              <p className="dish-category">{dish.category?.name}</p>
              <p className="dish-chef">by {dish.chef?.fullname}</p>
              <div className="dish-footer">
                <span className="dish-price">{formatPrice(dish.price)}</span>
                <span className="dish-rating">{'★'.repeat(Math.round(dish.rating))}{' '}{dish.rating}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredDishes.length === 0 && (
        <p className="no-results">No dishes found in this category.</p>
      )}
    </div>
  );
}
