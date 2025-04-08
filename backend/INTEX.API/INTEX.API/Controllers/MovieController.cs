using INTEX.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INTEX.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize] //controller now requires authentication
    public class MovieController: ControllerBase
    {
        private MovieDbContext _movieContext;
        public MovieController(MovieDbContext temp) => _movieContext = temp;

        [HttpGet("AllMovies")]
        public IActionResult GetItems()
        {
            try
            {
                var query = _movieContext.movies_titles.AsQueryable();
                var movies = query.ToList();

                return Ok(movies);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("AddMovie")]
        public IActionResult AddMovie([FromBody] Movie newMovie)
        {
            _movieContext.movies_titles.Add(newMovie);
            _movieContext.SaveChanges();
            return Ok(newMovie);
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
    }
}