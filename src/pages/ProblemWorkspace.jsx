import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Play, Send, MessageSquare, Code2, AlertTriangle, CheckCircle, Trash2, Clock, Eye, EyeOff, FileText, AlertOctagon } from 'lucide-react';

const ProblemWorkspace = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Problem State
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Workspace Tabs: 'description' | 'discussions' | 'submissions'
  const [activeTab, setActiveTab] = useState('description');

  // Code Editor State
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  
  // Console Runner State
  const [runnerOutput, setRunnerOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [runVerdict, setRunVerdict] = useState(null); // { status, detail }
  
  // Toggle Hint State
  const [showHint, setShowHint] = useState(false);

  // Discussions State (Replaces Comments)
  const [discussions, setDiscussions] = useState([]);
  const [discussionTitle, setDiscussionTitle] = useState('');
  const [discussionContent, setDiscussionContent] = useState('');
  const [submittingDiscussion, setSubmittingDiscussion] = useState(false);
  
  // Active Thread ID for showing content in accordion style
  const [expandedDiscussionId, setExpandedDiscussionId] = useState(null);

  // Submissions State
  const [submissionsList, setSubmissionsList] = useState([]);

  // Load starter code dynamically from DB schema or fallback
  const loadCodeTemplate = (prob, lang) => {
    if (!prob) return '';
    const dbTemplate = prob.codeTemplateSchema?.find(t => t.language === lang);
    if (dbTemplate) return dbTemplate.starterCode;

    // Fallback template if missing
    if (lang === 'javascript') {
      const funcName = prob.slug.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      return `function ${funcName}(input) {\n    // Write code here\n    return input;\n}`;
    }
    return `// Template for ${lang}\n`;
  };

  // Fetch Problem Details, Discussions & Submissions
  const fetchData = async () => {
    setLoading(true);
    try {
      const pRes = await axiosInstance.get(`/problems/${slug}`);
      setProblem(pRes.data);
      setCode(loadCodeTemplate(pRes.data, language));
      
      const dRes = await axiosInstance.get(`/discussions/${slug}`);
      setDiscussions(dRes.data);
      
      // Update local submissions list
      const allSubs = JSON.parse(localStorage.getItem('oj_submissions') || '[]');
      const filtered = allSubs.filter(s => s.problemId === pRes.data.id || s.problem_slug === pRes.data.slug);
      setSubmissionsList(filtered.reverse());
    } catch (err) {
      setError('Problem not found or failed to load data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  // Update template on language switch
  useEffect(() => {
    if (problem) {
      setCode(loadCodeTemplate(problem, language));
    }
  }, [language]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  // -----------------------------------------------------------------
  // RUN CODE (CLIENT SIDE SAMPLE) & SUBMIT CODE (VIA API CLIENT)
  // -----------------------------------------------------------------
  
  // "Run Code" executes only public sample test cases
  const handleRunCode = async () => {
    setIsRunning(true);
    setRunnerOutput('Running sample test cases...');
    setRunVerdict(null);
    
    try {
      // Fetch public test cases
      const tcRes = await axiosInstance.get(`/problems/${problem.id}/testcases`);
      const publicCases = tcRes.data;

      if (publicCases.length === 0) {
        setRunnerOutput('No public sample test cases defined for this problem.');
        setIsRunning(false);
        return;
      }

      await new Promise(r => setTimeout(r, 600)); // Minor execution delay

      if (language !== 'javascript') {
        setRunVerdict({ status: 'AC', detail: 'Sample Case Passed (Simulated)' });
        setRunnerOutput(`Input: ${publicCases[0].input}\nOutput: ${publicCases[0].expectedOutput}\n\nAll public test cases passed (Simulated).`);
        setIsRunning(false);
        return;
      }

      // JavaScript client execution sandbox
      const cleanCode = code + `\nreturn ${problem.functionName};`;
      const userFunctionFactory = new Function(cleanCode);
      const userFunction = userFunctionFactory();

      let passedCount = 0;
      let outputLogs = [];

      for (let tc of publicCases) {
        let args = [];
        try {
          if (tc.input.includes('\n')) {
            args = tc.input.split('\n').map(p => JSON.parse(p.trim()));
          } else {
            args = [JSON.parse(tc.input.trim())];
          }
        } catch (e) {
          args = [tc.input];
        }

        const expected = JSON.parse(tc.expectedOutput.trim());
        const result = userFunction(...args);
        
        const isMatch = (Array.isArray(expected) && Array.isArray(result)) 
          ? expected.sort().join(',') === result.sort().join(',')
          : JSON.stringify(expected) === JSON.stringify(result);

        if (isMatch) {
          passedCount++;
          outputLogs.push(`Test Case ${passedCount} [SUCCESS]\nInput: ${tc.input.replace('\n', ', ')}\nOutput: ${JSON.stringify(result)}\n`);
        } else {
          outputLogs.push(`Test Case ${passedCount + 1} [FAILED]\nInput: ${tc.input.replace('\n', ', ')}\nExpected: ${tc.expectedOutput}\nGot: ${JSON.stringify(result)}\n`);
          setRunVerdict({ status: 'WA', detail: 'Wrong Answer on Sample Case' });
          setRunnerOutput(outputLogs.join('\n'));
          setIsRunning(false);
          return;
        }
      }

      setRunVerdict({ status: 'AC', detail: 'Sample Cases Passed' });
      setRunnerOutput(outputLogs.join('\n') + `\nAll ${passedCount}/${publicCases.length} sample test cases passed successfully.`);
    } catch (err) {
      setRunVerdict({ status: 'CE', detail: 'Runtime/Compilation Error' });
      setRunnerOutput(`Error: ${err.message}\n${err.stack ? err.stack.split('\n')[0] : ''}`);
    } finally {
      setIsRunning(false);
    }
  };

  // "Submit Solution" calls POST /submissions to evaluate against hidden test cases
  const handleSubmitCode = async () => {
    setIsRunning(true);
    setRunnerOutput('Submitting solution to judge queue...');
    setRunVerdict(null);

    try {
      const response = await axiosInstance.post('/submissions', {
        problemId: problem.id,
        code,
        language
      });

      const submission = response.data;
      
      // Update local submissions list
      setSubmissionsList(prev => [submission, ...prev]);

      // Handle verdict presentation
      if (submission.status === 'AC') {
        setRunVerdict({ status: 'AC', detail: `Accepted (${submission.runtime}ms)` });
        setRunnerOutput(`Verdict: ACCEPTED\nPassed Test Cases: ${submission.passedTestCases}/${submission.totalTestCases}\nExecution Time: ${submission.runtime}ms\nMemory Used: ${submission.memory}MB\n\nSolution verified successfully.`);
      } else if (submission.status === 'WA') {
        setRunVerdict({ status: 'WA', detail: 'Wrong Answer' });
        setRunnerOutput(`Verdict: WRONG ANSWER\nPassed Test Cases: ${submission.passedTestCases}/${submission.totalTestCases}\n\nConsole logs:\n${submission.errorOutput || 'Output mismatch on hidden case.'}`);
      } else if (submission.status === 'CE') {
        setRunVerdict({ status: 'CE', detail: 'Compilation Error' });
        setRunnerOutput(`Verdict: COMPILATION ERROR\n\nCompiler Output:\n${submission.compileOutput}\n\nError Output:\n${submission.errorOutput}`);
      } else {
        setRunVerdict({ status: 'RE', detail: 'Runtime Error' });
        setRunnerOutput(`Verdict: RUNTIME ERROR\n\n${submission.errorOutput}`);
      }

    } catch (err) {
      setRunVerdict({ status: 'RE', detail: 'Server Error' });
      setRunnerOutput(`Failed to execute submission check: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // -----------------------------------------------------------------
  // DISCUSSIONS SECTION (Replaces Comments)
  // -----------------------------------------------------------------
  const handleDiscussionSubmit = async (e) => {
    e.preventDefault();
    if (!discussionTitle.trim() || !discussionContent.trim()) return;
    if (!user) {
      alert('You must be signed in to post in discussions.');
      navigate('/login');
      return;
    }

    setSubmittingDiscussion(true);
    try {
      const response = await axiosInstance.post('/discussions', {
        problemId: problem.id,
        title: discussionTitle,
        content: discussionContent
      });
      setDiscussions(prev => [response.data, ...prev]);
      setDiscussionTitle('');
      setDiscussionContent('');
    } catch (err) {
      alert('Failed to post discussion. Please try again.');
    } finally {
      setSubmittingDiscussion(false);
    }
  };

  const handleDiscussionDelete = async (id, e) => {
    e.stopPropagation(); // Prevent toggling the accordion when clicking delete
    if (!window.confirm('Are you sure you want to delete this discussion thread?')) return;
    try {
      await axiosInstance.delete(`/discussions/${id}`);
      setDiscussions(prev => prev.map(d => {
        if (d.id === id) {
          return { ...d, title: '[deleted]', content: '[deleted]', username: '[deleted]', is_deleted: true };
        }
        return d;
      }));
    } catch (err) {
      alert('Unauthorized to delete this discussion thread.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: '16px' }}>
        <div className="spinner" style={{ width: '32px', height: '32px' }} />
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Loading Workspace...</span>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-wa)' }}>{error || 'Problem Details Missing'}</h2>
        <button onClick={() => navigate('/problems')} className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Problems</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Workspace Header banner */}
      <div style={{ borderBottom: '1px solid var(--border-color)', padding: '12px 24px', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{problem.id}</span>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '700' }}>{problem.title}</h2>
          <span className="badge" style={{ textTransform: 'capitalize' }}>{problem.difficulty}</span>
          <span className="badge" style={{ fontSize: '0.65rem' }}>Limits: {problem.timilimt}ms / {problem.memorylimit}MB</span>
        </div>
        <button onClick={() => navigate('/problems')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
          All Problems
        </button>
      </div>

      {/* Main workspace splits */}
      <div className="grid grid-2" style={{ flex: 1, minHeight: 0 }}>
        
        {/* Left Side: Tabs Panel */}
        <div style={{ borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', backgroundColor: 'var(--bg-secondary)' }}>
          {/* Tab Navigation header */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
            <button 
              onClick={() => setActiveTab('description')}
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            >
              Description
            </button>
            <button 
              onClick={() => setActiveTab('discussions')}
              className={`tab-btn ${activeTab === 'discussions' ? 'active' : ''}`}
            >
              Discussions ({discussions.length})
            </button>
            <button 
              onClick={() => setActiveTab('submissions')}
              className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
            >
              Submissions ({submissionsList.length})
            </button>
          </div>

          <div style={{ padding: '24px', flex: 1 }}>
            
            {/* TAB: DESCRIPTION */}
            {activeTab === 'description' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span className="label" style={{ fontSize: '0.7rem' }}>id of question:</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{problem.id}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span className="label" style={{ fontSize: '0.7rem' }}>description :</span>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.925rem' }}>{problem.description}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span className="label" style={{ fontSize: '0.7rem' }}>constraints :</span>
                  <pre style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.825rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                    {problem.constrains}
                  </pre>
                </div>

                {/* Example Schema Rendering */}
                {problem.exampleSchema && problem.exampleSchema.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <span className="label" style={{ fontSize: '0.7rem' }}>Examples:</span>
                    {problem.exampleSchema.map((ex, idx) => (
                      <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', padding: '12px', backgroundColor: 'var(--bg-tertiary)' }}>
                        <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}><strong>Example {idx + 1}:</strong></div>
                        <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>Input: {ex.input}</div>
                        <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>Output: {ex.output}</div>
                        {ex.explanation && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>Explanation: {ex.explanation}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {problem.parameterTypes && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span className="label" style={{ fontSize: '0.7rem' }}>parameterTypes:</span>
                    <pre style={{ backgroundColor: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                      {problem.parameterTypes}
                    </pre>
                  </div>
                )}

                {/* Hints Section */}
                {problem.hints && (
                  <div style={{ marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <button 
                      onClick={() => setShowHint(!showHint)} 
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                    >
                      {showHint ? <EyeOff size={14} /> : <Eye size={14} />}
                      {showHint ? 'Hide Hint' : 'Show Hint'}
                    </button>
                    {showHint && (
                      <div className="card" style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--bg-tertiary)', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <AlertOctagon size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-tle)' }} />
                        <span>{problem.hints}</span>
                      </div>
                    )}
                  </div>
                )}

                {problem.tags && (
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Tags:</span>
                    {problem.tags.map(t => (
                      <span key={t} className="badge">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: DISCUSSIONS (Replaces Comments) */}
            {activeTab === 'discussions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Discussions</h3>
                
                {/* Create Thread Box */}
                <form onSubmit={handleDiscussionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder={user ? "Discussion Title/Subject..." : "Please log in to add a post."}
                    value={discussionTitle}
                    onChange={(e) => setDiscussionTitle(e.target.value)}
                    disabled={submittingDiscussion || !user}
                    required
                  />
                  <textarea
                    className="input"
                    style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit', padding: '12px' }}
                    placeholder="Write detailed content here..."
                    value={discussionContent}
                    onChange={(e) => setDiscussionContent(e.target.value)}
                    disabled={submittingDiscussion || !user}
                    required
                  />
                  {user ? (
                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '8px 16px' }} disabled={submittingDiscussion}>
                      {submittingDiscussion ? 'Posting...' : 'Create Thread'}
                    </button>
                  ) : (
                    <button type="button" onClick={() => navigate('/login')} className="btn btn-secondary" style={{ alignSelf: 'flex-end', padding: '8px 16px' }}>
                      Log In to Post
                    </button>
                  )}
                </form>

                {/* List of discussions in accordion style */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                  {discussions.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '24px' }}>
                      No discussions found. Start a new thread!
                    </div>
                  ) : (
                    discussions.map((d) => {
                      const isExpanded = expandedDiscussionId === d.id;
                      return (
                        <div 
                          key={d.id} 
                          className="card" 
                          style={{ 
                            padding: '14px', 
                            cursor: d.is_deleted ? 'default' : 'pointer', 
                            borderColor: isExpanded ? 'var(--text-primary)' : 'var(--border-color)' 
                          }}
                          onClick={() => !d.is_deleted && setExpandedDiscussionId(isExpanded ? null : d.id)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', textDecoration: d.is_deleted ? 'line-through' : 'none', color: d.is_deleted ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                                {d.title}
                              </h4>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Posted by <strong>{d.username}</strong>
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                              {!d.is_deleted && (user?.role === 'admin' || user?.id === d.userId) && (
                                <button 
                                  onClick={(e) => handleDiscussionDelete(d.id, e)} 
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', transition: 'color 0.1s' }}
                                  onMouseEnter={(e) => e.target.style.color = 'var(--color-wa)'}
                                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                                  title="Delete Thread"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Accordion Content Panel */}
                          {isExpanded && !d.is_deleted && (
                            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '12px', paddingTop: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                              {d.content}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB: SUBMISSIONS */}
            {activeTab === 'submissions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Your Submission History</h3>
                {submissionsList.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '24px' }}>
                    You haven't submitted any code for this problem yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {submissionsList.map((sub) => (
                      <div key={sub.id} className="card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                            <span 
                              style={{ 
                                fontWeight: '700', 
                                fontSize: '0.8rem',
                                color: sub.status === 'AC' ? 'var(--color-ac)' : 'var(--color-wa)'
                              }}
                            >
                              {sub.status === 'AC' ? 'ACCEPTED' : sub.status === 'CE' ? 'COMPILATION ERROR' : 'WRONG ANSWER'}
                            </span>
                            <span className="user-role-badge" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>{sub.language}</span>
                            {sub.status === 'AC' && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                ({sub.runtime}ms / {sub.memory}MB)
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {sub.status === 'AC' ? 'All test cases passed' : `Passed ${sub.passedTestCases}/${sub.totalTestCases} cases`}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {new Date(sub.submittedAt || sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Code Editor Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          
          {/* Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={16} style={{ color: 'var(--text-secondary)' }} />
              <select className="input" style={{ padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer' }} value={language} onChange={handleLanguageChange}>
                <option value="javascript">JavaScript (Evaluator Active)</option>
                <option value="python">Python 3 (Simulated)</option>
                <option value="cpp">C++ (GCC, Simulated)</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleRunCode} 
                disabled={isRunning} 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <Play size={12} />
                Run Code
              </button>
              <button 
                onClick={handleSubmitCode} 
                disabled={isRunning} 
                className="btn btn-primary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <Send size={12} />
                Submit Solution
              </button>
            </div>
          </div>

          {/* Text Editor Body */}
          <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
            <textarea
              className="code-textarea"
              style={{
                width: '100%',
                height: '100%',
                padding: '20px',
                border: 'none',
                resize: 'none',
                outline: 'none',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                tabSize: 4
              }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Write your code here..."
              disabled={isRunning}
            />
          </div>

          {/* Bottom Terminal Output */}
          <div style={{ height: '200px', borderTop: '2px solid var(--border-color)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', padding: '6px 16px', backgroundColor: 'var(--bg-tertiary)', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              <span>Console output</span>
              {runVerdict && (
                <span 
                  style={{ 
                    fontWeight: '700',
                    color: (runVerdict.status === 'AC') ? 'var(--color-ac)' : 'var(--color-wa)'
                  }}
                >
                  Verdict: {runVerdict.detail}
                </span>
              )}
            </div>
            <pre style={{ flex: 1, padding: '12px 16px', overflowY: 'auto', margin: 0, fontSize: '0.8rem', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--bg-primary)', color: runVerdict?.status === 'CE' ? 'var(--color-wa)' : 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
              {runnerOutput}
            </pre>
          </div>

        </div>

      </div>

      <style>{`
        .tab-btn {
          background: none;
          border: none;
          padding: 10px 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all var(--transition-speed);
        }
        .tab-btn:hover {
          color: var(--text-primary);
        }
        .tab-btn.active {
          color: var(--text-primary);
          border-bottom-color: var(--text-primary);
          background-color: var(--bg-secondary);
        }
      `}</style>
    </div>
  );
};

export default ProblemWorkspace;
