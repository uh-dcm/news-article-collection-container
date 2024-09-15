"""
This service converts db to json, csv and parquet. Used by export_manager.py.
This is optimized for lowering peak memory usage, since memory is so tight on Rahti.
Going row by row ended up lowering peak memory usage massively. Pandas also seemed
to be a bit heavy on memory.
"""
import io
import json
import csv
import pyarrow as pa
import pyarrow.parquet as pq

def convert_db_to_json(result):
    """
    Convert db to .json. Called by export_manager.convert_and_send().
    This just starts streaming over rows immediately.
    """
    yield '['
    first = True
    for row in result:
        if not first:
            yield ','
        else:
            first = False
        yield json.dumps(row._asdict(), ensure_ascii=False, default=str)
    yield ']'

def convert_db_to_csv(result):
    """
    Convert db to .csv. Called by export_manager.convert_and_send().
    This holds each row in local memory as file-like with io then streams it over.
    """
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_NONNUMERIC, escapechar='\\')

    # headers
    writer.writerow(result.keys())
    yield output.getvalue()
    output.seek(0)
    output.truncate(0)

    # rows
    for row in result:
        writer.writerow(row)
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)

def convert_db_to_parquet(result, output_file_path):
    """
    Convert db to .parquet. Called by export_manager.convert_and_send().
    Unlike JSON and CSV, Parquet needs to be built into a whole file first locally
    before being streamed over. It would also be possible to build many small Parquet
    files and then send those over but it's pretty complex. Even rather than this
    row by row memory saving build, Parquet's compression would benefit
    from bigger batches, but there was an immediate spike in peak memory usage.
    For very very large files this might need status updates to keep the request alive.
    """
    columns = list(result.keys())
    schema = pa.schema([(col, pa.string()) for col in columns])

    with pq.ParquetWriter(output_file_path, schema) as writer:
        for row in result:
            arrays = [pa.array([str(getattr(row, col, ''))]) for col in columns]
            batch = pa.RecordBatch.from_arrays(arrays, schema=schema)
            writer.write_batch(batch)
