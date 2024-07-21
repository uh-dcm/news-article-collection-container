"""
Tests content_fetcher.py route responses and functions.
"""
import unittest.mock

from route_modules.data_acquisition.content_fetcher import run_collect_and_process, run_subprocess

def test_start_fetch(client):
    """
    Tests /api/start when not yet fetching.
    """
    response = client.post('/api/start')
    assert response.status_code == 201
    assert response.json['status'] == "started"

def test_start_fetch_already_running(client):
    """
    Tests /api/start when already fetching.
    """
    client.post('/api/start')
    response = client.post('/api/start')
    assert response.status_code == 409
    assert response.json['status'] == "already running"

def test_stop_fetch(client):
    """
    Tests /api/stop when fetching.
    """
    client.post('/api/start')
    response = client.post('/api/stop')
    assert response.status_code == 200
    assert response.json['status'] in ["stopped"]

def test_stop_fetch_not_running(client):
    """
    Tests /api/stop when not fetching, then after starting fetching.
    """
    response = client.post('/api/stop')
    assert response.status_code == 409
    assert response.json['status'] == "it was not running"

    client.post('/api/start')
    response = client.post('/api/stop')
    assert response.status_code == 200
    assert response.json['status'] == "stopped"

def test_fetch_status(client):
    """
    Tests /api/status checks.
    """
    response = client.post('/api/start')
    assert response.status_code == 201

    response = client.get('/api/status')
    assert response.status_code == 200
    assert response.json['status'] == "running"

    response = client.post('/api/stop')
    assert response.status_code == 200

    response = client.get('/api/status')
    assert response.status_code == 204

def test_run_collect_and_process_success(app):
    """
    Tests run_collect_and_process() succeeding.
    """
    with app.app_context():
        with unittest.mock.patch(
                'configs.db_config.ProcessingStatus.get_status', return_value=False
            ), \
             unittest.mock.patch(
                'configs.db_config.ProcessingStatus.set_status'
            ), \
             unittest.mock.patch(
                'route_modules.data_acquisition.content_fetcher.run_subprocess'
            ) as mock_run_subprocess, \
             unittest.mock.patch('os.path.exists', return_value=True):

            run_collect_and_process()

            assert mock_run_subprocess.call_count == 2
            mock_run_subprocess.assert_any_call('collect.py')
            mock_run_subprocess.assert_any_call('process.py')

def test_run_collect_and_process_already_active(app):
    """
    Tests run_collect_and_process() already running.
    """
    with app.app_context():
        with unittest.mock.patch(
                'configs.db_config.ProcessingStatus.get_status', return_value=True
            ), \
             unittest.mock.patch(
                'configs.db_config.ProcessingStatus.set_status'
            ) as mock_set_status, \
             unittest.mock.patch(
                'route_modules.data_acquisition.content_fetcher.run_subprocess'
            ) as mock_run_subprocess:

            run_collect_and_process()

            assert not mock_run_subprocess.called
            mock_set_status.assert_not_called()

def test_run_collect_and_process_no_feeds(app):
    """
    Tests run_collect_and_process() not finding feeds.txt.
    """
    with app.app_context():
        with unittest.mock.patch(
                'configs.db_config.ProcessingStatus.get_status', return_value=False
            ), \
             unittest.mock.patch(
                'configs.db_config.ProcessingStatus.set_status'
            ) as mock_set_status, \
             unittest.mock.patch(
                'route_modules.data_acquisition.content_fetcher.run_subprocess'
            ) as mock_run_subprocess, \
             unittest.mock.patch('os.path.exists', return_value=False):

            run_collect_and_process()

            assert not mock_run_subprocess.called
            mock_set_status.assert_not_called()

def test_run_collect_and_process_error(app):
    """
    Tests error during run_collect_and_process().
    """
    with app.app_context():
        with unittest.mock.patch(
                'configs.db_config.ProcessingStatus.get_status', return_value=False
            ), \
             unittest.mock.patch(
                'configs.db_config.ProcessingStatus.set_status'
            ) as mock_set_status, \
             unittest.mock.patch(
                'route_modules.data_acquisition.content_fetcher.run_subprocess',
                side_effect=Exception("Test error")
            ), \
             unittest.mock.patch('os.path.exists', return_value=True):

            run_collect_and_process()

            assert mock_set_status.call_count == 2
            mock_set_status.assert_any_call(True)
            mock_set_status.assert_any_call(False)

def test_run_subprocess(app):
    """
    Tests run_process().
    """
    with app.app_context():
        with unittest.mock.patch('subprocess.run') as mock_subprocess:
            mock_subprocess.return_value.stdout = "Test output"
            mock_subprocess.return_value.stderr = "Test error"

            run_subprocess('test_script.py')

            mock_subprocess.assert_called_once()
