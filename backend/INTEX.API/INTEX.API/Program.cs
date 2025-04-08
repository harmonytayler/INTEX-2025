using INTEX.API.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using INTEX.API.Data;
using INTEX.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<MovieDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("MovieConnection")));

//builder for identity (auth)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("IdentityConnection")));

builder.Services.AddAuthorization();

//used if identity AND roles are being implemented
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

//commented out, use only if we do not use roles, otherwise use above
//builder.Services.AddIdentityApiEndpoints<IdentityUser>().AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.Configure<IdentityOptions>(options =>
{
    options.ClaimsIdentity.UserIdClaimType = ClaimTypes.NameIdentifier;
    options.ClaimsIdentity.UserNameClaimType = ClaimTypes.Email;
});

builder.Services.AddScoped<IUserClaimsPrincipalFactory<IdentityUser>, CustomUserClaimsPrincipalFactory>();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Domain = "intex-2025.azurewebsites.net";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.Name = ".AspNetCore.Identity.Application";
    options.LoginPath = "/login";
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("ConnectFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "https://kind-ground-08eb7501e.6.azurestaticapps.net", "http://localhost:5000", "https://intex-2025.azurewebsites.net")
            .AllowCredentials()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

//used for roles to connect to the NoOpEmailSender.cs file, delete if not using roles
builder.Services.AddSingleton<IEmailSender<IdentityUser>, NoOpEmailSender<IdentityUser>>();

var app = builder.Build();

// Configure the HTTP request pipeline.
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


// Logout endpoint to remove cookie
app.MapPost("/logout", async (HttpContext context, SignInManager<IdentityUser> signInManager) =>
{
    await signInManager.SignOutAsync();
    
    //Ensure authentication cookie is removed
    context.Response.Cookies.Delete(".AspNetCore.Identity.Application", new CookieOptions
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.None
    });
    
    return Results.Ok(new {message = "Logout successful"});
}).RequireAuthorization();

//gets information about the login user and ask if they are authenticated
app.MapGet("/pingauth", (ClaimsPrincipal user) =>
{
    if (!user.Identity?.IsAuthenticated ?? false)
    {
        return Results.Unauthorized();
    }
    
    var email = user.FindFirstValue(ClaimTypes.Email) ?? "unknown@email.com";
    return Results.Json(new { email = email }); //returns user email as json
}).RequireAuthorization();

app.Run();
