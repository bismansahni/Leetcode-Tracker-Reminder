
import requests
import sys

def DailyDBUpdate(conn):
    url = "https://leetcode.com/graphql"

    query = """
    query recentAcSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
            title
            titleSlug
            timestamp
        }
    }
    """

    payload = {
        "query": query,
        "variables": {
            "username": "bismansahni",
            "limit": 10
        }
    }

    headers = {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()

        if "errors" in data:
            print("❌ GraphQL errors:", data["errors"])
            return []

        submissions = data["data"]["recentAcSubmissionList"]

        print("✅ Recent Accepted Submissions:")

        cursor = conn.cursor()

        for i, sub in enumerate(submissions, 1):
            full_url = f"https://leetcode.com/problems/{sub['titleSlug']}/"
            print(f"{i}. {sub['title']} ,  {full_url}")

            cursor.execute("SELECT 1 FROM questions WHERE url = %s;", (full_url,))
            
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO questions (url, numberofrevision, last_sent_date)
                    VALUES (%s, %s, %s);
                """, (full_url, 0, None))
                print(f"📥 Inserted into DB: {full_url}")

        conn.commit()
        cursor.close()
        conn.close()

        return submissions

    except Exception as e:
        print(f"❌ Error during DB update: {e}", file=sys.stderr)
        return []
