import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class SensorsComponent extends Component {
  @tracked query = '';
}
