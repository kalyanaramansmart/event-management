from flask import Blueprint, request, g
from .service import get_all_event, get_event_by_id, create_event, update_event, delete_event, update_slot
from utils.token import is_admin, is_user
from utils.response import error


event_bp = Blueprint("event", __name__)


@event_bp.route("", methods=["GET"])
def get_all_event_route():
    return get_all_event()


@event_bp.route("/<uuid:event_id>", methods=["GET"])
def get_event_by_id_route(event_id):
    return get_event_by_id(event_id)


@event_bp.route("", methods=["POST"])
def create_event_route():
    if not is_admin(g):
        return error("Admin access required", 403)
    data = request.json
    return create_event(data)


@event_bp.route("/<uuid:event_id>", methods=["PUT"])
def update_event_route(event_id):
    if not is_admin(g):
        return error("Admin access required", 403)
    data = request.json
    return update_event(event_id, data)


@event_bp.route("/<uuid:event_id>", methods=["DELETE"])
def delete_event_route(event_id):
    if not is_admin(g):
        return error("Admin access required", 403)
    return delete_event(event_id)


@event_bp.route("/<uuid:event_id>", methods=["PATCH"])
def update_slot_route(event_id):
    if not is_user(g):
        return error("Admin cannot book slot.", 403)
    return update_slot(event_id)
