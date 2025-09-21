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

      // Track recently solved problems
      for (const id of updatedIds) {
        const timestamp = Date.now();

        // Get question details from database
        const { rows } = await sql`
          SELECT id, url, numberofrevision
          FROM questions
          WHERE id = ${id}
        `;

        if (rows.length > 0) {
          const question = rows[0];
          const title = question.url
            .split('/problems/')[1]
            ?.split('/')[0]
            ?.replace(/-/g, ' ') || `Problem ${id}`;

          // Store in a sorted set with timestamp as score for ordering
          await redis.zadd('recent_solved', {
            score: timestamp,
            member: JSON.stringify({
              id: question.id,
              url: question.url,
              title: title,
              solvedAt: new Date(timestamp).toISOString(),
              revisions: question.numberofrevision
            })
          });

          // Keep only the 10 most recent entries
          const count = await redis.zcard('recent_solved');
          if (count > 10) {
            await redis.zremrangebyrank('recent_solved', 0, -11);
          }
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