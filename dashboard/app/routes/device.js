import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class DeviceRoute extends Route {
    async model(params) {
	let response = await fetch(`/api/devices/${params.device_id}.json`);
	let { data } = await response.json();
	let { id, attributes } = data;

	return { id, ...attributes };
    }
}
