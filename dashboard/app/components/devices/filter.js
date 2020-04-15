import Component from '@glimmer/component';

export default class DevicesFilterComponent extends Component {
  get results() {
    let { devices, query } = this.args;

    if (query) {
      devices = devices.filter(device => device.name.includes(query));
    }

    return devices;
  }
}
