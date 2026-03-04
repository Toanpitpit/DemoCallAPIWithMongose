import { useState, useEffect } from 'react';
import { getChefs } from '../api/chefApi';
import { getImageUrl } from '../api/axiosConfig';

export default function Chefs() {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChefs()
      .then((res) => setChefs(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading chefs...</div>;

  return (
    <div className="page">
      <h1>Our Chefs</h1>
      <div className="cards-grid">
        {chefs.map((chef) => (
          <div key={chef._id} className="info-card chef-card">
            {chef.image && (
              <div className="card-image">
                <img src={getImageUrl(chef.image)} alt={chef.fullname} />
              </div>
            )}
            <h3>{chef.fullname}</h3>
            <span className="chef-rank">{chef.rank}</span>
            <p>{chef.description}</p>
            <span className="chef-nationality">{chef.nationality}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
