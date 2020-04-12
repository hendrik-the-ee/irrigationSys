import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

// This class is for specific sensor details,
// the index route is for all sensors
export default class SensorRoute extends Route {
    @service store;

    async model(params) {
    return this.store.find('sensor', params.sensor_id);
  }
}
