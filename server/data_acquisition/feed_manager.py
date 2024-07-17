"""
This handles get and set of feeds.txt. Called by app.py.
"""
from os.path import exists
from flask import jsonify, request

from config import FETCHER_FOLDER
from log_config import logger

def get_feed_urls():
    """
    Returns the URLs from feeds.txt. Called by app.get_feed_urls_route().
    """
    feed_file_path = f'./{FETCHER_FOLDER}/data/feeds.txt'

    feeds = []
    if exists(feed_file_path):
        try:
            with open(feed_file_path, encoding='utf-8') as f:
                feeds = f.readlines()
        except Exception as e:
            logger.error("Error in getting feed URLs: %s", e)
            return jsonify({"status": "error", "message": str(e)}), 500

    return jsonify(feeds), 200

def set_feed_urls():
    """
    Writes the URLs to feeds.txt. Called by app.set_feed_urls_route().
    """
    if not request.is_json:
        return jsonify({"status": "error", "message": "Invalid content type, expected JSON"}), 415

    try:
        feeds = request.json
        if not isinstance(feeds, dict) or 'feedUrls' not in feeds:
            return jsonify({"status": "error", "message": "Invalid JSON structure"}), 400
        feed_urls = feeds['feedUrls']
        with open(f'./{FETCHER_FOLDER}/data/feeds.txt', 'w', encoding='utf-8') as f:
            f.write("\n".join(feed_urls))
        return jsonify({"status": "success"}), 200
    except Exception as e:
        logger.error("Error in setting feed URLs: %s", e)
        return jsonify({"status": "error", "message": str(e)}), 500
