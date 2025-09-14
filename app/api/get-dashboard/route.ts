import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

type Question = {
    id: number;
    url: string;
    numberofrevision: number;
};

export async function GET(request: NextRequest) {
    try {

        const { rows: questions } = await sql<Question>`
      SELECT id, url, numberofrevision
      FROM questions
      ORDER BY id ASC
    `;

        const { rows: [metrics] } = await sql<{
            total: number;
            avg_rev: number | null;
            never_revised: number;
            needing_practice: number;
            well_practiced: number;
            practiced: number;
            mastered: number;
        }>`
      SELECT
        COUNT(*)::int                                          AS total,
        AVG(numberofrevision)::float                           AS avg_rev,
        SUM((numberofrevision = 0)::int)::int                  AS never_revised,
        SUM((numberofrevision BETWEEN 1 AND 2)::int)::int      AS needing_practice,
        SUM((numberofrevision >= 3)::int)::int                 AS well_practiced,
        SUM((numberofrevision BETWEEN 3 AND 4)::int)::int      AS practiced,
        SUM((numberofrevision >= 5)::int)::int                 AS mastered
      FROM questions
    `;

        const { rows: top5 } = await sql<{
            id: number;
            url: string;
            numberofrevision: number;
            title: string;
        }>`
      SELECT
        id,
        url,
        numberofrevision,
        REPLACE(
          SPLIT_PART(SPLIT_PART(url, '/problems/', 2), '/', 1),
          '-', ' '
        ) AS title
      FROM questions
      ORDER BY numberofrevision DESC, id ASC
      LIMIT 5
    `;

        const { rows: revisionDistribution } = await sql<{ bucket: string; count: number }>`
      WITH buckets AS (
        SELECT CASE
                 WHEN numberofrevision >= 6 THEN '6+'
                 ELSE numberofrevision::text
               END AS bucket
        FROM questions
      )
      SELECT bucket, COUNT(*)::int AS count
      FROM buckets
      GROUP BY bucket
      ORDER BY
        CASE bucket
          WHEN '0' THEN 0
          WHEN '1' THEN 1
          WHEN '2' THEN 2
          WHEN '3' THEN 3
          WHEN '4' THEN 4
          WHEN '5' THEN 5
          ELSE 6
        END
    `;

        return NextResponse.json(
            {
                status: 'success',
                questions,
                metrics: {
                    total: metrics.total,
                    averageRevisions: metrics.avg_rev ?? 0,
                    neverRevised: metrics.never_revised,
                    needingPractice: metrics.needing_practice,
                    wellPracticed: metrics.well_practiced,
                    practiced: metrics.practiced,
                    mastered: metrics.mastered,
                },
                top5,
                revisionDistribution,
            },
            {
                status: 200,
                headers: {
                    // Cache for 12h, allow stale while revalidating
                    'Cache-Control': 'public, max-age=43200, stale-while-revalidate=60',
                },
            }
        );
    } catch (error) {
        console.error('[get-dashboard] error:', error);
        return NextResponse.json(
            { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
