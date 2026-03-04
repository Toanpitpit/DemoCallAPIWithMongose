import { useState, useEffect } from 'react';
import { getCategories } from '../api/categoryApi';
import { getImageUrl } from '../api/axiosConfig';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading categories...</div>;

  return (
    <div className="page">
      <h1>Categories</h1>
      <div className="cards-grid">
        {categories.map((cat) => (
          <div key={cat._id} className="info-card">
            {cat.image && (
              <div className="card-image">
                <img src={getImageUrl(cat.image)} alt={cat.name} />
              </div>
            )}
            <h3>{cat.name}</h3>
            <p>{cat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
