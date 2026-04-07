using Microsoft.EntityFrameworkCore;
using backend.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

builder.Services.AddDbContext<BookstoreContext>(options =>
    options.UseSqlite("Data Source=Bookstore.sqlite"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

app.UseCors("AllowReactApp");

app.UseRouting();
app.UseAuthorization();

app.MapControllers();

app.Run();
