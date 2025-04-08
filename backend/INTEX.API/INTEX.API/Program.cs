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
builder.Services.AddSwaggerGen();

// Database contexts
builder.Services.AddDbContext<TestDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("TestConnection")));

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
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
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
                "https://kind-ground-08eb7501e.6.azurestaticapps.net")
            .AllowCredentials()
            .AllowAnyHeader()
            .AllowAnyMethod();
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

// Login endpoint to handle POST requests for authentication
app.MapPost("/login", async (HttpContext context, SignInManager<IdentityUser> signInManager, UserManager<IdentityUser> userManager) =>
{
    var loginRequest = await context.Request.ReadFromJsonAsync<LoginRequest>();

    if (loginRequest == null || string.IsNullOrEmpty(loginRequest.Email) || string.IsNullOrEmpty(loginRequest.Password))
    {
        return Results.BadRequest(new { message = "Email and password are required." });
    }

    var user = await userManager.FindByEmailAsync(loginRequest.Email);
    if (user == null)
    {
        return Results.BadRequest(new { message = "Invalid email or password." });
    }

    var result = await signInManager.PasswordSignInAsync(user, loginRequest.Password, isPersistent: loginRequest.RememberMe, lockoutOnFailure: false);

    if (result.Succeeded)
    {
        // Successful login, return Ok response
        return Results.Ok(new { message = "Login successful" });
    }

    return Results.BadRequest(new { message = "Invalid email or password." });
}).AllowAnonymous();

// DTO for Login Request
// Moved to a separate file or above top-level statements

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
