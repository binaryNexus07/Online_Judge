import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/client';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Pagination state
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProblems, setTotalProblems] = useState(0);

  // Constants
  const limit = 10;
  const difficulties = ['Easy', 'Medium', 'Hard'];
  
  // Extract all unique tags dynamically from our database for the dropdown filter
  const [allTags, setAllTags] = useState([]);

  const fetchProblems = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/problems', {
        params: {
          search,
          difficulty,
          tag,
          page,
          limit
        }
      });
      setProblems(response.data.problems);
      setTotalPages(response.data.totalPages);
      setTotalProblems(response.data.total);
    } catch (err) {
      setError('Failed to load problems. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on parameter changes
  useEffect(() => {
    fetchProblems();
  }, [difficulty, tag, page]);

  // Fetch all available tags once for filtering
  useEffect(() => {
    const loadAllTags = async () => {
      try {
        const response = await axiosInstance.get('/problems', { params: { limit: 1000 } });
        const tags = new Set();
        response.data.problems.forEach(p => {
          if (p.tags) p.tags.forEach(t => tags.add(t));
        });
        setAllTags(Array.from(tags));
      } catch (err) {
        console.error('Failed to load tags list', err);
      }
    };
    loadAllTags();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProblems();
  };

  const getDifficultyColor = (diff) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'var(--color-ac)';
      case 'medium': return 'var(--color-tle)';
      case 'hard': return 'var(--color-wa)';
      default: return 'var(--text-secondary)';
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDifficulty('');
    setTag('');
    setPage(1);
    // Directly fetch clean state
    setTimeout(() => {
      fetchProblems();
    }, 0);
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '4px' }}>Problem Set</h1>
          <p style={{ fontSize: '0.875rem' }}>Select a challenge to write code and verify correctness</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge" style={{ fontSize: '0.875rem', padding: '6px 12px' }}>
            {totalProblems} Problems Available
          </span>
        </div>
      </div>

      {/* Query Filters */}
      <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          
          {/* Search bar */}
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input"
              style={{ width: '100%', paddingLeft: '36px' }}
              placeholder="Search by ID, name, or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Difficulty Dropdown */}
          <select 
            className="input" 
            style={{ minWidth: '130px', cursor: 'pointer' }}
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
          >
            <option value="">All Difficulties</option>
            {difficulties.map(d => (
              <option key={d} value={d.toLowerCase()}>{d}</option>
            ))}
          </select>

          {/* Tag Dropdown */}
          <select 
            className="input" 
            style={{ minWidth: '130px', cursor: 'pointer' }}
            value={tag}
            onChange={(e) => { setTag(e.target.value); setPage(1); }}
          >
            <option value="">All Tags</option>
            {allTags.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Submit */}
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>
            Search
          </button>

          {/* Clear Filters */}
          {(search || difficulty || tag) && (
            <button type="button" onClick={clearFilters} className="btn btn-secondary" style={{ padding: '10px' }}>
              Clear
            </button>
          )}
        </form>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--color-wa)', color: 'var(--color-wa)', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>{error}</span>
          <button onClick={fetchProblems} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Retry</button>
        </div>
      )}

      {/* Problems List Table */}
      <div className="card" style={{ padding: 0, overflowX: 'auto', marginBottom: '24px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px', flexDirection: 'column', gap: '16px' }}>
            <div className="spinner" style={{ width: '24px', height: '24px' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Loading problems...</span>
          </div>
        ) : problems.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ marginBottom: '8px' }}>No Problems Found</h3>
            <p style={{ fontSize: '0.875rem' }}>No problems matched your active search query and filter criteria.</p>
            {(search || difficulty || tag) && (
              <button onClick={clearFilters} className="btn btn-primary" style={{ marginTop: '16px' }}>Reset Filters</button>
            )}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Title</th>
                <th style={{ width: '120px' }}>Difficulty</th>
                <th>Tags</th>
                <th style={{ width: '120px', textRight: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem) => (
                <tr key={problem.id}>
                  <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{problem.id}</td>
                  <td>
                    <Link 
                      to={`/problems/${problem.slug}`} 
                      style={{ color: 'var(--text-primary)', fontWeight: '600', textDecoration: 'none', transition: 'color var(--transition-speed)' }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--text-secondary)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
                    >
                      {problem.title}
                    </Link>
                  </td>
                  <td>
                    <span style={{ color: getDifficultyColor(problem.difficulty), fontWeight: '600', textTransform: 'capitalize' }}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {problem.tags && problem.tags.map(t => (
                        <span key={t} className="badge" style={{ fontSize: '0.7rem' }}>{t}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <Link to={`/problems/${problem.slug}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                      Solve
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && !loading && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary"
              style={{ padding: '8px' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary"
              style={{ padding: '8px' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Problems;
