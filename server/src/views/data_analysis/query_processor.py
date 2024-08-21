"""
This handles all of the search algorithm, with some minor cosmetics
happening on the frontend. All of this took a lot of work and breaks easily.
And you don't know you've broken something because it takes plenty of testing
to find out you did. Called by routes.py.
"""
from datetime import datetime, timedelta
import re
from flask import jsonify, request, current_app
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from src.utils.resource_management import check_articles_table

# start of the search functions
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

        # pagination and sorting params
        query_params = {
            'page': int(request.args.get('page', 1)),
            'per_page': int(request.args.get('per_page', 10)),
            'sort_by': request.args.get('sort_by', 'time'),
            'sort_order': request.args.get('sort_order', 'desc')
        }

        queries, sql_params = build_search_query(search_params, query_params)
        query, count_query, id_query = queries

        # plenty of pagination here, that sometimes only happen doing many things at once on the app
        with current_app.db_engine.connect() as connection:
            total_count = connection.execute(text(count_query), sql_params).scalar()

            total_pages = (total_count + query_params['per_page'] - 1) // query_params['per_page']
            query_params['page'] = min(query_params['page'], max(1, total_pages))

            sql_params['offset'] = (query_params['page'] - 1) * query_params['per_page']

            rows = connection.execute(text(query), sql_params).fetchall()
            all_ids = [row[0] for row in connection.execute(text(id_query), sql_params)]

        data = [
            {"time": time, "url": url, "full_text": full_text}
            for _, time, url, full_text in rows
        ]

        current_app.last_search_ids = all_ids

        return jsonify({
            "data": data,
            "total_count": total_count,
            "page": query_params['page'],
            "per_page": query_params['per_page']
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

# this is the start of the query build, with pagination, seems to work fine
def build_search_query(search_params, query_params):
    """
    Builds the SQLite query based on the params. Used by get_search_results().
    """
    base_query, count_query, sql_params = build_base_query(search_params)

    id_query = f"SELECT id FROM articles WHERE {base_query.split('WHERE', 1)[1]}"

    final_query = apply_sorting_and_pagination(
        base_query, query_params['sort_by'],
        query_params['sort_order']
    )

    sql_params.update(
        {'per_page': query_params['per_page'],
         'offset': (query_params['page'] - 1) * query_params['per_page']}
    )

    return (final_query, count_query, id_query), sql_params

# this base query separates general query from advanced query
# could be more succint perhaps
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

    advanced_params = ['text_query', 'url_query', 'html_query', 'start_time', 'end_time']
    has_advanced_search = any(search_params.get(param) for param in advanced_params)

    if has_advanced_search:
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
    elif search_params.get('general_query'):
        base_query, count_query, sql_params = add_general_query(
            search_params, base_query, count_query, sql_params
        )

    return base_query, count_query, sql_params

# this is more specific sorting and pagination, seems to work fine
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

# parse_operators and create_term_sql_condition are part of the same package for advanced search
# they aren't perfect but they seem to work ok for advanced search alone

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

# the two next are for the general query
# general query required very unique handling different from the others
# may seem to replicate the same things but needed to do them in a unique way
# these were created last

def process_query_part(part, param_index, sql_params):
    """
    Part of add_general_query that parses more complicated operators and paths.
    Pylint wanted to split the large function.
    """
    param_name = f'general_query_{param_index}'
    part = part.strip('"')
    if part == 'NOTEXT':
        return "(full_text IS NULL OR full_text = '' OR url IS NULL OR url = '')", sql_params
    elif 'ESC' in part:
        escaped_part = part.replace('ESC%', r'\%').replace('ESC_', r'\_')
        condition = (
            f"(full_text LIKE :{param_name} ESCAPE '\\' OR "
            f"url LIKE :{param_name} ESCAPE '\\' OR "
            f"CAST(time AS TEXT) LIKE :{param_name} ESCAPE '\\')"
        )
        sql_params[param_name] = escaped_part
    else:
        condition = (
            f"(full_text LIKE :{param_name} OR "
            f"url LIKE :{param_name} OR "
            f"CAST(time AS TEXT) LIKE :{param_name})"
        )
        sql_params[param_name] = f'%{part}%'
    return condition, sql_params

def add_general_query(search_params, base_query, count_query, sql_params):
    """
    Parses the general query alone. Used by build_base_query().
    Needed special customization.
    """
    general_query = search_params.get('general_query', '').strip()
    if not general_query:
        return base_query, count_query, sql_params

    parts = re.findall(r'"[^"]*"|\S+', general_query)
    conditions = []
    current_group = []
    param_index = 0
    negate_next = False
    and_next = False

    for part in parts:
        if part == 'OR':
            if current_group:
                conditions.append('(' + ' AND '.join(current_group) + ')')
                current_group = []
            and_next = False
        elif part == 'AND':
            and_next = True
        elif part == 'NOT':
            negate_next = True
        else:
            param_index += 1
            term_condition, sql_params = process_query_part(part, param_index, sql_params)

            if negate_next:
                term_condition = f"NOT {term_condition}"
                negate_next = False
            if and_next and current_group:
                current_group[-1] += f" AND {term_condition}"
            else:
                current_group.append(term_condition)
            and_next = False

    if current_group:
        conditions.append('(' + ' AND '.join(current_group) + ')')
    final_condition = ' OR '.join(conditions)
    base_query += f" AND ({final_condition})"
    count_query += f" AND ({final_condition})"
    return base_query, count_query, sql_params

# the bottom two manage start_time and end_time
# they seem fairly stable and succint for their purpose

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
