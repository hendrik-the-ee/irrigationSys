# https://www.askpython.com/python/examples/build-a-dashboard-in-python
from datetime import date
import dash
import dash_core_components as dcc
import dash_html_components as html
from dash.dependencies import Input, Output, State
import plotly.express as px
import pandas as pd
import pandas_gbq as pd_gbq
from flask_caching import Cache
import re

external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']

app = dash.Dash(__name__, external_stylesheets=external_stylesheets)
cache = Cache(app.server, config={
    'CACHE_TYPE': 'filesystem',
    'CACHE_DIR': 'cache-directory'
})
TIMEOUT = 6000

colors = {
    'background': '#F0F8FF',
    'text': '#00008B'
}

start = '2021-04-01 00:00:00 UTC'
end  = '2021-04-15 00:00:00 UTC'


def get_dashboard(project_id, start_date=None, end_date=None):
    if start_date is None:
        start_date = start

    if end_date is None:
        end_date = end

    fig_temp = get_figure(start_date, end_date, project_id, 'temp')
    fig_humidity = get_figure(start_date, end_date, project_id, 'humidity')
    fig_soil_moisture = get_figure(start_date, end_date, project_id, 'soil_moisture')

    app.layout = html.Div(children=[
        html.H1(children='Hydrobot Dashboard'),

        dcc.DatePickerRange(
            id='date-picker-range',
            min_date_allowed=date(2020, 3, 1),
            initial_visible_month=date.today(),
        ),
        html.Div(id='output-container-date-picker-range'),

        html.Div([
            html.H4('Temperature Measurements'),
        ]),

        dcc.Graph(
            id='soil-and-air-temp',
            figure=fig_temp
        ),

        html.Div([
            html.H4('Humidity Measurement'),
        ]),

        dcc.Graph(
            id='humidity',
            figure=fig_humidity
        ),
        html.Div([
            html.H4('Soil Moisture Measurement'),
        ]),

        dcc.Graph(
            id='soil-moisture',
            figure=fig_soil_moisture
        ),
    ])

    return app


@cache.memoize(timeout=TIMEOUT)
def get_figure(start_date, end_date, project_id, fig_type):
    if not project_id:
        return None

    # https://pandas-gbq.readthedocs.io/en/latest/
    sql = ''
    y = []
    if fig_type == 'humidity':
        sql = f"""
 SELECT s.CreatedAt, AVG(w.humidity) as Humidity
FROM `{project_id}.alpha_test_jade.hydrobot_data_backyard` s
JOIN `{project_id}.weather_data.bloomsky_backyard` w
ON DATETIME_DIFF(DATETIME(s.CreatedAt), DATETIME(cast(w.datetime as timestamp)), MINUTE) >= 0
AND
DATETIME_DIFF(DATETIME(s.CreatedAt), DATETIME(cast(w.datetime as timestamp)), MINUTE) < 5
WHERE s.CreatedAt BETWEEN '{start}' AND '{end}' GROUP BY s.CreatedAt ORDER BY s.CreatedAt ASC;
        """
        y = ['Humidity']
    elif fig_type == 'temp':
        sql = f"""
        SELECT s.CreatedAt, AVG(s.SoilTemp)*1.8+32 as SoilTemp_F, AVG(w.temperature) as AirTemp_F
FROM `{project_id}.alpha_test_jade.hydrobot_data_backyard` s
JOIN `{project_id}.weather_data.bloomsky_backyard` w
ON DATETIME_DIFF(DATETIME(s.CreatedAt), DATETIME(cast(w.datetime as timestamp)), MINUTE) >= 0
AND
DATETIME_DIFF(DATETIME(s.CreatedAt), DATETIME(cast(w.datetime as timestamp)), MINUTE) < 5
WHERE s.CreatedAt BETWEEN '{start}' AND '{end}' GROUP BY s.CreatedAt ORDER BY s.CreatedAt ASC;
        """
        y = ['SoilTemp_F', 'AirTemp_F']
    else:
        sql = f"""
        SELECT CreatedAt, AVG(SoilMoisture) as SoilMoisture
FROM `{project_id}.alpha_test_jade.hydrobot_data_backyard`
WHERE CreatedAt BETWEEN '{start}' AND '{end}' GROUP BY CreatedAt ORDER BY CreatedAt ASC;
        """
        y = ['SoilMoisture']

    df = pd_gbq.read_gbq(sql, project_id=project_id)

    x = 'CreatedAt'
    fig = px.scatter(df, x=x, y=y, labels={"value": "Value", "CreatedAt": "Datetime", "variable": "Legend"})
    fig.update_traces(mode='markers+lines')

    return fig

@app.callback(
    dash.dependencies.Output('output-container-date-picker-range', 'children'),
    [dash.dependencies.Input('date-picker-range', 'start_date'),
     dash.dependencies.Input('date-picker-range', 'end_date')]
)
def update_output(start_date, end_date):
    string_prefix = ''
    if start_date is not None:
        start_date_object = date.fromisoformat(start_date)
        start_date_string = start_date_object.strftime('%Y-%m-%d 00:00:00 UTC')
        string_prefix = string_prefix + 'Start Date: ' + start_date_string + ' | '
    if end_date is not None:
        end_date_object = date.fromisoformat(end_date)
        end_date_string = end_date_object.strftime('%Y-%m-%d 00:00:00 UTC')
        string_prefix = string_prefix + 'End Date: ' + end_date_string
    if not string_prefix:
        return 'Select a date to see it displayed here'
    else:
        return string_prefix

# @app.callback(
#     dash.dependencies.Output('soil-and-air-temp', 'children'),
#     [dash.dependencies.Input('date-picker-range', 'start_date'),
#      dash.dependencies.Input('date-picker-range', 'end_date')]
# )
# def update_temp_graph(start_date, end_date):
#     return get_figure()
