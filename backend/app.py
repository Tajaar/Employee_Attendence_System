# app.py
from flask import Flask, jsonify
from flask_cors import CORS
import os
from flask_jwt_extended import JWTManager
from db import get_connection
from routes import routes

app = Flask(__name__)
CORS(app)

# Secret key for JWT
app.config["SECRET_KEY"] = os.getenv("JWT_SECRET", "mysecretkey")


# Initialize JWTManager
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(routes)


@app.route("/health", methods=["GET"])
def health_check():
    """Simple health check endpoint"""
    try:
        conn = get_connection()
        conn.close()
        return jsonify({"status": "ok", "message": "Database connection successful"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    print("Starting Flask app and testing DB connection...")
    try:
        conn = get_connection()
        conn.close()
        print("✅ Database connection successful.")
    except Exception as e:
        print("❌ Database connection failed:", e)
    app.run(debug=True)
