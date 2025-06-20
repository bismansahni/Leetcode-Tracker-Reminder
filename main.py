from flask import Flask, jsonify, request
import os
import psycopg2
from dotenv import load_dotenv
import sys

from controllers.fetchQuestion import fetchQuestionfromDB
from controllers.sendEmail import send_email
from controllers.DailyDbupdate import DailyDBUpdate
from controllers.questionCommit import questionCommit

load_dotenv()

app = Flask(__name__)

def connectDB():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

@app.route("/")
def home():
    return "<p>Service is running.</p>"

@app.route("/CommitQuestion")
def commit_question():
    try:
        token = request.args.get("token")
        expected_token = os.getenv("SECRET_TOKEN")

        if token != expected_token:
            return jsonify({"status": "unauthorized", "message": "Invalid or missing token"}), 401

        conn = connectDB()
        return questionCommit(conn)

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/HitMain")
def hit_main():
    try:
        token = request.args.get("token")
        expected_token = os.getenv("SECRET_TOKEN")

        if token != expected_token:
            return jsonify({"status": "unauthorized", "message": "Invalid or missing token"}), 401

        conn = connectDB()
        results = fetchQuestionfromDB(conn)
        conn.close()  

        send_email(results)

        db_conn = connectDB()  
        DailyDBUpdate(db_conn)
        db_conn.close()

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
