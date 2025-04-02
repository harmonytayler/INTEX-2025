using INTEX.API.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<TestDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("TestConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("ConnectFrontend",
        policy =>
        {
            policy.WithOrigins("https://kind-ground-08eb7501e.6.azurestaticapps.net")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("ConnectFrontend");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
