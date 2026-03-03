import { useState, useEffect } from 'react';
import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from '../api/ingredientApi';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', description: '', origin: '' };

export default function AdminIngredients() {
  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

  const fetchData = () => {
    setLoading(true);
    getIngredients()
      .then((res) => setIngredients(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, description: item.description, origin: item.origin });
    setEditingId(item._id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ingredient?')) return;
    try {
      await deleteIngredient(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingId) {
        await updateIngredient(editingId, form);
      } else {
        await createIngredient(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchData();
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
        <h1>Manage Ingredients</h1>
        {!showForm && (
          <button className="btn-primary" onClick={() => { setShowForm(true); setError(''); }}>
            + Add Ingredient
          </button>
        )}
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit Ingredient' : 'Create Ingredient'}</h2>
          {error && <p className="error-msg">{error}</p>}

          <div className="form-group">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows="3" />
          </div>

          <div className="form-group">
            <label>Origin</label>
            <input name="origin" value={form.origin} onChange={handleChange} required />
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
            <th>Name</th>
            <th>Description</th>
            <th>Origin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((item) => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td className="desc-cell">{item.description}</td>
              <td>{item.origin}</td>
              <td className="action-btns">
                <button className="btn-edit" onClick={() => handleEdit(item)}>Edit</button>
                {isAdmin && (
                  <button className="btn-delete" onClick={() => handleDelete(item._id)}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {ingredients.length === 0 && <p className="no-results">No ingredients yet.</p>}
    </div>
  );
}
