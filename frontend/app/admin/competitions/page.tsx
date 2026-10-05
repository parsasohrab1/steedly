'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { competitionsAPI } from '@/lib/api';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa';

export default function AdminCompetitionsPage() {
  const router = useRouter();
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCompetitions();
  }, [search]);

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      const response = await competitionsAPI.getCompetitions();
      if (response.data.success) {
        let filtered = response.data.data;
        if (search) {
          filtered = filtered.filter((comp: any) =>
            comp.title.toLowerCase().includes(search.toLowerCase())
          );
        }
        setCompetitions(filtered);
      }
    } catch (error) {
      console.error('Error loading competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this competition?')) {
      return;
    }
    try {
      // TODO: Implement delete competition API when available
      alert('Deleting competitions will be enabled soon');
      // await competitionsAPI.deleteCompetition(id);
      // loadCompetitions();
    } catch (error) {
      alert('Error deleting the competition');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Competition management</h1>
        <Link
          href="/admin/competitions/new"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
        >
          <FaPlus />
          New competition
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute right-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search competitions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Competitions Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {competitions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No competitions found
                  </td>
                </tr>
              ) : (
                competitions.map((competition) => (
                  <tr key={competition.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{competition.title}</div>
                      {competition.is_international && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 inline-block">
                          International
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{competition.competition_type}</td>
                    <td className="px-6 py-4 text-sm">{competition.location}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(competition.start_date).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/competitions/${competition.slug}`}
                          target="_blank"
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="View"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          href={`/admin/competitions/${competition.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(competition.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
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
    </div>
  );
}

