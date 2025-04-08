using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using INTEX.API.Data;

namespace INTEX.API.Controllers;

// Controller for handling recommendation-related API requests
[Route("api/[controller]")]
[ApiController]
public class RecommendationsController : ControllerBase
{
    // Database context for accessing the content_recommendations and movies_titles tables
    private readonly ApplicationDbContext _context;

    // Constructor that injects the database context
    public RecommendationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/recommendations/{showId}
    // Retrieves movie recommendations for a given showId
    // Returns a list of recommended movies if found, or 404 if no recommendations exist for the showId
    [HttpGet("{showId}")]
    public async Task<IActionResult> GetRecommendations(string showId)
    {
        // Log the showId being queried for debugging purposes
        Console.WriteLine($"Looking for SourceShowID: {showId}");

        // Query the content_recommendations table to find a record with a matching SourceShowID
        // Use ToLower() for case-insensitive comparison, and handle null SourceShowID with a fallback to an empty string
        var rec = await _context.ContentRecommendations
            .FirstOrDefaultAsync(r => (r.SourceShowID.ToLower() ?? "") == showId.ToLower());

        // If no recommendation record is found, return a 404 Not Found response
        if (rec == null)
        {
            Console.WriteLine("No ContentRecommendation found.");
            return NotFound();
        }

        // Extract the recommendation IDs (Recommendation1 to Recommendation10) into a list
        // These IDs correspond to show_id values in the movies_titles table
        var ids = new List<string?>
        {
            rec.Recommendation1, rec.Recommendation2, rec.Recommendation3,
            rec.Recommendation4, rec.Recommendation5, rec.Recommendation6,
            rec.Recommendation7, rec.Recommendation8, rec.Recommendation9,
            rec.Recommendation10
        };

        // Log the recommendation IDs for debugging
        Console.WriteLine($"Recommendation IDs: {string.Join(", ", ids)}");

        // Query the movies_titles table to find movies whose show_id matches any of the recommendation IDs
        var recommendedMovies = await _context.MoviesTitles
            .Where(m => ids.Contains(m.Show_Id))
            .ToListAsync();

        // Log the number of recommended movies found for debugging
        Console.WriteLine($"Found {recommendedMovies.Count} movies.");

        // Return the list of recommended movies with a 200 OK response
        return Ok(recommendedMovies);
    }
}