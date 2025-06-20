
import sys

def fetchQuestionfromDB(conn):
    try:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, url
            FROM questions
            WHERE numberofrevision = (
                SELECT MIN(numberofrevision) FROM questions
            )
            ORDER BY RANDOM()
            LIMIT 2;
        """)

        results = cursor.fetchall()

        cursor.close()
        conn.close()

        print("📌 Fetched questions with minimum revision randomly:", results)
        return results

    except Exception as e:
        print(f"❌ Error fetching questions: {e}", file=sys.stderr)
        return []
