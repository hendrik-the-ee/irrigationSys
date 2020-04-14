import Component from '@glimmer/component';

export default class SensorsFilterComponent extends Component {
  get results() {
    let { sensors, query } = this.args;

    if (query) {
      sensors = sensors.filter(sensor => sensor.name.includes(query));
    }

    return sensors;
  }
}
