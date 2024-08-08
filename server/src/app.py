"""
This is the main backend app for the project.
"""
import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from src.config import Config, TestConfig
from src.utils import resource_management
from src.utils.log_config import setup_logging
from src.routes import init_routes

def create_app(testing=False):
    """
    Flask recommended factory style app creation.
    Ran by Dockerfile through __main__ as application = create_app()
    or in conftest.py as application = create_app(testing=True).
    """
    # Flask
    app = Flask(__name__, static_folder=os.path.join(Config.SERVER_ROOT, 'static'))
    CORS(app, resources={r"/*": {"origins": "*"}})

    print("I am being tested or not: ", testing)

    # testing check
    app.config.from_object(TestConfig if testing else Config)

    # jwt
    jwt = JWTManager()
    jwt.init_app(app)

    # data directory
    os.makedirs(os.path.join(app.config['FETCHER_FOLDER'], 'data'), exist_ok=True)

    # logging
    setup_logging(app)

    # scheduler
    resource_management.init_scheduler(app, testing)

    # db engine
    with app.app_context():
        resource_management.init_db_engine(app)

    # Flask teardown function to cleanly dispose of resources
    @app.teardown_appcontext
    def cleanup_resources(_=None):
        resource_management.shutdown_scheduler(app)
        resource_management.dispose_engine(app)

    # routes
    init_routes(app)

    return app

if __name__ == '__main__':
    application = create_app()
    application.run(host='0.0.0.0', port=5000)
