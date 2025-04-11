import React, { useState } from 'react';
import '../style/MovieDetails.css';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  readOnly?: boolean;
  isPopup?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  readOnly = false,
  isPopup = false 
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const handleMouseEnter = (value: number) => {
    if (!readOnly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const handleClick = (value: number) => {
    if (!readOnly) {
      onRatingChange(value);
    }
  };

  return (
    <div className={`star-rating ${isPopup ? 'popup-rating' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-button ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(star)}
          disabled={readOnly}
          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
        >
          <svg
            className={`star-icon ${star <= (hoverRating || rating) ? 'star-filled' : 'star-empty'}`}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </button>
      ))}
      {!readOnly && (
        <div className="rating-text">
          {rating > 0 ? `Your rating: ${rating} star${rating !== 1 ? 's' : ''}` : 'Click a star to rate'}
        </div>
      )}
    </div>
  );
};

export default StarRating; 