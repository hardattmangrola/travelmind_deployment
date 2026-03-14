import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

// PATCH /api/invitations/[id] — Accept or decline an invitation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await request.json(); // "accept" | "decline"

    if (!["accept", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Find the invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        id,
        OR: [
          { receiverEmail: session.user.email },
          { receiverId: session.user.id },
        ],
        status: "pending",
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (action === "accept") {
      // Update invitation status and add as collaborator in a transaction
      await prisma.$transaction([
        prisma.invitation.update({
          where: { id },
          data: { status: "accepted", receiverId: session.user.id },
        }),
        prisma.itineraryCollaborator.upsert({
          where: {
            itineraryId_userId: {
              itineraryId: invitation.itineraryId,
              userId: session.user.id,
            },
          },
          update: { role: invitation.role },
          create: {
            itineraryId: invitation.itineraryId,
            userId: session.user.id,
            role: invitation.role,
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: "Invitation accepted!" });
    } else {
      await prisma.invitation.update({
        where: { id },
        data: { status: "declined" },
      });
      return NextResponse.json({ success: true, message: "Invitation declined" });
    }
  } catch (error) {
    console.error("Respond to invitation error:", error);
    return NextResponse.json({ error: "Failed to respond to invitation" }, { status: 500 });
  }
}
