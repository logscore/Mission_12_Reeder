import React from 'react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';

function CartPage() {
  const { cart, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="alert alert-info">
          Your cart is empty.{' '}
          <button className="btn btn-link p-0" onClick={() => navigate(-1)}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.bookID}>
                  <td>{item.title}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeFromCart(item.bookID)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="table-secondary fw-bold">
                <td>Total</td>
                <td></td>
                <td>{totalItems}</td>
                <td>${totalPrice.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate(-1)}
            >
              Continue Shopping
            </button>
            <button className="btn btn-danger" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
