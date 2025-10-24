// app/clinics/[id]/page.tsx
// export const runtime = 'edge';
export const dynamic = 'force-dynamic';


// app/clinics/[id]/page.tsx
import { createSupabaseClient } from '@/lib/supabase';
import { Clinic } from '@/lib/dataTypes';
import { getPhotoUrl } from '@/lib/googlePlaces';
import Link from 'next/link';
import ClinicBanner from '@/components/ClinicBanner';
import { notFound } from 'next/navigation';



// ----------------------
// 1. Updated for Next.js 15 - params is now a Promise
interface ClinicPageProps {
  params: Promise<{
    id: string;
  }>;
}
// ----------------------

// Server-side data fetching
async function getClinic(id: string): Promise<Clinic | null> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('place_id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Clinic;
}

// ----------------------
// 2. Await the params promise before using
export default async function ClinicDetailPage({ params }: ClinicPageProps) {
  // CRITICAL: Await params in Next.js 15+
  const { id } = await params;
// ----------------------

  const clinic = await getClinic(id);
  
  if (!clinic) {
    notFound();
  }

  const photos = clinic.photos?.slice(0, 4) || [];
  const hasPhotos = photos.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Directory
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Image */}
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
          <ClinicBanner
            clinicName={clinic.display_name}
            placeId={clinic.place_id}
            rating={clinic.rating}
            website={clinic.website}
            className="w-full h-64 md:h-80 object-cover"
          />
        </div>

        {/* Additional Photos Grid */}
        {hasPhotos && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-lg overflow-hidden">
              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={getPhotoUrl(photo.name, 400, 300)}
                  alt={`${clinic.display_name} photo ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform duration-200"
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {clinic.display_name}
                  </h1>
                  <p className="text-gray-600">{clinic.primary_type?.replace(/_/g, ' ')}</p>
                </div>

                {clinic.current_open_now !== undefined && (
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      clinic.current_open_now
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {clinic.current_open_now ? '● Open Now' : '● Closed'}
                  </span>
                )}
              </div>

              {/* Rating */}
              {clinic.rating && (
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl text-yellow-400">★</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {clinic.rating.toFixed(1)}
                    </span>
                  </div>
                  {clinic.user_rating_count && (
                    <span className="text-gray-600">
                      Based on {clinic.user_rating_count} reviews
                    </span>
                  )}
                </div>
              )}

              {/* Business Status */}
              {clinic.business_status !== 'OPERATIONAL' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 font-medium">
                    {clinic.business_status === 'CLOSED_TEMPORARILY'
                      ? '⚠️ This clinic is temporarily closed'
                      : '❌ This clinic is permanently closed'}
                  </p>
                </div>
              )}
            </div>

            {/* Opening Hours */}
            {clinic.opening_hours?.weekday_text && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Opening Hours</h2>
                <div className="space-y-2">
                  {clinic.opening_hours.weekday_text.map((text, index) => (
                    <p key={index} className="text-gray-700">
                      {text}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Features & Amenities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clinic.accessibility_options?.wheelchair_accessible_entrance && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">Wheelchair Accessible Entrance</span>
                  </div>
                )}
                {clinic.accessibility_options?.wheelchair_accessible_parking && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">Wheelchair Accessible Parking</span>
                  </div>
                )}
                {clinic.accessibility_options?.wheelchair_accessible_restroom && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">Wheelchair Accessible Restroom</span>
                  </div>
                )}
                {clinic.parking_options?.free_parking_lot && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">Free Parking Lot</span>
                  </div>
                )}
                {clinic.parking_options?.paid_parking_lot && (
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">$</span>
                    <span className="text-gray-700">Paid Parking Lot</span>
                  </div>
                )}
                {clinic.payment_options?.accepts_credit_cards && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">Accepts Credit Cards</span>
                  </div>
                )}
                {clinic.payment_options?.accepts_cash_only && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">Cash Only</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>

              {/* Address */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
                <p className="text-gray-900">{clinic.formatted_address}</p>
              </div>

              {/* Phone */}
              {clinic.phone && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Phone</h3>
                  <a
                    href={`tel:${clinic.phone}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {clinic.phone}
                  </a>
                </div>
              )}

              {/* Website */}
              {clinic.website && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Website</h3>
                  <a
                    href={clinic.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium break-all"
                  >
                    Visit Website →
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {clinic.phone && (
                  <a
                    href={`tel:${clinic.phone}`}
                    className="block w-full text-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📞 Call Now
                  </a>
                )}

                <a
                  href={clinic.google_maps_uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  📍 Get Directions
                </a>

                {clinic.website && (
                  <a
                    href={clinic.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    🌐 Visit Website
                  </a>
                )}
              </div>
            </div>

            {/* Map Preview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Location</h2>
              <p className="text-gray-600 mb-3">View on Google Maps for directions.</p>
              {clinic.google_maps_uri && (
                <a
                  href={clinic.google_maps_uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  Open in Google Maps ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
