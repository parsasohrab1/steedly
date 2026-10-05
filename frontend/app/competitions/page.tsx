import Link from 'next/link';
import { competitionsAPI } from '@/lib/api';

async function getCompetitions() {
  try {
    const response = await competitionsAPI.getCompetitions();
    return response.data.data;
  } catch (error) {
    console.error('Error fetching competitions:', error);
    return [];
  }
}

export default async function CompetitionsPage() {
  const competitions = await getCompetitions();

  const competitionTypes: { [key: string]: string } = {
    race: 'Racing',
    jumping: 'Jumping',
    dressage: 'Dressage',
    polo: 'Polo',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Horse competitions</h1>

      {competitions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">No competitions have been registered yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition: any) => (
            <Link
              key={competition.id}
              href={`/competitions/${competition.slug}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              {competition.image_url && (
                <div className="h-48 bg-gray-200 relative">
                  <img
                    src={competition.image_url}
                    alt={competition.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded">
                    {competitionTypes[competition.competition_type] || competition.competition_type}
                  </span>
                  {competition.is_international && (
                    <span className="text-xs text-gray-500">International</span>
                  )}
                </div>
                <h2 className="text-xl font-bold mb-2">{competition.title}</h2>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {competition.description}
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>📍 {competition.location}</p>
                  <p>
                    📅 {new Date(competition.start_date).toLocaleDateString('fa-IR')}
                    {competition.end_date &&
                      ` - ${new Date(competition.end_date).toLocaleDateString('fa-IR')}`}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

