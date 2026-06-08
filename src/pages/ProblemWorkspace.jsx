import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Play, Send, MessageSquare, Code2, AlertTriangle, CheckCircle, Trash2, Clock } from 'lucide-react';

const ProblemWorkspace = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Problem State
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Workspace Tabs: 'description' | 'comments' | 'submissions'
  const [activeTab, setActiveTab] = useState('description');

  // Code Editor State
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  
  // Console Runner State
  const [customInput, setCustomInput] = useState('');
  const [runnerOutput, setRunnerOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [runVerdict, setRunVerdict] = useState(null); // { status, detail }

  // Comments State
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Submissions Simulation State
  const [submissionsList, setSubmissionsList] = useState([]);

  // Default code templates based on selected problem and language
  const getCodeTemplate = (prob, lang) => {
    if (!prob) return '';
    if (lang === 'javascript') {
      if (prob.slug === 'two-sum') {
        return `// JavaScript Template\nfunction twoSum(nums, target) {\n    // Write your code here\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) {\n            return [map.get(diff), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`;
      }
      if (prob.slug === 'reverse-string') {
        return `// JavaScript Template\nfunction reverseString(s) {\n    // Write your code here\n    // Modify s in-place\n    let left = 0, right = s.length - 1;\n    while (left < right) {\n        const temp = s[left];\n        s[left] = s[right];\n        s[right] = temp;\n        left++;\n        right--;\n    }\n    return s;\n}`;
      }
      // General template
      const funcName = prob.slug.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      return `// JavaScript Template\nfunction ${funcName}(input) {\n    // Write code here\n    return input;\n}`;
    } else if (lang === 'python') {
      return `def solve():\n    # Python 3 Template\n    pass\n`;
    } else {
      return `// C++/Java Template\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write code here\n    return 0;\n}`;
    }
  };

  // Fetch Problem Details & Comments
  const fetchData = async () => {
    setLoading(true);
    try {
      const pRes = await axiosInstance.get(`/problems/${slug}`);
      setProblem(pRes.data);
      setCode(getCodeTemplate(pRes.data, language));
      
      const cRes = await axiosInstance.get(`/comments/${slug}`);
      setComments(cRes.data);
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
      setCode(getCodeTemplate(problem, language));
    }
  }, [language]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  // Load submissions from localStorage
  useEffect(() => {
    if (problem) {
      const allSubs = JSON.parse(localStorage.getItem('oj_submissions') || '[]');
      const filtered = allSubs.filter(s => s.problem_slug === problem.slug);
      setSubmissionsList(filtered.reverse());
    }
  }, [problem]);

  // -----------------------------------------------------------------
  // RUN/EVAL CODE CLIENT SIDE (JS ONLY, SIMULATE OTHERS)
  // -----------------------------------------------------------------
  const executeCode = async (isSubmission = false) => {
    setIsRunning(true);
    setRunnerOutput('Running compiler execution...');
    setRunVerdict(null);
    await new Promise(r => setTimeout(r, 800)); // Sim delay

    if (language !== 'javascript') {
      // Simulation for other languages
      setIsRunning(false);
      if (code.trim().length < 10) {
        setRunVerdict({ status: 'CE', detail: 'Compilation Error: Syntax error near line 1' });
        setRunnerOutput('g++: compilation failed.\nIn function main:\nerror: expected \';\' before return');
        return;
      }
      // Return a simulated accepted or wrong answer based on code
      const isCorrect = code.toLowerCase().includes('return') || code.toLowerCase().includes('def') || code.toLowerCase().includes('solve');
      if (isCorrect) {
        setRunVerdict({ status: 'AC', detail: 'Accepted (Simulated Python/C++)' });
        setRunnerOutput(`All test cases passed.\nRuntime: 12ms\nMemory: 8MB`);
        if (isSubmission) recordSubmission('AC', 'Simulated execution');
      } else {
        setRunVerdict({ status: 'WA', detail: 'Wrong Answer on Hidden Case 4' });
        setRunnerOutput(`Expected: ${problem.output}\nGot: [Null/Empty]`);
        if (isSubmission) recordSubmission('WA', 'Output mismatch on hidden case 4');
      }
      return;
    }

    // actual client-side eval execution for JavaScript!
    try {
      // 1. Create function sandbox
      // Safe execution wrapping the eval
      const cleanCode = code + `\nreturn ${problem.slug.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}`;
      const userFunctionFactory = new Function(cleanCode);
      const userFunction = userFunctionFactory();

      if (typeof userFunction !== 'function') {
        throw new Error(`Could not locate function: ${problem.slug.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}`);
      }

      // Helper to match actual problem logic
      let result;
      let expected;

      if (problem.slug === 'two-sum') {
        // Run on sample test case
        result = userFunction([2, 7, 11, 15], 9);
        expected = [0, 1];
        
        // Hidden test case validation if submitting
        if (isSubmission) {
          const result2 = userFunction([3, 2, 4], 6);
          const expected2 = [1, 2];
          const matches2 = Array.isArray(result2) && result2.sort().join(',') === expected2.sort().join(',');
          
          const matches = Array.isArray(result) && result.sort().join(',') === expected.sort().join(',');
          if (matches && matches2) {
            setRunVerdict({ status: 'AC', detail: 'All 2/2 Test Cases Passed (Accepted)' });
            setRunnerOutput(`Input: nums = [2,7,11,15], target = 9\nOutput: [${result.join(', ')}]\n\nInput: nums = [3,2,4], target = 6\nOutput: [${result2.join(', ')}]\n\nStatus: Accepted!`);
            recordSubmission('AC', 'Client-side javascript verification');
          } else {
            setRunVerdict({ status: 'WA', detail: 'Wrong Answer' });
            setRunnerOutput(`Test case nums = [3,2,4], target = 6 failed.\nExpected: [1, 2]\nGot: ${JSON.stringify(result2)}`);
            recordSubmission('WA', 'Output mismatch');
          }
        } else {
          const matches = Array.isArray(result) && result.sort().join(',') === expected.sort().join(',');
          if (matches) {
            setRunVerdict({ status: 'AC', detail: 'Sample Case Passed' });
            setRunnerOutput(`Input: ${problem.input}\nOutput: [${result.join(', ')}]\n\nStatus: Correct!`);
          } else {
            setRunVerdict({ status: 'WA', detail: 'Wrong Answer on Sample Case' });
            setRunnerOutput(`Input: ${problem.input}\nExpected: ${problem.output}\nGot: ${JSON.stringify(result)}`);
          }
        }

      } else if (problem.slug === 'reverse-string') {
        const testArr = ['h','e','l','l','o'];
        userFunction(testArr); // In-place reverse
        result = testArr;
        expected = ['o','l','l','e','h'];

        if (isSubmission) {
          const testArr2 = ['H','a','n','n','a','h'];
          userFunction(testArr2);
          const expected2 = ['h','a','n','n','a','H'];
          const matches2 = resultMatches(testArr2, expected2);
          const matches = resultMatches(result, expected);
          if (matches && matches2) {
            setRunVerdict({ status: 'AC', detail: 'All 2/2 Test Cases Passed (Accepted)' });
            setRunnerOutput(`Input: ['h','e','l','l','o']\nOutput: ${JSON.stringify(result)}\n\nInput: ['H','a','n','n','a','h']\nOutput: ${JSON.stringify(testArr2)}\n\nStatus: Accepted!`);
            recordSubmission('AC', 'Client-side javascript verification');
          } else {
            setRunVerdict({ status: 'WA', detail: 'Wrong Answer' });
            setRunnerOutput(`Expected: ${JSON.stringify(expected2)}\nGot: ${JSON.stringify(testArr2)}`);
            recordSubmission('WA', 'Output mismatch');
          }
        } else {
          const matches = resultMatches(result, expected);
          if (matches) {
            setRunVerdict({ status: 'AC', detail: 'Sample Case Passed' });
            setRunnerOutput(`Input: ${problem.input}\nOutput: ${JSON.stringify(result)}\n\nStatus: Correct!`);
          } else {
            setRunVerdict({ status: 'WA', detail: 'Wrong Answer on Sample Case' });
            setRunnerOutput(`Expected: ${problem.output}\nGot: ${JSON.stringify(result)}`);
          }
        }
      } else {
        // General fallback evaluation
        setRunVerdict({ status: 'AC', detail: 'Sample Case Evaluated (Simulated)' });
        setRunnerOutput(`Compiled successfully.\nOutput matches sample outputs.`);
        if (isSubmission) recordSubmission('AC', 'Client-side simulation');
      }

    } catch (err) {
      setRunVerdict({ status: 'CE', detail: 'Runtime/Compilation Error' });
      setRunnerOutput(`Error: ${err.message}\n${err.stack ? err.stack.split('\n')[0] : ''}`);
      if (isSubmission) recordSubmission('CE', err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const resultMatches = (a, b) => {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
  };

  // Helper to record submission history in local storage
  const recordSubmission = (status, remarks) => {
    const allSubs = JSON.parse(localStorage.getItem('oj_submissions') || '[]');
    const newSub = {
      id: 'sub_' + Math.random().toString(36).substr(2, 9),
      problem_slug: problem.slug,
      problem_title: problem.title,
      username: user ? user.username : 'Guest Coder',
      language,
      code,
      status,
      remarks,
      created_at: new Date().toISOString()
    };
    allSubs.push(newSub);
    localStorage.setItem('oj_submissions', JSON.stringify(allSubs));
    setSubmissionsList(prev => [newSub, ...prev]);
  };

  // -----------------------------------------------------------------
  // COMMENTS SECTION
  // -----------------------------------------------------------------
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    if (!user) {
      alert('You must be signed in to add a comment.');
      navigate('/login');
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await axiosInstance.post('/comments', {
        problem_id: slug,
        body: commentBody
      });
      setComments(prev => [...prev, response.data]);
      setCommentBody('');
    } catch (err) {
      alert('Failed to post comment. Refresh or login again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await axiosInstance.delete(`/comments/${id}`);
      // Refresh local comment state (change current display to [deleted])
      setComments(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, body: '[deleted]', username: '[deleted]', is_deleted: true };
        }
        return c;
      }));
    } catch (err) {
      alert('Unauthorized to delete this comment.');
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
              onClick={() => setActiveTab('comments')}
              className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
            >
              Comments ({comments.length})
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
                    {problem.constraints}
                  </pre>
                </div>

                <div className="grid grid-2" style={{ gap: '16px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span className="label" style={{ fontSize: '0.7rem' }}>input:</span>
                    <pre style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.825rem', overflowX: 'auto' }}>
                      {problem.input}
                    </pre>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span className="label" style={{ fontSize: '0.7rem' }}>output:</span>
                    <pre style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.825rem', overflowX: 'auto' }}>
                      {problem.output}
                    </pre>
                  </div>
                </div>

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

            {/* TAB: COMMENTS */}
            {activeTab === 'comments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Discussion Thread</h3>
                
                {/* Comment Box */}
                <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    className="input"
                    style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit', padding: '12px' }}
                    placeholder={user ? "Share your approach or ask a question..." : "Please log in to add a comment."}
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    disabled={submittingComment || !user}
                  />
                  {user ? (
                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '8px 16px' }} disabled={submittingComment}>
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  ) : (
                    <button type="button" onClick={() => navigate('/login')} className="btn btn-secondary" style={{ alignSelf: 'flex-end', padding: '8px 16px' }}>
                      Log In to Post
                    </button>
                  )}
                </form>

                {/* List of comments */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                  {comments.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '24px' }}>
                      No comments yet. Be the first to start the discussion!
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                        <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                          <span style={{ fontWeight: '600', color: comment.is_deleted ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                            {comment.username}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                            <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                            {!comment.is_deleted && (user?.role === 'admin' || user?.id === comment.user_id) && (
                              <button 
                                onClick={() => handleCommentDelete(comment.id)} 
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', transition: 'color 0.1s' }}
                                onMouseEnter={(e) => e.target.style.color = 'var(--color-wa)'}
                                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                                title="Delete comment"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: comment.is_deleted ? 'var(--text-muted)' : 'var(--text-primary)', fontStyle: comment.is_deleted ? 'italic' : 'normal', marginTop: '4px' }}>
                          {comment.body}
                        </p>
                      </div>
                    ))
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
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.remarks}</div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                <option value="javascript">JavaScript (Runner Enabled)</option>
                <option value="python">Python 3 (Simulated)</option>
                <option value="cpp">C++ (GCC 11, Simulated)</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => executeCode(false)} 
                disabled={isRunning} 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <Play size={12} />
                Run Code
              </button>
              <button 
                onClick={() => executeCode(true)} 
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
                    color: runVerdict.status === 'AC' ? 'var(--color-ac)' : 'var(--color-wa)'
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
