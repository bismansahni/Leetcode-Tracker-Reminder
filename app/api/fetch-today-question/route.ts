import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export async function GET() {
    try {
        const redis = getRedis();

        // @ts-ignore
        const [
            first_question_id,
            first_question_url,
            first_question_solved,
            second_question_id,
            second_question_url,
            second_question_solved,
        ] = await redis.mget(
            'first_question_id',
            'first_question_url',
            'first_question_solved',
            'second_question_id',
            'second_question_url',
            'second_question_solved'
        );

        return NextResponse.json(
            {
                status: 'success',
                first_question_id: first_question_id ?? null,
                first_question_url: first_question_url ?? null,
                first_question_solved: first_question_solved ?? null,
                second_question_id: second_question_id ?? null,
                second_question_url: second_question_url ?? null,
                second_question_solved: second_question_solved ?? null,
            },
            { status: 200, headers: { 'Cache-Control': 'no-store' } }
        );
    } catch (err) {
        console.error('[fetch-today-question][GET] error:', err);
        return NextResponse.json(
            { status: 'error', message: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
