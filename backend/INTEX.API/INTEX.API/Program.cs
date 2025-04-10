using INTEX.API.Data;
using INTEX.API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Add logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

try
{
    // Add services to the container.
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.WriteIndented = true;
        });

    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options => 
    {
        options.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
    });

    // Database contexts
    var movieConnection = builder.Configuration.GetConnectionString("MovieConnection");
    var identityConnection = builder.Configuration.GetConnectionString("IdentityConnection");

    if (string.IsNullOrEmpty(movieConnection) || string.IsNullOrEmpty(identityConnection))
    {
        throw new InvalidOperationException("Connection strings are not configured properly.");
    }

    builder.Services.AddDbContext<MovieDbContext>(options =>
    {
        options.UseSqlite(movieConnection);
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    });

    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        options.UseSqlite(identityConnection);
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    });

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
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
    });

    // Authorization
    builder.Services.AddAuthorization();

    // CORS for frontend connection
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("ConnectFrontend", policy =>
        {
            var origins = new List<string>
            {
                "http://localhost:3000",
                "https://kind-ground-08eb7501e.6.azurestaticapps.net",
                "http://localhost:5000",
                "http://localhost:5001",
                "https://localhost:5001",
                "https://intex-2025-htdhfyfpgzffdyar.eastus-01.azurewebsites.net"
            };

            // Add the deployed backend URL to allowed origins
            var deployedBackendUrl = builder.Configuration["DeployedBackendUrl"];
            if (!string.IsNullOrEmpty(deployedBackendUrl))
            {
                origins.Add(deployedBackendUrl);
            }

            policy.WithOrigins(origins.ToArray())
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

    // Add error handling middleware
    app.Use(async (context, next) =>
    {
        try
        {
            await next();
        }
        catch (Exception ex)
        {
            app.Logger.LogError(ex, "An unhandled exception occurred.");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new { error = "An unexpected error occurred" });
        }
    });

    app.UseCors("ConnectFrontend");
    app.UseHttpsRedirection();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();
    app.MapIdentityApi<IdentityUser>();

    // Endpoint to log in a user
    app.MapPost("/login", async (HttpContext context, SignInManager<IdentityUser> signInManager, UserManager<IdentityUser> userManager) =>
    {
        try
        {
            var loginRequest = await context.Request.ReadFromJsonAsync<LoginRequest>();
            if (loginRequest == null || string.IsNullOrEmpty(loginRequest.Email) || string.IsNullOrEmpty(loginRequest.Password))
            {
                app.Logger.LogWarning("Login attempt with missing credentials");
                return Results.BadRequest(new { message = "Email and password are required" });
            }

            var user = await userManager.FindByEmailAsync(loginRequest.Email);
            if (user == null)
            {
                app.Logger.LogWarning($"Login attempt failed for non-existent user: {loginRequest.Email}");
                return Results.Unauthorized();
            }

            var result = await signInManager.PasswordSignInAsync(user, loginRequest.Password, false, false);
            if (result.Succeeded)
            {
                app.Logger.LogInformation($"Successful login for user: {loginRequest.Email}");
                return Results.Ok(new { message = "Login successful" });
            }

            app.Logger.LogWarning($"Failed login attempt for user: {loginRequest.Email}");
            return Results.Json(new { message = "Invalid email or password" }, statusCode: StatusCodes.Status401Unauthorized);
        }
        catch (Exception ex)
        {
            app.Logger.LogError(ex, "Error during login");
            return Results.StatusCode(StatusCodes.Status500InternalServerError);
        }
    });

    // GET endpoint for login page
    app.MapGet("/login", (HttpContext context) =>
    {
        return Results.Content(
            "<!DOCTYPE html><html><head><title>Login</title></head><body><h1>Login Required</h1><p>Please log in to access this resource.</p></body></html>",
            "text/html"
        );
    });

    // Logout endpoint
    app.MapPost("/logout", async (HttpContext context, SignInManager<IdentityUser> signInManager) =>
    {
        try
        {
            await signInManager.SignOutAsync();
            context.Response.Cookies.Delete(".AspNetCore.Identity.Application", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None
            });
            return Results.Ok(new { message = "Logout successful" });
        }
        catch (Exception ex)
        {
            app.Logger.LogError(ex, "Error during logout");
            return Results.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }).RequireAuthorization();

    // Authentication check endpoint
    app.MapGet("/pingauth", (ClaimsPrincipal user) =>
    {
        if (!user.Identity?.IsAuthenticated ?? false)
            return Results.Unauthorized();

        var email = user.FindFirstValue(ClaimTypes.Email) ?? "unknown@email.com";
        return Results.Json(new { email });
    }).RequireAuthorization();

    app.Logger.LogInformation("Application starting...");
    
    // Always use the deployed URL
    var url = builder.Configuration["DeployedBackendUrl"] ?? "https://intex-2025-htdhfyfpgzffdyar.eastus-01.azurewebsites.net";
    
    app.Logger.LogInformation($"Starting application on {url}");
    app.Run(url);
}
catch (Exception ex)
{
    Console.WriteLine($"Host terminated unexpectedly: {ex}");
    throw;
}
