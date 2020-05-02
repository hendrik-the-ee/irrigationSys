import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
    async model() {
    	let response = await fetch('/api/devices.json');
    	let { data } = await response.json();
    	return data.map(model => {
    	    let { id, attributes } = model;

    	    return { id, ...attributes };
    	});
    }
}
