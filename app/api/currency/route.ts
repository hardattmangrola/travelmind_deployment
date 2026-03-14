import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || "USD";
  const to = searchParams.get("to") || "INR";

  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Currency conversion failed" }, { status: 502 });
    }

    const data = await res.json();

    return NextResponse.json({
      from: data.base,
      to,
      rate: data.rates?.[to] || null,
      date: data.date,
    });
  } catch (error) {
    console.error("Currency error:", error);
    return NextResponse.json({ error: "Currency service unavailable" }, { status: 500 });
  }
}
