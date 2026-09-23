'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { shopAPI } from '@/lib/api';
import { FaArrowRight, FaShoppingCart, FaStar, FaTag, FaBox } from 'react-icons/fa';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  stock_quantity: number;
  category_name: string;
  category_slug: string;
  image_url: string;
  images?: string[];
  created_at: string;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    try {
      const response = await shopAPI.getProduct(slug);
      if (response.data.success) {
        setProduct(response.data.data);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    import('@/lib/cart').then(({ cartService }) => {
      cartService.addItem({
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        image_url: product.image_url || product.images?.[0] || '',
        stock_quantity: product.stock_quantity,
      }, quantity);
      
      alert('محصول به سبد خرید اضافه شد!');
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">محصول یافت نشد</h1>
          <Link href="/shop" className="text-primary-600 hover:text-primary-700">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.image_url 
      ? [product.image_url] 
      : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-600">
          <li><Link href="/" className="hover:text-primary-600">خانه</Link></li>
          <li><FaArrowRight className="text-xs" /></li>
          <li><Link href="/shop" className="hover:text-primary-600">فروشگاه</Link></li>
          <li><FaArrowRight className="text-xs" /></li>
          <li><Link href={`/shop?category=${product.category_slug}`} className="hover:text-primary-600">{product.category_name}</Link></li>
          <li><FaArrowRight className="text-xs" /></li>
          <li className="text-gray-900">{product.name}</li>
        </ol>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 bg-white rounded-lg shadow-md p-6">
        {/* Product Images */}
        <div>
          {images.length > 0 ? (
            <>
              <div className="relative w-full h-96 bg-gray-200 rounded-lg mb-4">
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-primary-600' : 'border-transparent'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} - تصویر ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <FaBox className="text-6xl text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {/* Category */}
          <Link
            href={`/shop?category=${product.category_slug}`}
            className="inline-block mb-4 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold hover:bg-primary-200 transition"
          >
            <FaTag className="inline ml-2" />
            {product.category_name}
          </Link>

          {/* Name */}
          <h1 className="text-3xl font-bold mb-4 text-gray-900">{product.name}</h1>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-lg text-gray-600 mb-6">{product.short_description}</p>
          )}

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-primary-600">
              {product.price.toLocaleString('fa-IR')}
            </span>
            <span className="text-gray-600 mr-2">تومان</span>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock_quantity > 0 ? (
              <span className="text-green-600 font-semibold">
                ✓ موجود در انبار ({product.stock_quantity} عدد)
              </span>
            ) : (
              <span className="text-red-600 font-semibold">✗ ناموجود</span>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stock_quantity > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">تعداد</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={product.stock_quantity}
                  className="w-20 px-4 py-2 border rounded-lg text-center"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className="w-full bg-primary-600 text-white px-6 py-4 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaShoppingCart />
            {product.stock_quantity > 0 ? 'افزودن به سبد خرید' : 'ناموجود'}
          </button>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">توضیحات محصول</h2>
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}
    </div>
  );
}

