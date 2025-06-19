from flask import request, jsonify
import os

def questionCommit(connection_pool):
    try:
        token = request.args.get("token")
        expected_token = os.getenv("SECRET_TOKEN")

        if token != expected_token:
            return jsonify({"status": "unauthorized", "message": "Invalid or missing token"}), 401
        
        id1 = request.args.get("id1")
        id2 = request.args.get("id2")

        if not id1 or not id2:
            return jsonify({"status": "error", "message": "Missing question IDs"}), 400
        
        conn = connection_pool.getconn()
        cursor = conn.cursor()

        for question_id in [id1, id2]:
            cursor.execute("""
                UPDATE questions
                SET numberofrevision = numberofrevision + 1
                WHERE id = %s
            """, (question_id,))

        conn.commit()
        cursor.close()
        connection_pool.putconn(conn)

        return jsonify({
            "status": "success",
            "message": f"Revisions updated successfully for IDs {id1} and {id2}",
            "updated_ids": [id1, id2]
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
