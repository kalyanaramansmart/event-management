from flask import Blueprint, request, g
from .service import get_all_categories, get_category_by_id, create_category, update_category, delete_category
from utils.token import is_admin
from utils.response import error


category_bp = Blueprint("category", __name__)


@category_bp.route("", methods=["GET"])
def get_all_categories_route():
    return get_all_categories()


@category_bp.route("/<uuid:category_id>", methods=["GET"])
def get_category_by_id_route(category_id):
    if not is_admin(g):
        return error("Admin access required", 403)
    return get_category_by_id(category_id)


@category_bp.route("", methods=["POST"])
def create_category_route():
    if not is_admin(g):
        return error("Admin access required", 403)
    data = request.json
    return create_category(data)


@category_bp.route("/<uuid:category_id>", methods=["PUT"])
def update_category_route(category_id):
    if not is_admin(g):
        return error("Admin access required", 403)
    data = request.json
    return update_category(category_id, data)


@category_bp.route("/<uuid:category_id>", methods=["DELETE"])
def delete_category_route(category_id):
    if not is_admin(g):
        return error("Admin access required", 403)
    return delete_category(category_id)
