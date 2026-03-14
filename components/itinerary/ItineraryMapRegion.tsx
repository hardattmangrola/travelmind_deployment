"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2, MapPin, Star, Clock } from "lucide-react";

// Dynamically import map to avoid SSR issues with Leaflet
const ActivityMap = dynamic(() => import("@/components/map/ActivityMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-colItems-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto mt-20" />
    </div>
  ),
});

interface Activity {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description?: string;
  image?: string;
  rating?: number;
  duration?: number;
  city?: string;
  price?: number;
  currency?: string;
}

export function ItineraryMapRegion({
  itineraryId,
  destination,
  country,
}: {
  itineraryId: string;
  destination: string;
  country?: string;
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredActivity, setHoveredActivity] = useState<Activity | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMapData() {
      if (!destination || !itineraryId) return;

      try {
        setIsLoading(true);
        // 1. Get destination center as fallback
        const query = country ? `${destination}, ${country}` : destination;
        const geoRes = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`);
        const geoData = geoRes.ok ? await geoRes.json() : [];
        let center: [number, number] | null = null;
        
        if (geoData.length > 0) {
          center = [parseFloat(geoData[0].lat), parseFloat(geoData[0].lng)];
        }

        // 2. Fetch user's planned activities
        const actRes = await fetch(`/api/itinerary/${itineraryId}/activities`);
        const userActivities = actRes.ok ? await actRes.json() : [];

        // 3. Geocode each activity location sequentially
        const mappedActivities: Activity[] = [];
        for (const act of userActivities) {
          if (act.location) {
            // A slight delay to prevent strict rate limiting from open API geocoders
            await new Promise((r) => setTimeout(r, 600)); 
            try {
              const actGeoRes = await fetch(`/api/geocode?query=${encodeURIComponent(act.location)}`);
              const actGeoData = actGeoRes.ok ? await actGeoRes.json() : [];
              
              if (actGeoData.length > 0) {
                const lat = parseFloat(actGeoData[0].lat);
                const lng = parseFloat(actGeoData[0].lng);
                
                mappedActivities.push({
                  id: act.id,
                  name: act.title,
                  category: act.type,
                  lat,
                  lng,
                  description: act.description || "Activity planned for your trip.",
                  duration: act.startTime && act.endTime ? 60 : undefined,
                  image: `https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=400&height=300&center=lonlat:${lng},${lat}&zoom=15&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "YOUR_KEY"}`,
                });
              }
            } catch (e) {
              console.error("Failed to geocode activity:", act.title);
            }
          }
        }

        if (!isMounted) return;

        // If we found local activities, maybe center map perfectly on the first one
        if (mappedActivities.length > 0 && !center) {
          center = [mappedActivities[0].lat, mappedActivities[0].lng];
        }

        if (center) setMapCenter(center);
        setActivities(mappedActivities);

      } catch (error) {
        console.error("Map Region Error:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchMapData();

    return () => {
      isMounted = false;
    };
  }, [destination, country, itineraryId]);

  return (
    <div className="relative h-full min-h-[300px] w-full bg-slate-50" data-html2canvas-ignore="true">
      {isLoading || !mapCenter ? (
        <div className="flex h-full min-h-[300px] flex-col items-center justify-center bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]">
          {isLoading ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
              <p className="mt-3 text-sm text-slate-500">Mapping your itinerary...</p>
            </div>
          ) : (
            <div className="text-center text-slate-500 flex flex-col items-center">
              <MapPin className="mb-2 size-8 text-indigo-500 opacity-50" />
              <p className="font-medium text-slate-700">Map unavailable</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <ActivityMap
            activities={activities}
            center={mapCenter}
            onHover={setHoveredActivity}
            onLeave={() => setHoveredActivity(null)}
          />

          <div className="absolute top-3 left-3 z-[1000] rounded-xl bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-lg border border-slate-200 backdrop-blur-sm">
            {activities.length} planned locations mapped
          </div>

          {hoveredActivity && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[340px] overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex gap-4 p-4">
                {hoveredActivity.image && !hoveredActivity.image.includes("YOUR_KEY") && (
                  <img
                    src={hoveredActivity.image}
                    alt={hoveredActivity.name}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">{hoveredActivity.name}</h3>
                  <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{hoveredActivity.description}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5">
                      {hoveredActivity.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
