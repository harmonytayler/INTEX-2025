import { useEffect, useState } from "react";
import { Movie } from "../types/Movie";
// import { useNavigate } from "react-router-dom";
import { fetchMovies } from "../api/MovieAPI";
import Pagination from "./Pagination";

function MovieList({selectedCategories}: {selectedCategories: string[]}) {

    const[movies, setMovies] = useState<Movie[]>([]);
    const[pageSize, setPageSize] = useState<number>(10);
    const[pageNum, setPageNum] = useState<number>(1);
    const[totalPages, setTotalPages] = useState<number>(0);
    // const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    
    useEffect(() => {
        const loadProjects = async () => {
            try {
                setLoading(true);
                const data = await fetchMovies(pageSize, pageNum, selectedCategories);
                setMovies(data.movies); 
                setTotalPages(Math.ceil(data.totalNumMovies  / pageSize));
            } catch (error) {
                setError((error as Error).message);
            } finally {
                setLoading(false);
            }
        };

        loadProjects();
    }, [pageSize, pageNum, selectedCategories]);

    if (loading) return <p>Loading projects...</p>;
    if (error) return <p className="test-red-500">Error: {error}</p>;

    return (
        <>
            <br />
            {movies.map((m) => (
                <div id='movieCard' className='card'>
                    <h3 className='card-title'>{m.title}</h3>
                    <div className='card-body'>
                        <ul className="list-unstyled">
                            <li>
                                <strong>Type: </strong>
                                {m.type}
                            </li>
                            <li>
                                <strong>Director: </strong>
                                {m.director} Individuals Served
                            </li>
                        </ul>                      
                    </div>
                </div>
            ))}
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
        </>
    );
}

export default MovieList