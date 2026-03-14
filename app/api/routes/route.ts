import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { coordinates, profile = "driving-car" } = body;

  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
    return NextResponse.json(
      { error: "coordinates array with at least 2 [lng, lat] pairs is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey || apiKey === "your_openrouteservice_key_here") {
    return NextResponse.json({ error: "OpenRouteService API key not configured" }, { status: 503 });
  }

  try {
    const res = await fetch(
      `https://api.openrouteservice.org/v2/directions/${profile}`,
      {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coordinates }),
      }
    );

    if (!res.ok) {
      console.error("ORS error:", await res.text());
      return NextResponse.json({ error: "Route calculation failed" }, { status: 502 });
    }

    const data = await res.json();
    const route = data.routes?.[0];

    if (!route) {
      return NextResponse.json({ error: "No route found" }, { status: 404 });
    }

    const segments = route.segments?.map((seg: any) => ({
      distanceKm: Math.round((seg.distance / 1000) * 10) / 10,
      durationMinutes: Math.round(seg.duration / 60),
    })) || [];

    return NextResponse.json({
      totalDistanceKm: Math.round((route.summary.distance / 1000) * 10) / 10,
      totalDurationMinutes: Math.round(route.summary.duration / 60),
      segments,
    });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Route service unavailable" }, { status: 500 });
  }
}
