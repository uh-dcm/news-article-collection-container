"""
This defines the routes used in app.py. The route functionalities are in src.views.
"""
import os
from flask import send_from_directory

from src.views.administration import user_management, log_operations, status_stream
from src.views.data_acquisition import feed_manager, content_fetcher
from src.views.data_analysis import query_processor, stats_analyzer
from src.views.data_export import export_manager
from src.views import mail_dispatcher
from src.utils.auth_utils import jwt_required_conditional, validate_token

def init_routes(app):
    """
    Configures the basic routes for the app. Used by create_app().
    17 in total.
    """
    log_file_path = app.config['LOG_FILE_PATH']

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        """Default view."""
        if path != "" and path != "api" and os.path.exists(app.static_folder + '/' + path):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    # basic routes
    app.add_url_rule(
        '/api/register',
        'register',
        user_management.register,
        methods=['POST']
    )
    app.add_url_rule(
        '/api/login',
        'login',
        user_management.login,
        methods=['POST']
    )
    app.add_url_rule(
        '/api/get_user_exists',
        'get_user_exists',
        user_management.get_user_exists,
        methods=['GET']
    )
    app.add_url_rule(
        '/api/get_is_valid_token',
        'get_is_valid_token',
        validate_token,
        methods=['GET']
    )
    app.add_url_rule(
        '/api/error_logs',
        'get_error_logs',
        jwt_required_conditional(lambda: log_operations.get_error_logs(log_file_path)),
        methods=['GET']
    )
    app.add_url_rule(
        '/api/clear_error_logs',
        'clear_error_logs',
        jwt_required_conditional(lambda: log_operations.clear_error_logs(log_file_path)),
        methods=['POST']
    )
    app.add_url_rule(
        '/stream',
        'stream',
        status_stream.stream
    )
    app.add_url_rule(
        '/api/mail_dispatcher',
        'send_email',
        mail_dispatcher.send_email,
        methods=['POST']
    )

    # data routes
    app.add_url_rule(
        '/api/get_feed_urls',
        'get_feed_urls',
        jwt_required_conditional(feed_manager.get_feed_urls),
        methods=['GET']
    )
    app.add_url_rule(
        '/api/set_feed_urls',
        'set_feed_urls',
        jwt_required_conditional(feed_manager.set_feed_urls),
        methods=['POST']
    )
    app.add_url_rule(
        '/api/start',
        'start_fetch',
        jwt_required_conditional(content_fetcher.start_fetch),
        methods=['POST']
    )
    app.add_url_rule(
        '/api/stop',
        'stop_fetch',
        jwt_required_conditional(content_fetcher.stop_fetch),
        methods=['POST']
    )
    app.add_url_rule(
        '/api/status',
        'get_fetch_status',
        jwt_required_conditional(content_fetcher.get_fetch_status),
        methods=['GET']
    )
    app.add_url_rule(
        '/api/articles/search',
        'get_search_results',
        jwt_required_conditional(query_processor.get_search_results),
        methods=['GET']
    )
    app.add_url_rule(
        '/api/articles/statistics',
        'get_stats',
        jwt_required_conditional(stats_analyzer.get_stats),
        methods=['GET']
    )
    app.add_url_rule(
        '/api/articles/export',
        'get_all_export',
        jwt_required_conditional(export_manager.get_all_export),
        methods=['GET']
    )
    app.add_url_rule(
        '/api/articles/export_query',
        'get_query_export',
        jwt_required_conditional(export_manager.get_query_export),
        methods=['GET']
    )
