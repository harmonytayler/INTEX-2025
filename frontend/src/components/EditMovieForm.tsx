import { useState, useEffect, useRef } from 'react';
import { Movie } from '../types/Movie';
import { updateMovie } from '../api/MovieAPI';
import '../pages/AdminPage.css';

interface EditMovieFormProps {
  movie: Movie;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditMovieForm = ({ movie, onSuccess, onCancel }: EditMovieFormProps) => {
  const [formData, setFormData] = useState<Movie>({ ...movie });
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // List of all possible genres
  const allGenres = [
    'Action',
    'Adventure',
    'Anime Series',
    'British TV Shows',
    'Children',
    'Comedies',
    'Comedies & Dramas',
    'International Comedies',
    'Romantic Comedies',
    'Crime TV Shows',
    'Documentaries',
    'International Documentaries',
    'Docuseries',
    'Dramas',
    'International Dramas',
    'Romantic Dramas',
    'Family Movies',
    'Fantasy',
    'Horror Movies',
    'International Thrillers',
    'International TV Shows',
    'Kids TV',
    'Language TV Shows',
    'Musicals',
    'Nature TV',
    'Reality TV',
    'Spirituality',
    'TV Action',
    'TV Comedies',
    'TV Dramas',
    'Talk Shows',
    'Thrillers',
  ];

  // Initialize selected genres based on the movie data
  useEffect(() => {
    const genres = allGenres.filter((genre) => {
      const genreKey = genre
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') as keyof Movie;
      return formData[genreKey] === 1;
    });
    setSelectedGenres(genres);
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) : value,
    });
  };

  const handleGenreChange = (genre: string) => {
    const genreKey = genre
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') as keyof Movie;

    if (selectedGenres.includes(genre)) {
      // Remove genre
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
      setFormData({
        ...formData,
        [genreKey]: 0,
      });
    } else {
      // Add genre
      setSelectedGenres([...selectedGenres, genre]);
      setFormData({
        ...formData,
        [genreKey]: 1,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      alert('Please upload an image file');
      return;
    }

    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPosterPreview(e.target?.result as string);
      setFormData({
        ...formData,
        posterUrl: e.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMovie(formData.showId, formData);
    onSuccess();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Movie</h2>
          <button className="close-button" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="modal-layout">
              <div className="modal-poster">
                <div
                  className={`aspect-ratio ${isDragging ? 'dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {posterPreview ? (
                    <img
                      src={posterPreview}
                      alt={`${formData.title} poster`}
                      className="movie-poster"
                    />
                  ) : (
                    <img
                      src={
                        formData.posterUrl ||
                        'https://via.placeholder.com/300x450?text=No+Poster'
                      }
                      alt={`${formData.title} poster`}
                      className="movie-poster"
                    />
                  )}
                  <div className="drag-drop-area">
                    <i className="fas fa-cloud-upload-alt"></i>
                    <p>Drag & drop to replace poster</p>
                    <p>or click to browse</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInput}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-details">
                <div className="modal-row">
                  <div className="modal-label">Title:</div>
                  <div className="modal-value">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="modal-row">
                  <div className="modal-label">Rating:</div>
                  <div className="modal-value">
                    {formData.averageStarRating === undefined ? (
                      <span className="no-rating">There are no ratings</span>
                    ) : formData.averageStarRating === 0 ? (
                      <span className="no-rating">There are no ratings</span>
                    ) : (
                      `${formData.averageStarRating.toFixed(1)}/5`
                    )}
                  </div>
                </div>

                <div className="modal-row">
                  <div className="modal-label">Duration:</div>
                  <div className="modal-value">
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="modal-row">
                  <div className="modal-label">Year:</div>
                  <div className="modal-value">
                    <input
                      type="number"
                      name="releaseYear"
                      value={formData.releaseYear}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="modal-row">
                  <div className="modal-label">Country:</div>
                  <div className="modal-value">
                    <input
                      type="text"
                      name="country"
                      value={formData.country || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="modal-row">
                  <div className="modal-label">Genres:</div>
                  <div className="modal-value">
                    <div className="genre-dropdown">
                      <div className="genre-selected">
                        {selectedGenres.length > 0
                          ? selectedGenres.join(', ')
                          : 'Select genres'}
                      </div>
                      <div className="genre-options">
                        {allGenres.map((genre) => (
                          <div
                            key={genre}
                            className={`genre-option ${selectedGenres.includes(genre) ? 'selected' : ''}`}
                            onClick={() => handleGenreChange(genre)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedGenres.includes(genre)}
                              onChange={() => {}}
                              className="genre-checkbox"
                            />
                            <span>{genre}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-row">
                  <div className="modal-label">Director:</div>
                  <div className="modal-value">
                    <input
                      type="text"
                      name="director"
                      value={formData.director || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="modal-row">
                  <div className="modal-label">Cast:</div>
                  <div className="modal-value">
                    <input
                      type="text"
                      name="cast"
                      value={formData.cast || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="modal-row">
                  <div className="modal-label">Description:</div>
                  <div className="modal-value">
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="modal-row">
                  <div className="modal-label">Type:</div>
                  <div className="modal-value">
                    <input
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={onCancel}
                className="modal-button cancel-button"
              >
                Cancel
              </button>
              <button type="submit" className="modal-button edit-button">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMovieForm;
