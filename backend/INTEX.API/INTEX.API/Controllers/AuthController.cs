using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;

namespace INTEX.API.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    // GET /auth/google  →  kicks off Google login
    [HttpGet("google")]
    public IActionResult Google(string returnUrl = "/home")
    {
        var frontendUrl = $"http://localhost:3000{returnUrl}";
        return Challenge(new AuthenticationProperties { RedirectUri = frontendUrl },
            GoogleDefaults.AuthenticationScheme);
    }

}