from flask import Flask
from blueprints.user.routes import user_bp
from blueprints.category.routes import category_bp
from blueprints.event.routes import event_bp
from utils.token import jwt_middleware
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.before_request(jwt_middleware)

    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(category_bp, url_prefix="/api/category")
    app.register_blueprint(event_bp, url_prefix="/api/events")
    # app.register_blueprint(preference_bp, url_prefix="/api/preferences")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
    
