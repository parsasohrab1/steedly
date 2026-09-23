'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { shopAPI } from '@/lib/api';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await shopAPI.getProducts({ page, limit: 20, search });
      if (response.data.success) {
        setProducts(response.data.data.products);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این محصول را حذف کنید؟')) {
      return;
    }
    try {
      // TODO: Implement delete product API when available
      alert('حذف محصول به زودی فعال می‌شود');
      // await shopAPI.deleteProduct(id);
      // loadProducts();
    } catch (error) {
      alert('خطا در حذف محصول');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">مدیریت محصولات</h1>
        <Link
          href="/admin/products/new"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
        >
          <FaPlus />
          محصول جدید
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute right-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="جستجوی محصولات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نام</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">دسته‌بندی</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">قیمت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">موجودی</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    محصولی یافت نشد
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{product.name}</div>
                      {product.short_description && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {product.short_description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{product.category_name || '-'}</td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {Number(product.price).toLocaleString('fa-IR')} تومان
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/shop/${product.slug}`}
                          target="_blank"
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="مشاهده"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="ویرایش"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="حذف"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2 rounded ${
                p === page
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

