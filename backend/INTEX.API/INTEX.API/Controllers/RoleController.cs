using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.Linq;

namespace INTEX.API.Controllers;

[Route("[controller]")]
[ApiController]
// Comment out the controller-level restriction to make endpoints accessible
// [Authorize(Roles = "Administrator")]
public class RoleController : Controller
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<IdentityUser> _userManager;

    public RoleController(RoleManager<IdentityRole> roleManager, UserManager<IdentityUser> userManager)
    {
        _roleManager = roleManager;
        _userManager = userManager;
    }
    
    [HttpPost("AddRole")]
    [AllowAnonymous] // Allow anyone to create roles (for debugging)
    public async Task<IActionResult> AddRole(string roleName)
    {
        try 
        {
            if (string.IsNullOrWhiteSpace(roleName))
            {
                return BadRequest("Role name cannot be empty.");
            }

            var roleExists = await _roleManager.RoleExistsAsync(roleName);
            if (roleExists)
            {
                return Ok($"Role '{roleName}' already exists.");  // Return 200 instead of 409
            }

            var result = await _roleManager.CreateAsync(new IdentityRole(roleName));
            if (result.Succeeded)
            {
                return Ok($"Role '{roleName}' created successfully.");
            }

            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return StatusCode(500, $"An error occurred while creating the role: {errors}");
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, $"An error occurred while creating the role: {ex.Message}");
        }
    }

    [HttpPost("AssignRoleToUser")]
    [AllowAnonymous] // Allow anyone to assign roles (for debugging)
    public async Task<IActionResult> AssignRoleToUser([FromQuery] string userEmail, [FromQuery] string roleName)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(userEmail) || string.IsNullOrWhiteSpace(roleName))
            {
                return BadRequest("User email and role name are required.");
            }

            var user = await _userManager.FindByEmailAsync(userEmail);
            if (user == null)
            {
                return NotFound($"User with email '{userEmail}' not found.");
            }

            var roleExists = await _roleManager.RoleExistsAsync(roleName);
            if (!roleExists)
            {
                // Create the role if it doesn't exist
                var createResult = await _roleManager.CreateAsync(new IdentityRole(roleName));
                if (!createResult.Succeeded)
                {
                    var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                    return StatusCode(500, $"Failed to create role: {errors}");
                }
            }

            // Check if user already has the role
            var isInRole = await _userManager.IsInRoleAsync(user, roleName);
            if (isInRole)
            {
                return Ok($"User '{userEmail}' already has the role '{roleName}'.");
            }

            var result = await _userManager.AddToRoleAsync(user, roleName);
            if (result.Succeeded)
            {
                return Ok($"Role '{roleName}' assigned to user '{userEmail}'.");
            }

            var addErrors = string.Join(", ", result.Errors.Select(e => e.Description));
            return StatusCode(500, $"An error occurred while assigning the role: {addErrors}");
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, $"An error occurred while assigning the role: {ex.Message}");
        }
    }

    [HttpGet("CheckUserRole")]
    [AllowAnonymous] // Allow anyone to check roles
    public async Task<IActionResult> CheckUserRole([FromQuery] string email, [FromQuery] string role)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(role))
        {
            return BadRequest("Email and role are required.");
        }

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return Ok(new { hasRole = false, detail = "User not found" });
        }

        var hasRole = await _userManager.IsInRoleAsync(user, role);
        var userRoles = await _userManager.GetRolesAsync(user);

        return Ok(new { 
            hasRole, 
            userId = user.Id,
            email = user.Email,
            userRoles = userRoles.ToList(),
            requestedRole = role
        });
    }

    [HttpGet("GetAllRoles")]
    [AllowAnonymous] // Make it accessible for debugging
    public IActionResult GetAllRoles()
    {
        var roles = _roleManager.Roles.Select(r => r.Name).ToList();
        return Ok(new { roles });
    }
}

