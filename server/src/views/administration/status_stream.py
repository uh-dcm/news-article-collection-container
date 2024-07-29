"""
Handles streaming processing status for frontend. Used by app.py.
"""
import time
from flask import Response, stream_with_context

from src.utils.processing_status import ProcessingStatus

def stream():
    """
    Processing status check stream, inactive when client not in use.
    Used by app.stream_route().
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
