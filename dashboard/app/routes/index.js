import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
    // async model() {
    // 	let response = await fetch('/api/sensors.json');
    // 	let { data } = await response.json();
    // 	console.log(data)
    // 	return data.map(model => {
    // 	    let { id, attributes } = model;

    // 	    return { id, ...attributes };
    // 	});
    // }
    @service store;

    async model() {
	return this.store.findAll('sensor');
    }
}
