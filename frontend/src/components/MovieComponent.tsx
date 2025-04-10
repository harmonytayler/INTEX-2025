import { useEffect, useState } from "react";
import { Movie } from "../types/Movie";
import { fetchMovies } from "../api/MovieAPI";
import Pagination from "./Pagination";
import GenreFilter from "./GenreFilter";

function MovieList({selectedCategories}: {selectedCategories: string[]}) {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [pageSize, setPageSize] = useState<number>(10);
    const [pageNum, setPageNum] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [activeSearchTerm, setActiveSearchTerm] = useState<string>("");
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    
    // Function to handle search button click
    const handleSearch = () => {
        setActiveSearchTerm(searchTerm);
        setPageNum(1); // Reset to first page when searching
    };

    // Function to handle Enter key press in search input
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Function to handle genre filter changes
    const handleGenreChange = (genres: string[]) => {
        setSelectedGenres(genres);
        setPageNum(1); // Reset to first page when changing filters
    };

    useEffect(() => {
        const loadMovies = async () => {
            try {
                setLoading(true);
                setError(null);
                
                console.log("Fetching movies...");
                const data = await fetchMovies(pageSize, pageNum, selectedCategories, activeSearchTerm, selectedGenres);
                console.log("Response data:", data);
                
                // Check if movies is an array before setting state
                if (data && Array.isArray(data.movies)) {
                    setMovies(data.movies);
                    setTotalPages(Math.ceil((data.total || 0) / pageSize));
                } else {
                    console.warn("Unexpected data format:", data);
                    setMovies([]);
                    setTotalPages(0);
                }
            } catch (error) {
                console.error("Error loading movies:", error);
                setError((error as Error).message);
                setMovies([]);
            } finally {
                setLoading(false);
            }
        };

        loadMovies();
    }, [pageSize, pageNum, selectedCategories, activeSearchTerm, selectedGenres]);

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Genre Filter Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
                <GenreFilter 
                    selectedGenres={selectedGenres}
                    onGenreChange={handleGenreChange}
                />
            </div>

            {/* Main Content */}
            <div className="flex-grow">
                <div className="movie-list">
                    <div className="mb-4 flex">
                        <input
                            type="text"
                            className="flex-grow p-2 border rounded-l-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search movies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button 
                            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={handleSearch}
                        >
                            Search
                        </button>
                    </div>

                    {/* Display loading state */}
                    {loading && <p>Loading movies...</p>}
                    
                    {/* Display error if any */}
                    {error && <p className="text-danger">Error: {error}</p>}
                    
                    {/* Display message if no movies found */}
                    {!loading && !error && (!movies || movies.length === 0) && (
                        <p className="text-gray-600 mb-4">No movies found. Try adjusting your search or filters.</p>
                    )}

                    {/* Display movies count and list if there are results */}
                    {!loading && !error && movies && movies.length > 0 && (
                        <>
                            <h3>Movies Found: {movies.length}</h3>
                            <div className="row">
                                {movies.map((movie, index) => (
                                    <div key={movie.showId|| `movie-${index}`} className="col-md-6 mb-3">
                                        <div className="card">
                                            <div className="card-body">
                                                <h5 className="card-title">{movie.title || 'Unknown Title'}</h5>
                                                <p className="card-text">Type: {movie.type || 'Unknown'}</p>
                                                {/* Only include the most essential information */}
                                                {movie.director && <p className="card-text">Director: {movie.director}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    
                    {/* Always show pagination if there are any pages */}
                    {totalPages > 0 && (
                        <Pagination
                            currentPage={pageNum}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            onPageChange={setPageNum}
                            onPageSizeChange={(newSize) => {
                                setPageSize(newSize);
                                setPageNum(1);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default MovieList;