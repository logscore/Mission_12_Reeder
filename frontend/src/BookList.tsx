import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Book {
  bookID: number;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  classification: string;
  category: string;
  pageCount: number;
  price: number;
}

interface BooksResponse {
  books: Book[];
  totalBooks: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

function BookList() {
  const [data, setData] = useState<BooksResponse | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const { addToCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read state from URL search params so it persists across navigation
  const pageNumber = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 5;
  const sortBy = searchParams.get('sortBy') || '';
  const selectedCategory = searchParams.get('category') || '';

  const updateParam = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams);
    if (value === '' || value === 0) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    // Reset to page 1 when changing filters
    if (key !== 'page') {
      params.set('page', '1');
    }
    setSearchParams(params);
  };

  // Fetch categories on mount
  useEffect(() => {
    fetch('http://localhost:5027/api/books/categories')
      .then((res) => res.json())
      .then((json) => setCategories(json))
      .catch((err) => console.error(err));
  }, []);

  // Fetch books when params change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('pageNumber', String(pageNumber));
    params.set('pageSize', String(pageSize));
    if (sortBy) params.set('sortBy', sortBy);
    if (selectedCategory) params.set('category', selectedCategory);

    fetch(`http://localhost:5027/api/books?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [pageNumber, pageSize, sortBy, selectedCategory]);

  const handleAddToCart = (book: Book) => {
    addToCart({ bookID: book.bookID, title: book.title, price: book.price });
    setToastMessage(`"${book.title}" added to cart!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const pageNumbers = [];
  if (data) {
    for (let i = 1; i <= data.totalPages; i++) {
      pageNumbers.push(i);
    }
  }

  return (
    <div className="container-fluid mt-4">
      {/* Bootstrap Toast (NEW BOOTSTRAP FEATURE #1) */}
      <div
        className="toast-container position-fixed top-0 end-0 p-3"
        style={{ zIndex: 1055 }}
      >
        <div
          className={`toast align-items-center text-bg-success border-0 ${showToast ? 'show' : ''}`}
          role="alert"
        >
          <div className="d-flex">
            <div className="toast-body">{toastMessage}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setShowToast(false)}
            ></button>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Category filter sidebar */}
        <div className="col-lg-2 col-md-3 mb-4">
          <div className="card">
            <div className="card-header fw-bold">Categories</div>
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => updateParam('category', '')}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`list-group-item list-group-item-action ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => updateParam('category', cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main book list */}
        <div className="col-lg-8 col-md-6">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="mb-0">Hilton's Bookstore</h1>
            <button
              className={`btn btn-sm ${sortBy === 'title' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => updateParam('sortBy', sortBy === 'title' ? '' : 'title')}
            >
              {sortBy === 'title' ? 'Clear Sort' : 'Sort by Title'}
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : !data || data.books.length === 0 ? (
            <p>No books found.</p>
          ) : (
            <>
              <table className="table table-striped table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Publisher</th>
                    <th>ISBN</th>
                    <th>Classification</th>
                    <th>Category</th>
                    <th>Pages</th>
                    <th>Price</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.books.map((book) => (
                    <tr key={book.bookID}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.publisher}</td>
                      <td>{book.isbn}</td>
                      <td>{book.classification}</td>
                      <td>{book.category}</td>
                      <td>{book.pageCount}</td>
                      <td>${book.price.toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleAddToCart(book)}
                        >
                          Add to Cart
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <label className="me-2">Results per page:</label>
                  <select
                    className="form-select d-inline-block w-auto"
                    value={pageSize}
                    onChange={(e) => updateParam('pageSize', Number(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>

                <nav>
                  <ul className="pagination mb-0">
                    <li className={`page-item ${pageNumber === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => updateParam('page', pageNumber - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {pageNumbers.map((num) => (
                      <li
                        key={num}
                        className={`page-item ${num === pageNumber ? 'active' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => updateParam('page', num)}
                        >
                          {num}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${pageNumber === data.totalPages ? 'disabled' : ''}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => updateParam('page', pageNumber + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          )}
        </div>

        {/* Cart summary sidebar */}
        <div className="col-lg-2 col-md-3 mb-4">
          <div className="card">
            <div className="card-header fw-bold">
              Cart{' '}
              {/* Bootstrap Badge (NEW BOOTSTRAP FEATURE #2) */}
              <span className="badge rounded-pill text-bg-danger">
                {totalItems}
              </span>
            </div>
            <div className="card-body">
              {totalItems === 0 ? (
                <p className="text-muted mb-0">Your cart is empty.</p>
              ) : (
                <>
                  <p className="mb-1">
                    <strong>Items:</strong> {totalItems}
                  </p>
                  <p className="mb-2">
                    <strong>Total:</strong> ${totalPrice.toFixed(2)}
                  </p>
                  <button
                    className="btn btn-primary btn-sm w-100"
                    onClick={() => navigate('/cart')}
                  >
                    View Cart
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookList;
