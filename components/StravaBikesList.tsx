"use client";
import { useState, useEffect } from "react";
import { Bike, MapPin } from "lucide-react";

interface StravaBike {
  id: string;
  name: string;
  nickname: string;
  distance: number;
  converted_distance: number;
  primary: boolean;
  retired: boolean;
  resource_state: number;
}

interface StravaBikesResponse {
  connected: boolean;
  bikes: StravaBike[];
  needsReauth?: boolean;
}

interface StravaBikesListProps {
  stravaConnected: boolean;
}

export default function StravaBikesList({
  stravaConnected,
}: StravaBikesListProps) {
  const [bikes, setBikes] = useState<StravaBike[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch bikes when Strava is connected
  useEffect(() => {
    if (stravaConnected) {
      fetchStravaBikes();
    } else {
      setBikes([]);
    }
  }, [stravaConnected]);

  const fetchStravaBikes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/strava/bikes");
      const data: StravaBikesResponse = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch bikes");
      }

      if (data.needsReauth) {
        setError(
          "Strava authorization expired. Please reconnect your account."
        );
        setBikes([]);
      } else {
        setBikes(data.bikes || []);
      }
    } catch (err) {
      console.error("Error fetching Strava bikes:", err);
      setError("Failed to load bikes from Strava");
      setBikes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDistance = (distanceInMeters: number): string => {
    const km = Math.round(distanceInMeters / 1000);
    return `${km.toLocaleString()} km`;
  };

  // Don't render anything if Strava is not connected
  if (!stravaConnected) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-6 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <Bike size={16} className="text-blue-600" />
          <h3 className="font-medium text-gray-900">Strava Bikes</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 border rounded-lg bg-red-50 border-red-200">
        <div className="flex items-center gap-2 mb-2">
          <Bike size={16} className="text-red-600" />
          <h3 className="font-medium text-red-900">Strava Bikes</h3>
        </div>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center gap-2 mb-4">
        <Bike size={16} className="text-blue-600" />
        <h3 className="font-medium text-gray-900">Strava Bikes</h3>
        <span className="text-sm text-gray-500">({bikes.length})</span>
      </div>

      {bikes.length === 0 ? (
        <p className="text-sm text-gray-600">
          No bikes found in your Strava account.
        </p>
      ) : (
        <div className="space-y-4">
          {bikes.map((bike) => (
            <div key={bike.id} className="bg-white p-4 rounded-lg border">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {bike.nickname || bike.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {bike.primary && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Primary
                      </span>
                    )}
                    {bike.retired && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Retired
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{formatDistance(bike.distance)}</span>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-400">
                Strava ID: {bike.id}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Bikes synced from your Strava account. Distance shows total recorded
        rides.
      </div>
    </div>
  );
}
