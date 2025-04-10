import { useEffect, useState } from "react";
import { Movie } from "../types/Movie";
import { deleteMovie, fetchMovies } from "../api/MovieAPI";
import Pagination from "../components/Pagination";
import NewMovieForm from "../components/NewMovieForm";
import EditProjectForm from "../components/EditMovieForm.tsx";

// List of all genre keys in the Movie interface
const genreKeys: (keyof Movie)[] = [
    "action",
    "adventure",
    "animeSeriesInternationalTVShows",
    "britishTVShowsDocuseriesInternationalTVShows",
    "children",
    "comedies",
    "comediesDramasInternationalMovies",
    "comediesInternationalMovies",
    "comediesRomanticMovies",
    "crimeTVShowsDocuseries",
    "documentaries",
    "documentariesInternationalMovies",
    "docuseries",
    "dramas",
    "dramasInternationalMovies",
    "dramasRomanticMovies",
    "familyMovies",
    "fantasy",
    "horrorMovies",
    "internationalMoviesThrillers",
    "internationalTVShowsRomanticTVShowsTVDramas",
    "kidsTV",
    "languageTVShows",
    "musicals",
    "natureTV",
    "realityTV",
    "spirituality",
    "tVAction",
    "tVComedies",
    "tVDramas",
    "talkShowsTVComedies",
    "thrillers"
];

// Helper function that detects which genre property equals 1 and returns them as a comma-separated string
const getGenres = (movie: Movie): string => {
    return genreKeys.filter((key) => movie[key] === 1).join(", ");
};

const AdminProjectsPage = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [pageSize, setPageSize] = useState<number>(10);
    const [pageNum, setPageNum] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState(false);
    const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

    useEffect(() => {
        const loadMovies = async () => {
            try {
                const data = await fetchMovies(pageSize, pageNum, []);
                setMovies(data.movies);
                setTotalPages(Math.ceil(data.total / pageSize));
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        loadMovies();
    }, [pageSize, pageNum]);

    const handleDelete = async (showId: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this movie?");
        if (!confirmDelete) return;

        try {
            await deleteMovie(showId);
            setMovies(movies.filter((m) => m.showId !== showId));
        } catch (error) {
            alert("Failed to delete movie. Please try again.");
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
    if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"><strong className="font-bold">Error:</strong> <span className="block sm:inline">{error}</span></div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Movie Management</h1>
                {!showForm && (
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-md transition duration-300 ease-in-out"
                        onClick={() => setShowForm(true)}
                    >
                        <i className="fas fa-plus mr-2"></i>Add New Movie
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <NewMovieForm
                        onSuccess={() => {
                            setShowForm(false);
                            fetchMovies(pageSize, pageNum, []).then((data) =>
                                setMovies(data.movies)
                            );
                        }}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            {editingMovie && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <EditProjectForm
                        movie={editingMovie}
                        onSuccess={() => {
                            setEditingMovie(null);
                            fetchMovies(pageSize, pageNum, []).then((data) =>
                                setMovies(data.movies)
                            );
                        }}
                        onCancel={() => setEditingMovie(null)}
                    />
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto bg-white">
                    <table className="min-w-full divide-y divide-gray-200 bg-white">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Show ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Director</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Release Year</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Genre</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {movies.map((movie, index) => (
                                <tr 
                                    key={movie.showId} 
                                    className={`${
                                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    } hover:bg-gray-100 transition-colors duration-150`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{movie.showId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movie.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movie.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movie.director || "-"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movie.releaseYear}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movie.rating || "-"}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="max-w-xs truncate" title={getGenres(movie)}>
                                            {getGenres(movie)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                                            onClick={() => setEditingMovie(movie)}
                                        >
                                            <i className="fas fa-edit"></i> Edit
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-900 transition-colors duration-200 ml-2"
                                            onClick={() => handleDelete(movie.showId)}
                                        >
                                            <i className="fas fa-trash"></i> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-6">
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
            </div>
        </div>
    );
};

export default AdminProjectsPage;
