import { useState } from "react";
import { Movie } from "../types/Movie";
import { updateMovie } from "../api/MovieAPI";

interface EditMovieFormProps {
    movie: Movie;
    onSuccess: () => void;
    onCancel: () => void;
}

const EditMovieForm = ({
    movie,
    onSuccess,
    onCancel,
}: EditMovieFormProps) => {
    const [formData, setFormData] = useState<Movie>({...movie});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData, 
            [name]: type === 'number' ? parseInt(value) : value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateMovie(formData.showId, formData);
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Edit Movie</h2>
            <label>Show ID:<input type="text" name="showId" value={formData.showId} onChange={handleChange} readOnly /></label>
            <label>Type:<input type="text" name="type" value={formData.type} onChange={handleChange} /></label>
            <label>Title:<input type="text" name="title" value={formData.title} onChange={handleChange} /></label>
            <label>Director:<input type="text" name="director" value={formData.director || ""} onChange={handleChange} /></label>
            <label>Cast:<input type="text" name="cast" value={formData.cast || ""} onChange={handleChange} /></label>
            <label>Country:<input type="text" name="country" value={formData.country || ""} onChange={handleChange} /></label>
            <label>Release Year:<input type="number" name="releaseYear" value={formData.releaseYear} onChange={handleChange} /></label>
            <label>Rating:<input type="text" name="rating" value={formData.rating || ""} onChange={handleChange} /></label>
            <label>Duration:<input type="text" name="duration" value={formData.duration || ""} onChange={handleChange} /></label>
            <label>Description:<input type="text" name="description" value={formData.description || ""} onChange={handleChange} /></label>
            <label>Action:<input type="number" name="action" value={formData["action"]} onChange={handleChange} /></label>
            <label>Adventure:<input type="number" name="adventure" value={formData["adventure"]} onChange={handleChange} /></label>
            <label>Anime Series International TV Shows:<input type="number" name="animeSeriesInternationalTVShows" value={formData["animeSeriesInternationalTVShows"]} onChange={handleChange} /></label>
            <label>British TV Shows Docuseries International TV Shows:<input type="number" name="britishTVShowsDocuseriesInternationalTVShows" value={formData["britishTVShowsDocuseriesInternationalTVShows"]} onChange={handleChange} /></label>
            <label>Children:<input type="number" name="children" value={formData["children"]} onChange={handleChange} /></label>
            <label>Comedies:<input type="number" name="comedies" value={formData["comedies"]} onChange={handleChange} /></label>
            <label>Comedies Dramas International Movies:<input type="number" name="comediesDramasInternationalMovies" value={formData["comediesDramasInternationalMovies"]} onChange={handleChange} /></label>
            <label>Comedies International Movies:<input type="number" name="comediesInternationalMovies" value={formData["comediesInternationalMovies"]} onChange={handleChange} /></label>
            <label>Comedies Romantic Movies:<input type="number" name="comediesRomanticMovies" value={formData["comediesRomanticMovies"]} onChange={handleChange} /></label>
            <label>Crime TV Shows Docuseries:<input type="number" name="crimeTVShowsDocuseries" value={formData["crimeTVShowsDocuseries"]} onChange={handleChange} /></label>
            <label>Documentaries:<input type="number" name="documentaries" value={formData["documentaries"]} onChange={handleChange} /></label>
            <label>Documentaries International Movies:<input type="number" name="documentariesInternationalMovies" value={formData["documentariesInternationalMovies"]} onChange={handleChange} /></label>
            <label>Docuseries:<input type="number" name="docuseries" value={formData["docuseries"]} onChange={handleChange} /></label>
            <label>Dramas:<input type="number" name="dramas" value={formData["dramas"]} onChange={handleChange} /></label>
            <label>Dramas International Movies:<input type="number" name="dramasInternationalMovies" value={formData["dramasInternationalMovies"]} onChange={handleChange} /></label>
            <label>Dramas Romantic Movies:<input type="number" name="dramasRomanticMovies" value={formData["dramasRomanticMovies"]} onChange={handleChange} /></label>
            <label>Family Movies:<input type="number" name="familyMovies" value={formData["familyMovies"]} onChange={handleChange} /></label>
            <label>Fantasy:<input type="number" name="fantasy" value={formData["fantasy"]} onChange={handleChange} /></label>
            <label>Horror Movies:<input type="number" name="horrorMovies" value={formData["horrorMovies"]} onChange={handleChange} /></label>
            <label>International Movies Thrillers:<input type="number" name="internationalMoviesThrillers" value={formData["internationalMoviesThrillers"]} onChange={handleChange} /></label>
            <label>International TV Shows Romantic TV Shows TV Dramas:<input type="number" name="internationalTVShowsRomanticTVShowsTVDramas" value={formData["internationalTVShowsRomanticTVShowsTVDramas"]} onChange={handleChange} /></label>
            <label>Kids TV:<input type="number" name="kidsTV" value={formData["kidsTV"]} onChange={handleChange} /></label>
            <label>Language TV Shows:<input type="number" name="languageTVShows" value={formData["languageTVShows"]} onChange={handleChange} /></label>
            <label>Musicals:<input type="number" name="musicals" value={formData["musicals"]} onChange={handleChange} /></label>
            <label>Nature TV:<input type="number" name="natureTV" value={formData["natureTV"]} onChange={handleChange} /></label>
            <label>Reality TV:<input type="number" name="realityTV" value={formData["realityTV"]} onChange={handleChange} /></label>
            <label>Spirituality:<input type="number" name="spirituality" value={formData["spirituality"]} onChange={handleChange} /></label>
            <label>TV Action:<input type="number" name="tVAction" value={formData["tVAction"]} onChange={handleChange} /></label>
            <label>TV Comedies:<input type="number" name="tVComedies" value={formData["tVComedies"]} onChange={handleChange} /></label>
            <label>TV Dramas:<input type="number" name="tVDramas" value={formData["tVDramas"]} onChange={handleChange} /></label>
            <label>Talk Shows TV Comedies:<input type="number" name="talkShowsTVComedies" value={formData["talkShowsTVComedies"]} onChange={handleChange} /></label>
            <label>Thrillers:<input type="number" name="thrillers" value={formData["thrillers"]} onChange={handleChange} /></label>
            <button type="submit" className="btn btn-primary">Update Movie</button>
            <button type="button" onClick={onCancel}>Cancel</button>
        </form>
    );
};      
export default EditMovieForm;