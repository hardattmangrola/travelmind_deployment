import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const activities = await prisma.activity.findMany({
      where: { itineraryId: id },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" }
      ],
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("[ACTIVITIES_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, date, startTime, endTime, location, description, type } = body;

    if (!title || !date) {
      return NextResponse.json({ error: "Title and Date are required" }, { status: 400 });
    }

    // Verify user can access itinerary
    const itinerary = await prisma.itinerary.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          { collaborators: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!itinerary) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const newActivity = await prisma.activity.create({
      data: {
        itineraryId: id,
        title,
        date,
        startTime,
        endTime,
        location,
        description,
        type: type || "activity",
        createdBy: session.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error("[ACTIVITIES_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
