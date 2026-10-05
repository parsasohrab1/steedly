'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { blogAPI, shopAPI, competitionsAPI } from '@/lib/api';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface SearchResult {
  type: 'blog' | 'product' | 'competition';
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const searchTimeout = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const [blogRes, shopRes, competitionsRes] = await Promise.all([
        blogAPI.searchPosts(query).catch(() => ({ data: { data: [] } })),
        shopAPI.getProducts({ search: query, limit: 5 }).catch(() => ({ data: { data: { products: [] } } })),
        competitionsAPI.getCompetitions().catch(() => ({ data: { data: [] } }))
      ]);

      const searchResults: SearchResult[] = [];

      // Blog posts
      if (blogRes.data.data) {
        blogRes.data.data.forEach((post: any) => {
          if (post.title.toLowerCase().includes(query.toLowerCase())) {
            searchResults.push({
              type: 'blog',
              id: post.id,
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              category: post.category_name
            });
          }
        });
      }

      // Products
      if (shopRes.data.data?.products) {
        shopRes.data.data.products.forEach((product: any) => {
          searchResults.push({
            type: 'product',
            id: product.id,
            title: product.name,
            slug: product.slug,
            excerpt: product.short_description,
            category: product.category_name
          });
        });
      }

      // Competitions
      if (competitionsRes.data.data) {
        competitionsRes.data.data.forEach((comp: any) => {
          if (comp.title.toLowerCase().includes(query.toLowerCase())) {
            searchResults.push({
              type: 'competition',
              id: comp.id,
              title: comp.title,
              slug: comp.slug,
              excerpt: comp.description?.substring(0, 100),
              category: comp.competition_type
            });
          }
        });
      }

      setResults(searchResults.slice(0, 10));
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    let path = '';
    switch (result.type) {
      case 'blog':
        path = `/blog/${result.slug}`;
        break;
      case 'product':
        path = `/shop/${result.slug}`;
        break;
      case 'competition':
        path = `/competitions/${result.slug}`;
        break;
    }
    router.push(path);
    setShowResults(false);
    setQuery('');
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'blog':
        return 'Article';
      case 'product':
        return 'Product';
      case 'competition':
        return 'Competition';
      default:
        return type;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder="Search articles, products and competitions..."
          className="w-full px-4 py-3 pr-10 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {showResults && (results.length > 0 || loading) && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-right px-4 py-3 hover:bg-gray-50 transition flex items-start gap-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        {getTypeLabel(result.type)}
                      </span>
                      {result.category && (
                        <span className="text-xs text-gray-500">{result.category}</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900">{result.title}</h4>
                    {result.excerpt && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{result.excerpt}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

