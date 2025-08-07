// import { NextRequest, NextResponse } from 'next/server';
// import { headers } from 'next/headers';
//
// export async function GET(request: NextRequest) {
//   const headersList = await headers();
//   const authHeader = headersList.get('authorization');
//
//   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
//     return NextResponse.json(
//       { message: 'Unauthorized' },
//       { status: 401 }
//     );
//   }
//
//   try {
//     // const baseUrl = process.env.VERCEL_URL
//
//     const host = request.headers.get('host');
//     const baseUrl = `https://${host}`;
//
//
//
//
//     const response = await fetch(`${baseUrl}/api/hit-main?token=${process.env.SECRET_TOKEN}`, {
//       method: 'GET',
//     });
//
//     const data = await response.json();
//
//     return NextResponse.json({
//       success: true,
//       data,
//       message: 'Daily update completed'
//     });
//   } catch (error) {
//     console.error('Cron job error:', error);
//     return NextResponse.json(
//       { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
    );
  }

  try {
    const host = request.headers.get('host');
    const baseUrl = `https://${host}`;

    const response = await fetch(`${baseUrl}/api/hit-main?token=${process.env.SECRET_TOKEN}`, {
      method: 'GET',
    });

    const rawText = await response.text();
    console.log('🔥 Raw response from /api/hit-main:', rawText);

    try {
      const data = JSON.parse(rawText);
      return NextResponse.json({
        success: true,
        data,
        message: 'Daily update completed',
      });
    } catch (err) {
      if (err instanceof Error) {
        console.error('❌ JSON parse error:', err.message);
      } else {
        console.error('❌ JSON parse error (non-Error):', err);
      }
      return NextResponse.json(
          {
            success: false,
            error: 'Invalid JSON returned from /api/hit-main',
            rawResponse: rawText,
          },
          { status: 500 }
      );
    }

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
    );
  }
}
