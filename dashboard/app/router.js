import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
    this.route('reports');
    this.route('device', { path: '/devices/:device_id' });
    this.route('sensor', { path: '/sensors/:sensor_id' });
    this.route('controller', { path: '/controllers/:controller_id' });
});
