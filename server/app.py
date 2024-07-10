"""
This is the main backend app for the project.
"""
import os
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from sqlalchemy import create_engine

# authentication
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash

from scheduler_config import init_scheduler, Config
from config import DATABASE_URL, FETCHER_FOLDER
from log_config import LOG_FILE_PATH

from data_acquisition.feed_manager import get_feed_urls, set_feed_urls
from data_acquisition.content_fetcher import start_fetch, stop_fetch, get_fetch_status
from data_analysis.query_processor import get_search_results
from data_analysis.stats_analyzer import get_stats
from data_export.export_manager import get_export

os.makedirs(f"./{FETCHER_FOLDER}/data/", exist_ok=True)
engine = create_engine(DATABASE_URL, echo=False)
connection = engine.connect()

app = Flask(__name__, static_folder='static')
CORS(app, resources={r"/*": {"origins": "*"}})
app.config.from_object(Config())
app.config['JWT_SECRET_KEY'] = "your_secret_key_here_change_this"
jwt = JWTManager(app)

init_scheduler(app)

from functools import wraps

def jwt_required_conditional(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if os.getenv('FLASK_ENV') == 'testing':
            return fn(*args, **kwargs)
        else:
            return jwt_required()(fn)(*args, **kwargs)
        
    return wrapper


LOCK_FILE = f'./{FETCHER_FOLDER}/data/processing.lock'

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
def register():
    """
    Register a new user.
    """

    if os.getenv('FLASK_ENV') == 'testing':
        with open(f'./{FETCHER_FOLDER}/data/password.txt', 'w') as f:
            f.write(generate_password_hash("testpassword"))
        return jsonify({"msg": "User created"}), 200

    password = request.json.get('password', None)

    if not password:
        return jsonify({"msg": "Missing username or password"}), 400

    hashed_password = generate_password_hash(password)
    
    # use a basic file for now
    if os.path.exists(f'./{FETCHER_FOLDER}/data/password.txt'):
        return jsonify({"msg": "User already exists"}), 409
    
    with open(f'./{FETCHER_FOLDER}/data/password.txt', 'w') as f:
        f.write(hashed_password)

    return jsonify({"msg": "User created"}), 200

@app.route('/api/login', methods=['POST'])
def login():
    """
    Login a user.
    """
    password = request.json.get('password', None)

    if not password:
        return jsonify({"msg": "Missing username or password"}), 400

    if not os.path.exists(f'./{FETCHER_FOLDER}/data/password.txt'):
        return jsonify({"msg": "User does not exist"}), 404

    with open(f'./{FETCHER_FOLDER}/data/password.txt', 'r') as f:
        hashed_password = f.read()

    if not check_password_hash(hashed_password, password):
        return jsonify({"msg": "Invalid username or password"}), 401

    access_token = create_access_token(identity='admin')
    return jsonify(access_token=access_token), 200


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
    return get_search_results(engine)

@app.route('/api/articles/statistics', methods=['GET'])
@jwt_required_conditional
def get_stats_route():
    """
    Returns stats about db articles. Uses stats_analyzer.py.
    """
    return get_stats(engine)

@app.route('/api/articles/export', methods=['GET'])
@jwt_required_conditional
def get_export_route():
    """
    Exports the articles from db. Uses export_manager.py.
    """
    return get_export(engine)

@app.route('/api/error_logs', methods=['GET'])
@jwt_required_conditional
def get_error_log_route():
    """
    Returns a log report of errors. Uses log_config.py.
    """
    try:
        with open(LOG_FILE_PATH, 'r', encoding='utf-8') as log_file:
            log_records = log_file.read()
        return jsonify(logs=log_records.splitlines()), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch logs", "details": str(e)}), 500

@app.route('/api/clear_error_logs', methods=['POST'])
def clear_error_logs_route():
    """
    Clears the error logs.
    """
    try:
        with open(LOG_FILE_PATH, 'w', encoding='utf-8') as log_file:
            log_file.write('')
        return jsonify({"message": "Logs cleared successfully"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to clear logs", "details": str(e)}), 500

@app.route('/api/get_user_exists', methods=['GET'])
def get_user_exists():
    """
    Check if user exists.
    """
    return jsonify({"exists": os.path.exists(f'./{FETCHER_FOLDER}/data/password.txt')}), 200

@app.route('/api/create_test_user', methods=['POST'])
def create_test_user():
    """
    Create a test user.
    """
    with open(f'./{FETCHER_FOLDER}/data/password.txt', 'w') as f:
        f.write(generate_password_hash("test"))

    access_token = create_access_token(identity='admin')

    return jsonify({"msg": "User created", "accessToken": access_token}), 200

@app.route('/api/get_is_valid_token', methods=['GET'])
@jwt_required_conditional
def get_is_valid_token():
    """
    Check if token is valid.
    """
    return jsonify({"valid": True}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
