'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { competitionsAPI } from '@/lib/api';
import { FaArrowRight, FaCalendarAlt, FaMapMarkerAlt, FaTrophy, FaFlag } from 'react-icons/fa';

interface Competition {
  id: number;
  title: string;
  slug: string;
  description: string;
  competition_type: string;
  location: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  prize_info: string;
  conditions: string;
  image_url: string;
  is_international: boolean;
}

interface CompetitionResult {
  id: number;
  position: number;
  participant_name: string;
  horse_name: string;
  score: number;
  notes: string;
}

export default function CompetitionPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (slug) {
      loadCompetition();
    }
  }, [slug]);

  const loadCompetition = async () => {
    try {
      const response = await competitionsAPI.getCompetition(slug);
      if (response.data.success) {
        setCompetition(response.data.data);
        // Check if competition has ended to show results
        const endDate = new Date(response.data.data.end_date);
        if (endDate < new Date()) {
          loadResults(response.data.data.id);
        }
      }
    } catch (error) {
      console.error('Error loading competition:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async (id: number) => {
    try {
      const response = await competitionsAPI.getResults(id.toString());
      if (response.data.success) {
        setResults(response.data.data);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error loading results:', error);
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

  if (!competition) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">مسابقه یافت نشد</h1>
          <Link href="/competitions" className="text-primary-600 hover:text-primary-700">
            بازگشت به مسابقات
          </Link>
        </div>
      </div>
    );
  }

  const isUpcoming = new Date(competition.start_date) > new Date();
  const isOngoing = new Date(competition.start_date) <= new Date() && new Date(competition.end_date) >= new Date();
  const isEnded = new Date(competition.end_date) < new Date();
  const canRegister = competition.registration_deadline && new Date(competition.registration_deadline) > new Date();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-600">
          <li><Link href="/" className="hover:text-primary-600">خانه</Link></li>
          <li><FaArrowRight className="text-xs" /></li>
          <li><Link href="/competitions" className="hover:text-primary-600">مسابقات</Link></li>
          <li><FaArrowRight className="text-xs" /></li>
          <li className="text-gray-900">{competition.title}</li>
        </ol>
      </nav>

      {/* Competition Header */}
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {competition.image_url && (
          <div className="relative w-full h-96 bg-gray-200">
            <Image
              src={competition.image_url}
              alt={competition.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="p-8">
          {/* Type and Status */}
          <div className="flex items-center gap-4 mb-4">
            <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
              {competition.competition_type}
            </span>
            {competition.is_international && (
              <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold flex items-center gap-2">
                <FaFlag />
                بین‌المللی
              </span>
            )}
            {isUpcoming && (
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                در پیش است
              </span>
            )}
            {isOngoing && (
              <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                در حال برگزاری
              </span>
            )}
            {isEnded && (
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                پایان یافته
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-6 text-gray-900">{competition.title}</h1>

          {/* Key Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b">
            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-primary-600 text-xl mt-1" />
              <div>
                <p className="text-sm text-gray-600">مکان</p>
                <p className="font-semibold">{competition.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaCalendarAlt className="text-primary-600 text-xl mt-1" />
              <div>
                <p className="text-sm text-gray-600">تاریخ شروع</p>
                <p className="font-semibold">
                  {new Date(competition.start_date).toLocaleDateString('fa-IR')}
                </p>
              </div>
            </div>
            {competition.end_date && (
              <div className="flex items-start gap-3">
                <FaCalendarAlt className="text-primary-600 text-xl mt-1" />
                <div>
                  <p className="text-sm text-gray-600">تاریخ پایان</p>
                  <p className="font-semibold">
                    {new Date(competition.end_date).toLocaleDateString('fa-IR')}
                  </p>
                </div>
              </div>
            )}
            {competition.registration_deadline && (
              <div className="flex items-start gap-3">
                <FaCalendarAlt className="text-primary-600 text-xl mt-1" />
                <div>
                  <p className="text-sm text-gray-600">مهلت ثبت‌نام</p>
                  <p className="font-semibold">
                    {new Date(competition.registration_deadline).toLocaleDateString('fa-IR')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {competition.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">توضیحات</h2>
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: competition.description }}
              />
            </div>
          )}

          {/* Prize Info */}
          {competition.prize_info && (
            <div className="mb-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <FaTrophy className="text-yellow-600" />
                جوایز
              </h3>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: competition.prize_info }}
              />
            </div>
          )}

          {/* Conditions */}
          {competition.conditions && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">شرایط شرکت</h2>
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: competition.conditions }}
              />
            </div>
          )}

          {/* Registration Button */}
          {canRegister && (
            <div className="mt-8 pt-8 border-t">
              <button className="w-full bg-primary-600 text-white px-6 py-4 rounded-lg hover:bg-primary-700 transition font-semibold text-lg">
                ثبت‌نام در مسابقه
              </button>
            </div>
          )}
        </div>
      </article>

      {/* Results */}
      {showResults && results.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">نتایج مسابقه</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-4">رتبه</th>
                  <th className="text-right p-4">شرکت‌کننده</th>
                  <th className="text-right p-4">نام اسب</th>
                  <th className="text-right p-4">امتیاز</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-bold">{result.position}</td>
                    <td className="p-4">{result.participant_name}</td>
                    <td className="p-4">{result.horse_name}</td>
                    <td className="p-4">{result.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

