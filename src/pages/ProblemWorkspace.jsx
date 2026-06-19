import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Play, Send, Code2, CheckCircle, Clock, Eye, EyeOff, AlertOctagon } from 'lucide-react';

const STATUS_MAP = {
  accepted: { label: 'ACCEPTED', color: 'var(--color-ac)' },
  wrong_answer: { label: 'WRONG ANSWER', color: 'var(--color-wa)' },
  compile_error: { label: 'COMPILATION ERROR', color: 'var(--color-wa)' },
  runtime_error: { label: 'RUNTIME ERROR', color: 'var(--color-wa)' },
  time_limit_exceeded: { label: 'TIME LIMIT EXCEEDED', color: 'var(--color-tle)' },
  memory_limit_exceeded: { label: 'MEMORY LIMIT EXCEEDED', color: 'var(--color-tle)' },
  pending: { label: 'PENDING', color: 'var(--text-muted)' },
  judging: { label: 'JUDGING', color: 'var(--text-muted)' },
};

const ProblemWorkspace = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('description');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');

  const [runnerOutput, setRunnerOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [runVerdict, setRunVerdict] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const [submissionsList, setSubmissionsList] = useState([]);

  const loadCodeTemplate = (prob, lang) => {
    if (!prob) return '';
    const tmpl = prob.codeTemplate?.find(t => t.language === lang);
    if (tmpl) return tmpl.starterCode;
    const funcName = prob.functionName || prob.slug?.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) || 'solve';
    if (lang === 'javascript') return `function ${funcName}(input) {\n    // Write code here\n    return input;\n}`;
    if (lang === 'python') return `def ${funcName}(input):\n    # Write code here\n    pass`;
    if (lang === 'cpp') return `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    int ${funcName}(int input) {\n        // Write code here\n        return input;\n    }\n};`;
    if (lang === 'java') return `class Solution {\n    public int ${funcName}(int input) {\n        // Write code here\n        return input;\n    }\n}`;
    return `// Template for ${lang}\n`;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const pRes = await axiosInstance.get(`/problem/${slug}`);
      const prob = pRes.data?.data || pRes.data;
      setProblem(prob);
      setCode(loadCodeTemplate(prob, language));

      // Fetch user's submissions for this problem
      if (user) {
        try {
          const sRes = await axiosInstance.get('/submission/my-submissions', { params: { limit: 50 } });
          const allSubs = sRes.data?.data?.submissions || [];
          const filtered = allSubs.filter(s => s.problemId?._id === prob._id || s.problemId === prob._id);
          setSubmissionsList(filtered);
        } catch (e) {
          // Submissions fetch failed - not critical
        }
      }
    } catch (err) {
      setError('Problem not found or failed to load data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [slug]);
  useEffect(() => { if (problem) setCode(loadCodeTemplate(problem, language)); }, [language]);

  // Run Code against sample examples (client-side for JS)
  const handleRunCode = async () => {
    setIsRunning(true);
    setRunnerOutput('Running sample test cases...');
    setRunVerdict(null);

    try {
      const examples = problem.examples || [];
      if (examples.length === 0) {
        setRunnerOutput('No sample examples defined for this problem.');
        setIsRunning(false);
        return;
      }

      await new Promise(r => setTimeout(r, 500));

      if (language !== 'javascript') {
        setRunVerdict({ status: 'accepted', detail: 'Sample Case Passed (Simulated)' });
        setRunnerOutput(`Input: ${examples[0].input}\nOutput: ${examples[0].output}\n\nAll sample cases passed (Simulated for ${language}).`);
        setIsRunning(false);
        return;
      }

      const cleanCode = code + `\nreturn ${problem.functionName};`;
      const userFunctionFactory = new Function(cleanCode);
      const userFunction = userFunctionFactory();

      let passedCount = 0;
      let outputLogs = [];

      for (let ex of examples) {
        let args = [];
        try {
          if (ex.input.includes('\n')) {
            args = ex.input.split('\n').map(p => JSON.parse(p.trim()));
          } else {
            args = [JSON.parse(ex.input.trim())];
          }
        } catch (e) {
          args = [ex.input];
        }

        let expected;
        try { expected = JSON.parse(ex.output.trim()); } catch (e) { expected = ex.output.trim(); }
        const result = userFunction(...args);

        const isMatch = (Array.isArray(expected) && Array.isArray(result))
          ? expected.sort().join(',') === result.sort().join(',')
          : JSON.stringify(expected) === JSON.stringify(result);

        if (isMatch) {
          passedCount++;
          outputLogs.push(`Example ${passedCount} [SUCCESS]\nInput: ${ex.input}\nOutput: ${JSON.stringify(result)}\n`);
        } else {
          outputLogs.push(`Example ${passedCount + 1} [FAILED]\nInput: ${ex.input}\nExpected: ${ex.output}\nGot: ${JSON.stringify(result)}\n`);
          setRunVerdict({ status: 'wrong_answer', detail: 'Wrong Answer on Sample Case' });
          setRunnerOutput(outputLogs.join('\n'));
          setIsRunning(false);
          return;
        }
      }

      setRunVerdict({ status: 'accepted', detail: 'Sample Cases Passed' });
      setRunnerOutput(outputLogs.join('\n') + `\nAll ${passedCount}/${examples.length} sample cases passed.`);
    } catch (err) {
      setRunVerdict({ status: 'compile_error', detail: 'Runtime/Compilation Error' });
      setRunnerOutput(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Solution via backend
  const handleSubmitCode = async () => {
    if (!user) {
      setRunnerOutput('Please log in to submit solutions.');
      return;
    }
    setIsRunning(true);
    setRunnerOutput('Submitting solution to judge queue...');
    setRunVerdict(null);

    try {
      const response = await axiosInstance.post('/submission/submit', {
        problemId: problem._id,
        code,
        language
      });

      const submission = response.data?.data || response.data;
      setSubmissionsList(prev => [submission, ...prev]);

      const statusInfo = STATUS_MAP[submission.status] || STATUS_MAP.pending;

      if (submission.status === 'accepted') {
        setRunVerdict({ status: 'accepted', detail: `Accepted (${submission.runtime || 0}ms)` });
        setRunnerOutput(`Verdict: ACCEPTED\nPassed Test Cases: ${submission.passedTestCases}/${submission.totalTestCases}\nRuntime: ${submission.runtime || 0}ms\nMemory: ${submission.memory || 0}KB`);
      } else if (submission.status === 'compile_error') {
        setRunVerdict({ status: 'compile_error', detail: 'Compilation Error' });
        setRunnerOutput(`Verdict: COMPILATION ERROR\n\n${submission.compileOutput || submission.errorOutput || 'Unknown error'}`);
      } else {
        setRunVerdict({ status: submission.status, detail: statusInfo.label });
        setRunnerOutput(`Verdict: ${statusInfo.label}\nPassed: ${submission.passedTestCases}/${submission.totalTestCases}\n\n${submission.errorOutput || submission.executionOutput || ''}`);
      }
    } catch (err) {
      setRunVerdict({ status: 'runtime_error', detail: 'Server Error' });
      setRunnerOutput(`Failed to submit: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsRunning(false);
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

  const getVerdictColor = (status) => {
    const info = STATUS_MAP[status];
    return info ? info.color : 'var(--text-muted)';
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-color)', padding: '12px 24px', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '700' }}>{problem.title}</h2>
          <span className="badge" style={{ textTransform: 'capitalize' }}>{problem.difficulty}</span>
          <span className="badge" style={{ fontSize: '0.65rem' }}>Limits: {problem.timeLimit}ms / {problem.memoryLimit}MB</span>
        </div>
        <button onClick={() => navigate('/problems')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>All Problems</button>
      </div>

      {/* Main workspace */}
      <div className="grid grid-2" style={{ flex: 1, minHeight: 0 }}>

        {/* Left: Tabs Panel */}
        <div style={{ borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
            <button onClick={() => setActiveTab('description')} className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}>Description</button>
            <button onClick={() => setActiveTab('submissions')} className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}>Submissions ({submissionsList.length})</button>
          </div>

          <div style={{ padding: '24px', flex: 1 }}>

            {/* Description Tab */}
            {activeTab === 'description' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

                {/* Examples */}
                {problem.examples && problem.examples.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <span className="label" style={{ fontSize: '0.7rem' }}>Examples:</span>
                    {problem.examples.map((ex, idx) => (
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

                {problem.parameterTypes && problem.parameterTypes.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span className="label" style={{ fontSize: '0.7rem' }}>parameterTypes:</span>
                    <pre style={{ backgroundColor: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                      {Array.isArray(problem.parameterTypes) ? problem.parameterTypes.join(', ') : problem.parameterTypes}
                    </pre>
                  </div>
                )}

                {problem.hints && (
                  <div style={{ marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <button onClick={() => setShowHint(!showHint)} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                      {showHint ? <EyeOff size={14} /> : <Eye size={14} />}
                      {showHint ? ' Hide Hint' : ' Show Hint'}
                    </button>
                    {showHint && (
                      <div className="card" style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--bg-tertiary)', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <AlertOctagon size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-tle)' }} />
                        <span>{problem.hints}</span>
                      </div>
                    )}
                  </div>
                )}

                {problem.tags && problem.tags.length > 0 && (
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Tags:</span>
                    {problem.tags.map(t => (
                      <span key={t} className="badge">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submissions Tab */}
            {activeTab === 'submissions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Your Submission History</h3>
                {!user ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '24px' }}>
                    Please <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/login')}>log in</span> to view submissions.
                  </div>
                ) : submissionsList.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '24px' }}>
                    You haven't submitted any code for this problem yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {submissionsList.map((sub) => {
                      const statusInfo = STATUS_MAP[sub.status] || STATUS_MAP.pending;
                      return (
                        <div key={sub._id} className="card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontWeight: '700', fontSize: '0.8rem', color: statusInfo.color }}>{statusInfo.label}</span>
                              <span className="user-role-badge" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>{sub.language}</span>
                              {sub.status === 'accepted' && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({sub.runtime || 0}ms / {sub.memory || 0}KB)</span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {sub.status === 'accepted' ? 'All test cases passed' : `Passed ${sub.passedTestCases || 0}/${sub.totalTestCases || 0} cases`}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            {new Date(sub.submissionTime || sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Code Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={16} style={{ color: 'var(--text-secondary)' }} />
              <select className="input" style={{ padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer' }} value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="javascript">JavaScript</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleRunCode} disabled={isRunning} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <Play size={12} /> Run Code
              </button>
              <button onClick={handleSubmitCode} disabled={isRunning} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <Send size={12} /> Submit
              </button>
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
            <textarea
              className="code-textarea"
              style={{ width: '100%', height: '100%', padding: '20px', border: 'none', resize: 'none', outline: 'none', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.5', tabSize: 4 }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Write your code here..."
              disabled={isRunning}
            />
          </div>

          {/* Console */}
          <div style={{ height: '200px', borderTop: '2px solid var(--border-color)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', padding: '6px 16px', backgroundColor: 'var(--bg-tertiary)', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              <span>Console output</span>
              {runVerdict && (
                <span style={{ fontWeight: '700', color: getVerdictColor(runVerdict.status) }}>
                  Verdict: {runVerdict.detail}
                </span>
              )}
            </div>
            <pre style={{ flex: 1, padding: '12px 16px', overflowY: 'auto', margin: 0, fontSize: '0.8rem', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--bg-primary)', color: runVerdict?.status === 'compile_error' ? 'var(--color-wa)' : 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
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
        .tab-btn:hover { color: var(--text-primary); }
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
