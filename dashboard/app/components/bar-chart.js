import Component from '@glimmer/component';
import { select } from 'd3-selection';
import { arc } from 'd3-shape';
import { action, set } from '@ember/object';
import { scaleLinear, scaleBand } from 'd3-scale';

export default class BarChartComponent extends Component {
    // https://embermap.com/topics/d3/our-first-chart
    // https://github.com/ijlee2/lights-out-octane/app/components/lights-out/template.hbs
    // did insert element() where we get svg from "this"
    // and then append some attributes to it
    //
    testDataVolts = [
	{name: 'sensor-1', volts: 3.75},
	{name: 'sensor-2', volts: 3.55},
	{name: 'sensor-3', volts: 2.05},
    ];

    constructor() {
	super(...arguments);
    }

    @action
    createBarChart() {
	this.createBarChartContainer();
    }

    createBarChartContainer() {
	// Clear the DOM
        document.getElementById('bar-chart').innerHTML = '';

	let sensorVolts = this.testDataVolts.map(data => data.volts)
	let yScale = scaleLinear()
	    .domain([ 0, Math.max(...sensorVolts) ])
	    .range( [ 0, 100 ]);

	let xScale = scaleBand()
	    .domain(this.testDataVolts.map(data => data.name))
	    .range([ 0, 100 ])
            .paddingInner(0.12);

	let barChartContainer = select('#bar-chart').append('svg');

	this.barChartContainer = barChartContainer;

	let barChart = barChartContainer
	    .selectAll('rect')
	    .data(this.testDataVolts)
	    .enter()
	    .append('rect')
	    .attr('width', `${xScale.bandwidth()}%`)
	    .attr('height', sensor => `${yScale(sensor.volts)}%`)
	    .attr('x', data => `${xScale(data.name)}%`)
	    .attr('y', data => `${100 - yScale(data.volts)}%`);

	this.barChart = barChart;
    }
}
