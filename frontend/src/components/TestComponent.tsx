import { useEffect, useState } from "react";
import { fetchMovies } from "../api/MovieAPI";
import { Movie } from "../types/Movie";

function MovieComponent() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMovies = async () => {
            try {
                const data = await fetchMovies();
                setMovies(data);
            } catch (err) {
                setError((err as Error).message);
            }
        };

        loadMovies();
    }, []);

    if (error) {
        return <p className="text-red-500">Error: {error}</p>;
    }

    return (
        <div className="p-6">
            <h3 className="text-2xl font-bold mb-4">Movies</h3>
            <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 border">ID</th>
                        <th className="px-4 py-2 border">Name</th>
                    </tr>
                </thead>
                <tbody>
                    {movies.map((item) => (
                        <tr key={item.show_id}>
                            <td className="px-4 py-2 border text-center">{item.show_id}</td>
                            <td className="px-4 py-2 border">{item.title}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default MovieComponent;
