import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  if (!city) {
    return NextResponse.json({ error: "city parameter is required" }, { status: 400 });
  }

  try {
    // Step 1: Search for city slug via Teleport (with 3s timeout)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    let searchRes;
    try {
      searchRes = await fetch(
        `https://api.teleport.org/api/cities/?search=${encodeURIComponent(city)}&limit=1`,
        { signal: controller.signal }
      );
    } catch {
      return NextResponse.json(getFallbackCityInfo(city));
    } finally {
      clearTimeout(timeout);
    }

    if (!searchRes.ok) {
      return NextResponse.json(getFallbackCityInfo(city));
    }

    const searchData = await searchRes.json();
    const cityItem = searchData?._embedded?.["city:search-results"]?.[0];
    
    if (!cityItem) {
      return NextResponse.json(getFallbackCityInfo(city));
    }

    const cityHref = cityItem?._links?.["city:item"]?.href;
    if (!cityHref) {
      return NextResponse.json(getFallbackCityInfo(city));
    }

    // Step 2: Get city details
    const cityRes = await fetch(cityHref);
    if (!cityRes.ok) {
      return NextResponse.json(getFallbackCityInfo(city));
    }

    const cityData = await cityRes.json();
    const urbanAreaHref = cityData?._links?.["city:urban_area"]?.href;

    if (!urbanAreaHref) {
      return NextResponse.json({
        name: cityData.name || city,
        country: cityData?._links?.["city:country"]?.name || "",
        safetyScore: 7,
        costOfLiving: 5,
        qualityOfLife: 6,
        currency: "USD",
        timezone: cityData?.timezone || "UTC",
        language: "English",
      });
    }

    // Step 3: Get urban area scores
    const scoresRes = await fetch(`${urbanAreaHref}scores/`);
    const scoresData = scoresRes.ok ? await scoresRes.json() : null;

    const scores = scoresData?.categories || [];
    const safety = scores.find((c: any) => c.name === "Safety")?.score_out_of_10 || 7;
    const costOfLiving = scores.find((c: any) => c.name === "Cost of Living")?.score_out_of_10 || 5;
    const qualityOfLife = scores.find((c: any) => c.name === "Quality of Life" || c.name === "Commute")?.score_out_of_10 || 6;

    // Step 4: Get urban area details
    const detailsRes = await fetch(urbanAreaHref);
    const detailsData = detailsRes.ok ? await detailsRes.json() : null;

    return NextResponse.json({
      name: cityData.name || city,
      country: detailsData?.full_name?.split(",").pop()?.trim() || "",
      safetyScore: Math.round(safety * 10) / 10,
      costOfLiving: Math.round(costOfLiving * 10) / 10,
      qualityOfLife: Math.round(qualityOfLife * 10) / 10,
      currency: "USD",
      timezone: cityData?.timezone || "UTC",
      language: "English",
    });
  } catch (error) {
    console.error("City info error:", error);
    return NextResponse.json(getFallbackCityInfo(city));
  }
}

function getFallbackCityInfo(city: string) {
  return {
    name: city,
    country: "",
    safetyScore: 7,
    costOfLiving: 5,
    qualityOfLife: 6,
    currency: "USD",
    timezone: "UTC",
    language: "English",
  };
}
