using INTEX.API.Data;
using INTEX.API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;


namespace INTEX.API.Controllers
{
[Route("[controller]")]
[ApiController]
[Authorize] // Controller requires authentication
public class MovieController : ControllerBase
{
    private MovieDbContext _movieContext;

    // SAS Token (replace with your actual SAS token)
    private readonly string _sasToken;
    private readonly string containerName = "images";

    public MovieController(MovieDbContext movieContext, IConfiguration config)
    {
        _movieContext = movieContext;
        _sasToken = config["Azure:BlobSasToken"];
    }

    [HttpGet("PosterUrl/{showId}")]
    public async Task<IActionResult> GetPosterUrl(string showId)
    {
        // Step 1: Look up the movie title from the showId
        var ShowId = showId;
        var movie = await _movieContext.movies_titles.FindAsync(ShowId); // Assuming the ShowId is unique in the movies_titles table
        if (movie == null)
        {
            return NotFound(new { message = "Movie not found" });
        }

        // Step 2: Use the movie title to build the URL for the poster
        string title = movie.Title;

        // Step 3: Remove special characters that do not need to be encoded (e.g., & and :)
        string sanitizedTitle = RemoveUnwantedCharacters(title);

        // Construct the URL for the image with the SAS token
        string blobUrl = $"https://intexmovieposters.blob.core.windows.net/{containerName}/{sanitizedTitle}.jpg?{_sasToken}";

        return Ok(blobUrl);
    }

    // Helper method to remove unwanted characters (like &, :, etc.)
    private string RemoveUnwantedCharacters(string input)
    {
        // Define the unwanted characters that should be removed
        var unwantedChars = new[] { '&', ':', '?', '=', ';', '#', '%', '.', '$' };

        // Remove unwanted characters from the title string
        foreach (var ch in unwantedChars)
        {
            input = input.Replace(ch.ToString(), string.Empty);
        }

        return input;
    }





        // Removed duplicate method

        private string GenerateNextShowId()
        {
            // Get all existing show IDs
            var existingIds = _movieContext.movies_titles
                .Select(m => m.ShowId)
                .ToList();

            // Find the highest number in existing IDs
            int maxNumber = 0;
            foreach (var id in existingIds)
            {
                if (id.StartsWith("s") && int.TryParse(id.Substring(1), out int number))
                {
                    maxNumber = Math.Max(maxNumber, number);
                }
            }

            // Generate the next ID
            return $"s{maxNumber + 1}";
        }

