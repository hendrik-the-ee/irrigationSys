from flask import Flask, request
import logging
import gpio

app = Flask(__name__)

logging.basicConfig(
    filename="sensor_data.log",
    format='%(message)s',
    datefmt='%m/%d/%Y %I:%M:%S %p',
    level=logging.INFO
)

# Set GPIO parameters
PIN = 24
gpio.initialize_gpio(PIN)

SLEEP_TIME = 30 # seconds

@app.route('/data', methods = ["POST"])
def data():
    # todo - add authentication for the esp32
    logging.info(request.data)
    return str(SLEEP_TIME)

app.run(host='0.0.0.0', port=8090)
