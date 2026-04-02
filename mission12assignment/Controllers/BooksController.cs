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

    [HttpGet("{id}")]
    public async Task<ActionResult<Book>> GetBook(int id)
    {
        var book = await _context.Books.FindAsync(id);

        if (book == null)
        {
            return NotFound();
        }

        return Ok(book);
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

    [HttpPost]
    public async Task<ActionResult<Book>> AddBook(Book book)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBook), new { id = book.BookID }, book);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBook(int id, Book book)
    {
        if (id != book.BookID)
        {
            return BadRequest("Book ID mismatch.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var existingBook = await _context.Books.FindAsync(id);

        if (existingBook == null)
        {
            return NotFound();
        }

        existingBook.Title = book.Title;
        existingBook.Author = book.Author;
        existingBook.Publisher = book.Publisher;
        existingBook.ISBN = book.ISBN;
        existingBook.Classification = book.Classification;
        existingBook.Category = book.Category;
        existingBook.PageCount = book.PageCount;
        existingBook.Price = book.Price;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await _context.Books.FindAsync(id);

        if (book == null)
        {
            return NotFound();
        }

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
