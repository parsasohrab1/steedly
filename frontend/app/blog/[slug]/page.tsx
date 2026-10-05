'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { blogAPI } from '@/lib/api';
import { FaArrowRight, FaCalendarAlt, FaUser, FaEye, FaTag } from 'react-icons/fa';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category_name: string;
  category_slug: string;
  author_name: string;
  views_count: number;
  published_at: string;
  created_at: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const loadPost = async () => {
    try {
      const response = await blogAPI.getPost(slug);
      if (response.data.success) {
        setPost(response.data.data);
      }
    } catch (error: any) {
      setError('Article not found');
    } finally {
      setLoading(false);
    }
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

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
          <Link href="/blog" className="text-primary-600 hover:text-primary-700">
            Back to articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-600">
          <li><Link href="/" className="hover:text-primary-600">Home</Link></li>
          <li><FaArrowRight className="text-xs" /></li>
          <li><Link href="/blog" className="hover:text-primary-600">Articles</Link></li>
          <li><FaArrowRight className="text-xs" /></li>
          <li><Link href={`/blog?category=${post.category_slug}`} className="hover:text-primary-600">{post.category_name}</Link></li>
          <li><FaArrowRight className="text-xs" /></li>
          <li className="text-gray-900">{post.title}</li>
        </ol>
      </nav>

      {/* Article Header */}
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {post.featured_image && (
          <div className="relative w-full h-96 bg-gray-200">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="p-8">
          {/* Category Badge */}
          <Link
            href={`/blog?category=${post.category_slug}`}
            className="inline-block mb-4 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold hover:bg-primary-200 transition"
          >
            <FaTag className="inline ml-2" />
            {post.category_name}
          </Link>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{post.title}</h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">{post.excerpt}</p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b text-gray-600">
            <div className="flex items-center gap-2">
              <FaUser className="text-primary-600" />
              <span>{post.author_name || 'Unknown author'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-primary-600" />
              <span>{new Date(post.published_at).toLocaleDateString('fa-IR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaEye className="text-primary-600" />
              <span>{post.views_count.toLocaleString('en-US')} views</span>
            </div>
          </div>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share Section */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-bold mb-4">Share</h3>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Telegram
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                WhatsApp
              </button>
              <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">
                Copy link
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Related articles</h2>
        <div className="text-center py-8 text-gray-600">
          <p>Related articles will be added soon</p>
        </div>
      </div>
    </div>
  );
}

