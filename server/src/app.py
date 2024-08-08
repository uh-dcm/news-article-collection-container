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

import secrets

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

    if testing:
        Config.FETCHER_FOLDER = TestConfig.FETCHER_FOLDER
    else:
        Config.FETCHER_FOLDER = os.path.join(Config.SERVER_ROOT, 'rss-fetcher')
    
    # make data folder if it doesn't exist
    data_dir = os.path.join(Config.FETCHER_FOLDER, 'data')
    os.makedirs(data_dir, exist_ok=True)

    # secret key and jwt secret key

    # get the secret key from a file if it exists

    secret_key_path = os.path.join(data_dir, 'secret_key.txt')
    if not os.path.exists(secret_key_path):
        Config.SECRET_KEY = secrets.token_hex(32)
        with open(secret_key_path, 'w', encoding='utf-8') as f:
            f.write(Config.SECRET_KEY)
    else:
        with open(secret_key_path, 'r', encoding='utf-8') as f:
            Config.SECRET_KEY = f.read().strip()

    jwt_secret_key_path = os.path.join(data_dir, 'jwt_secret_key.txt')
    if not os.path.exists(jwt_secret_key_path):
        Config.JWT_SECRET_KEY = secrets.token_hex(32)
        with open(jwt_secret_key_path, 'w', encoding='utf-8') as f:
            f.write(Config.JWT_SECRET_KEY)
    else:
        with open(jwt_secret_key_path, 'r', encoding='utf-8') as f:
            Config.JWT_SECRET_KEY = f.read().strip()


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
