# https://www.askpython.com/python/examples/build-a-dashboard-in-python
import os
import datetime as dt
from datetime import date

import dash
import dash_core_components as dcc
import dash_html_components as html
from dash.dependencies import Input, Output
from dash.exceptions import PreventUpdate
import plotly.express as px

import pandas as pd
import pandas_gbq as pd_gbq
import numpy as np
from flask_caching import Cache
import re

external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']

app = dash.Dash(__name__, external_stylesheets=external_stylesheets)
app.title = "Hydrobot"
cache = Cache(app.server, config={
    'CACHE_TYPE': 'filesystem',
    'CACHE_DIR': 'cache-directory'
})
TIMEOUT = 0 #6000
PROJECT_ID = os.environ.get("PROJECT_ID", "")
WEATHER_DATA = os.environ.get("WEATHER_DATA", "")
SENSOR_DATA = os.environ.get("SENSOR_DATA", "")

colors = {
    'background': '#F0F8FF',
    'text': '#00008B'
}


def get_dashboard(start_date=None, end_date=None):
    today = date.today()
    two_weeks_ago = today - dt.timedelta(days=14)

    if start_date is None:
        start_date = two_weeks_ago

    if end_date is None:
        end_date = today

    app.layout = html.Div(children=[
        html.H1(children='Hydrobot Dashboard'),

        dcc.DatePickerRange(
            id='date-picker-range',
            min_date_allowed=date(2020, 3, 1),
            initial_visible_month=date.today(),
            start_date=start_date,
            end_date=today
        ),
        html.Div(id='output-container-date-picker-range'),

        html.Div([
            html.H4('Temperature Measurements'),
        ]),

        dcc.Graph(
            id='soil-and-air-temp',
        ),

        html.Div([
            html.H4('Humidity Measurement'),
        ]),

        dcc.Graph(
            id='humidity',
        ),
        html.Div([
            html.H4('Soil Moisture Measurement'),
        ]),

        dcc.Graph(
            id='soil-moisture',
        ),
    ])

    return app

@cache.memoize(timeout=TIMEOUT)
def get_humidity_figure(start_date, end_date):
    sql = f"""
 SELECT s.CreatedAt, AVG(w.humidity) as Humidity
FROM `{PROJECT_ID}.{SENSOR_DATA}` s
JOIN `{PROJECT_ID}.{WEATHER_DATA}` w
ON DATETIME_DIFF(DATETIME(s.CreatedAt), DATETIME(cast(w.datetime as timestamp)), MINUTE) >= 0
AND
DATETIME_DIFF(DATETIME(s.CreatedAt), DATETIME(cast(w.datetime as timestamp)), MINUTE) < 5
WHERE s.CreatedAt BETWEEN '{start_date}' AND '{end_date}' GROUP BY s.CreatedAt ORDER BY s.CreatedAt ASC;
        """
    y = ['Humidity']

    df = pd_gbq.read_gbq(sql, project_id=PROJECT_ID)

    if df.empty:
        return None

    x = 'CreatedAt'
    fig = px.scatter(df, x=x, y=y, labels={"value": "Value", "CreatedAt": "Datetime", "variable": "Legend"})
    fig.update_traces(mode='markers+lines')

    return fig


@cache.memoize(timeout=TIMEOUT)
def get_temp_figure(start_date, end_date):
    sql = f"""
        SELECT s.CreatedAt, AVG(s.SoilTemp)*1.8+32 as SoilTemp_F, AVG(w.temperature) as AirTemp_F
FROM `{PROJECT_ID}.{SENSOR_DATA}` s
JOIN `{PROJECT_ID}.{WEATHER_DATA}` w
ON DATETIME_DIFF(DATETIME(s.CreatedAt), DATETIME(cast(w.datetime as timestamp)), MINUTE) >= 0
AND
DATETIME_DIFF(DATETIME(s.CreatedAt), DATETIME(cast(w.datetime as timestamp)), MINUTE) < 5
WHERE s.CreatedAt BETWEEN '{start_date}' AND '{end_date}' GROUP BY s.CreatedAt ORDER BY s.CreatedAt ASC;
        """
    y = ['SoilTemp_F', 'AirTemp_F']

    df = pd_gbq.read_gbq(sql, project_id=PROJECT_ID)

    if df.empty:
        return None

    x = 'CreatedAt'
    fig = px.scatter(df, x=x, y=y, labels={"value": "Value", "CreatedAt": "Datetime", "variable": "Legend"})
    fig.update_traces(mode='markers+lines')

    return fig


@cache.memoize(timeout=TIMEOUT)
def get_soil_moisture_figure(start_date, end_date):
    sql = f"""
        SELECT CreatedAt, AVG(SoilMoisture) as SoilMoisture
    FROM `{PROJECT_ID}.{SENSOR_DATA}`
    WHERE CreatedAt BETWEEN '{start_date}' AND '{end_date}' GROUP BY CreatedAt ORDER BY CreatedAt ASC;
        """
    y = ['SoilMoisture']
    df = pd_gbq.read_gbq(sql, project_id=PROJECT_ID)

    if df.empty:
        return None

    df.where(df['SoilMoisture'] > 1024, 1024, inplace=True)
    df.replace(0, 1, inplace=True)
    df['SoilMoisture'] = np.log(df['SoilMoisture'])
    df = df[~(df['SoilMoisture'] > 7.2)]
    df = df[~(df['SoilMoisture'] < 6.8)]

    x = 'CreatedAt'
    fig = px.scatter(df, x=x, y=y, labels={"value": "Value", "CreatedAt": "Datetime", "variable": "Legend"})
    fig.update_traces(mode='markers+lines')

    return fig


@app.callback(
    Output('output-container-date-picker-range', 'children'),
    Output('humidity', 'figure'),
    Output('soil-and-air-temp', 'figure'),
    Output('soil-moisture', 'figure'),
    [Input('date-picker-range', 'start_date'),
     Input('date-picker-range', 'end_date')]
)
def update_output(start_date=None, end_date=None):
    if start_date is None and end_date is None:
        raise PreventUpdate

    date_picker = ''
    if start_date is not None:
        start_date_object = date.fromisoformat(start_date)
        start_date_string = start_date_object.strftime('%Y-%m-%d 00:00:00 UTC')
        date_picker = date_picker + 'Start Date: ' + start_date_string + ' | '
    if end_date is not None:
        end_date_object = date.fromisoformat(end_date)
        end_date_string = end_date_object.strftime('%Y-%m-%d 00:00:00 UTC')
        date_picker = date_picker + 'End Date: ' + end_date_string
    if not date_picker:
        date_picker = 'Select a date to see it displayed here for project'

    humidity_figure = get_humidity_figure(start_date, end_date)
    temp_figure = get_temp_figure(start_date_string, end_date_string)
    soil_moisture_figure = get_soil_moisture_figure(start_date, end_date)

    return date_picker, humidity_figure, temp_figure, soil_moisture_figure
