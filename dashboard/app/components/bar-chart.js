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

    // volts --> yvalues
    // datetime --> xvalues
    createBarChartContainer() {
    	let { chartData } = this.args;
    	let yValues = chartData.map(data => data.y_value)

    	let yScale = scaleLinear()
    	    .domain([ 0, Math.max(...yValues) ])
    	    .range( [ 0, 100 ]);

    	let xScale = scaleBand()
    	    .domain(chartData.map(data => data.x_value))
    	    .range([ 0, 100 ])
            .paddingInner(0.12);

    	let svg = d3.selectAll('svg');

    	let barChart = svg.selectAll('rect').data(chartData)
    	    .enter()
    	    .append('rect')
    	    .attr('width', `${xScale.bandwidth()}%`)
    	    .attr('height', data => `${yScale(data.y_value)}%`)
    	    .attr('x', data => `${xScale(data.x_value)}%`)
    	    .attr('y', data => `${100 - yScale(data.y_value)}%`)
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

	let labels = svg.selectAll('text').data(chartData).enter();

        labels
	    .append('text')
	    .text(d => d.y_value)
	    .attr('fill', 'white')
	    .attr('x', data => `${xScale(data.x_value)+12}%`)
    	    .attr('y', data => `${120 - yScale(data.y_value)}%`);

	// TODO : update to restrict chart to last 7 days
	// maybe we can add day under each bar that way, using the template?
	// or just use svt:title for day
	labels
	    .append('text')
	    .text(d => d.x_value)
	    .attr('fill', 'white')
	    .attr('x', data => `${xScale(data.x_value)+5}%`)
    	    .attr('y', data => `${135 - yScale(data.y_value)}%`);
    }
}
