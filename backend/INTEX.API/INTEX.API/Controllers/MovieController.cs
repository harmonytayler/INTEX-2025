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
            var query = _movieContext.movies_titles.AsQueryable();
            var movies = query.Take(5).ToList();

            return Ok(movies);
        }
    }
}