
function generate_dataset(het, prev) {
    pen = d3.range(0.05, 1.05, 0.05).map(d3.format("0.2"))
    var maf = whiffin(het, prev, pen);
    var dataset = [];
    for (i = 0; i < maf.length; i++) {
        dataset.push({
            "x": parseFloat(pen[i]),
            "y": parseFloat(maf[i])
        })
    }
    return dataset
};


function whiffin(het, prev, pen) {
    if (het === 0 || prev === 0) {
        return Array(pen.length).fill(0)
    }
    let prev_inv = 1 / prev;
    maf = [];
    for (i = 0; i < pen.length; i++) {
        maf_i = (prev_inv * het) / pen[i]
        maf.push(maf_i)
    }
    return maf.map(d3.format('0.4'))
};


class WhiffinPlot {

    constructor() {
        this.margin = { top: 10, right: 30, bottom: 30, left: 60 };
        this.width = 460 - this.margin.left - this.margin.right;
        this.height = 400 - this.margin.top - this.margin.bottom;
        this.svg = d3.select("#whiffin")
            .append("svg")
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom)
                .append("g")
                    .attr("transform",
                        "translate(" +this.margin.left + "," + this.margin.top + ")");

        //Init dataset
        this.het = 0.05;
        this.prev = 1000;
        this.data_init = generate_dataset(this.het, this.prev);
        //console.log("this.data_init:", this.data_init);

        //Init plot with axes
        //console.log("init:", this.data_init);
        var xScale = d3.scaleLinear()
            .domain([0, d3.max(this.data_init, d => +d.x)]).nice()
            .range([0, this.width]);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(this.data_init, d => +d.y)]).nice()
            .range([this.height - 150, 0]);

        this.svg
            .append("g")
                .attr("class", "xaxis")
                .attr("transform", "translate(0," + (this.height - 150) + ")")
            .call(d3.axisBottom(xScale));

        this.svg
            .append("g")
                .attr("class", "yaxis")
            .call(d3.axisLeft(yScale));

        //Init axis labels
        this.svg
            .append("text")
            .attr("transform",
                "translate(" + (this.width / 2) + " ," + (this.height - 115) + ")")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Penetrance");
        this.svg
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.margin.left)
            .attr("x", 0 - ((this.height - 150) / 2))
            .attr("dy", "0.75em")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Max. credible allele freq.");
        //Init curve with defaults:
        this.line = d3.line()
            .x(function (d) { return xScale(d.x); })
            .y(function (d) { return yScale(d.y); })
            .curve(d3.curveBasis)

        this.myLine = this.svg
            .append("g")
                .append("path")
                .datum(this.data_init)
                .attr("d", this.line)
                    .attr("fill", "none")
                    .attr("stroke", "purple")
                    .attr("opacity", "0.8")
                    .attr("stroke-width", 1.5);
    };

    update(dataset) {

        var yScaleNew = d3.scaleLinear()
            .domain([0, d3.max(dataset, d => +d.y)]).nice()
            .range([this.height - 150, 0]);
        var xScaleNew = d3.scaleLinear()
            .domain([0, d3.max(dataset, d => +d.x)]).nice()
            .range([0, this.width]);

        //console.log("updated data:", dataset)

        this.svg.select(".yaxis")
            .call(d3.axisLeft(yScaleNew))
        
        var lineNew = d3.line()
            .x(function (d) { return xScaleNew(d.x); })
            .y(function (d) { return yScaleNew(d.y); })
            .curve(d3.curveBasis)

        this.myLine
            .datum(dataset)
            .transition()
            .duration(100)
            .attr("d", lineNew)
                .attr("fill", "none")
                .attr("stroke", "purple")
                .attr("opacity", "0.8")
                .attr("stroke-width", 1.5);
    };
}