using INTEX.API.Data;
using INTEX.API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace INTEX.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize] // Ensure the controller requires authentication
    public class MovieUserController : ControllerBase
    {
        private readonly MovieDbContext _context;

        // Constructor to inject MovieDbContext
        public MovieUserController(MovieDbContext context)
        {
            _context = context;
        }

        // GET: /MovieUser/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMovieUser(int id)
        {
            try
            {
                var movieUser = await _context.movies_users.FindAsync(id);
                if (movieUser == null)
                {
                    return NotFound($"MovieUser with ID {id} not found.");
                }

                return Ok(movieUser);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        
        // GET: /MovieUser/GetNextUserId
        [HttpGet("GetNextUserId")]
        public async Task<IActionResult> GetNextUserId()
        {
            try
            {
                // Find the highest user_id
                var highestUserId = await _context.movies_users
                    .OrderByDescending(u => u.UserId)
                    .Select(u => u.UserId)
                    .FirstOrDefaultAsync();

                // If there are no users, set the initial UserId to 1
                int newUserId = (highestUserId == 0) ? 1 : highestUserId + 1;

                // Ensure the new userId does not already exist
                var userExists = await _context.movies_users
                    .AnyAsync(u => u.UserId == newUserId);

                // If it exists, increment and check again until a unique ID is found
                while (userExists)
                {
                    newUserId++;
                    userExists = await _context.movies_users
                        .AnyAsync(u => u.UserId == newUserId);
                }

                // Return the next available unique userId
                return Ok(newUserId);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        
        [HttpPost("AddUser")]
        public async Task<IActionResult> AddMovieUser([FromBody] MovieUser newUser)
        {
            try
            {
                if (newUser == null)
                {
                    return BadRequest("Invalid user data.");
                }

                // Check if another user with the same email already exists
                var existingUser = await _context.movies_users
                    .FirstOrDefaultAsync(u => u.Email == newUser.Email);

                if (existingUser != null)
                {
                    return Conflict($"A user with the email {newUser.Email} already exists.");
                }

                // Let the database handle userId auto-generation
                _context.movies_users.Add(newUser);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetMovieUser), new { id = newUser.UserId }, newUser);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        // PUT: /MovieUser/Update/{id}
        [HttpPut("Update/{id}")]
        public async Task<IActionResult> UpdateMovieUser(int id, [FromBody] MovieUser user)
        {
            try
            {
                if (id != user.UserId)
                {
                    return BadRequest("User ID mismatch.");
                }

                _context.Entry(user).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return Ok(user);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MovieUserExists(id))
                {
                    return NotFound($"MovieUser with ID {id} not found");
                }
                else
                {
                    return StatusCode(500, "Error updating user.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: /MovieUser/Delete/{id}
        [HttpDelete("DeleteUser/{id}")]
        public async Task<IActionResult> DeleteMovieUser(int id)
        {
            try
            {
                var movieUser = await _context.movies_users.FindAsync(id);
                if (movieUser == null)
                {
                    return NotFound($"MovieUser with ID {id} not found");
                }

                _context.movies_users.Remove(movieUser);
                await _context.SaveChangesAsync();

                return NoContent();  // 204 No Content
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Helper method to check if the MovieUser exists
        private bool MovieUserExists(int id)
        {
            return _context.movies_users.Any(e => e.UserId == id);
        }
    }
}
