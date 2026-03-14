import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lng,
      daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,weather_code",
      timezone: "auto",
    });

    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params.toString()}`
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Weather fetch failed" }, { status: 502 });
    }

    const data = await res.json();
    const daily = data.daily;

    if (!daily || !daily.time) {
      return NextResponse.json([]);
    }

    const weatherDays = daily.time.map((date: string, i: number) => {
      const code = daily.weather_code?.[i] || 0;
      return {
        date,
        tempMax: daily.temperature_2m_max?.[i] || 0,
        tempMin: daily.temperature_2m_min?.[i] || 0,
        condition: weatherCodeToCondition(code),
        precipitationChance: daily.precipitation_probability_max?.[i] || 0,
        windSpeed: daily.wind_speed_10m_max?.[i] || 0,
        icon: weatherCodeToIcon(code),
      };
    });

    return NextResponse.json(weatherDays);
  } catch (error) {
    console.error("Weather error:", error);
    return NextResponse.json({ error: "Weather service unavailable" }, { status: 500 });
  }
}

function weatherCodeToCondition(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  if (code <= 82) return "Rain Showers";
  if (code <= 86) return "Snow Showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

function weatherCodeToIcon(code: number): string {
  if (code === 0) return "sun";
  if (code <= 3) return "cloud-sun";
  if (code <= 48) return "cloud";
  if (code <= 67) return "cloud-rain";
  if (code <= 77) return "snowflake";
  if (code <= 82) return "cloud-rain";
  if (code <= 99) return "cloud-lightning";
  return "cloud";
}
