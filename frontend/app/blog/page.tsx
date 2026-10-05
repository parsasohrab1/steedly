import Link from 'next/link';
import { blogAPI } from '@/lib/api';

async function getBlogPosts() {
  try {
    const response = await blogAPI.getPosts({ page: 1, limit: 12 });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return { posts: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } };
  }
}

export default async function BlogPage() {
  const { posts, pagination } = await getBlogPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Specialized horse articles</h1>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">No articles have been published yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: any) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              {post.featured_image && (
                <div className="h-48 bg-gray-200 relative">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <span className="text-sm text-primary-600">{post.category_name}</span>
                <h2 className="text-xl font-bold mt-2 mb-2">{post.title}</h2>
                <p className="text-gray-600 text-sm line-clamp-3">{post.excerpt}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>{post.author_name}</span>
                  <span>{new Date(post.published_at).toLocaleDateString('fa-IR')}</span>
                </div>
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
              href={`/blog?page=${page}`}
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

