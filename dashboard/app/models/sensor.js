import Model, { attr } from '@ember-data/model';

export default class SensorModel extends Model {
  @attr name;
  @attr controller;
  @attr location;
  @attr category;
  @attr last_sent_data;
}
