using Microsoft.AspNetCore.Mvc;
using mission12assignment.Models;

namespace mission12assignment.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BooksController : ControllerBase
{
    private readonly BookstoreContext _context;

    public BooksController(BookstoreContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetBooks(int pageNumber = 1, int pageSize = 5, string sortBy = "", string category = "")
    {
        var query = _context.Books.AsQueryable();

        // Filter by category if provided
        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(b => b.Category == category);
        }

        if (sortBy.Equals("title", StringComparison.OrdinalIgnoreCase))
        {
            query = query.OrderBy(b => b.Title);
        }

        var totalBooks = query.Count();
        var books = query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(new
        {
            books,
            totalBooks,
            totalPages = (int)Math.Ceiling((double)totalBooks / pageSize),
            currentPage = pageNumber,
            pageSize
        });
    }

    [HttpGet("categories")]
    public IActionResult GetCategories()
    {
        var categories = _context.Books
            .Select(b => b.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToList();

        return Ok(categories);
    }
}
