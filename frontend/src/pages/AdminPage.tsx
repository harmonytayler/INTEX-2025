import React, { useState, useEffect } from 'react';
import { Movie, EssentialMovie } from '../types/Movie';
import { fetchMovies, deleteMovie, fetchMovieById, fetchAdminMovies } from '../api/MovieAPI';
import './AdminPage.css';
import Pagination from '../components/Pagination';
import EditMovieForm from '../components/EditMovieForm';
import NewMovieForm from '../components/NewMovieForm';
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { GENRE_MAPPING, AVAILABLE_GENRES } from '../constants/genres';

const AdminPage: React.FC = () => {
  const [movies, setMovies] = useState<EssentialMovie[]>([]);
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
  const [appliedGenres, setAppliedGenres] = useState<string[]>([]);
  const [deleteConfirmMovie, setDeleteConfirmMovie] = useState<EssentialMovie | null>(null);
  const [searchInput, setSearchInput] = useState('');

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
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    const loadMovies = async () => {
      try {
        setLoading(true);
        const response = await fetchAdminMovies(
          currentPage,
          itemsPerPage,
          searchTerm,
          appliedGenres,
          sortField,
          sortOrder
        );

        // Convert to EssentialMovie type for the table view
        const essentialMovies: EssentialMovie[] = response.movies.map(movie => ({
          showId: movie.showId,
          title: movie.title,
          averageStarRating: movie.averageStarRating,
          duration: movie.duration,
          releaseYear: movie.releaseYear,
          country: movie.country,
          director: movie.director,
          // Include all genre fields as they're needed for filtering
          ...Object.keys(GENRE_MAPPING).reduce((acc, genre) => {
            acc[GENRE_MAPPING[genre]] = movie[GENRE_MAPPING[genre]];
            return acc;
          }, {} as Record<string, any>)
        }));

        setMovies(essentialMovies);
        setTotalResults(response.total);
        setTotalPages(response.totalPages);
        setError(null);
      } catch (err) {
        console.error('Error loading movies:', err);
        setError('Failed to fetch movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [isAdmin, navigate, currentPage, itemsPerPage, sortField, sortOrder, appliedGenres, searchTerm]);

  const handleGenreFilter = () => {
    setIsGenreFilterOpen(true);
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenres((prev) => {
      const newGenres = prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre];
      return newGenres;
    });
  };

  const clearGenres = () => {
    setSelectedGenres([]);
  };

  const applyGenreFilters = () => {
    setAppliedGenres(selectedGenres);
    setCurrentPage(1);
    setIsGenreFilterOpen(false);
  };

  const handleEditMovie = async (movie: EssentialMovie) => {
    try {
      setLoading(true);
      const fullMovieDetails = await fetchMovieById(movie.showId);
      setEditingMovie(fullMovieDetails);
      setIsEditModalOpen(true);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error loading movie details:', err);
      setError('Failed to load movie details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMovie = (movie: EssentialMovie) => {
    setDeleteConfirmMovie(movie);
  };

  const confirmDelete = async () => {
    if (deleteConfirmMovie) {
      try {
        await deleteMovie(deleteConfirmMovie.showId);
        applyGenreFilters();
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

  const handleViewMovie = async (movie: EssentialMovie) => {
    try {
      setLoading(true);
      const fullMovieDetails = await fetchMovieById(movie.showId);
      setSelectedMovie(fullMovieDetails);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error loading movie details:', err);
      setError('Failed to load movie details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  const formatDuration = (duration: string | null | undefined): string => {
    if (!duration) return '-';
    return duration;
  };

  const getGenres = (movie: EssentialMovie): string => {
    const genres = AVAILABLE_GENRES.filter(
      (genre) => movie[GENRE_MAPPING[genre] as keyof EssentialMovie] === 1
    );
    return genres.join(', ') || '-';
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // If search input is empty, set searchTerm to empty string to show all movies
      setSearchTerm(searchInput.trim());
      setCurrentPage(1); // Reset to first page when searching
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    setCurrentPage(1); // Reset to first page when searching
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
        <button onClick={applyGenreFilters} className="retry-button">
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
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            placeholder="Search movies..."
            className="search-input"
            value={searchInput}
            onChange={handleSearchInput}
            onKeyDown={handleSearch}
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
                    applyGenreFilters();
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
                    applyGenreFilters();
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
                {AVAILABLE_GENRES.map((genre) => (
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
                className="modal-button clear-button"
                onClick={clearGenres}
                disabled={selectedGenres.length === 0}
              >
                Clear Filters
              </button>
              <button
                className="modal-button apply-button"
                onClick={applyGenreFilters}
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
