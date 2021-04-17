# https://www.askpython.com/python/examples/build-a-dashboard-in-python
import os
from dashboard import get_dashboard

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8050))
    debug = os.environ.get("DEBUG", True)
    dashboard = get_dashboard()

    dashboard.run_server(debug=debug, port=port)
