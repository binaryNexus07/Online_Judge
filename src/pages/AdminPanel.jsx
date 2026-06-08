import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/client';
import { Plus, Edit2, Trash2, BookOpen, AlertCircle, CheckCircle, Shield } from 'lucide-react';

const AdminPanel = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tab: 'list' | 'add' | 'edit'
  const [activeTab, setActiveTab] = useState('list');

  // Form Fields State
  const [questionId, setQuestionId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [constraints, setConstraints] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [outputVal, setOutputVal] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [tags, setTags] = useState('');

  // Editing Reference
  const [editingProblemId, setEditingProblemId] = useState(null);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/problems', { params: { limit: 1000 } });
      setProblems(response.data.problems);
    } catch (err) {
      setError('Failed to fetch problems.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const resetForm = () => {
    setQuestionId('');
    setTitle('');
    setDescription('');
    setConstraints('');
    setInputVal('');
    setOutputVal('');
    setDifficulty('easy');
    setTags('');
    setEditingProblemId(null);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!questionId || !title || !description || !constraints || !inputVal || !outputVal) {
      setError('Please fill in all required question structure fields.');
      return;
    }

    try {
      const payload = {
        id: questionId,
        title,
        description,
        constraints,
        input: inputVal,
        output: outputVal,
        difficulty,
        tags
      };

      await axiosInstance.post('/problems', payload);
      setSuccess(`Problem ${questionId} created successfully!`);
      resetForm();
      fetchProblems();
      setActiveTab('list');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create problem.');
    }
  };

  const handleEditSelect = (problem) => {
    setQuestionId(problem.id);
    setTitle(problem.title);
    setDescription(problem.description);
    setConstraints(problem.constraints);
    setInputVal(problem.input);
    setOutputVal(problem.output);
    setDifficulty(problem.difficulty);
    setTags(problem.tags ? problem.tags.join(', ') : '');
    setEditingProblemId(problem.id);
    setActiveTab('edit');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        title,
        description,
        constraints,
        input: inputVal,
        output: outputVal,
        difficulty,
        tags
      };

      await axiosInstance.put(`/problems/${editingProblemId}`, payload);
      setSuccess(`Problem ${editingProblemId} updated successfully!`);
      resetForm();
      fetchProblems();
      setActiveTab('list');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update problem.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete problem ${id}?`)) return;
    setError('');
    setSuccess('');

    try {
      await axiosInstance.delete(`/problems/${id}`);
      setSuccess(`Problem ${id} deleted successfully.`);
      fetchProblems();
    } catch (err) {
      setError('Failed to delete problem.');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={24} style={{ color: 'var(--color-wa)' }} />
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>Admin Control Panel</h1>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>Add, edit, or remove challenges from the database</p>
          </div>
        </div>
      </div>

      {/* Message Notifications */}
      {error && (
        <div style={{ display: 'flex', gap: '8px', padding: '12px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--color-wa-bg)', color: 'var(--color-wa)', fontSize: '0.875rem', marginBottom: '16px', alignItems: 'center' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div style={{ display: 'flex', gap: '8px', padding: '12px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--color-ac-bg)', color: 'var(--color-ac)', fontSize: '0.875rem', marginBottom: '16px', alignItems: 'center' }}>
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs Headers */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
        <button 
          onClick={() => { setActiveTab('list'); resetForm(); setError(''); setSuccess(''); }} 
          className={`tab-btn-admin ${activeTab === 'list' ? 'active' : ''}`}
        >
          Manage Problems ({problems.length})
        </button>
        <button 
          onClick={() => { setActiveTab('add'); resetForm(); setError(''); setSuccess(''); }} 
          className={`tab-btn-admin ${activeTab === 'add' ? 'active' : ''}`}
        >
          <Plus size={14} style={{ marginRight: '4px' }} />
          Create New Question
        </button>
        {activeTab === 'edit' && (
          <button className="tab-btn-admin active">
            Edit Problem {editingProblemId}
          </button>
        )}
      </div>

      {/* TAB CONTENT: LIST */}
      {activeTab === 'list' && (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px', flexDirection: 'column', gap: '16px' }}>
              <div className="spinner" style={{ width: '24px', height: '24px' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Syncing questions...</span>
            </div>
          ) : problems.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No problems found. Start by creating a new question!
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>ID</th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Tags</th>
                  <th style={{ width: '120px', textRight: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem) => (
                  <tr key={problem.id}>
                    <td style={{ fontWeight: '600' }}>{problem.id}</td>
                    <td style={{ fontWeight: '600' }}>{problem.title}</td>
                    <td style={{ textTransform: 'capitalize' }}>{problem.difficulty}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {problem.tags && problem.tags.map(t => (
                          <span key={t} className="badge" style={{ fontSize: '0.65rem' }}>{t}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleEditSelect(problem)} 
                          className="btn btn-secondary" 
                          style={{ padding: '6px', fontSize: '0.75rem' }}
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          onClick={() => handleDelete(problem.id)} 
                          className="btn btn-danger" 
                          style={{ padding: '6px', fontSize: '0.75rem' }}
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB CONTENT: ADD or EDIT FORM */}
      {(activeTab === 'add' || activeTab === 'edit') && (
        <form onSubmit={activeTab === 'add' ? handleCreateSubmit : handleEditSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '32px' }}>
          
          <div className="grid grid-2" style={{ gap: '24px' }}>
            <div className="form-group">
              <label className="label">id of question (unique)</label>
              <input
                type="text"
                className="input"
                value={questionId}
                onChange={(e) => setQuestionId(e.target.value)}
                placeholder="e.g. Q5"
                required
                disabled={activeTab === 'edit'} // ID cannot be edited
              />
            </div>
            
            <div className="form-group">
              <label className="label">Title</label>
              <input
                type="text"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Longest Palindromic Substring"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">description :</label>
            <textarea
              className="input"
              style={{ minHeight: '140px', resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide the question statement description detail here..."
              required
            />
          </div>

          <div className="form-group">
            <label className="label">constraints :</label>
            <textarea
              className="input"
              style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'var(--font-mono)' }}
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="e.g. 1 <= nums.length <= 10^5"
              required
            />
          </div>

          <div className="grid grid-2" style={{ gap: '24px' }}>
            <div className="form-group">
              <label className="label">input:</label>
              <textarea
                className="input"
                style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'var(--font-mono)' }}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="e.g. nums = [1,2,3], target = 4"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">output:</label>
              <textarea
                className="input"
                style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'var(--font-mono)' }}
                value={outputVal}
                onChange={(e) => setOutputVal(e.target.value)}
                placeholder="e.g. 2"
                required
              />
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: '24px' }}>
            <div className="form-group">
              <label className="label">Difficulty</label>
              <select 
                className="input" 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Tags (comma separated)</label>
              <input
                type="text"
                className="input"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. string, dynamic-programming, array"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button 
              type="button" 
              onClick={() => { setActiveTab('list'); resetForm(); setError(''); setSuccess(''); }} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '120px' }}>
              {activeTab === 'add' ? 'Publish Question' : 'Save Changes'}
            </button>
          </div>

        </form>
      )}

      <style>{`
        .tab-btn-admin {
          background: none;
          border: none;
          padding: 12px 18px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all var(--transition-speed);
        }
        .tab-btn-admin:hover {
          color: var(--text-primary);
        }
        .tab-btn-admin.active {
          color: var(--text-primary);
          border-bottom-color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
