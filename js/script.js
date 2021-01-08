var prevalence = [];
var penetrance = [];
var heterogeneity = [];

base_prev = 10;
for (var i = 10; i >= 0; i--) {
    prevalence.push(base_prev * (2 ** i))
}

for (var i = 0.005; i <= 1; i = i + 0.01) {
    penetrance.push(i)
    heterogeneity.push(i)
}

//Prevalence slider
var prev = 1000;
d3.select('p#value-prev')
            .text("1 in " + parseInt(Math.round(prev)))
            .style('font-size', '11px');
var sliderPrev = d3
    .sliderBottom()
    .min(d3.max(prevalence))
    .max(d3.min(prevalence))
    .width(300)
    .ticks(10)
    .step(10)
    .default(prev)
    .fill('orange')
    .on('onchange', val => {
        d3.select('p#value-prev')
            .text("1 in " + parseInt(Math.round(val)))
            .style('font-size', '11px');
        prev = val;
        //update dataset
        var dataset_updated = generate_dataset(het, prev)
        //console.log(dataset_updated)
        whiffinPlot.update(dataset_updated);
    });

var gPrev = d3
    .select('div#slider-prev')
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .attr('id', 'sliderPrev')
    .append('g')
    .attr('transform', 'translate(30,30)');

gPrev.call(sliderPrev);

//Heterogeneity slider
var het = 0.05;
d3.select('p#value-het')
            .text(d3.format('.2')(het))
            .style('font-size', '11px');
var sliderHet = d3
    .sliderBottom()
    .min(d3.min(heterogeneity))
    .max(d3.max(heterogeneity))
    .width(300)
    .ticks(10)
    .step(0.01)
    .default(het)
    .fill('steelblue')
    .on('onchange', val => {
        d3.select('p#value-het')
            .text(d3.format('.2')(val))
            .style('font-size', '11px');
        het = val;
        //update dataset
        var dataset_updated = generate_dataset(het, prev)
        //console.log(dataset_updated)
        whiffinPlot.update(dataset_updated);
    });

var gHet = d3
    .select('div#slider-het')
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .attr('id', 'sliderHet')
    .append('g')
    .attr('transform', 'translate(30,30)');

gHet.call(sliderHet);

let whiffinPlot = new WhiffinPlot();