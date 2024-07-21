"""
This is the main backend app for the project.
"""
import os
import time
from flask import Flask, send_from_directory, jsonify, Response, stream_with_context
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# basic functionality module imports
from configs.config import Config, TestConfig
from configs.db_config import get_engine, ProcessingStatus
from configs.scheduler_config import init_scheduler, shutdown_scheduler
from configs.log_config import setup_logging
from utils.auth_utils import jwt_required_conditional

# route functionality module imports
from route_modules.administration.user_management import register, login, get_user_exists
from route_modules.administration.log_operations import get_error_logs, clear_error_logs
from route_modules.data_acquisition.feed_manager import get_feed_urls, set_feed_urls
from route_modules.data_acquisition.content_fetcher import start_fetch, stop_fetch, get_fetch_status
from route_modules.data_analysis.query_processor import get_search_results
from route_modules.data_analysis.stats_analyzer import get_stats
from route_modules.data_export.export_manager import get_all_export, get_query_export

def create_app(testing=False):
    """
    Flask recommended factory style app creation.
    Ran by Dockerfile through __main__ as application = create_app()
    or in conftest.py as app = create_app(testing=True).
    """
    # Flask
    app = Flask(__name__, static_folder='static')
    CORS(app, resources={r"/*": {"origins": "*"}})

    # testing check
    app.config.from_object(TestConfig if testing else Config)

    # jwt
    jwt = JWTManager()
    jwt.init_app(app)

    # scheduler
    if not testing:
        init_scheduler(app)
    @app.teardown_appcontext
    def shutdown_context(_=None):
        shutdown_scheduler()

    # directories and logging
    os.makedirs(f"./{app.config['FETCHER_FOLDER']}/data/", exist_ok=True)
    log_file_path = setup_logging(app)
    app.config['LOG_FILE_PATH'] = log_file_path

    # routes
    configure_basic_routes(app, log_file_path)
    configure_data_routes(app)

    # db engine
    with app.app_context():
        get_engine()
    @app.teardown_appcontext
    def shutdown_session(_=None):
        engine = get_engine()
        engine.dispose()

    return app

def configure_basic_routes(app, log_file_path):
    """
    Configures the basic routes for the app. Used by create_app().
    8 in total.
    """
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        """
        Default view.
        """
        if path != "" and path != "api" and os.path.exists("static/" + path):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    @app.route('/api/register', methods=['POST'])
    def register_route():
        """
        Register a new user. Uses user_management.py.
        """
        return register()

    @app.route('/api/login', methods=['POST'])
    def login_route():
        """
        Login a user. Uses user_management.py.
        """
        return login()

    @app.route('/api/get_user_exists', methods=['GET'])
    def get_user_exists_route():
        """
        Check if the user exists. Uses user_management.py.
        """
        return get_user_exists()

    @app.route('/api/get_is_valid_token', methods=['GET'])
    @jwt_required_conditional
    def get_is_valid_token():
        """
        Check if the token is valid.
        """
        return jsonify({"valid": True}), 200

    @app.route('/api/error_logs', methods=['GET'])
    @jwt_required_conditional
    def get_error_logs_route():
        """
        Returns a log report of errors. Uses log_operations.py.
        """
        return get_error_logs(log_file_path)

    @app.route('/api/clear_error_logs', methods=['POST'])
    @jwt_required_conditional
    def clear_error_logs_route():
        """
        Clears the error logs. Uses log_operations.py.
        """
        return clear_error_logs(log_file_path)

    @app.route('/stream')
    def stream():
        """
        Processing status stream for App.tsx. Inactive when client not in use.
        """
        def event_stream():
            last_status = None
            while True:
                current_status = ProcessingStatus.get_status()
                if current_status != last_status:
                    yield f"event: processing_status\ndata: {str(current_status).lower()}\n\n"
                    last_status = current_status
                time.sleep(1)
        return Response(stream_with_context(event_stream()), content_type='text/event-stream')

def configure_data_routes(app):
    """
    Configures the data routes for the app. Used by create_app().
    9 in total.
    """
    @app.route('/api/get_feed_urls', methods=['GET'])
    @jwt_required_conditional
    def get_feed_urls_route():
        """
        Returns saved feeds from feeds.txt. Uses feed_manager.py.
        """
        return get_feed_urls()

    @app.route('/api/set_feed_urls', methods=['POST'])
    @jwt_required_conditional
    def set_feed_urls_route():
        """
        Saves added feeds to feeds.txt. Uses feed_manager.py.
        """
        return set_feed_urls()

    @app.route('/api/start', methods=['POST'])
    @jwt_required_conditional
    def start_fetch_route():
        """
        Schedules and starts the fetching job. Uses content_fetcher.py.
        Runs collect.py and process.py on the submitted feeds.
        """
        return start_fetch()

    @app.route('/api/stop', methods=['POST'])
    @jwt_required_conditional
    def stop_fetch_route():
        """
        Stops the fetching job. Uses content_fetcher.py.
        """
        return stop_fetch()

    @app.route('/api/status', methods=['GET'])
    @jwt_required_conditional
    def get_fetch_status_route():
        """
        Checks status of the fetching job. Uses content_fetcher.py.
        """
        return get_fetch_status()

    @app.route('/api/articles/search', methods=['GET'])
    @jwt_required_conditional
    def get_search_results_route():
        """
        Search db for a query and return results. Uses query_processor.py.
        """
        return get_search_results()

    @app.route('/api/articles/statistics', methods=['GET'])
    @jwt_required_conditional
    def get_stats_route():
        """
        Returns stats about db articles. Uses stats_analyzer.py.
        """
        return get_stats()

    @app.route('/api/articles/export', methods=['GET'])
    @jwt_required_conditional
    def get_all_export_route():
        """
        Exports all the articles from db. Uses export_manager.py.
        """
        return get_all_export()

    @app.route('/api/articles/export_query', methods=['GET'])
    @jwt_required_conditional
    def get_query_export_route():
        """
        Exports queried articles from db. Uses export_manager.py.
        """
        return get_query_export()

if __name__ == '__main__':
    application = create_app()
    application.run(host='0.0.0.0', port=5000)
