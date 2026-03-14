import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const limit = searchParams.get("limit") || "10";

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  const token = process.env.PREDICTHQ_ACCESS_TOKEN;
  if (!token || token === "your_predicthq_token_here") {
    return NextResponse.json({ error: "PredictHQ token not configured" }, { status: 503 });
  }

  try {
    const params = new URLSearchParams({
      "location_around.origin": `${lat},${lng}`,
      "location_around.offset": "10km",
      limit,
      sort: "start",
      category: "festivals,performing-arts,community,expos,concerts,sports",
    });

    if (startDate) params.set("start.gte", startDate);
    if (endDate) params.set("start.lte", endDate);

    const res = await fetch(
      `https://api.predicthq.com/v1/events/?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      console.error("PredictHQ error:", await res.text());
      return NextResponse.json({ error: "Events fetch failed" }, { status: 502 });
    }

    const data = await res.json();
    const results = data.results || [];

    const events = results.map((e: any, index: number) => ({
      id: `phq-${e.id || index}`,
      name: e.title || "Event",
      city: e.geo?.address?.locality || "",
      date: e.start ? e.start.substring(0, 10) : "",
      price: 0,
      currency: "INR",
      venue: e.geo?.address?.formatted_address || e.location?.[1] ? `${e.location[1]}, ${e.location[0]}` : "",
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
      description: e.description || `${e.category} event`,
      category: e.category ? e.category.charAt(0).toUpperCase() + e.category.slice(1) : "Event",
      url: e.url || "",
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error("Events error:", error);
    return NextResponse.json({ error: "Events service unavailable" }, { status: 500 });
  }
}
