import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class DevicessComponent extends Component {
  @tracked query = '';
}
