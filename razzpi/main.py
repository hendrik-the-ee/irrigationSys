from flask import Flask, request
import logging

app = Flask(__name__)

logging.basicConfig(
    filename="sensor_data.log",
    format='%(asctime)s %(message)s',
    datefmt='%m/%d/%Y %I:%M:%S %p',
    level=logging.INFO
)


@app.route('/data', methods = ["POST"])
def data():
    # todo - add authentication for the esp32
    logging.info(request.data)
    # seconds for sleep;
    # need to factor in waking from deep sleep and
    # getting sensor info between requests
    return '12'


app.run(host='0.0.0.0', port=8090)
