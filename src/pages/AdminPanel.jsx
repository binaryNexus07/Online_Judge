import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/client';
import { Plus, Edit2, Trash2, Shield, AlertCircle, CheckCircle, Database, Eye, EyeOff } from 'lucide-react';

const AVAILABLE_TAGS = [
  'Array', 'Hash Table', 'String', 'Two Pointers', 'Sliding Window',
  'Binary Search', 'Divide and Conquer', 'Dynamic Programming',
  'Greedy', 'Stack', 'Queue', 'Tree', 'Graph', 'Sorting',
  'Math', 'Recursion', 'Linked List', 'Backtracking'
];

const AdminPanel = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('list');

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [constraints, setConstraints] = useState('');
  const [timeLimit, setTimeLimit] = useState(1000);
  const [memoryLimit, setMemoryLimit] = useState(256);
  const [functionName, setFunctionName] = useState('');
  const [parameterTypes, setParameterTypes] = useState('');
  const [hints, setHints] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [examples, setExamples] = useState([{ input: '', output: '', explanation: '' }]);
  const [jsTemplate, setJsTemplate] = useState('');
  const [pyTemplate, setPyTemplate] = useState('');
  const [cppTemplate, setCppTemplate] = useState('');
  const [javaTemplate, setJavaTemplate] = useState('');

  const [editingProblemId, setEditingProblemId] = useState(null);

  // Test Case State
  const [testCasesList, setTestCasesList] = useState([]);
  const [newTcInput, setNewTcInput] = useState('');
  const [newTcOutput, setNewTcOutput] = useState('');
  const [newTcExplanation, setNewTcExplanation] = useState('');
  const [newTcIsHidden, setNewTcIsHidden] = useState(false);
  const [loadingTestCases, setLoadingTestCases] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pRes = await axiosInstance.get('/problem/all', { params: { limit: 1000 } });
      const resData = pRes.data?.data || pRes.data;
      setProblems(resData.problems || []);
    } catch (err) {
      setError('Failed to fetch problems.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setTitle(''); setSlug(''); setDescription(''); setDifficulty('easy');
    setConstraints(''); setTimeLimit(1000); setMemoryLimit(256);
    setFunctionName(''); setParameterTypes(''); setHints('');
    setSelectedTags([]); setExamples([{ input: '', output: '', explanation: '' }]);
    setJsTemplate(''); setPyTemplate(''); setCppTemplate(''); setJavaTemplate('');
    setEditingProblemId(null); setTestCasesList([]);
  };

  const fetchTestCases = async (probId) => {
    setLoadingTestCases(true);
    try {
      const res = await axiosInstance.get(`/testCase/problem/${probId}`);
      setTestCasesList(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load test cases', err);
    } finally {
      setLoadingTestCases(false);
    }
  };

  const handleExampleChange = (index, field, value) => {
    const updated = [...examples];
    updated[index][field] = value;
    setExamples(updated);
  };
  const addExampleField = () => setExamples([...examples, { input: '', output: '', explanation: '' }]);
  const removeExampleField = (index) => { if (examples.length > 1) setExamples(examples.filter((_, i) => i !== index)); };
  const handleTagToggle = (tag) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const getPayload = () => {
    const codeTemplate = [];
    if (jsTemplate.trim()) codeTemplate.push({ language: 'javascript', starterCode: jsTemplate });
    if (pyTemplate.trim()) codeTemplate.push({ language: 'python', starterCode: pyTemplate });
    if (cppTemplate.trim()) codeTemplate.push({ language: 'cpp', starterCode: cppTemplate });
    if (javaTemplate.trim()) codeTemplate.push({ language: 'java', starterCode: javaTemplate });

    const computedSlug = slug || title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const paramTypesArray = parameterTypes.split(',').map(s => s.trim()).filter(Boolean);

    return {
      title, slug: computedSlug, description, difficulty, constraints,
      timeLimit: Number(timeLimit) || 1000,
      memoryLimit: Number(memoryLimit) || 256,
      examples: examples.filter(ex => ex.input.trim() || ex.output.trim()),
      codeTemplate, solution: [],
      functionName: functionName || 'solve',
      parameterTypes: paramTypesArray,
      hints, tags: selectedTags
    };
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await axiosInstance.post('/problem/create', getPayload());
      setSuccess('Problem published successfully!');
      resetForm(); fetchData(); setActiveTab('list');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish problem.');
    }
  };

  const handleEditSelect = async (problem) => {
    resetForm();
    setTitle(problem.title);
    setSlug(problem.slug);
    setDescription(problem.description);
    setDifficulty(problem.difficulty || 'easy');
    setConstraints(problem.constraints || '');
    setTimeLimit(problem.timeLimit || 1000);
    setMemoryLimit(problem.memoryLimit || 256);
    setFunctionName(problem.functionName || '');
    setParameterTypes(Array.isArray(problem.parameterTypes) ? problem.parameterTypes.join(', ') : (problem.parameterTypes || ''));
    setHints(problem.hints || '');
    setSelectedTags(problem.tags || []);
    if (problem.examples?.length > 0) setExamples(problem.examples);

    const jsT = problem.codeTemplate?.find(t => t.language === 'javascript');
    if (jsT) setJsTemplate(jsT.starterCode);
    const pyT = problem.codeTemplate?.find(t => t.language === 'python');
    if (pyT) setPyTemplate(pyT.starterCode);
    const cppT = problem.codeTemplate?.find(t => t.language === 'cpp');
    if (cppT) setCppTemplate(cppT.starterCode);
    const javaT = problem.codeTemplate?.find(t => t.language === 'java');
    if (javaT) setJavaTemplate(javaT.starterCode);

    setEditingProblemId(problem._id);
    fetchTestCases(problem._id);
    setActiveTab('edit');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await axiosInstance.patch(`/problem/${editingProblemId}`, getPayload());
      setSuccess('Problem updated successfully!');
      resetForm(); fetchData(); setActiveTab('list');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update problem.');
    }
  };

  const handleDeleteProblem = async (id) => {
    if (!window.confirm('Delete this problem? All related test cases will be deleted.')) return;
    setError(''); setSuccess('');
    try {
      await axiosInstance.delete(`/problem/${id}`);
      setSuccess('Problem deleted.'); fetchData();
    } catch (err) {
      setError('Failed to delete problem.');
    }
  };

  const handleAddTestCase = async (e) => {
    e.preventDefault();
    if (!newTcInput.trim() || !newTcOutput.trim()) return;
    try {
      const res = await axiosInstance.post(`/testCase/problem/${editingProblemId}`, {
        input: newTcInput, output: newTcOutput, explanation: newTcExplanation, isHidden: newTcIsHidden
      });
      setTestCasesList(prev => [...prev, res.data?.data || res.data]);
      setNewTcInput(''); setNewTcOutput(''); setNewTcExplanation(''); setNewTcIsHidden(false);
    } catch (err) {
      alert('Failed to save test case.');
    }
  };

  const handleDeleteTestCase = async (tcId) => {
    try {
      await axiosInstance.delete(`/testCase/${tcId}`);
      setTestCasesList(prev => prev.filter(tc => tc._id !== tcId));
    } catch (err) {
      alert('Failed to delete test case.');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={24} style={{ color: 'var(--color-wa)' }} />
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>Admin Panel</h1>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>Create and manage problems, test cases, and grading specs</p>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', gap: '8px', padding: '12px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--color-wa-bg)', color: 'var(--color-wa)', fontSize: '0.875rem', marginBottom: '16px', alignItems: 'center' }}>
          <AlertCircle size={16} /><span>{error}</span>
        </div>
      )}
      {success && (
        <div style={{ display: 'flex', gap: '8px', padding: '12px', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--color-ac-bg)', color: 'var(--color-ac)', fontSize: '0.875rem', marginBottom: '16px', alignItems: 'center' }}>
          <CheckCircle size={16} /><span>{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={() => { setActiveTab('list'); resetForm(); setError(''); setSuccess(''); }} className={`tab-btn-admin ${activeTab === 'list' ? 'active' : ''}`}>Manage Problems ({problems.length})</button>
        <button onClick={() => { setActiveTab('add'); resetForm(); setError(''); setSuccess(''); }} className={`tab-btn-admin ${activeTab === 'add' ? 'active' : ''}`}><Plus size={14} style={{ marginRight: '4px' }} /> Create New</button>
        {activeTab === 'edit' && <button className="tab-btn-admin active">Editing: {title}</button>}
      </div>

      {/* LIST TAB */}
      {activeTab === 'list' && (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px', flexDirection: 'column', gap: '16px' }}>
              <div className="spinner" style={{ width: '24px', height: '24px' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Loading...</span>
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>Title</th><th>Difficulty</th><th>Limits</th><th style={{ width: '120px' }}>Actions</th></tr>
              </thead>
              <tbody>
                {problems.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: '600' }}>{p.title}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.difficulty}</td>
                    <td>{p.timeLimit}ms / {p.memoryLimit}MB</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEditSelect(p)} className="btn btn-secondary" style={{ padding: '6px', fontSize: '0.75rem' }} title="Edit"><Edit2 size={12} /></button>
                        <button onClick={() => handleDeleteProblem(p._id)} className="btn btn-danger" style={{ padding: '6px', fontSize: '0.75rem' }} title="Delete"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ADD / EDIT TAB */}
      {(activeTab === 'add' || activeTab === 'edit') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <form onSubmit={activeTab === 'add' ? handleCreateSubmit : handleEditSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '32px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
              {activeTab === 'add' ? 'Publish Problem' : 'Edit Problem'}
            </h3>

            <div className="grid grid-2" style={{ gap: '24px' }}>
              <div className="form-group">
                <label className="label">Title</label>
                <input type="text" className="input" value={title} onChange={(e) => { setTitle(e.target.value); if (activeTab === 'add') setSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')); }} placeholder="e.g. Two Sum" required />
              </div>
              <div className="form-group">
                <label className="label">Slug</label>
                <input type="text" className="input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated from title" />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Description</label>
              <textarea className="input" style={{ minHeight: '140px', resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Problem statement..." required />
            </div>

            <div className="form-group">
              <label className="label">Constraints</label>
              <textarea className="input" style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'var(--font-mono)' }} value={constraints} onChange={(e) => setConstraints(e.target.value)} placeholder="e.g. 1 <= nums.length <= 10^5" required />
            </div>

            <div className="grid grid-2" style={{ gap: '24px' }}>
              <div className="form-group">
                <label className="label">Time Limit (ms)</label>
                <input type="number" className="input" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="label">Memory Limit (MB)</label>
                <input type="number" className="input" value={memoryLimit} onChange={(e) => setMemoryLimit(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: '24px' }}>
              <div className="form-group">
                <label className="label">Function Name</label>
                <input type="text" className="input" value={functionName} onChange={(e) => setFunctionName(e.target.value)} placeholder="e.g. twoSum" required />
              </div>
              <div className="form-group">
                <label className="label">Parameter Types (comma-separated)</label>
                <input type="text" className="input" value={parameterTypes} onChange={(e) => setParameterTypes(e.target.value)} placeholder="e.g. int[], int" required />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Hints</label>
              <textarea className="input" style={{ minHeight: '60px', resize: 'vertical' }} value={hints} onChange={(e) => setHints(e.target.value)} placeholder="Optional hints..." />
            </div>

            <div className="grid grid-2" style={{ gap: '24px' }}>
              <div className="form-group">
                <label className="label">Difficulty</label>
                <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="label" style={{ marginBottom: '8px' }}>Tags</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {AVAILABLE_TAGS.map(tag => (
                  <button key={tag} type="button" onClick={() => handleTagToggle(tag)} className={`btn ${selectedTags.includes(tag) ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: '9999px' }}>{tag}</button>
                ))}
              </div>
            </div>

            {/* Examples */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="label">Examples</span>
                <button type="button" onClick={addExampleField} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>Add Example</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {examples.map((ex, idx) => (
                  <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                    {examples.length > 1 && <button type="button" onClick={() => removeExampleField(idx)} className="btn btn-danger" style={{ position: 'absolute', right: '12px', top: '12px', padding: '4px' }}><Trash2 size={12} /></button>}
                    <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>Example #{idx + 1}</div>
                    <div className="grid grid-2" style={{ gap: '16px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="label" style={{ fontSize: '0.65rem' }}>Input</label>
                        <input type="text" className="input" value={ex.input} onChange={(e) => handleExampleChange(idx, 'input', e.target.value)} placeholder="nums = [1, 2], target = 3" />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="label" style={{ fontSize: '0.65rem' }}>Output</label>
                        <input type="text" className="input" value={ex.output} onChange={(e) => handleExampleChange(idx, 'output', e.target.value)} placeholder="[0, 1]" />
                      </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="label" style={{ fontSize: '0.65rem' }}>Explanation</label>
                      <input type="text" className="input" value={ex.explanation} onChange={(e) => handleExampleChange(idx, 'explanation', e.target.value)} placeholder="Explain..." />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Templates */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <span className="label" style={{ display: 'block', marginBottom: '12px' }}>Code Templates</span>
              <div className="grid grid-2" style={{ gap: '20px' }}>
                <div className="form-group"><label className="label" style={{ fontSize: '0.65rem' }}>JavaScript</label><textarea className="input" style={{ fontFamily: 'var(--font-mono)', minHeight: '100px', fontSize: '0.8rem' }} value={jsTemplate} onChange={(e) => setJsTemplate(e.target.value)} placeholder="function solve() { ... }" /></div>
                <div className="form-group"><label className="label" style={{ fontSize: '0.65rem' }}>Python</label><textarea className="input" style={{ fontFamily: 'var(--font-mono)', minHeight: '100px', fontSize: '0.8rem' }} value={pyTemplate} onChange={(e) => setPyTemplate(e.target.value)} placeholder="def solve(): pass" /></div>
                <div className="form-group"><label className="label" style={{ fontSize: '0.65rem' }}>C++</label><textarea className="input" style={{ fontFamily: 'var(--font-mono)', minHeight: '100px', fontSize: '0.8rem' }} value={cppTemplate} onChange={(e) => setCppTemplate(e.target.value)} placeholder="class Solution { ... };" /></div>
                <div className="form-group"><label className="label" style={{ fontSize: '0.65rem' }}>Java</label><textarea className="input" style={{ fontFamily: 'var(--font-mono)', minHeight: '100px', fontSize: '0.8rem' }} value={javaTemplate} onChange={(e) => setJavaTemplate(e.target.value)} placeholder="class Solution { ... }" /></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="button" onClick={() => { setActiveTab('list'); resetForm(); setError(''); setSuccess(''); }} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ minWidth: '120px' }}>{activeTab === 'add' ? 'Publish' : 'Save Changes'}</button>
            </div>
          </form>

          {/* Test Cases Panel (edit mode) */}
          {activeTab === 'edit' && (
            <div className="card" style={{ padding: '32px' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={18} /> Test Cases Manager
              </h3>

              <form onSubmit={handleAddTestCase} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Add new test case:</div>
                <div className="grid grid-2" style={{ gap: '20px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Input</label>
                    <textarea className="input" style={{ fontFamily: 'var(--font-mono)', minHeight: '80px', fontSize: '0.8rem' }} value={newTcInput} onChange={(e) => setNewTcInput(e.target.value)} placeholder="e.g. [2,7,11,15]\n9" required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Expected Output</label>
                    <textarea className="input" style={{ fontFamily: 'var(--font-mono)', minHeight: '80px', fontSize: '0.8rem' }} value={newTcOutput} onChange={(e) => setNewTcOutput(e.target.value)} placeholder="e.g. [0,1]" required />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="label">Explanation (optional)</label>
                  <input type="text" className="input" value={newTcExplanation} onChange={(e) => setNewTcExplanation(e.target.value)} placeholder="Optional explanation" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    <input type="checkbox" checked={newTcIsHidden} onChange={(e) => setNewTcIsHidden(e.target.checked)} />
                    <span>Hidden (used only for submission grading)</span>
                  </label>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Save Test Case</button>
                </div>
              </form>

              <div style={{ overflowX: 'auto' }}>
                {loadingTestCases ? (
                  <div style={{ display: 'flex', padding: '24px', justifyContent: 'center' }}><div className="spinner" /></div>
                ) : testCasesList.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '12px' }}>No test cases yet. Add at least one!</div>
                ) : (
                  <table>
                    <thead><tr><th>Input</th><th>Expected Output</th><th style={{ width: '120px' }}>Type</th><th style={{ width: '80px' }}>Action</th></tr></thead>
                    <tbody>
                      {testCasesList.map(tc => (
                        <tr key={tc._id}>
                          <td><pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>{tc.input}</pre></td>
                          <td><pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{tc.output}</pre></td>
                          <td>
                            <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              {tc.isHidden ? <EyeOff size={10} /> : <Eye size={10} />}
                              {tc.isHidden ? 'Hidden' : 'Public'}
                            </span>
                          </td>
                          <td><button onClick={() => handleDeleteTestCase(tc._id)} className="btn btn-danger" style={{ padding: '6px' }} title="Delete"><Trash2 size={12} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .tab-btn-admin { background: none; border: none; padding: 12px 18px; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); cursor: pointer; border-bottom: 2px solid transparent; transition: all var(--transition-speed); }
        .tab-btn-admin:hover { color: var(--text-primary); }
        .tab-btn-admin.active { color: var(--text-primary); border-bottom-color: var(--text-primary); }
      `}</style>
    </div>
  );
};

export default AdminPanel;
