import React from 'react';
import { Movie } from '../types/Movie';
import { useNavigate } from 'react-router-dom';

interface SearchDropdownProps {
  results: Movie[];
  onClose: () => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({ results, onClose }) => {
  const navigate = useNavigate();

  const handleMovieClick = (showId: string) => {
    navigate(`/movie/${showId}`);
    onClose();
  };

  if (results.length === 0) return null;

  // Calculate height based on number of results (max 3 movies visible)
  const itemHeight = 112; // 80px for poster + padding
  const maxVisibleItems = 3;
  const padding = 16; // 0.5rem padding top and bottom
  const height = Math.min(results.length, maxVisibleItems) * itemHeight + padding;

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      width: '100%',
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      border: '1px solid rgba(55, 65, 81, 1)',
      borderRadius: '0 0 0.5rem 0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      zIndex: 1001,
      marginTop: '0.25rem'
    }}>
      <div style={{
        height: `${height}px`,
        overflowY: results.length > maxVisibleItems ? 'scroll' : 'hidden',
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        padding: '0.5rem',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(156, 163, 175, 0.5) rgba(17, 24, 39, 0.95)'
      }}>
        {results.map((movie) => (
          <div
            key={movie.showId}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem',
              cursor: 'pointer',
              borderBottom: '1px solid rgba(55, 65, 81, 1)',
              transition: 'background-color 0.2s',
              width: '100%',
              boxSizing: 'border-box',
              height: '112px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onClick={() => handleMovieClick(movie.showId)}
          >
            <div style={{ width: '56px', height: '80px', flexShrink: 0 }}>
              <img
                src={movie.posterUrl || 'https://via.placeholder.com/56x80?text=No+Poster'}
                alt={movie.title}
                style={{ width: '56px', height: '80px', objectFit: 'cover' }}
                className="rounded"
              />
            </div>
            <div style={{ marginLeft: '1rem', flex: 1 }}>
              <div style={{
                color: 'white',
                fontSize: '1rem',
                fontWeight: 500,
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                lineHeight: '1.25'
              }}>{movie.title}</div>
              <div style={{
                color: 'rgba(156, 163, 175, 1)',
                fontSize: '0.875rem',
                marginTop: '0.25rem'
              }}>{movie.releaseYear}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchDropdown;