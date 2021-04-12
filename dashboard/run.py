# https://www.askpython.com/python/examples/build-a-dashboard-in-python
import os
from dashboard import get_dashboard

if __name__ == '__main__':
    project_id = os.environ.get("PROJECT_ID", "")
    port = int(os.environ.get("PORT", 8050))
    debug = os.environ.get("DEBUG", True)
    dashboard = get_dashboard(project_id)

    dashboard.run_server(debug=debug, port=port)
