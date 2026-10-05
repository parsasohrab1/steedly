'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cartService, CartItem } from '@/lib/cart';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
    // Listen for cart updates
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  const loadCart = () => {
    setItems(cartService.getItems());
    setLoading(false);
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    cartService.updateQuantity(productId, newQuantity);
    loadCart();
  };

  const handleRemoveItem = (productId: number) => {
    if (confirm('Are you sure you want to remove this product from the cart?')) {
      cartService.removeItem(productId);
      loadCart();
    }
  };

  const totalPrice = cartService.getTotalPrice();
  const totalItems = cartService.getTotalItems();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner fullScreen text="Loading cart..." />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <FaShoppingCart className="mx-auto text-6xl text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link
            href="/shop"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link
          href="/shop"
          className="flex items-center text-gray-600 hover:text-primary-600 transition"
        >
          <FaArrowLeft className="ml-2" />
          Back to shop
        </Link>
        <h1 className="text-3xl font-bold mr-4">Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Products ({totalItems})</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition"
                >
                  <Link href={`/shop/${item.slug}`} className="flex-shrink-0">
                    <div className="relative w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FaShoppingCart size={32} />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-grow">
                    <Link
                      href={`/shop/${item.slug}`}
                      className="text-lg font-semibold hover:text-primary-600 transition"
                    >
                      {item.name}
                    </Link>
                    <p className="text-primary-600 font-semibold mt-1">
                      {item.price.toLocaleString('en-US')} Toman
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 border rounded-lg">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.product_id, item.quantity - 1)
                        }
                        className="p-2 hover:bg-gray-100 transition"
                        disabled={item.quantity <= 1}
                      >
                        <FaMinus size={12} />
                      </button>
                      <span className="px-4 py-2 min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.product_id, item.quantity + 1)
                        }
                        className="p-2 hover:bg-gray-100 transition"
                        disabled={item.quantity >= item.stock_quantity}
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-left min-w-[8rem]">
                      <p className="font-semibold">
                        {(item.price * item.quantity).toLocaleString('en-US')} Toman
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.product_id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                      title="Remove from cart"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Number of products:</span>
                <span className="font-semibold">{totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-semibold">
                  {totalPrice.toLocaleString('en-US')} Toman
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-bold">Amount payable:</span>
                <span className="font-bold text-primary-600">
                  {totalPrice.toLocaleString('en-US')} Toman
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-primary-600 text-white text-center py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Continue to payment
            </Link>

            <Link
              href="/shop"
              className="block w-full text-center py-3 text-gray-600 hover:text-primary-600 transition mt-3"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

