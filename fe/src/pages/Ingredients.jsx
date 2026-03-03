import { useState, useEffect } from 'react';
import { getIngredients } from '../api/ingredientApi';

export default function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIngredients()
      .then((res) => setIngredients(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading ingredients...</div>;

  return (
    <div className="page">
      <h1>Ingredients</h1>
      <div className="cards-grid">
        {ingredients.map((ing) => (
          <div key={ing._id} className="info-card">
            <h3>{ing.name}</h3>
            <p>{ing.description}</p>
            <span className="ingredient-origin">Origin: {ing.origin}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
