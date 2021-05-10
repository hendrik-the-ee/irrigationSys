"""Python Flask WebApp Auth0 integration example
"""
from functools import wraps
import json
from os import environ as env
from werkzeug.exceptions import HTTPException

from dotenv import load_dotenv, find_dotenv
from flask import Flask
from flask import jsonify
from flask import redirect
from flask import render_template
from flask import session
from flask import url_for
from authlib.integrations.flask_client import OAuth
from six.moves.urllib.parse import urlencode
from dashboard.dashboard import get_dashboard
from werkzeug.serving import run_simple
from werkzeug.middleware.dispatcher import DispatcherMiddleware

import constants

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

AUTH0_CALLBACK_URL = env.get(constants.AUTH0_CALLBACK_URL)
AUTH0_CLIENT_ID = env.get(constants.AUTH0_CLIENT_ID)
AUTH0_CLIENT_SECRET = env.get(constants.AUTH0_CLIENT_SECRET)
AUTH0_DOMAIN = env.get(constants.AUTH0_DOMAIN)
AUTH0_BASE_URL = 'https://' + AUTH0_DOMAIN
AUTH0_AUDIENCE = env.get(constants.AUTH0_AUDIENCE)

server = Flask(__name__, static_url_path='/public', static_folder='./public')
server.secret_key = constants.SECRET_KEY
server.debug = True

#dash_app = get_dashboard()
#dash_app.server = server

# see: https://stackoverflow.com/questions/59627976/integrating-dash-apps-into-flask-minimal-example
#app = DispatcherMiddleware(server, {
#    '/dash1': dash_app.server,
#})

@server.errorhandler(Exception)
def handle_auth_error(ex):
    response = jsonify(message=str(ex))
    response.status_code = (ex.code if isinstance(ex, HTTPException) else 500)
    return response


oauth = OAuth(server)

auth0 = oauth.register(
    'auth0',
    client_id=AUTH0_CLIENT_ID,
    client_secret=AUTH0_CLIENT_SECRET,
    api_base_url=AUTH0_BASE_URL,
    access_token_url=AUTH0_BASE_URL + '/oauth/token',
    authorize_url=AUTH0_BASE_URL + '/authorize',
    client_kwargs={
        'scope': 'openid profile email',
    },
)


def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if constants.PROFILE_KEY not in session:
            return redirect('/login')
        return f(*args, **kwargs)

    return decorated


# Controllers API
@server.route('/')
def home():
    return render_template('home.html')


@server.route('/callback')
def callback_handling():
    auth0.authorize_access_token()
    resp = auth0.get('userinfo')
    userinfo = resp.json()

    session[constants.JWT_PAYLOAD] = userinfo
    session[constants.PROFILE_KEY] = {
        'user_id': userinfo['sub'],
        'name': userinfo['name'],
        'picture': userinfo['picture']
    }
    return redirect('http://localhost:8050/dashboard/', code=302)

@server.route('/login')
def login():
    return auth0.authorize_redirect(redirect_uri=AUTH0_CALLBACK_URL, audience=AUTH0_AUDIENCE)


@server.route('/logout')
def logout():
    session.clear()
    params = {'returnTo': url_for('home', _external=True), 'client_id': AUTH0_CLIENT_ID}
    return redirect(auth0.api_base_url + '/v2/logout?' + urlencode(params))


@server.route('/dashboard/')
@requires_auth
def dashboard():
    #return render_template('dashboard.html',
    #                       userinfo=session[constants.PROFILE_KEY],
    #                       userinfo_pretty=json.dumps(session[constants.JWT_PAYLOAD], indent=4))
    return redirect("http://localhost:8050/dashboard/")


if __name__ == "__main__":
    server.run(host='0.0.0.0', port=env.get('PORT', 3000))
    #run_simple('0.0.0.0', 3000, app, use_reloader=True, use_debugger=True)
