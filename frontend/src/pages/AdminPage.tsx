import React, { useState, useEffect } from 'react';
import { Movie } from '../types/Movie';
import { fetchMovies, deleteMovie } from '../api/MovieAPI';
import './AdminPage.css';
import Pagination from '../components/Pagination';
import EditMovieForm from '../components/EditMovieForm';
import NewMovieForm from '../components/NewMovieForm';
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddingMovie, setIsAddingMovie] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGenreFilterOpen, setIsGenreFilterOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [deleteConfirmMovie, setDeleteConfirmMovie] = useState<Movie | null>(null);

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

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleAddMovie = () => {
    setIsAddingMovie(true);
    setEditingMovie(null);
    setIsEditModalOpen(true);
  };

  const renderSortIcon = (field: string): string => {
    if (sortField !== field) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AdminPage mounted');
    console.log('isAdmin:', isAdmin);
    if (!isAdmin) {
      console.log('Not admin, redirecting...');
      navigate('/');
      return;
    }
    loadMovies();
  }, [isAdmin, navigate]);

  // Load movies with pagination and filters
  const loadMovies = async () => {
    try {
      setLoading(true);
      console.log('Loading movies...');
      const response = await fetchMovies(
        itemsPerPage,
        currentPage,
        selectedGenres,
        searchTerm,
        [sortField, sortOrder]
      );
      
      console.log('Movies loaded:', response);
      setMovies(response.movies);
      setTotalResults(response.total);
      setTotalPages(Math.ceil(response.total / itemsPerPage));
      setError(null);
    } catch (err) {
      console.error('Error loading movies:', err);
      setError('Failed to fetch movies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenreFilter = () => {
    setIsGenreFilterOpen(true);
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenres((prev) => {
      const newGenres = prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre];
      setCurrentPage(1);
      return newGenres;
    });
  };

  const handleEditMovie = (movie: Movie) => {
    setEditingMovie(movie);
    setIsEditModalOpen(true);
    setIsModalOpen(false);
  };

  const handleDeleteMovie = (movie: Movie) => {
    setDeleteConfirmMovie(movie);
  };

  const confirmDelete = async () => {
    if (deleteConfirmMovie) {
      try {
        await deleteMovie(deleteConfirmMovie.showId);
        loadMovies(); // Reload current page after deletion
        setDeleteConfirmMovie(null);
        setIsModalOpen(false);
      } catch (err) {
        setError('Failed to delete movie. Please try again later.');
        console.error('Error deleting movie:', err);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleViewMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  const formatDuration = (duration: string | null | undefined): string => {
    if (!duration) return '-';
    return duration;
  };

  const getGenres = (movie: Movie): string => {
    const genres = allGenres.filter(
      (genre) => movie[genre.toLowerCase() as keyof Movie] === 1
    );
    return genres.join(', ') || '-';
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-message">{error}</div>
        <button onClick={loadMovies} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">MANAGE CONTENT</h1>
      <br />
      <div className="admin-actions">
        <form onSubmit={(e) => {
          e.preventDefault();
          setCurrentPage(1);
          loadMovies();
        }} className="search-form">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search movies..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </form>
        <button onClick={handleAddMovie} className="add-button">
          <i className="fas fa-plus"></i> Add Movie
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>
                <div
                  className={`sort-header ${sortField === 'title' ? 'active' : ''}`}
                  onClick={() => handleSort('title')}
                >
                  Title
                  <span className="sort-icon">{renderSortIcon('title')}</span>
                </div>
              </th>
              <th>
                <div
                  className={`sort-header ${sortField === 'averageStarRating' ? 'active' : ''}`}
                  onClick={() => handleSort('averageStarRating')}
                >
                  Avg. Rating
                  <span className="sort-icon">
                    {renderSortIcon('averageStarRating')}
                  </span>
                </div>
              </th>
              <th>
                <div
                  className={`sort-header ${sortField === 'duration' ? 'active' : ''}`}
                  onClick={() => handleSort('duration')}
                >
                  Duration
                  <span className="sort-icon">
                    {renderSortIcon('duration')}
                  </span>
                </div>
              </th>
              <th>
                <div
                  className={`sort-header ${sortField === 'releaseYear' ? 'active' : ''}`}
                  onClick={() => handleSort('releaseYear')}
                >
                  Year
                  <span className="sort-icon">
                    {renderSortIcon('releaseYear')}
                  </span>
                </div>
              </th>
              <th>
                <div
                  className={`sort-header ${sortField === 'country' ? 'active' : ''}`}
                  onClick={() => handleSort('country')}
                >
                  Country
                  <span className="sort-icon">{renderSortIcon('country')}</span>
                </div>
              </th>
              <th>
                <div className="sort-header" onClick={handleGenreFilter}>
                  Genres
                  <span className="sort-icon">⚙️</span>
                </div>
              </th>
              <th>Director</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-state">
                  No movies found
                </td>
              </tr>
            ) : (
              movies.map((movie) => (
                <tr key={movie.showId}>
                  <td className="movie-title">{movie.title}</td>
                  <td>
                    {movie.averageStarRating === undefined ? (
                      <span className="no-rating">There are no ratings</span>
                    ) : movie.averageStarRating === 0 ? (
                      <span className="no-rating">There are no ratings</span>
                    ) : (
                      `${movie.averageStarRating.toFixed(1)}/5`
                    )}
                  </td>
                  <td>{formatDuration(movie.duration)}</td>
                  <td>{movie.releaseYear}</td>
                  <td>{movie.country || '-'}</td>
                  <td>{getGenres(movie)}</td>
                  <td>{movie.director || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleViewMovie(movie)}
                        className="action-button view-button"
                        title="View movie details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        onClick={() => handleEditMovie(movie)}
                        className="action-button edit-button"
                        title="Edit movie"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(movie)}
                        className="action-button delete-button"
                        title="Delete movie"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={itemsPerPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handleItemsPerPageChange}
        totalItems={totalResults}
      />

      {/* Movie Details Modal */}
      {isModalOpen && selectedMovie && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedMovie.title}</h2>
              <button className="close-button" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-layout">
                <div className="modal-poster">
                  <div className="aspect-ratio">
                    <img
                      src={
                        selectedMovie.posterUrl ||
                        'https://via.placeholder.com/300x450?text=No+Poster'
                      }
                      alt={`${selectedMovie.title} poster`}
                      className="movie-poster"
                    />
                  </div>
                </div>
                <div className="modal-details">
                  <div className="modal-row">
                    <div className="modal-label">Title:</div>
                    <div className="modal-value">{selectedMovie.title}</div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-label">Rating:</div>
                    <div className="modal-value">
                      {selectedMovie.averageStarRating === undefined ? (
                        <span className="no-rating">There are no ratings</span>
                      ) : selectedMovie.averageStarRating === 0 ? (
                        <span className="no-rating">There are no ratings</span>
                      ) : (
                        `${selectedMovie.averageStarRating.toFixed(1)}/5`
                      )}
                    </div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-label">Duration:</div>
                    <div className="modal-value">
                      {formatDuration(selectedMovie.duration)}
                    </div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-label">Year:</div>
                    <div className="modal-value">
                      {selectedMovie.releaseYear}
                    </div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-label">Country:</div>
                    <div className="modal-value">
                      {selectedMovie.country || '-'}
                    </div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-label">Genres:</div>
                    <div className="modal-value">
                      {getGenres(selectedMovie)}
                    </div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-label">Director:</div>
                    <div className="modal-value">
                      {selectedMovie.director || '-'}
                    </div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-label">Cast:</div>
                    <div className="modal-value">
                      {selectedMovie.cast || '-'}
                    </div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-label">Description:</div>
                    <div className="modal-value">
                      {selectedMovie.description || '-'}
                    </div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-label">Type:</div>
                    <div className="modal-value">{selectedMovie.type}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => handleEditMovie(selectedMovie)}
                className="modal-button edit-button"
              >
                <i className="fas fa-edit"></i> Edit
              </button>
              <button
                onClick={() => handleDeleteMovie(selectedMovie)}
                className="modal-button delete-button"
              >
                <i className="fas fa-trash-alt"></i> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Movie Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingMovie ? 'Edit Movie' : 'Add New Movie'}</h2>
              <button
                className="close-button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setIsAddingMovie(false);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {editingMovie ? (
                <EditMovieForm
                  movie={editingMovie}
                  onSuccess={() => {
                    setIsEditModalOpen(false);
                    loadMovies();
                  }}
                  onCancel={() => {
                    setIsEditModalOpen(false);
                    setIsAddingMovie(false);
                  }}
                />
              ) : (
                <NewMovieForm
                  onSuccess={() => {
                    setIsEditModalOpen(false);
                    setIsAddingMovie(false);
                    loadMovies();
                  }}
                  onCancel={() => {
                    setIsEditModalOpen(false);
                    setIsAddingMovie(false);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Genre Filter Modal */}
      {isGenreFilterOpen && (
        <div className="modal-overlay">
          <div className="modal-content genre-filter-modal">
            <div className="modal-header">
              <h2>Filter by Genres</h2>
              <button
                className="close-button"
                onClick={() => setIsGenreFilterOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="genre-grid">
                {allGenres.map((genre) => (
                  <label key={genre} className="genre-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre)}
                      onChange={() => handleGenreSelect(genre)}
                    />
                    {genre}
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-button apply-button"
                onClick={() => setIsGenreFilterOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmMovie && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirm-modal">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button
                className="close-button"
                onClick={() => setDeleteConfirmMovie(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete "{deleteConfirmMovie.title}"?
              </p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="modal-button cancel-button"
                onClick={() => setDeleteConfirmMovie(null)}
              >
                Cancel
              </button>
              <button
                className="modal-button delete-button"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
