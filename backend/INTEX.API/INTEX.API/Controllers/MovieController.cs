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
    }
}