        [HttpGet("AllMovies")]
        public IActionResult GetItems([FromQuery] int pageSize = 10, [FromQuery] int pageNum = 1, [FromQuery] string? searchTerm = null, [FromQuery] string? genres = null)
        {
            try
            {
                var query = _movieContext.movies_titles.AsQueryable();

                // Apply search filter if searchTerm is provided
                if (!string.IsNullOrWhiteSpace(searchTerm))
                {
                    searchTerm = searchTerm.ToLower();
                    
                    // First try exact match
                    var exactMatches = query.Where(m => m.Title.ToLower().Contains(searchTerm));
                    
                    // If no exact matches, try fuzzy search
                    if (!exactMatches.Any())
                    {
                        // Convert to list for fuzzy search since we can't use FuzzyMatch in LINQ expression trees
                        var allMovies = query.ToList();
                        var fuzzyMatches = allMovies.Where(m => FuzzySearchHelper.FuzzyMatch(m.Title, searchTerm));
                        query = fuzzyMatches.AsQueryable();
                    }
                    else
                    {
                        query = exactMatches;
                    }
                }

                // Apply genre filter if genres are provided
                if (!string.IsNullOrWhiteSpace(genres))
                {
                    var genreList = genres.Split(',').ToList();
                    foreach (var genre in genreList)
                    {
                        Console.WriteLine($"Applying filter for genre: {genre}");
                        
                        // Use switch for exact property matching instead of reflection
                        switch (genre)
                        {
                            case "Action":
                                query = query.Where(m => m.Action == 1);
                                break;
                            case "Adventure":
                                query = query.Where(m => m.Adventure == 1);
                                break;
                            case "AnimeSeriesInternationalTVShows":
                                query = query.Where(m => m.AnimeSeriesInternationalTVShows == 1);
                                break;
                            case "BritishTVShowsDocuseriesInternationalTVShows":
                                query = query.Where(m => m.BritishTVShowsDocuseriesInternationalTVShows == 1);
                                break;
                            case "Children":
                                query = query.Where(m => m.Children == 1);
                                break;
                            case "Comedies":
                                query = query.Where(m => m.Comedies == 1);
                                break;
                            case "ComediesDramasInternationalMovies":
                                query = query.Where(m => m.ComediesDramasInternationalMovies == 1);
                                break;
                            case "ComediesInternationalMovies":
                                query = query.Where(m => m.ComediesInternationalMovies == 1);
                                break;
                            case "ComediesRomanticMovies":
                                query = query.Where(m => m.ComediesRomanticMovies == 1);
                                break;
                            case "CrimeTVShowsDocuseries":
                                query = query.Where(m => m.CrimeTVShowsDocuseries == 1);
                                break;
                            case "Documentaries":
                                query = query.Where(m => m.Documentaries == 1);
                                break;
                            case "DocumentariesInternationalMovies":
                                query = query.Where(m => m.DocumentariesInternationalMovies == 1);
                                break;
                            case "Docuseries":
                                query = query.Where(m => m.Docuseries == 1);
                                break;
                            case "Dramas":
                                query = query.Where(m => m.Dramas == 1);
                                break;
                            case "DramasInternationalMovies":
                                query = query.Where(m => m.DramasInternationalMovies == 1);
                                break;
                            case "DramasRomanticMovies":
                                query = query.Where(m => m.DramasRomanticMovies == 1);
                                break;
                            case "FamilyMovies":
                                query = query.Where(m => m.FamilyMovies == 1);
                                break;
                            case "Fantasy":
                                query = query.Where(m => m.Fantasy == 1);
                                break;
                            case "HorrorMovies":
                                query = query.Where(m => m.HorrorMovies == 1);
                                break;
                            case "InternationalMoviesThrillers":
                                query = query.Where(m => m.InternationalMoviesThrillers == 1);
                                break;
                            case "InternationalTVShowsRomanticTVShowsTVDramas":
                                query = query.Where(m => m.InternationalTVShowsRomanticTVShowsTVDramas == 1);
                                break;
                            case "KidsTV":
                                query = query.Where(m => m.KidsTV == 1);
                                break;
                            case "LanguageTVShows":
                                query = query.Where(m => m.LanguageTVShows == 1);
                                break;
                            case "Musicals":
                                query = query.Where(m => m.Musicals == 1);
                                break;
                            case "NatureTV":
                                query = query.Where(m => m.NatureTV == 1);
                                break;
                            case "RealityTV":
                                query = query.Where(m => m.RealityTV == 1);
                                break;
                            case "Spirituality":
                                query = query.Where(m => m.Spirituality == 1);
                                break;
                            case "TVAction":
                                query = query.Where(m => m.TVAction == 1);
                                break;
                            case "TVComedies":
                                query = query.Where(m => m.TVComedies == 1);
                                break;
                            case "TVDramas":
                                query = query.Where(m => m.TVDramas == 1);
                                break;
                            case "TalkShowsTVComedies":
                                query = query.Where(m => m.TalkShowsTVComedies == 1);
                                break;
                            case "Thrillers":
                                query = query.Where(m => m.Thrillers == 1);
                                break;
                            default:
                                Console.WriteLine($"Unknown genre: {genre}");
                                break;
                        }
                    }
                }

                var totalCount = query.Count();
                
                var movies = query
                    .Skip((pageNum - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                return Ok(new { 
                    movies = movies,
                    totalNumMovies = totalCount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("AddMovie")]
        public IActionResult AddMovie([FromBody] Movie movie)
        {
            try
            {
                // Generate the next show ID
                movie.ShowId = GenerateNextShowId();
                
                // Add the movie to the database
                _movieContext.movies_titles.Add(movie);
                _movieContext.SaveChanges();

                return Ok(movie);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error adding movie: {ex.Message}");
            }
        }

        [HttpPut("Update/{id}")]
        public IActionResult UpdateMovie(string id, [FromBody] Movie movie)
        {
            try
            {
                var existingMovie = _movieContext.movies_titles.FirstOrDefault(m => m.ShowId == id);
                if (existingMovie == null)
                {
                    return NotFound($"Movie with ID {id} not found");
                }

                // Update properties
                existingMovie.Type = movie.Type;
                existingMovie.Title = movie.Title;
                existingMovie.Director = movie.Director;
                existingMovie.Cast = movie.Cast;
                existingMovie.Country = movie.Country;
                existingMovie.ReleaseYear = movie.ReleaseYear;
                existingMovie.Rating = movie.Rating;
                existingMovie.Duration = movie.Duration;
                existingMovie.Description = movie.Description;
                
                // Update genre properties
                existingMovie.Action = movie.Action;
                existingMovie.Adventure = movie.Adventure;
                existingMovie.AnimeSeriesInternationalTVShows = movie.AnimeSeriesInternationalTVShows;
                existingMovie.BritishTVShowsDocuseriesInternationalTVShows = movie.BritishTVShowsDocuseriesInternationalTVShows;
                existingMovie.Children = movie.Children;
                existingMovie.Comedies = movie.Comedies;
                existingMovie.ComediesDramasInternationalMovies = movie.ComediesDramasInternationalMovies;
                existingMovie.ComediesInternationalMovies = movie.ComediesInternationalMovies;
                existingMovie.ComediesRomanticMovies = movie.ComediesRomanticMovies;
                existingMovie.CrimeTVShowsDocuseries = movie.CrimeTVShowsDocuseries;
                existingMovie.Documentaries = movie.Documentaries;
                existingMovie.DocumentariesInternationalMovies = movie.DocumentariesInternationalMovies;
                existingMovie.Docuseries = movie.Docuseries;
                existingMovie.Dramas = movie.Dramas;
                existingMovie.DramasInternationalMovies = movie.DramasInternationalMovies;
                existingMovie.DramasRomanticMovies = movie.DramasRomanticMovies;
                existingMovie.FamilyMovies = movie.FamilyMovies;
                existingMovie.Fantasy = movie.Fantasy;
                existingMovie.HorrorMovies = movie.HorrorMovies;
                existingMovie.InternationalMoviesThrillers = movie.InternationalMoviesThrillers;
                existingMovie.InternationalTVShowsRomanticTVShowsTVDramas = movie.InternationalTVShowsRomanticTVShowsTVDramas;
                existingMovie.KidsTV = movie.KidsTV;
                existingMovie.LanguageTVShows = movie.LanguageTVShows;
                existingMovie.Musicals = movie.Musicals;
                existingMovie.NatureTV = movie.NatureTV;
                existingMovie.RealityTV = movie.RealityTV;
                existingMovie.Spirituality = movie.Spirituality;
                existingMovie.TVAction = movie.TVAction;
                existingMovie.TVComedies = movie.TVComedies;
                existingMovie.TVDramas = movie.TVDramas;
                existingMovie.TalkShowsTVComedies = movie.TalkShowsTVComedies;
                existingMovie.Thrillers = movie.Thrillers;

                _movieContext.Update(existingMovie);
                _movieContext.SaveChanges();
                return Ok(existingMovie);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("DeleteMovie/{id}")]
        public IActionResult DeleteMovie(string id)
        {
            try
            {
                var movie = _movieContext.movies_titles.FirstOrDefault(m => m.ShowId == id);
                if (movie == null)
                {
                    return NotFound($"Movie with ID {id} not found");
                }

                _movieContext.movies_titles.Remove(movie);
                _movieContext.SaveChanges();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        
        [HttpGet("ContentRecommendations/{showId}")]
        public IActionResult GetContentRecommendations(string showId)
        {
            try
            {
                // Retrieve content-based recommendations that match the show_id
                var recommendations = _movieContext.content_recommendations
                    .Where(c => c.SourceShowID == showId)
                    .Take(10)
                    .ToList();

                if (recommendations.Count == 0)
                {
                    return NotFound(new { message = "No content-based recommendations found for this movie." });
                }

                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("CollaborativeRecommendations/{showId}")]
        public IActionResult GetCollaborativeRecommendations(string showId)
        {
            try
            {
                // Fetch recommendations for the provided show ID from the collaborative recommender table
                var recommendations = _movieContext.collaborative_recommendations
                    .FirstOrDefault(cr => cr.ShowId == showId);

                if (recommendations == null)
                {
                    return NotFound(new { message = "No collaborative recommendations found for the provided show ID" });
                }

                // Return the recommendations
                return Ok(new
                {
                    recommendations.Rec1,
                    recommendations.Rec2,
                    recommendations.Rec3,
                    recommendations.Rec4,
                    recommendations.Rec5,
                    recommendations.Rec6,
                    recommendations.Rec7,
                    recommendations.Rec8,
                    recommendations.Rec9,
                    recommendations.Rec10
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("AverageRating/{showId}")]
        public IActionResult GetAverageRating(string showId)
        {
            try
            {
                // Query the ratings from the 'movies_ratings' table for the given 'showId'
                var ratings = _movieContext.movies_ratings
                    .Where(m => m.ShowId == showId)  // Filter by show_id
                    .ToList();  // Get all ratings for that show_id

                // If no ratings are found
                if (ratings.Count == 0)
                {
                    return NotFound(new { message = "No ratings found for this movie." });
                }

                // Calculate the average rating
                var averageRating = ratings.Average(m => m.Rating);

                // Return the average rating
                return Ok(new { ShowId = showId, AverageRating = averageRating });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetMovieById/{showId}")]
        public IActionResult GetMovieById(string showId)
        {
            try
            {
                // Log the incoming showId to ensure it's being passed correctly
                Console.WriteLine($"Looking for movie with ShowId: {showId}");

                // Look up the movie by ShowId
                var movie = _movieContext.movies_titles.FirstOrDefault(m => m.ShowId == showId);

                // If no movie is found, return a 404 Not Found response
                if (movie == null)
                {
                    return NotFound(new { message = $"Movie with ID {showId} not found" });
                }

                // Log the found movie for debugging purposes
                Console.WriteLine($"Found movie: {movie.Title}");

                // Return the movie data as an OK response
                return Ok(movie);
            }
            catch (Exception ex)
            {
                // Log the exception for debugging
                Console.WriteLine($"Error: {ex.Message}");

                // Return a 500 Internal Server Error if an exception occurs
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}