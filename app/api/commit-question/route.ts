import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import {getRedis} from "@/lib/redis";

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

    try {
      const redis = getRedis();

      // @ts-ignore
      const [firstIdStr, secondIdStr] = await redis.mget<string>(
          'first_question_id', 'second_question_id'
      );

      const firstId = firstIdStr ? Number(firstIdStr) : null;
      const secondId = secondIdStr ? Number(secondIdStr) : null;

      // Helper to set a solved flag while keeping the remaining TTL
      const setSolvedKeepingTTL = async (solvedKey: 'first_question_solved' | 'second_question_solved') => {
        const ttl = await redis.ttl(solvedKey);
        if (ttl > 0) {
          await redis.set(solvedKey, 'true', { ex: ttl });
        } else {
          // if no TTL on the key (or missing), just set true without TTL
          await redis.set(solvedKey, 'true');
        }
      };

      for (const id of updatedIds) {
        if (firstId !== null && id === firstId) {
          await setSolvedKeepingTTL('first_question_solved');
        }
        if (secondId !== null && id === secondId) {
          await setSolvedKeepingTTL('second_question_solved');
        }
      }
    } catch (e) {
      console.error('[commit-question] redis update failed:', e);
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