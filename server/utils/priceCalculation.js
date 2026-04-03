export const calculateTotalPrice = (cart) => {
  let total = 0;

  for (const item of cart.items) {
    if (item.book && item.book.price != null) {
      total += item.book.price * item.quantity;
    }
  }

  cart.totalPrice = total;
};
