import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  async model() {
    return {
      name: 'Sensor 1',
      controller: 'Pi 1',
      location: {
        lat: 37.7749,
        lng: -122.4194,
      },
	type: 'Moisture',
	last_sent_data: '2020-04-04 08:15:27',
    };
  }
}
