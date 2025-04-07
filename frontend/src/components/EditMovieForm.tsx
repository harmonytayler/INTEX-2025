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
        setFormData({...formData, [e.target.name] :e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateMovie(formData.show_id, formData);
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add New Movie</h2>
            <label>Show ID:<input type="number" name="show_id" value={formData.show_id} onChange={handleChange} /></label>
            <label>Type:<input type="text" name="type" value={formData.type} onChange={handleChange} /></label>
            <label>Title:<input type="text" name="title" value={formData.title} onChange={handleChange} /></label>
            <label>Director:<input type="text" name="director" value={formData.director} onChange={handleChange} /></label>
            <label>Cast:<input type="text" name="cast" value={formData.cast} onChange={handleChange} /></label>
            <label>Country:<input type="text" name="country" value={formData.country} onChange={handleChange} /></label>
            <label>Release Year:<input type="number" name="release_year" value={formData.release_year} onChange={handleChange} /></label>
            <label>Rating:<input type="text" name="rating" value={formData.rating} onChange={handleChange} /></label>
            <label>Duration:<input type="text" name="duration" value={formData.duration} onChange={handleChange} /></label>
            <label>Description:<input type="text" name="description" value={formData.description} onChange={handleChange} /></label>
            <label>Action:<input type="number" name="action" value={formData.action} onChange={handleChange} /></label>
            <label>Adventure:<input type="number" name="adventure" value={formData.adventure} onChange={handleChange} /></label>
            <label>Anime Series International TV Shows:<input type="number" name="anime_Series_International_TV_Shows" value={formData.anime_Series_International_TV_Shows} onChange={handleChange} /></label>
            <label>British TV Shows Docuseries International TV Shows:<input type="number" name="british_TV_Shows_Docuseries_International_TV_Shows" value={formData.british_TV_Shows_Docuseries_International_TV_Shows} onChange={handleChange} /></label>
            <label>Children:<input type="number" name="children" value={formData.children} onChange={handleChange} /></label>
            <label>Comedies:<input type="number" name="comedies" value={formData.comedies} onChange={handleChange} /></label>
            <label>Comedies Dramas International Movies:<input type="number" name="comedies_Dramas_International_Movies" value={formData.comedies_Dramas_International_Movies} onChange={handleChange} /></label>
            <label>Comedies International Movies:<input type="number" name="comedies_International_Movies" value={formData.comedies_International_Movies} onChange={handleChange} /></label>
            <label>Comedies Romantic Movies:<input type="number" name="comedies_Romatic_Movies" value={formData.comedies_Romatic_Movies} onChange={handleChange} /></label>
            <label>Crime TV Shows Docuseries:<input type="number" name="crime_TV_Shows_Docuseries" value={formData.crime_TV_Shows_Docuseries} onChange={handleChange} /></label>
            <label>Documentaries:<input type="number" name="documentaries" value={formData.documentaries} onChange={handleChange} /></label>
            <label>Documentaries International Movies:<input type="number" name="documentaries_International_Movies" value={formData.documentaries_International_Movies} onChange={handleChange} /></label>
            <label>Docuseries:<input type="number" name="docuseries" value={formData.docuseries} onChange={handleChange} /></label>
            <label>Dramas:<input type="number" name="dramas" value={formData.dramas} onChange={handleChange} /></label>
            <label>Dramas International Movies:<input type="number" name="dramas_International_Movies" value={formData.dramas_International_Movies} onChange={handleChange} /></label>
            <label>Dramas Romantic Movies:<input type="number" name="dramas_Romantic_Movies" value={formData.dramas_Romantic_Movies} onChange={handleChange} /></label>
            <label>Family Movies:<input type="number" name="family_Movies" value={formData.family_Movies} onChange={handleChange} /></label>
            <label>Fantasy:<input type="number" name="fantasy" value={formData.fantasy} onChange={handleChange} /></label>
            <label>Horror Movies:<input type="number" name="horror_Movies" value={formData.horror_Movies} onChange={handleChange} /></label>
            <label>International Movies Thrillers:<input type="number" name="international_Movies_Thrillers" value={formData.international_Movies_Thrillers} onChange={handleChange} /></label>
            <label>International TV Shows Romantic TV Shows TV Dramas:<input type="number" name="international_TV_Shows_Romantic_TV_Shows_TV_Dramas" value={formData.international_TV_Shows_Romantic_TV_Shows_TV_Dramas} onChange={handleChange} /></label>
            <label>Kids' TV:<input type="number" name="kids_TV" value={formData.kids_TV} onChange={handleChange} /></label>
            <label>Language TV Shows:<input type="number" name="language_TV_Shows" value={formData.language_TV_Shows} onChange={handleChange} /></label>
            <label>Musicals:<input type="number" name="musicals" value={formData.musicals} onChange={handleChange} /></label>
            <label>Nature TV:<input type="number" name="nature_TV" value={formData.nature_TV} onChange={handleChange} /></label>
            <label>Reality TV:<input type="number" name="reality_TV" value={formData.reality_TV} onChange={handleChange} /></label>
            <label>Spirituality:<input type="number" name="spirituality" value={formData.spirituality} onChange={handleChange} /></label>
            <label>TV Action:<input type="number" name="tv_Action" value={formData.tv_Action} onChange={handleChange} /></label>
            <label>TV Comedies:<input type="number" name="tv_Comedies" value={formData.tv_Comedies} onChange={handleChange} /></label>
            <label>TV Dramas:<input type="number" name="tv_Dramas" value={formData.tv_Dramas} onChange={handleChange} /></label>
            <label>Talk Shows TV Comedies:<input type="number" name="talk_Shows_TV_Comedies" value={formData.talk_Shows_TV_Comedies} onChange={handleChange} /></label>
            <label>Thrillers:<input type="number" name="thrillers" value={formData.thrillers} onChange={handleChange} /></label>
            <button type="submit" className="btn btn-primary">Add Movie</button>
            <button type="button" onClick={onCancel}>Cancel</button>
        </form>
    );
};      
export default EditMovieForm;