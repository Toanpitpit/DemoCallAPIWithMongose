import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categoryApi';
import { getImageUrl } from '../api/axiosConfig';

const emptyForm = { name: '', description: '', image: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    getCategories()
      .then((res) => setCategories(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      description: item.description,
      image: item.image || '',
    });
    setEditingId(item._id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(id);
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
        await updateCategory(editingId, form);
      } else {
        await createCategory(form);
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
        <h1>Manage Categories</h1>
        {!showForm && (
          <button className="btn-primary" onClick={() => { setShowForm(true); setError(''); }}>
            + Add Category
          </button>
        )}
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit Category' : 'Create Category'}</h2>
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
            <label>Image path (e.g. assets/images/categories/appetizer.jpg)</label>
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="assets/images/categories/..."
            />
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
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((item) => (
            <tr key={item._id}>
              <td>
                {item.image ? (
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="table-img"
                  />
                ) : (
                  <span className="no-img-small">-</span>
                )}
              </td>
              <td>{item.name}</td>
              <td className="desc-cell">{item.description}</td>
              <td className="action-btns">
                <button className="btn-edit" onClick={() => handleEdit(item)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(item._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {categories.length === 0 && <p className="no-results">No categories yet.</p>}
    </div>
  );
}
