import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const categories = searchParams.get("categories") || "tourism.sights,tourism.attraction,catering.restaurant,entertainment,leisure,sport";
  const radius = searchParams.get("radius") || "5000";
  const limit = searchParams.get("limit") || "20";

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey || apiKey === "your_geoapify_key_here") {
    return NextResponse.json({ error: "Geoapify API key not configured" }, { status: 503 });
  }

  try {
    const params = new URLSearchParams({
      categories,
      filter: `circle:${lng},${lat},${radius}`,
      limit,
      apiKey,
    });

    const res = await fetch(
      `https://api.geoapify.com/v2/places?${params.toString()}`
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("Geoapify error:", text);
      return NextResponse.json({ error: "Places fetch failed" }, { status: 502 });
    }

    const data = await res.json();
    const features = data.features || [];

    const activities = features.map((f: any, index: number) => {
      const props = f.properties || {};
      const categories = props.categories || [];
      const category = mapGeoapifyCategory(categories);

      return {
        id: `geoapify-${props.place_id || index}`,
        name: props.name || props.address_line1 || "Unknown Place",
        city: props.city || props.county || "",
        category,
        price: 0,
        currency: "INR",
        duration: 60,
        rating: props.rank ? Math.min(5, props.rank / 2) : 4.0,
        image: `https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=400&height=300&center=lonlat:${props.lon},${props.lat}&zoom=15&apiKey=${apiKey}`,
        description: props.formatted || props.address_line2 || "",
        lat: props.lat,
        lng: props.lon,
        openingHours: props.opening_hours || "",
        externalId: props.place_id || `geoapify-${index}`,
      };
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Places error:", error);
    return NextResponse.json({ error: "Places service unavailable" }, { status: 500 });
  }
}

function mapGeoapifyCategory(categories: string[]): string {
  const joined = categories.join(",");
  if (joined.includes("beach")) return "beach";
  if (joined.includes("catering") || joined.includes("restaurant")) return "restaurant";
  if (joined.includes("museum") || joined.includes("heritage")) return "museum";
  if (joined.includes("sport") || joined.includes("adventure")) return "adventure";
  if (joined.includes("entertainment") || joined.includes("nightlife")) return "nightlife";
  if (joined.includes("shop") || joined.includes("commercial")) return "shopping";
  if (joined.includes("natural") || joined.includes("park")) return "nature";
  if (joined.includes("healthcare") || joined.includes("wellness") || joined.includes("spa")) return "wellness";
  return "culture";
}
