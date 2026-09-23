'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI, blogAPI, shopAPI, competitionsAPI, servicesAPI } from '@/lib/api';
import { 
  FaChartBar, FaNewspaper, FaShoppingBag, FaTrophy, FaUsers, 
  FaUserMd, FaTruck, FaPlus, FaEdit, FaTrash, FaEye 
} from 'react-icons/fa';

interface DashboardStats {
  totalPosts: number;
  totalProducts: number;
  totalCompetitions: number;
  totalUsers: number;
  totalVeterinarians: number;
  totalTransporters: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await authAPI.getProfile();
      if (response.data.success) {
        const role = response.data.data.role;
        setUserRole(role);
        if (role !== 'admin' && role !== 'author') {
          router.push('/');
          return;
        }
      }
    } catch (error) {
      router.push('/auth/login');
    }
  };

  const loadStats = async () => {
    try {
      // Load basic stats (in a real app, you'd have a dedicated stats endpoint)
      const [postsRes, productsRes, competitionsRes] = await Promise.all([
        blogAPI.getPosts({ limit: 1 }),
        shopAPI.getProducts({ limit: 1 }),
        competitionsAPI.getCompetitions()
      ]);

      setStats({
        totalPosts: postsRes.data.data.pagination.total,
        totalProducts: productsRes.data.data.pagination.total,
        totalCompetitions: competitionsRes.data.data.length,
        totalUsers: 0, // Would need a dedicated endpoint
        totalVeterinarians: 0, // Would need a dedicated endpoint
        totalTransporters: 0 // Would need a dedicated endpoint
      });
    } catch (error) {
      console.error('Error loading stats:', error);
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

  if (userRole !== 'admin' && userRole !== 'author') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">پنل مدیریت</h1>
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700"
            >
              بازگشت به سایت
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={FaNewspaper}
            title="مقالات"
            value={stats?.totalPosts || 0}
            color="blue"
            href="/admin/blog"
          />
          <StatCard
            icon={FaShoppingBag}
            title="محصولات"
            value={stats?.totalProducts || 0}
            color="green"
            href="/admin/products"
          />
          <StatCard
            icon={FaTrophy}
            title="مسابقات"
            value={stats?.totalCompetitions || 0}
            color="yellow"
            href="/admin/competitions"
          />
          {userRole === 'admin' && (
            <>
              <StatCard
                icon={FaUsers}
                title="کاربران"
                value={stats?.totalUsers || 0}
                color="purple"
                href="/admin/users"
              />
              <StatCard
                icon={FaUserMd}
                title="دامپزشکان"
                value={stats?.totalVeterinarians || 0}
                color="red"
                href="/admin/veterinarians"
              />
              <StatCard
                icon={FaTruck}
                title="اسب‌کش‌ها"
                value={stats?.totalTransporters || 0}
                color="indigo"
                href="/admin/transporters"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">عملیات سریع</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/blog/new"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition"
            >
              <FaPlus className="text-primary-600" />
              <span>مقاله جدید</span>
            </Link>
            <Link
              href="/admin/products/new"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition"
            >
              <FaPlus className="text-primary-600" />
              <span>محصول جدید</span>
            </Link>
            <Link
              href="/admin/competitions/new"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition"
            >
              <FaPlus className="text-primary-600" />
              <span>مسابقه جدید</span>
            </Link>
            {userRole === 'admin' && (
              <Link
                href="/admin/users"
                className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition"
              >
                <FaUsers className="text-primary-600" />
                <span>مدیریت کاربران</span>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">آخرین مقالات</h2>
            <RecentPosts />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">آخرین محصولات</h2>
            <RecentProducts />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  color, 
  href 
}: { 
  icon: any; 
  title: string; 
  value: number; 
  color: string; 
  href: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  };

  return (
    <Link
      href={href}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString('fa-IR')}</p>
        </div>
        <div className={`p-4 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="text-2xl" />
        </div>
      </div>
    </Link>
  );
}

function RecentPosts() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    blogAPI.getPosts({ limit: 5 })
      .then(res => setPosts(res.data.data.posts))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-3">
      {posts.length === 0 ? (
        <p className="text-gray-500 text-sm">مقاله‌ای وجود ندارد</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
            <div className="flex-1">
              <p className="font-semibold text-sm">{post.title}</p>
              <p className="text-xs text-gray-500">
                {new Date(post.published_at).toLocaleDateString('fa-IR')}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/blog/${post.id}/edit`}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <FaEdit />
              </Link>
              <Link
                href={`/blog/${post.slug}`}
                className="p-2 text-green-600 hover:bg-green-50 rounded"
                target="_blank"
              >
                <FaEye />
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function RecentProducts() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    shopAPI.getProducts({ limit: 5 })
      .then(res => setProducts(res.data.data.products))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-3">
      {products.length === 0 ? (
        <p className="text-gray-500 text-sm">محصولی وجود ندارد</p>
      ) : (
        products.map((product) => (
          <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
            <div className="flex-1">
              <p className="font-semibold text-sm">{product.name}</p>
              <p className="text-xs text-gray-500">
                {Number(product.price).toLocaleString('fa-IR')} تومان
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <FaEdit />
              </Link>
              <Link
                href={`/shop/${product.slug}`}
                className="p-2 text-green-600 hover:bg-green-50 rounded"
                target="_blank"
              >
                <FaEye />
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

