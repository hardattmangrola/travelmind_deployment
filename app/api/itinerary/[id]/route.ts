import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const itinerary = await prisma.itinerary.findUnique({
      where: { id },
      include: {
        wishlistItems: true,
        collaborators: true,
      },
    });

    if (!itinerary) {
      return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
    }

    // Check if user has access
    if (
      itinerary.userId !== session.user.id &&
      !itinerary.collaborators.some((c) => c.userId === session.user.id)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("Fetch itinerary error:", error);
    return NextResponse.json({ error: "Failed to fetch itinerary" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const itinerary = await prisma.itinerary.findUnique({
      where: { id },
    });

    if (!itinerary) {
      return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
    }

    if (itinerary.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.itinerary.update({
      where: { id },
      data: {
        title: body.title,
        destination: body.destination,
        country: body.country,
        coverImage: body.coverImage,
        startDate: body.startDate,
        endDate: body.endDate,
        totalDays: body.totalDays,
        totalBudget: body.totalBudget,
        currency: body.currency,
        travelers: body.travelers,
        travelStyle: body.travelStyle,
        days: body.days,
        status: body.status,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update itinerary error:", error);
    return NextResponse.json({ error: "Failed to update itinerary" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const itinerary = await prisma.itinerary.findUnique({
      where: { id },
    });

    if (!itinerary) {
      return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
    }

    if (itinerary.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.itinerary.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete itinerary error:", error);
    return NextResponse.json({ error: "Failed to delete itinerary" }, { status: 500 });
  }
}
