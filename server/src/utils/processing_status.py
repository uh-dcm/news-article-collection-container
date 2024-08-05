"""
This handles processing status.
"""
class ProcessingStatus:
    """
    Shared class of processing status in the app. Processing status represents
    collect.py and process.py actively working on the DB. Downloads end faulty if
    let to run while DB is getting updated by processing. Used by content_fetcher.py,
    export_manager.py and status_stream.py.
    """
    _status = False

    @classmethod
    def set_status(cls, status):
        """Sets processing status. Used by content_fetcher.py."""
        cls._status = status

    @classmethod
    def get_status(cls):
        """
        Gets processing status. Used by content_fetcher.py,
        export_manager.py and status_stream.py.
        """
        return cls._status
