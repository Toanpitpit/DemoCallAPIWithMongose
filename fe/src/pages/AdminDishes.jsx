import { useState, useEffect } from 'react';
import { getDishes, createDish, updateDish, deleteDish } from '../api/dishApi';
import { getCategories } from '../api/categoryApi';
import { getChefs } from '../api/chefApi';
import { getIngredients } from '../api/ingredientApi';
import { BASE_URL } from '../api/axiosConfig';

const emptyForm = {
  title: '',
  price: '',
  description: '',
  category: '',
  chef: '',
  ingredients: [],
  is_signature: false,
  rating: 0,
  image: null,
};

export default function AdminDishes() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = () => {
    setLoading(true);
    Promise.all([getDishes(), getCategories(), getChefs(), getIngredients()])
      .then(([dishRes, catRes, chefRes, ingRes]) => {
        setDishes(dishRes.data.data);
        setCategories(catRes.data.data);
        setChefs(chefRes.data.data);
        setIngredientsList(ingRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleIngredientToggle = (id) => {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.includes(id)
        ? prev.ingredients.filter((i) => i !== id)
        : [...prev.ingredients, id],
    }));
  };

  const handleEdit = (dish) => {
    setForm({
      title: dish.title,
      price: dish.price,
      description: dish.description,
      category: dish.category?._id || '',
      chef: dish.chef?._id || '',
      ingredients: dish.ingredients?.map((i) => i._id) || [],
      is_signature: dish.is_signature,
      rating: dish.rating,
      image: null,
    });
    setEditingId(dish._id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dish?')) return;
    try {
      await deleteDish(id);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('price', form.price);
    formData.append('description', form.description);
    formData.append('category', form.category);
    formData.append('chef', form.chef);
    formData.append('ingredients', JSON.stringify(form.ingredients));
    formData.append('is_signature', form.is_signature);
    formData.append('rating', form.rating);
    if (form.image) formData.append('image', form.image);

    try {
      if (editingId) {
        await updateDish(editingId, formData);
      } else {
        await createDish(formData);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Manage Dishes</h1>
        {!showForm && (
          <button className="btn-primary" onClick={() => { setShowForm(true); setError(''); }}>
            + Add Dish
          </button>
        )}
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit Dish' : 'Create Dish'}</h2>
          {error && <p className="error-msg">{error}</p>}

          <div className="form-row">
            <div className="form-group">
              <label>Title</label>
              <input name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Price (VND)</label>
              <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows="3" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Chef</label>
              <select name="chef" value={form.chef} onChange={handleChange} required>
                <option value="">Select chef</option>
                {chefs.map((c) => (
                  <option key={c._id} value={c._id}>{c.fullname} ({c.rank})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rating (0-5)</label>
              <input name="rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={handleChange} />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" name="is_signature" checked={form.is_signature} onChange={handleChange} />
                Signature Dish
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Image</label>
            <input type="file" name="image" accept="image/*" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Ingredients</label>
            <div className="checkbox-list">
              {ingredientsList.map((ing) => (
                <label key={ing._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={form.ingredients.includes(ing._id)}
                    onChange={() => handleIngredientToggle(ing._id)}
                  />
                  {ing.name}
                </label>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Price</th>
            <th>Category</th>
            <th>Chef</th>
            <th>Rating</th>
            <th>Signature</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {dishes.map((dish) => (
            <tr key={dish._id}>
              <td>
                {dish.image ? (
                  <img src={`${BASE_URL}${dish.image}`} alt={dish.title} className="table-img" />
                ) : (
                  <span className="no-img-small">-</span>
                )}
              </td>
              <td>{dish.title}</td>
              <td>{formatPrice(dish.price)}</td>
              <td>{dish.category?.name}</td>
              <td>{dish.chef?.fullname}</td>
              <td>{dish.rating}</td>
              <td>{dish.is_signature ? 'Yes' : 'No'}</td>
              <td className="action-btns">
                <button className="btn-edit" onClick={() => handleEdit(dish)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(dish._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {dishes.length === 0 && <p className="no-results">No dishes yet.</p>}
    </div>
  );
}
