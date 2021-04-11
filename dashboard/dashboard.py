# https://www.askpython.com/python/examples/build-a-dashboard-in-python
import dash
import dash_core_components as dcc
import dash_html_components as html
import plotly.express as px
import pandas as pd

external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']

app = dash.Dash(__name__, external_stylesheets=external_stylesheets)

colors = {
    'background': '#F0F8FF',
    'text': '#00008B'
}

# Our dataframe
df = pd.read_csv('4-6-2021_hydrobot_data.csv')

x = 'CreatedAt'
fig = px.scatter(df, x=x, y=['Soil Temp (F)', 'Air Temp', 'Humidity'])
fig.update_traces(mode='markers+lines')
#fig.show()

app.layout = html.Div(children=[
    html.H1(children='Hydrobot Dashboard'),

    html.Div(children='''
        Dates: April 6, 2021 (3:49:42 through 15:47:01)
    '''),

    dcc.Graph(
        id='temp-and-humidity',
        figure=fig
    )
])

if __name__ == '__main__':
    app.run_server(debug=True)
