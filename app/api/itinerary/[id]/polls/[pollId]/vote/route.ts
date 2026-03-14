import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; pollId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pollId } = await params;
    const { optionId } = await req.json();

    if (!optionId) {
      return NextResponse.json({ error: "Option ID is required" }, { status: 400 });
    }

    // Upsert vote for this user on this poll
    // Users can only vote once per poll due to the @@unique([pollId, userId]) constraint
    const vote = await prisma.vote.upsert({
      where: {
        pollId_userId: {
          pollId,
          userId: session.user.id,
        },
      },
      update: {
        optionId,
      },
      create: {
        pollId,
        optionId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(vote);
  } catch (error) {
    console.error("[POLL_VOTE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
