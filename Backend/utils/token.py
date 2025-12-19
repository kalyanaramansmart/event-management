import jwt
from datetime import datetime, timedelta
from config import Config
from flask import request, g
from utils.response import error

SECRET_KEY = Config.SECRET_KEY


def create_jwt(id, user_email, role):
    payload = {
        "id": id,
        "email": user_email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token


def validate_jwt(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def jwt_middleware():
    if '/api/users/' in request.url:
        return
    if request.method == "OPTIONS":
        return

    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return error("Authorization token missing", 403)
    token = auth_header.split(" ")[1]
    payload = validate_jwt(token)

    if not payload:
        return error("Invalid or expired token", 401)

    g.user = payload


def is_admin(g):
    return hasattr(g, "user") and g.user.get("role") == "Admin"


def is_user(g):
    return hasattr(g, "user") and g.user.get("role") == "User"
