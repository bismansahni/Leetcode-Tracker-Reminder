from flask import Flask, jsonify, request
import os
from psycopg2 import pool
from dotenv import load_dotenv
import sys

from controllers.fetchQuestion import fetchQuestionfromDB
from controllers.sendEmail import send_email
from controllers.DailyDbupdate import DailyDBUpdate

load_dotenv()

app = Flask(__name__)

connection_pool = None

def connectDB():
    global connection_pool
    try:
        if connection_pool is None:
            connection_pool = pool.SimpleConnectionPool(
                minconn=1,
                maxconn=5,
                dsn=os.getenv('DATABASE_URL')
            )
            print("✅ Connection pool created successfully")

        conn = connection_pool.getconn()
        if conn is None:
            raise Exception("Failed to get connection from pool")
        
        connection_pool.putconn(conn)

    except Exception as e:
        print(f"❌ Database connection error: {e}", file=sys.stderr)
        raise

@app.route("/HitMain")
def hit_main():
    try:
        token = request.args.get("token")
        expected_token = os.getenv("SECRET_TOKEN")

        if token != expected_token:
            return jsonify({"status": "unauthorized", "message": "Invalid or missing token"}), 401

        connectDB()
        results = fetchQuestionfromDB(connection_pool)
        send_email(results)
        DailyDBUpdate(connection_pool)

        return jsonify({
            "status": "success",
            "questions": [{"id": row[0], "url": row[1]} for row in results]
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
