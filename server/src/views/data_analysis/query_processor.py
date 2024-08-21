"""
This handles db articles query route. Called by routes.py.
"""
from datetime import datetime, timedelta
import re
from flask import jsonify, request, current_app
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from src.utils.resource_management import check_articles_table

def get_search_results():
    """
    Searches db articles for a custom user query.
    Called by routes.init_routes() for route /api/articles/search.
    """
    try:
        # check whether the table exists
        db_check_error = check_articles_table()
        if db_check_error:
            return db_check_error

        # search params
        search_params = {
            'general_query': request.args.get('generalQuery', ''),
            'text_query': request.args.get('textQuery', ''),
            'url_query': request.args.get('urlQuery', ''),
            'start_time': request.args.get('startTime', ''),
            'end_time': request.args.get('endTime', ''),
            'html_query': request.args.get('htmlQuery', '')
        }

        # pagination params
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))

        # sorting params
        sort_by = request.args.get('sort_by', 'time')
        sort_order = request.args.get('sort_order', 'desc')

        query, count_query, sql_params = build_search_query(
            search_params,
            page,
            per_page,
            sort_by,
            sort_order
        )

        with current_app.db_engine.connect() as connection:
            result = connection.execute(text(query), sql_params)
            rows = result.fetchall()
            total_count = connection.execute(text(count_query), sql_params).scalar()

        data = [
            {"time": time, "url": url, "full_text": full_text}
            for _, time, url, full_text in rows
        ]
        current_app.last_search_ids = [row[0] for row in rows]

        return jsonify({
            "data": data,
            "total_count": total_count,
            "page": page,
            "per_page": per_page
        }), 200

    except SQLAlchemyError as e:
        current_app.logger.exception("Database error when searching")
        return jsonify({
            "status": "error",
            "message": f"Database error when searching: {str(e)}"
        }), 500
    except Exception as e:
        current_app.logger.exception("Error when searching")
        return jsonify({"status": "error", "message": str(e)}), 500

def build_search_query(search_params, page, per_page, sort_by, sort_order):
    """
    Builds the SQLite query based on the params. Used by get_search_results().
    """
    base_query, count_query, sql_params = build_base_query(search_params)

    final_query = apply_sorting_and_pagination(base_query, sort_by, sort_order)

    sql_params.update({'per_page': per_page, 'offset': (page - 1) * per_page})

    return final_query, count_query, sql_params

def build_base_query(search_params):
    """
    Builds base query with all search conditions. Used by build_search_query().
    """
    base_query = """
        SELECT id, DATETIME(time) as time, url, full_text
        FROM articles 
        WHERE 1=1
    """
    count_query = "SELECT COUNT(*) FROM articles WHERE 1=1"
    sql_params = {}

    base_query, count_query, sql_params = add_general_query(
        search_params, base_query, count_query, sql_params
    )

    for param, column in [
        ('text_query', 'full_text'),
        ('url_query', 'url'),
        ('html_query', 'html')
    ]:
        if search_params[param]:
            parsed_query, query_params = parse_operators(
                search_params[param], column
            )
            base_query += f" AND ({parsed_query})"
            count_query += f" AND ({parsed_query})"
            sql_params.update(query_params)

    base_query, count_query, sql_params = add_time_constraints(
        search_params, base_query, count_query, sql_params
    )

    return base_query, count_query, sql_params

def add_general_query(search_params, base_query, count_query, sql_params):
    """
    General query condition to base query. Used by build_base_query().
    """
    if search_params['general_query']:
        columns = ['full_text', 'url', 'time']
        combined_conditions = []
        combined_params = {}

        if search_params['general_query'].strip() == "NOT NOTEXT":
            condition = "NOT (full_text IS NULL OR full_text = '')"
            combined_conditions.append(condition)
        else:
            for column in columns:
                parsed_query, query_params = parse_operators(
                    search_params['general_query'], column
                )
                combined_conditions.append(f"({parsed_query})")
                combined_params.update(query_params)

        combined_query = " OR ".join(combined_conditions)

        base_query += f" AND ({combined_query})"
        count_query += f" AND ({combined_query})"
        sql_params.update(combined_params)

    return base_query, count_query, sql_params

