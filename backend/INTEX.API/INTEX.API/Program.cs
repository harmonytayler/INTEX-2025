using INTEX.API.Data;
using INTEX.API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options => 
{
    options.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
});

builder.Services.AddDbContext<MovieDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("MovieConnection")));

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("IdentityConnection")));

// Identity (with roles)
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Identity claims configuration
builder.Services.Configure<IdentityOptions>(options =>
{
    options.ClaimsIdentity.UserIdClaimType = ClaimTypes.NameIdentifier;
    options.ClaimsIdentity.UserNameClaimType = ClaimTypes.Email;
});

// Custom claims principal factory
builder.Services.AddScoped<IUserClaimsPrincipalFactory<IdentityUser>, CustomUserClaimsPrincipalFactory>();

// Identity cookie settings
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.Name = ".AspNetCore.Identity.Application";
    options.LoginPath = "/login";
    options.AccessDeniedPath = "/login";
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.ExpireTimeSpan = TimeSpan.FromHours(24);
    options.SlidingExpiration = true;
    options.Events = new Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationEvents
    {
        OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = 401;
            return Task.CompletedTask;
        },
        OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = 403;
            return Task.CompletedTask;
        }
    };
});

// Authorization
builder.Services.AddAuthorization();

// CORS for frontend connection
builder.Services.AddCors(options =>
{
    options.AddPolicy("ConnectFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "https://kind-ground-08eb7501e.6.azurestaticapps.net", "http://localhost:5000", "http://localhost:5001", "https://localhost:5001", "https://intex-2025.azurewebsites.net")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Optional: No-op email sender for roles
builder.Services.AddSingleton<IEmailSender<IdentityUser>, NoOpEmailSender<IdentityUser>>();

var app = builder.Build();

// HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("ConnectFrontend");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapIdentityApi<IdentityUser>();

// Endpoint to log in a user
app.MapPost("/login", async (HttpContext context, SignInManager<IdentityUser> signInManager, UserManager<IdentityUser> userManager) =>
{
    // Get login details from the request body (e.g., email and password)
    var loginRequest = await context.Request.ReadFromJsonAsync<LoginRequest>();

    if (loginRequest == null || string.IsNullOrEmpty(loginRequest.Email) || string.IsNullOrEmpty(loginRequest.Password))
    {
        return Results.BadRequest(new { message = "Email and password are required" });
    }

    // Find the user by email
    var user = await userManager.FindByEmailAsync(loginRequest.Email);
    if (user == null)
    {
        return Results.Unauthorized();
    }

    // Sign in the user
    var result = await signInManager.PasswordSignInAsync(user, loginRequest.Password, false, false);

    if (result.Succeeded)
    {
        // Successful login, return response
        return Results.Ok(new { message = "Login successful" });
    }

    // Failed login attempt
    return Results.Json(new { message = "Invalid email or password" }, statusCode: StatusCodes.Status401Unauthorized);
});

// GET endpoint for login page to handle redirects
app.MapGet("/login", (HttpContext context) =>
{
    // Return a simple HTML page for login
    return Results.Content(
        "<!DOCTYPE html><html><head><title>Login</title></head><body><h1>Login Required</h1><p>Please log in to access this resource.</p></body></html>",
        "text/html"
    );
});

// Logout endpoint to remove cookie
app.MapPost("/logout", async (HttpContext context, SignInManager<IdentityUser> signInManager) =>
{
    await signInManager.SignOutAsync();
    context.Response.Cookies.Delete(".AspNetCore.Identity.Application", new CookieOptions
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.None
    });
    return Results.Ok(new { message = "Logout successful" });
}).RequireAuthorization();

// Endpoint to check if user is authenticated
app.MapGet("/pingauth", (ClaimsPrincipal user) =>
{
    if (!user.Identity?.IsAuthenticated ?? false)
        return Results.Unauthorized();

    var email = user.FindFirstValue(ClaimTypes.Email) ?? "unknown@email.com";
    return Results.Json(new { email });
}).RequireAuthorization();

// Explicitly set the port to avoid conflicts
app.Run("https://localhost:5001");
