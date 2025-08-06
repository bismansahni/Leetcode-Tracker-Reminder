import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    const expectedToken = process.env.SECRET_TOKEN;

    if (token !== expectedToken) {
      return NextResponse.json(
        { status: "unauthorized", message: "Invalid or missing token" },
        { status: 401 }
      );
    }

    const id1 = request.nextUrl.searchParams.get('id1');
    const id2 = request.nextUrl.searchParams.get('id2');

    if (!id1 && !id2) {
      return NextResponse.json(
        { status: "error", message: "At least one question ID (id1 or id2) is required" },
        { status: 400 }
      );
    }

    const updatedIds = [];
    if (id1) updatedIds.push(parseInt(id1));
    if (id2) updatedIds.push(parseInt(id2));

    if (updatedIds.length === 1) {
      await sql`
        UPDATE questions
        SET numberofrevision = numberofrevision + 1
        WHERE id = ${updatedIds[0]}
      `;
    } else {
      await sql`
        UPDATE questions
        SET numberofrevision = numberofrevision + 1
        WHERE id = ${updatedIds[0]} OR id = ${updatedIds[1]}
      `;
    }

    return NextResponse.json({
      status: "success",
      message: `Revisions updated successfully for ID(s): ${updatedIds.join(', ')}`,
      updated_ids: updatedIds
    });

  } catch (error) {
    console.error("Error in commit-question:", error);
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}