def add_time_constraints(search_params, base_query, count_query, sql_params):
    """
    Time constraints to base query. Used by build_base_query().
    """
    for param, operator in [('start_time', '>='), ('end_time', '<=')]:
        if search_params[param]:
            parsed_time = parse_input_date(
                search_params[param], is_end_date=(param == 'end_time')
            )
            if parsed_time:
                base_query += f" AND time {operator} :{param}"
                count_query += f" AND time {operator} :{param}"
                sql_params[param] = parsed_time
            else:
                base_query += " AND 1=0"
                count_query += " AND 1=0"

    return base_query, count_query, sql_params

def apply_sorting_and_pagination(base_query, sort_by, sort_order):
    """
    Sorts and paginates base query.
    """
    if sort_by not in ['time', 'url']:
        sort_by = 'time'
    if sort_order not in ['asc', 'desc']:
        sort_order = 'desc'

    if sort_by == 'time':
        base_query += f" ORDER BY time {sort_order.upper()}"
    else:
        base_query += f" ORDER BY url {sort_order.upper()}"

    base_query += " LIMIT :per_page OFFSET :offset"

    return base_query

def parse_input_date(date_string, is_end_date=False):
    """
    Checking the input time formatting and converting it to datetime.
    Used by add_time_constraints().
    """
    formats = ["%Y", "%Y-%m", "%Y-%m-%d", "%Y-%m-%d %H", "%Y-%m-%d %H:%M", "%Y-%m-%d %H:%M:%S"]
    for fmt in formats:
        try:
            date = datetime.strptime(date_string, fmt)
            if is_end_date:
                if fmt == "%Y":
                    date = date.replace(month=12, day=31, hour=23, minute=59, second=59)
                elif fmt == "%Y-%m":
                    next_month = date.replace(day=28) + timedelta(days=4)
                    last_day = next_month - timedelta(days=next_month.day)
                    date = date.replace(day=last_day.day, hour=23, minute=59, second=59)
                elif fmt == "%Y-%m-%d":
                    date = date.replace(hour=23, minute=59, second=59)
            return date
        except ValueError:
            pass
    return None

def parse_operators(query, column):
    """
    Parses operators AND, OR and NOT in full text, URL
    and HTML queries. Used by build_base_query() and add_general_query().
    """
    or_groups = []
    current_group = []
    search_params = {}
    negate_next = False

    parts = re.findall(r'"[^"]*"|\S+', query)

    for i, part in enumerate(parts):
        if part == "AND":
            continue
        elif part == "OR":
            if current_group:
                or_groups.append(current_group)
                current_group = []
        elif part == "NOT":
            negate_next = True
        else:
            condition, param = create_term_sql_condition(part, column, i, negate_next)
            current_group.append(condition)
            if param:
                search_params.update(param)
            negate_next = False

    if current_group:
        or_groups.append(current_group)

    sql_parts = ['(' + ' AND '.join(group) + ')' for group in or_groups]
    return ' OR '.join(sql_parts) if sql_parts else "1=1", search_params

def create_term_sql_condition(term, column, index, negate=False):
    """
    Creates detailed SQL condition for term. Used by parse_operators().
    """
    term = term.strip('"')
    if not term:
        return None, None

    if term == "NOTEXT":
        condition = f"({column} IS NULL OR {column} = '')"
        param = None
    else:
        param_name = f'{column}_query_{index}'
        if 'ESC' in term:
            condition = f"{column} LIKE :{param_name} ESCAPE '\\'"
            esc_part = term.replace('ESC%', r'\%').replace('ESC_', r'\_')
        else:
            condition = f"{column} LIKE :{param_name}"
            esc_part = term if term.startswith('"') and term.endswith('"') else f'%{term}%'

        param = {param_name: esc_part}

    if negate:
        condition = f"NOT ({condition})"

    return condition, param
