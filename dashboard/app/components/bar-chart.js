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
    // testDataVolts = [
    // 	{name: 'sensor-1', volts: 3.75},
    // 	{name: 'sensor-2', volts: 3.55},
    // 	{name: 'sensor-3', volts: 2.05},
    // ];

    constructor() {
	super(...arguments);
    }

    get chartName() {
	let { name } = this.args;
	return name;
    }

    @action
    createBarChart() {
	this.createBarChartContainer();
    }

    createBarChartContainer() {
	let { chartData } = this.args;
	let sensorVolts = chartData.map(data => data.volts)

	let yScale = scaleLinear()
	    .domain([ 0, Math.max(...sensorVolts) ])
	    .range( [ 0, 100 ]);

	let xScale = scaleBand()
	    .domain(chartData.map(data => data.datetime))
	    .range([ 0, 100 ])
            .paddingInner(0.12);

	let barChartContainers = d3.selectAll('svg');

	this.barChartContainers = barChartContainers;

	let barChart = this.barChartContainers.selectAll('rect').data(chartData)
	    .enter()
	    .append('rect')
	    .attr('width', `${xScale.bandwidth()}%`)
	    .attr('height', data => `${yScale(data.volts)}%`)
	    .attr('x', data => `${xScale(data.datetime)}%`)
	    .attr('y', data => `${100 - yScale(data.volts)}%`)
	    .attr('fill', 'blue');

	barChart.append('svg:title').text(d => d.datetime);

	barChart.on('mouseover', data => {
	            select(event.currentTarget).style('fill', "green");
	    })
	    .on('mouseout', () => {
		select(event.currentTarget)
		    .style('fill', 'blue');
	    });

	this.barChart = barChart;
    }
}
