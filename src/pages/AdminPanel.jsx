import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/client';
import { Plus, Edit2, Trash2, Shield, AlertCircle, CheckCircle, Database, HelpCircle, Eye, EyeOff } from 'lucide-react';

const AdminPanel = () => {
  const [problems, setProblems] = useState([]);
  const [topicsList, setTopicsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tab: 'list' | 'add' | 'edit'
  const [activeTab, setActiveTab] = useState('list');

  // Form Fields State
  const [questionId, setQuestionId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [constrains, setConstrains] = useState('');
  const [timilimt, setTimilimt] = useState(1000);
  const [memorylimit, setMemorylimit] = useState(256);
  const [functionName, setFunctionName] = useState('');
  const [parameterTypes, setParameterTypes] = useState('');
  const [hints, setHints] = useState('');
  
  // Example Schema State (List of {input, output, explanation})
  const [examples, setExamples] = useState([{ input: '', output: '', explanation: '' }]);
  
  // Templates State
  const [jsTemplate, setJsTemplate] = useState('');
  const [pyTemplate, setPyTemplate] = useState('');
  
  // Selected Topics (array of topic IDs)
  const [selectedTopics, setSelectedTopics] = useState([]);

  // Editing Reference
  const [editingProblemId, setEditingProblemId] = useState(null);

  // Test Case Manager State
  const [testCasesList, setTestCasesList] = useState([]);
  const [newTcInput, setNewTcInput] = useState('');
  const [newTcExpected, setNewTcExpected] = useState('');
  const [newTcIsHidden, setNewTcIsHidden] = useState(false);
  const [loadingTestCases, setLoadingTestCases] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pRes = await axiosInstance.get('/problems', { params: { limit: 1000 } });
      setProblems(pRes.data.problems);
      
      const tRes = await axiosInstance.get('/topics');
      setTopicsList(tRes.data);
    } catch (err) {
      setError('Failed to fetch initial database resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setQuestionId('');
    setTitle('');
    setDescription('');
    setConstrains('');
    setTimilimt(1000);
    setMemorylimit(256);
    setFunctionName('');
    setParameterTypes('');
    setHints('');
    setExamples([{ input: '', output: '', explanation: '' }]);
    setJsTemplate('');
    setPyTemplate('');
    setSelectedTopics([]);
    setEditingProblemId(null);
    setTestCasesList([]);
  };

  // Helper to sync test cases list for the editing problem
  const fetchTestCases = async (probId) => {
    setLoadingTestCases(true);
    try {
      const response = await axiosInstance.get(`/problems/${probId}/testcases`);
      setTestCasesList(response.data);
    } catch (err) {
      console.error('Failed to load test cases', err);
    } finally {
      setLoadingTestCases(false);
    }
  };

  // -----------------------------------------------------------------
  // DYNAMIC LIST MANIPULATIONS
  // -----------------------------------------------------------------
  const handleExampleChange = (index, field, value) => {
    const updated = [...examples];
    updated[index][field] = value;
    setExamples(updated);
  };

  const addExampleField = () => {
    setExamples([...examples, { input: '', output: '', explanation: '' }]);
  };

  const removeExampleField = (index) => {
    if (examples.length === 1) return;
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleTopicToggle = (topicId) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  // -----------------------------------------------------------------
  // SUBMITS (CREATE / EDIT)
  // -----------------------------------------------------------------
  const getPayload = () => {
    // Format Templates Array
    const codeTemplates = [];
    if (jsTemplate.trim()) codeTemplates.push({ language: 'javascript', starterCode: jsTemplate });
    if (pyTemplate.trim()) codeTemplates.push({ language: 'python', starterCode: pyTemplate });

    return {
      id: questionId,
      title,
      description,
      constrains,
      timilimt: Number(timilimt) || 1000,
      memorylimit: Number(memorylimit) || 256,
      exampleSchema: examples.filter(ex => ex.input.trim() || ex.output.trim()),
      codeTemplateSchema: codeTemplates,
      solutionSchema: [], // can be expanded similarly if needed
      functionName: functionName || 'solve',
      parameterTypes: parameterTypes || 'string',
      hints,
      topics: selectedTopics
    };
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axiosInstance.post('/problems', getPayload());
      setSuccess(`Problem ${questionId} published successfully!`);
      resetForm();
      fetchData();
      setActiveTab('list');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish problem.');
    }
  };

  const handleEditSelect = async (problem) => {
    resetForm();
    
    // Prefill fields
    setQuestionId(problem.id);
    setTitle(problem.title);
    setDescription(problem.description);
    setConstrains(problem.constrains || '');
    setTimilimt(problem.timilimt || 1000);
    setMemorylimit(problem.memorylimit || 256);
    setFunctionName(problem.functionName || '');
    setParameterTypes(problem.parameterTypes || '');
    setHints(problem.hints || '');
    
    if (problem.exampleSchema && problem.exampleSchema.length > 0) {
      setExamples(problem.exampleSchema);
    }
    
    const jsT = problem.codeTemplateSchema?.find(t => t.language === 'javascript');
    if (jsT) setJsTemplate(jsT.starterCode);
    const pyT = problem.codeTemplateSchema?.find(t => t.language === 'python');
    if (pyT) setPyTemplate(pyT.starterCode);

    // Map selected topic IDs
    // Find active problem topics from the global database seeds (filtered relationally)
    try {
      const fullProb = await axiosInstance.get(`/problems/${problem.id}`);
      // Find matching topic IDs from names
      const matchedIds = topicsList
        .filter(t => fullProb.data.tags?.includes(t.name))
        .map(t => t.id);
      setSelectedTopics(matchedIds);
    } catch (e) {
      console.error(e);
    }

    setEditingProblemId(problem.id);
    fetchTestCases(problem.id);
    setActiveTab('edit');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axiosInstance.put(`/problems/${editingProblemId}`, getPayload());
      setSuccess(`Problem ${editingProblemId} updated successfully!`);
      resetForm();
      fetchData();
      setActiveTab('list');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update problem.');
    }
  };

  const handleDeleteProblem = async (id) => {
    if (!window.confirm(`Delete problem ${id}? All related test cases will be deleted.`)) return;
    setError('');
    setSuccess('');
    try {
      await axiosInstance.delete(`/problems/${id}`);
      setSuccess(`Problem ${id} deleted.`);
      fetchData();
    } catch (err) {
      setError('Failed to delete problem.');
    }
  };

  // -----------------------------------------------------------------
  // TEST CASE ACTIONS
  // -----------------------------------------------------------------
  const handleAddTestCase = async (e) => {
    e.preventDefault();
    if (!newTcInput.trim() || !newTcExpected.trim()) return;

    try {
      const response = await axiosInstance.post('/testcases', {
        problemId: editingProblemId,
        input: newTcInput,
        expectedOutput: newTcExpected,
        isHidden: newTcIsHidden
      });
      setTestCasesList(prev => [...prev, response.data]);
      setNewTcInput('');
      setNewTcExpected('');
      setNewTcIsHidden(false);
    } catch (err) {
      alert('Failed to save testcase.');
    }
  };

  const handleDeleteTestCase = async (tcId) => {
    try {
      await axiosInstance.delete(`/testcases/${tcId}`);
      setTestCasesList(prev => prev.filter(tc => tc.id !== tcId));
    } catch (err) {
      alert('Failed to delete testcase.');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={24} style={{ color: 'var(--color-wa)' }} />
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>Admin Panel</h1>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>Create questions and manage grading specifications</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Tabs */}
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
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>ID</th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Limits</th>
                  <th style={{ width: '120px', textRight: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem) => (
                  <tr key={problem.id}>
                    <td style={{ fontWeight: '600' }}>{problem.id}</td>
                    <td style={{ fontWeight: '600' }}>{problem.title}</td>
                    <td style={{ textTransform: 'capitalize' }}>{problem.difficulty}</td>
                    <td>{problem.timilimt}ms / {problem.memorylimit}MB</td>
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
                          onClick={() => handleDeleteProblem(problem.id)} 
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

      {/* TAB CONTENT: ADD or EDIT */}
      {(activeTab === 'add' || activeTab === 'edit') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <form onSubmit={activeTab === 'add' ? handleCreateSubmit : handleEditSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '32px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
              {activeTab === 'add' ? 'Publish Question' : 'Modify Core Specs'}
            </h3>

            <div className="grid grid-2" style={{ gap: '24px' }}>
              <div className="form-group">
                <label className="label">id of question (unique)</label>
                <input
                  type="text"
                  className="input"
                  value={questionId}
                  onChange={(e) => setQuestionId(e.target.value)}
                  placeholder="e.g. Q4"
                  required
                  disabled={activeTab === 'edit'}
                />
              </div>
              
              <div className="form-group">
                <label className="label">Title</label>
                <input
                  type="text"
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Median of Two Sorted Arrays"
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
                placeholder="Write description here..."
                required
              />
            </div>

            <div className="form-group">
              <label className="label">constraints :</label>
              <textarea
                className="input"
                style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'var(--font-mono)' }}
                value={constrains}
                onChange={(e) => setConstrains(e.target.value)}
                placeholder="e.g. 1 <= nums.length <= 10^5"
                required
              />
            </div>

            <div className="grid grid-2" style={{ gap: '24px' }}>
              <div className="form-group">
                <label className="label">timilimt (ms)</label>
                <input
                  type="number"
                  className="input"
                  value={timilimt}
                  onChange={(e) => setTimilimt(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">memorylimit (MB)</label>
                <input
                  type="number"
                  className="input"
                  value={memorylimit}
                  onChange={(e) => setMemorylimit(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: '24px' }}>
              <div className="form-group">
                <label className="label">functionName (matching JS runner entry)</label>
                <input
                  type="text"
                  className="input"
                  value={functionName}
                  onChange={(e) => setFunctionName(e.target.value)}
                  placeholder="e.g. findMedianSortedArrays"
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">parameterTypes</label>
                <input
                  type="text"
                  className="input"
                  value={parameterTypes}
                  onChange={(e) => setParameterTypes(e.target.value)}
                  placeholder="e.g. integer[], integer[]"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">hints</label>
              <textarea
                className="input"
                style={{ minHeight: '60px', resize: 'vertical' }}
                value={hints}
                onChange={(e) => setHints(e.target.value)}
                placeholder="Provide helpful hints..."
              />
            </div>

            {/* Relational Topics Category selector */}
            <div className="form-group">
              <label className="label" style={{ marginBottom: '8px' }}>Assign Topics</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {topicsList.map(topic => {
                  const isChecked = selectedTopics.includes(topic.id);
                  return (
                    <button 
                      key={topic.id}
                      type="button"
                      onClick={() => handleTopicToggle(topic.id)}
                      className={`btn ${isChecked ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '9999px' }}
                    >
                      {topic.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Examples Schema Subform */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="label">exampleSchema</span>
                <button type="button" onClick={addExampleField} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                  Add Example
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {examples.map((ex, idx) => (
                  <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                    {examples.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeExampleField(idx)} 
                        className="btn btn-danger" 
                        style={{ position: 'absolute', right: '12px', top: '12px', padding: '4px' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                    <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>Example #{idx + 1}</div>
                    
                    <div className="grid grid-2" style={{ gap: '16px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="label" style={{ fontSize: '0.65rem' }}>Input</label>
                        <input
                          type="text"
                          className="input"
                          value={ex.input}
                          onChange={(e) => handleExampleChange(idx, 'input', e.target.value)}
                          placeholder="nums = [1, 2], target = 3"
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="label" style={{ fontSize: '0.65rem' }}>Output</label>
                        <input
                          type="text"
                          className="input"
                          value={ex.output}
                          onChange={(e) => handleExampleChange(idx, 'output', e.target.value)}
                          placeholder="[0, 1]"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="label" style={{ fontSize: '0.65rem' }}>Explanation</label>
                      <input
                        type="text"
                        className="input"
                        value={ex.explanation}
                        onChange={(e) => handleExampleChange(idx, 'explanation', e.target.value)}
                        placeholder="Explain the example results..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Editors */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <span className="label" style={{ display: 'block', marginBottom: '12px' }}>codeTemplateSchema</span>
              <div className="grid grid-2" style={{ gap: '20px' }}>
                <div className="form-group">
                  <label className="label" style={{ fontSize: '0.65rem' }}>JavaScript Starter Code</label>
                  <textarea
                    className="input"
                    style={{ fontFamily: 'var(--font-mono)', minHeight: '120px', fontSize: '0.8rem' }}
                    value={jsTemplate}
                    onChange={(e) => setJsTemplate(e.target.value)}
                    placeholder="function solve() { ... }"
                  />
                </div>
                <div className="form-group">
                  <label className="label" style={{ fontSize: '0.65rem' }}>Python Starter Code</label>
                  <textarea
                    className="input"
                    style={{ fontFamily: 'var(--font-mono)', minHeight: '120px', fontSize: '0.8rem' }}
                    value={pyTemplate}
                    onChange={(e) => setPyTemplate(e.target.value)}
                    placeholder="def solve():pass"
                  />
                </div>
              </div>
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

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button 
                type="button" 
                onClick={() => { setActiveTab('list'); resetForm(); setError(''); setSuccess(''); }} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ minWidth: '120px' }}>
                {activeTab === 'add' ? 'Publish Question' : 'Save core specifications'}
              </button>
            </div>
          </form>

          {/* Test Cases Sub-Panel Manager (Available during Edit Mode) */}
          {activeTab === 'edit' && (
            <div className="card" style={{ padding: '32px' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={18} />
                Test Cases Manager
              </h3>

              {/* Add Test Case Form */}
              <form onSubmit={handleAddTestCase} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Add new test case:</div>
                <div className="grid grid-2" style={{ gap: '20px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Input (parameters split by newline or json)</label>
                    <textarea
                      className="input"
                      style={{ fontFamily: 'var(--font-mono)', minHeight: '80px', fontSize: '0.8rem' }}
                      value={newTcInput}
                      onChange={(e) => setNewTcInput(e.target.value)}
                      placeholder="e.g. [2,7,11,15]\n9"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">Expected Output (json parsed representation)</label>
                    <textarea
                      className="input"
                      style={{ fontFamily: 'var(--font-mono)', minHeight: '80px', fontSize: '0.8rem' }}
                      value={newTcExpected}
                      onChange={(e) => setNewTcExpected(e.target.value)}
                      placeholder="e.g. [0,1]"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    <input 
                      type="checkbox" 
                      checked={newTcIsHidden} 
                      onChange={(e) => setNewTcIsHidden(e.target.checked)} 
                    />
                    <span>Is Hidden (Hidden Case used only for submission grading)</span>
                  </label>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    Save Test Case
                  </button>
                </div>
              </form>

              {/* Test Cases Table list */}
              <div style={{ overflowX: 'auto' }}>
                {loadingTestCases ? (
                  <div style={{ display: 'flex', padding: '24px', justifyContent: 'center' }}>
                    <div className="spinner" />
                  </div>
                ) : testCasesList.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '12px' }}>
                    No test cases defined yet. Code runs will fail. Please add at least one test case!
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Input</th>
                        <th>Expected Output</th>
                        <th style={{ width: '120px' }}>Type</th>
                        <th style={{ width: '80px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testCasesList.map(tc => (
                        <tr key={tc.id}>
                          <td>
                            <pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>{tc.input}</pre>
                          </td>
                          <td>
                            <pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{tc.expectedOutput}</pre>
                          </td>
                          <td>
                            <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              {tc.isHidden ? <EyeOff size={10} /> : <Eye size={10} />}
                              {tc.isHidden ? 'Hidden' : 'Public'}
                            </span>
                          </td>
                          <td>
                            <button 
                              onClick={() => handleDeleteTestCase(tc.id)} 
                              className="btn btn-danger" 
                              style={{ padding: '6px' }}
                              title="Delete Test Case"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
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
