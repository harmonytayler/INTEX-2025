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
                "http://localhost:3000", "https://intex-bougier.azurewebsites.net", "https://kind-water-03db1f21e.6.azurestaticapps.net")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Optional: No-op email sender for roles
builder.Services.AddSingleton<IEmailSender<IdentityUser>, NoOpEmailSender<IdentityUser>>();

builder.Services.Configure<IdentityOptions>(options =>
{
    // More secure Password settings.
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 12;
    options.Password.RequiredUniqueChars = 1;
});

var app = builder.Build();

// HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseCors("ConnectFrontend");
// Remove HTTPS redirection for local development
app.UseHttpsRedirection();

// Add CSP header middleware
app.Use(async (context, next) =>
{
    context.Response.Headers.Add(
        "Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https://intexmovieposters.blob.core.windows.net; " +
        "connect-src 'self' https://intex-bougier.azurewebsites.net; " +
        "frame-ancestors 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'"
    );
    await next();
});

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

app.Run();
