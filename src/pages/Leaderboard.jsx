import React, { useState, useEffect } from 'react';
import { Search, Trophy, Medal, Award, User } from 'lucide-react';

// Coder rank color-coding helpers
export const getRankDetails = (rating) => {
  if (rating >= 3000) return { title: 'Legendary Grandmaster', color: '#FF0000', glow: true };
  if (rating >= 2400) return { title: 'Grandmaster', color: '#FF0000' };
  if (rating >= 2100) return { title: 'Master', color: '#FF8C00' };
  if (rating >= 1900) return { title: 'Candidate Master', color: '#AA00AA' };
  if (rating >= 1600) return { title: 'Expert', color: '#0000FF' };
  if (rating >= 1400) return { title: 'Specialist', color: '#03A89E' };
  if (rating >= 1200) return { title: 'Pupil', color: '#008000' };
  return { title: 'Newbie', color: '#808080' };
};

const SEED_LEADERBOARD = [
  { username: 'tourist', email: 'tourist@itmo.ru', rating: 3782, solved: 842 },
  { username: 'Benq', email: 'benq@mit.edu', rating: 3624, solved: 798 },
  { username: 'ecnerwala', email: 'ecnerwala@harvard.edu', rating: 3512, solved: 765 },
  { username: 'radewoosh', email: 'rade@uw.edu.pl', rating: 3421, solved: 730 },
  { username: 'Bansal', email: 'sumitbansal1290@gmail.com', rating: 2450, solved: 124 },
  { username: 'AliceCoder', email: 'alice@example.com', rating: 1920, solved: 43 },
  { username: 'BobDev', email: 'bob@example.com', rating: 1540, solved: 18 },
  { username: 'NewbieCoder', email: 'newbie@example.com', rating: 980, solved: 2 }
];

const Leaderboard = () => {
  const [board, setBoard] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read actual submissions to dynamically adjust local user scores
    const subs = JSON.parse(localStorage.getItem('oj_submissions') || '[]');
    const solvedMap = {};
    
    // Count accepted unique problems solved
    subs.forEach(s => {
      if (s.status === 'AC') {
        if (!solvedMap[s.username]) solvedMap[s.username] = new Set();
        solvedMap[s.username].add(s.problem_slug);
      }
    });

    const updatedBoard = SEED_LEADERBOARD.map(coder => {
      const uniqueSolved = solvedMap[coder.username] ? solvedMap[coder.username].size : 0;
      // Add local storage solved questions on top of seed database solved questions
      return {
        ...coder,
        solved: coder.solved + uniqueSolved
      };
    });

    // Sort by rating descending
    updatedBoard.sort((a, b) => b.rating - a.rating);
    setBoard(updatedBoard);
    setLoading(false);
  }, []);

  const filteredBoard = board.filter(coder => 
    coder.username.toLowerCase().includes(search.toLowerCase()) ||
    coder.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderRankIcon = (index) => {
    if (index === 0) return <Trophy size={16} style={{ color: '#FFD700' }} />;
    if (index === 1) return <Medal size={16} style={{ color: '#C0C0C0' }} />;
    if (index === 2) return <Medal size={16} style={{ color: '#CD7F32' }} />;
    return null;
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '4px' }}>Leaderboard</h1>
        <p style={{ fontSize: '0.875rem' }}>Top coders ranked by rating and solved count</p>
      </div>

      {/* Search Filter */}
      <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '24px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="input"
          style={{ width: '100%', paddingLeft: '36px' }}
          placeholder="Search coder by username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Leaderboard Table */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px', flexDirection: 'column', gap: '16px' }}>
            <div className="spinner" style={{ width: '24px', height: '24px' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Loading leaderboard...</span>
          </div>
        ) : filteredBoard.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No coders found matching your search.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Rank</th>
                <th>User</th>
                <th>Rating</th>
                <th>Ranks</th>
                <th style={{ width: '150px' }}>Solved Count</th>
              </tr>
            </thead>
            <tbody>
              {filteredBoard.map((coder, index) => {
                const rankInfo = getRankDetails(coder.rating);
                return (
                  <tr key={coder.username}>
                    <td style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {renderRankIcon(index)}
                        <span>#{index + 1}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span 
                          style={{ 
                            fontWeight: '700', 
                            color: rankInfo.color,
                            textShadow: rankInfo.glow ? '0 0 4px rgba(255,0,0,0.2)' : 'none'
                          }}
                        >
                          {coder.username}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{coder.email}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>{coder.rating}</td>
                    <td>
                      <span 
                        className="user-role-badge"
                        style={{ 
                          color: rankInfo.color, 
                          borderColor: rankInfo.color + '40',
                          backgroundColor: rankInfo.color + '0C',
                          fontSize: '0.7rem'
                        }}
                      >
                        {rankInfo.title}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{coder.solved}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
