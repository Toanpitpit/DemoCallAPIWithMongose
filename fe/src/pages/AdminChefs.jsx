import { useState, useEffect } from 'react';
import { getChefs, createChef, updateChef, deleteChef } from '../api/chefApi';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../api/axiosConfig';

const emptyForm = { fullname: '', rank: '', description: '', nationality: '', image: '' };

export default function AdminChefs() {
  const [chefs, setChefs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

  const fetchData = () => {
    setLoading(true);
    getChefs()
      .then((res) => setChefs(res.data.data))
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
      fullname: item.fullname,
      rank: item.rank,
      description: item.description,
      nationality: item.nationality,
      image: item.image || '',
    });
    setEditingId(item._id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this chef?')) return;
    try {
      await deleteChef(id);
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
        await updateChef(editingId, form);
      } else {
        await createChef(form);
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
        <h1>Manage Chefs</h1>
        {!showForm && (
          <button className="btn-primary" onClick={() => { setShowForm(true); setError(''); }}>
            + Add Chef
          </button>
        )}
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit Chef' : 'Create Chef'}</h2>
          {error && <p className="error-msg">{error}</p>}

          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input name="fullname" value={form.fullname} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Rank</label>
              <input name="rank" value={form.rank} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows="3" />
          </div>

          <div className="form-group">
            <label>Nationality</label>
            <input name="nationality" value={form.nationality} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Image path (e.g. assets/images/chefs/chef_1.jpg)</label>
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="assets/images/chefs/..."
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
            <th>Full Name</th>
            <th>Rank</th>
            <th>Nationality</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {chefs.map((item) => (
            <tr key={item._id}>
              <td>
                {item.image ? (
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.fullname}
                    className="table-img"
                  />
                ) : (
                  <span className="no-img-small">-</span>
                )}
              </td>
              <td>{item.fullname}</td>
              <td><span className="chef-rank">{item.rank}</span></td>
              <td>{item.nationality}</td>
              <td className="desc-cell">{item.description}</td>
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

      {chefs.length === 0 && <p className="no-results">No chefs yet.</p>}
    </div>
  );
}
