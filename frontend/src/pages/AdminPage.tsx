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
                setTotalPages(Math.ceil(data.totalNumMovies / pageSize));
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        loadMovies();
    }, [pageSize, pageNum]);

    const handleDelete = async (showId: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this project?");
        if (!confirmDelete) return;

        try {
            await deleteMovie(showId);
            setMovies(movies.filter((m) => m.showId !== showId));
        } catch (error) {
            alert("Failed to delete project. Please try again.");
        }
    };

    if (loading) return <p>Loading projects...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div>
            <h1>Admin Projects</h1>

            {!showForm && (
                <button
                    className="btn btn-success mb-3"
                    onClick={() => setShowForm(true)}
                >
                    Add Project
                </button>
            )}

            {showForm && (
                <NewMovieForm
                    onSuccess={() => {
                        setShowForm(false);
                        fetchMovies(pageSize, pageNum, []).then((data) =>
                            setMovies(data.movies)
                        );
                    }}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {editingMovie && (
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
            )}

            <table className="table table-border table-striped">
                <thead className="table-dark">
                    <tr>
                        <th>Show ID</th>
                        <th>Type</th>
                        <th>Title</th>
                        <th>Director</th>
                        <th>Cast</th>
                        <th>Country</th>
                        <th>Release Year</th>
                        <th>Rating</th>
                        <th>Duration</th>
                        <th>Description</th>
                        <th>Genre</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {movies.map((movie) => (
                        <tr key={movie.showId}>
                            <td>{movie.showId}</td>
                            <td>{movie.type}</td>
                            <td>{movie.title}</td>
                            <td>{movie.director}</td>
                            <td>{movie.cast}</td>
                            <td>{movie.country}</td>
                            <td>{movie.releaseYear}</td>
                            <td>{movie.rating}</td>
                            <td>{movie.duration}</td>
                            <td>{movie.description}</td>
                            <td>{getGenres(movie)}</td>
                            <td>
                                <button
                                    className="btn btn-primary btn-sm w-100 mb-1"
                                    onClick={() => setEditingMovie(movie)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-danger btn-sm w-100"
                                    onClick={() => handleDelete(movie.showId)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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
    );
};

export default AdminProjectsPage;