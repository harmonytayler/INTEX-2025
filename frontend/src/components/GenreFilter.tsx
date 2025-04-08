import React from 'react';

// Map of display names to exact C# property names
const genrePropertyMap: Record<string, string> = {
    "Action": "Action",
    "Adventure": "Adventure",
    "Anime Series International TV Shows": "AnimeSeriesInternationalTVShows",
    "British TV Shows Docuseries International TV Shows": "BritishTVShowsDocuseriesInternationalTVShows",
    "Children": "Children",
    "Comedies": "Comedies",
    "Comedies Dramas International Movies": "ComediesDramasInternationalMovies",
    "Comedies International Movies": "ComediesInternationalMovies",
    "Comedies Romantic Movies": "ComediesRomanticMovies",
    "Crime TV Shows Docuseries": "CrimeTVShowsDocuseries",
    "Documentaries": "Documentaries",
    "Documentaries International Movies": "DocumentariesInternationalMovies",
    "Docuseries": "Docuseries",
    "Dramas": "Dramas",
    "Dramas International Movies": "DramasInternationalMovies",
    "Dramas Romantic Movies": "DramasRomanticMovies",
    "Family Movies": "FamilyMovies",
    "Fantasy": "Fantasy",
    "Horror Movies": "HorrorMovies",
    "International Movies Thrillers": "InternationalMoviesThrillers",
    "International TV Shows Romantic TV Shows TV Dramas": "InternationalTVShowsRomanticTVShowsTVDramas",
    "Kids TV": "KidsTV",
    "Language TV Shows": "LanguageTVShows",
    "Musicals": "Musicals",
    "Nature TV": "NatureTV",
    "Reality TV": "RealityTV",
    "Spirituality": "Spirituality",
    "TV Action": "TVAction",
    "TV Comedies": "TVComedies",
    "TV Dramas": "TVDramas",
    "Talk Shows TV Comedies": "TalkShowsTVComedies",
    "Thrillers": "Thrillers"
};

// Display names for the UI
const genreKeys = Object.keys(genrePropertyMap);

interface GenreFilterProps {
    selectedGenres: string[];
    onGenreChange: (genres: string[]) => void;
}

const GenreFilter: React.FC<GenreFilterProps> = ({ selectedGenres, onGenreChange }) => {
    const handleGenreToggle = (genre: string) => {
        const propertyName = genrePropertyMap[genre];
        if (selectedGenres.includes(propertyName)) {
            onGenreChange(selectedGenres.filter(g => g !== propertyName));
        } else {
            onGenreChange([...selectedGenres, propertyName]);
        }
    };

    return (
        <div className="genre-filter p-4 bg-gray-50 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Filter by Genre</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {genreKeys.map((genre) => (
                    <div key={genre} className="flex items-center">
                        <input
                            type="checkbox"
                            id={`genre-${genrePropertyMap[genre]}`}
                            checked={selectedGenres.includes(genrePropertyMap[genre])}
                            onChange={() => handleGenreToggle(genre)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                            htmlFor={`genre-${genrePropertyMap[genre]}`}
                            className="ml-2 text-sm text-gray-700"
                        >
                            {genre}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GenreFilter; 