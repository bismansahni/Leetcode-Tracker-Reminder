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

    if (!id1 || !id2) {
      return NextResponse.json(
        { status: "error", message: "Missing question IDs" },
        { status: 400 }
      );
    }

    await sql`
      UPDATE questions
      SET numberofrevision = numberofrevision + 1
      WHERE id = ${id1}
    `;

    await sql`
      UPDATE questions
      SET numberofrevision = numberofrevision + 1
      WHERE id = ${id2}
    `;

    return NextResponse.json({
      status: "success",
      message: `Revisions updated successfully for IDs ${id1} and ${id2}`,
      updated_ids: [id1, id2]
    });

  } catch (error) {
    console.error("Error in commit-question:", error);
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}