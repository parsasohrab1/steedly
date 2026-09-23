'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { blogAPI, shopAPI, competitionsAPI } from '@/lib/api';
import { FaSearch, FaFilter } from 'react-icons/fa';

interface SearchResult {
  type: 'blog' | 'product' | 'competition';
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  image?: string;
  price?: number;
  date?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: type,
    category: '',
    sort: 'relevance'
  });

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, filters]);

  const performSearch = async () => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search blog posts
      if (filters.type === 'all' || filters.type === 'blog') {
        const blogRes = await blogAPI.searchPosts(query);
        if (blogRes.data.data) {
          blogRes.data.data.forEach((post: any) => {
            searchResults.push({
              type: 'blog',
              id: post.id,
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              category: post.category_name,
              image: post.featured_image,
              date: post.published_at
            });
          });
        }
      }

      // Search products
      if (filters.type === 'all' || filters.type === 'product') {
        const shopRes = await shopAPI.getProducts({ search: query, limit: 50 });
        if (shopRes.data.data?.products) {
          shopRes.data.data.products.forEach((product: any) => {
            searchResults.push({
              type: 'product',
              id: product.id,
              title: product.name,
              slug: product.slug,
              excerpt: product.short_description,
              category: product.category_name,
              image: product.images?.[0] || product.image_url,
              price: product.price
            });
          });
        }
      }

      // Search competitions
      if (filters.type === 'all' || filters.type === 'competition') {
        const compRes = await competitionsAPI.getCompetitions();
        if (compRes.data.data) {
          compRes.data.data.forEach((comp: any) => {
            if (comp.title.toLowerCase().includes(query.toLowerCase()) ||
                comp.description?.toLowerCase().includes(query.toLowerCase())) {
              searchResults.push({
                type: 'competition',
                id: comp.id,
                title: comp.title,
                slug: comp.slug,
                excerpt: comp.description?.substring(0, 150),
                category: comp.competition_type,
                image: comp.image_url,
                date: comp.start_date
              });
            }
          });
        }
      }

      // Sort results
      let sortedResults = [...searchResults];
      if (filters.sort === 'date') {
        sortedResults.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
      } else if (filters.sort === 'price' && filters.type === 'product') {
        sortedResults = sortedResults.filter(r => r.type === 'product');
        sortedResults.sort((a, b) => (a.price || 0) - (b.price || 0));
      }

      setResults(sortedResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'blog':
        return 'مقاله';
      case 'product':
        return 'محصول';
      case 'competition':
        return 'مسابقه';
      default:
        return type;
    }
  };

  const getResultPath = (result: SearchResult) => {
    switch (result.type) {
      case 'blog':
        return `/blog/${result.slug}`;
      case 'product':
        return `/shop/${result.slug}`;
      case 'competition':
        return `/competitions/${result.slug}`;
      default:
        return '/';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">نتایج جستجو</h1>
        {query && (
          <p className="text-gray-600">
            نتایج جستجو برای: <span className="font-semibold">"{query}"</span>
            {results.length > 0 && (
              <span className="mr-2">({results.length} نتیجه)</span>
            )}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <span className="text-sm font-medium">فیلتر:</span>
          </div>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            <option value="all">همه</option>
            <option value="blog">مقالات</option>
            <option value="product">محصولات</option>
            <option value="competition">مسابقات</option>
          </select>

          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            <option value="relevance">مرتبط‌ترین</option>
            <option value="date">جدیدترین</option>
            {filters.type === 'product' && (
              <option value="price">قیمت (کم به زیاد)</option>
            )}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال جستجو...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">نتیجه‌ای یافت نشد</h2>
          <p className="text-gray-600 mb-6">
            {query ? 'لطفاً کلمات کلیدی دیگری را امتحان کنید' : 'لطفاً عبارت جستجو را وارد کنید'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              href={getResultPath(result)}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              {result.image && (
                <div className="h-48 bg-gray-200 relative">
                  <img
                    src={result.image}
                    alt={result.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                    {getTypeLabel(result.type)}
                  </span>
                  {result.category && (
                    <span className="text-xs text-gray-500">{result.category}</span>
                  )}
                </div>
                <h3 className="text-lg font-bold mb-2 line-clamp-2">{result.title}</h3>
                {result.excerpt && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{result.excerpt}</p>
                )}
                {result.price && (
                  <p className="text-lg font-bold text-primary-600">
                    {Number(result.price).toLocaleString('fa-IR')} تومان
                  </p>
                )}
                {result.date && (
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(result.date).toLocaleDateString('fa-IR')}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

