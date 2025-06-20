# def fetchQuestionfromDB(pool):
#     try:
#         conn = pool.getconn()
#         cursor = conn.cursor()

#         cursor.execute("""
#             SELECT id, url
#             FROM questions
#             WHERE numberofrevision = (
#                 SELECT MIN(numberofrevision) FROM questions
#             )
#             ORDER BY RANDOM()
#             LIMIT 2;
#         """)

#         results = cursor.fetchall()

#         cursor.close()
#         pool.putconn(conn)

#         print("📌 Fetched questions with minimum revision randomly:", results)
#         return results

#     except Exception as e:
#         print(f"❌ Error fetching questions: {e}", file=sys.stderr)
#         return []



### THE TOP COMMENTED CODE IS THE ONE BEFORE WE HANDLED STALE CONNECTIONS 


import sys

def fetchQuestionfromDB(pool):
    try:
        conn = pool.getconn()
        if conn.closed != 0:
            conn = pool._getconn()  # handle stale connections

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
        pool.putconn(conn)

        print("📌 Fetched questions with minimum revision randomly:", results)
        return results

    except Exception as e:
        print(f"❌ Error fetching questions: {e}", file=sys.stderr)
        return []
