import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SensorRoute extends Route {
  // async model(params) {
  //   let response = await fetch(`/api/sensors/${params.sensor_id}.json`);
  //   let { data } = await response.json();

  //   let { id, attributes } = data;

  //   return { id, ...attributes };
    // }
    @service store;

    async model(params) {
	return this.store.find('sensor', params.sensor_id);
    }
}
