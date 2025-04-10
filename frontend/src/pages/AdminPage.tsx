import React, { useState, useEffect } from 'react';
import { Movie } from '../types/Movie';
import { fetchMovies, deleteMovie } from '../api/MovieAPI';
import './AdminPage.css';
import Pagination from '../components/Pagination';
import StarRating from '../components/StarRating';
import EditMovieForm from '../components/EditMovieForm';
import NewMovieForm from '../components/NewMovieForm';

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
  const [deleteConfirmMovie, setDeleteConfirmMovie] = useState<Movie | null>(
    null
  );

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

  useEffect(() => {
    fetchAllMovies();
  }, [
    currentPage,
    searchTerm,
    sortField,
    sortOrder,
    selectedGenres,
    itemsPerPage,
  ]);

  const fetchAllMovies = async () => {
    try {
      setLoading(true);
      // Fetch all movies with a large page size to get the complete dataset
      const response = await fetchMovies(
        10000, // Fetch all movies (increased from 1000 to accommodate all ~5000+ movies)
        1, // Start from page 1
        [], // No genre filter initially
        '' // No search term initially
      );

      let allMovies = [...response.movies];

      // Apply genre filter if selected
      if (selectedGenres.length > 0) {
        allMovies = allMovies.filter((movie) =>
          selectedGenres.some(
            (genre) => movie[genre.toLowerCase() as keyof Movie] === 1
          )
        );
      }

      // Apply search filter if there's a search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        allMovies = allMovies.filter(
          (movie) =>
            movie.title.toLowerCase().includes(searchLower) ||
            (movie.director &&
              movie.director.toLowerCase().includes(searchLower)) ||
            (movie.cast &&
              Array.isArray(movie.cast) &&
              movie.cast.some((actor: string) =>
                actor.toLowerCase().includes(searchLower)
              )) ||
            (movie.description &&
              movie.description.toLowerCase().includes(searchLower))
        );
      }

      // Sort movies based on the current sort field and order
      allMovies.sort((a, b) => {
        let compareA = a[sortField as keyof Movie];
        let compareB = b[sortField as keyof Movie];

        // Handle null/undefined values
        if (compareA === null || compareA === undefined) compareA = '';
        if (compareB === null || compareB === undefined) compareB = '';

        // Convert to strings for comparison
        const strA = String(compareA).toLowerCase();
        const strB = String(compareB).toLowerCase();

        if (sortOrder === 'asc') {
          return strA.localeCompare(strB);
        } else {
          return strB.localeCompare(strA);
        }
      });

      // Update total results based on filtered dataset
      setTotalResults(allMovies.length);

      // Apply pagination to the filtered and sorted dataset
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedMovies = allMovies.slice(startIndex, endIndex);

      // Update state with paginated results
      setMovies(paginatedMovies);
      setTotalPages(Math.ceil(allMovies.length / itemsPerPage));
      setError(null);
    } catch (err) {
      setError('Failed to fetch movies. Please try again later.');
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAllMovies();
  };

  const handleAddMovie = () => {
    setIsAddingMovie(true);
    setEditingMovie(null);
    setIsEditModalOpen(true);
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
        fetchAllMovies();
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

  const formatRating = (rating: number | null | undefined): string => {
    if (rating === null || rating === undefined) return '-';
    return `${rating.toFixed(1)} / 5`;
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

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading movies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">MANAGE CONTENT</h1>
      <br />
      <div className="admin-actions">
        <form onSubmit={handleSearch} className="search-form">
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
                    fetchAllMovies();
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
                    fetchAllMovies();
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
