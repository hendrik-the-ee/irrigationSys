from flask import Flask, request

app = Flask(__name__)

@app.route('/data', methods = ["POST", "GET"])
def data():
    return 'hello from the raspberry pi!'

app.run(host='0.0.0.0', port=8090)
