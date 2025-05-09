import Image from "next/image";

interface BusinessCardProps {
  business: {
    id: string;
    name: string;
    description: string;
    type: string;
    phone: string;
    email: string;
    website: string;
    latitude: number;
    longitude: number;
    operating_hours: any;
    has_delivery: boolean;
    has_free_wifi: boolean;
    image: string;
  };
  onEdit: (business: BusinessCardProps["business"]) => void;
}

export default function BusinessCard({ business, onEdit }: BusinessCardProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="relative h-48 w-full">
        {business.image ? (
          <Image
            src={business.image}
            alt={business.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{business.type}</p>

        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {business.description}
        </p>

        <div className="mt-4 space-y-2">
          {business.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {business.phone}
            </div>
          )}

          {business.email && (
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {business.email}
            </div>
          )}

          {business.website && (
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500"
              >
                {business.website}
              </a>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center space-x-2">
          {business.has_delivery && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Delivery Available
            </span>
          )}
          {business.has_free_wifi && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Free WiFi
            </span>
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={() => onEdit(business)}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Business
          </button>
        </div>
      </div>
    </div>
  );
}
