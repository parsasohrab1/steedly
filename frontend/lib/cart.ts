// Cart management with localStorage
export interface CartItem {
  product_id: number;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  quantity: number;
  stock_quantity: number;
}

const CART_STORAGE_KEY = 'steedly_cart';

export const cartService = {
  // Get all cart items
  getItems(): CartItem[] {
    if (typeof window === 'undefined') return [];
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  },

  // Add item to cart
  addItem(item: Omit<CartItem, 'quantity'>, quantity: number = 1): void {
    const items = this.getItems();
    const existingItemIndex = items.findIndex(
      (i) => i.product_id === item.product_id
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      const newQuantity = items[existingItemIndex].quantity + quantity;
      if (newQuantity <= item.stock_quantity) {
        items[existingItemIndex].quantity = newQuantity;
      }
    } else {
      // Add new item
      items.push({ ...item, quantity });
    }

    this.saveItems(items);
  },

  // Update item quantity
  updateQuantity(productId: number, quantity: number): void {
    const items = this.getItems();
    const itemIndex = items.findIndex((i) => i.product_id === productId);

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        items.splice(itemIndex, 1);
      } else if (quantity <= items[itemIndex].stock_quantity) {
        items[itemIndex].quantity = quantity;
      }
      this.saveItems(items);
    }
  },

  // Remove item from cart
  removeItem(productId: number): void {
    const items = this.getItems().filter((i) => i.product_id !== productId);
    this.saveItems(items);
  },

  // Clear cart
  clear(): void {
    this.saveItems([]);
  },

  // Get total items count
  getTotalItems(): number {
    return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
  },

  // Get total price
  getTotalPrice(): number {
    return this.getItems().reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  },

  // Save items to localStorage
  saveItems(items: CartItem[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      // Dispatch custom event for cart updates
      window.dispatchEvent(new Event('cartUpdated'));
    }
  },
};

