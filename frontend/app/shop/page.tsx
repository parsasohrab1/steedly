import Link from 'next/link';
import { shopAPI } from '@/lib/api';

async function getProducts() {
  try {
    const response = await shopAPI.getProducts({ page: 1, limit: 12 });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } };
  }
}

export default async function ShopPage() {
  const { products, pagination } = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">فروشگاه استیدلی</h1>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">هنوز محصولی در فروشگاه موجود نیست.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              {product.images && product.images.length > 0 && (
                <div className="h-48 bg-gray-200 relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-lg font-bold mb-2">{product.name}</h2>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.short_description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary-600">
                    {product.price.toLocaleString('fa-IR')} تومان
                  </span>
                  {product.compare_at_price && (
                    <span className="text-sm text-gray-400 line-through">
                      {product.compare_at_price.toLocaleString('fa-IR')}
                    </span>
                  )}
                </div>
                {product.stock_quantity === 0 && (
                  <span className="text-red-600 text-sm mt-2 block">ناموجود</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/shop?page=${page}`}
              className={`px-4 py-2 rounded ${
                page === pagination.page
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

