import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

async function fetchQuestionFromDB() {
  const result = await sql`
    SELECT id, url
    FROM questions
    WHERE numberofrevision = (
      SELECT MIN(numberofrevision) FROM questions
    )
    ORDER BY RANDOM()
    LIMIT 2;
  `;
  
  return result.rows;
}

async function sendEmail(results: any[]) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const userId = process.env.EMAILJS_USER_ID;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (results.length < 2) {
    return;
  }

  const [firstQuestion, secondQuestion] = results;

  const templateParams = {
    to_email: "bismansahni@outlook.com",
    subject: "Your Random Questions",
    first_question_id: firstQuestion.id,
    first_question_url: firstQuestion.url,
    second_question_id: secondQuestion.id,
    second_question_url: secondQuestion.url,
  };

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: userId,
    template_params: templateParams
  };

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${privateKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.statusText}`);
  }
}

async function dailyDBUpdate() {
  const url = "https://leetcode.com/graphql";

  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        title
        titleSlug
        timestamp
      }
    }
  `;

  const payload = {
    query,
    variables: {
      username: "bismansahni",
      limit: 10
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Referer": "https://leetcode.com"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  const submissions = data.data.recentAcSubmissionList;

  for (const sub of submissions) {
    const fullUrl = `https://leetcode.com/problems/${sub.titleSlug}/`;
    
    const existing = await sql`
      SELECT 1 FROM questions WHERE url = ${fullUrl}
    `;
    
    if (existing.rows.length === 0) {
      await sql`
        INSERT INTO questions (url, numberofrevision, last_sent_date)
        VALUES (${fullUrl}, 0, NULL)
      `;
    }
  }

  return submissions;
}

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

    const results = await fetchQuestionFromDB();
    await sendEmail(results);
    await dailyDBUpdate();

    return NextResponse.json({
      status: "success",
      questions: results.map(row => ({ id: row.id, url: row.url }))
    });

  } catch (error) {
    console.error("Error in hit-main:", error);
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}