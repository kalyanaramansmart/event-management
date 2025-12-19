from flask import Blueprint, request
from .service import create_user, login_user


user_bp = Blueprint("user", __name__)


@user_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    return create_user(data)


@user_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    return login_user(data)
