import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const itineraries = await prisma.itinerary.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { collaborators: { some: { userId: session.user.id } } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        destination: true,
        country: true,
        coverImage: true,
        startDate: true,
        endDate: true,
        totalDays: true,
        totalBudget: true,
        currency: true,
        travelers: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(itineraries);
  } catch (error) {
    console.error("Fetch user itineraries error:", error);
    return NextResponse.json({ error: "Failed to fetch itineraries" }, { status: 500 });
  }
}
