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
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const polls = await prisma.poll.findMany({
      where: { itineraryId: id },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        options: {
          include: {
            votes: {
              include: {
                user: {
                  select: { id: true, name: true, image: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(polls);
  } catch (error) {
    console.error("[POLLS_GET]", error);
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
    const { question, options } = body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: "Question and at least 2 options are required" },
        { status: 400 }
      );
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

    const newPoll = await prisma.poll.create({
      data: {
        itineraryId: id,
        question,
        createdBy: session.user.id,
        options: {
          create: options.map((opt: string) => ({ text: opt })),
        },
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        options: {
          include: {
            votes: true,
          },
        },
      },
    });

    return NextResponse.json(newPoll, { status: 201 });
  } catch (error) {
    console.error("[POLLS_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
