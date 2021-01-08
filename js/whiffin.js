function generate_dataset(het, prev) {
    pen = d3.range(0.05, 1.05, 0.005).map(d3.format("0.2"))
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
        this.margin = { top: 10, right: 80, bottom: 30, left: 80 };
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
        var dataset = generate_dataset(this.het, this.prev);
        //console.log("this.data_init:", this.data_init);

        //Init plot with axes
        //console.log("init:", this.data_init);
        var xScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, d => +d.x)]).nice()
            .range([0, this.width]);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, d => +d.y)]).nice()
            .range([this.height - 150, 0]);

        var tooltip = d3.select("body")
            .append("div")   
                .attr("class", "tooltip")
                .style("opacity", 0);

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
                .datum(dataset)
                .attr("d", this.line)
                    .attr("fill", "none")
                    .attr("stroke", "purple")
                    .attr("opacity", "0.8")
                    .attr("stroke-width", 1.5);

        //Tooltip code
        var bisect = d3.bisector(function(d) { return d.x; }).left;

        // Create the circle that travels along the curve of chart
        var focus = this.svg
            .append('g')
                .append('circle')
                    .style("fill", "darkgray")
                    .attr("stroke", "black")
                    .attr('r', 5)
                    .style("opacity", 0)

        // Create the text that travels along the curve of chart
        var focusText = this.svg
            .append('g')
                .append('text')
                    .style("opacity", 0)
                    .attr("text-anchor", "left")
                    .attr("alignment-baseline", "middle")
                    .style("font-size", "9px")

        var focusText2 = this.svg
            .append('g')
                .append('text')
                    .style("opacity", 0)
                    .attr("text-anchor", "left")
                    .attr("alignment-baseline", "middle")
                    .style("font-size", "9px")

        // Create a rect on top of the svg area: this rectangle recovers mouse position
        this.svg
          .append('rect')
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('width', this.width)
            .attr('height', this.height - 130)
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseout', mouseout);

        // What happens when the mouse move -> show the annotations at the right positions.
        function mouseover() {
            focus.style("opacity", 0.7)
            focusText.style("opacity",1)
            focusText2.style("opacity",1)
        }

        function mousemove() {
            // recover coordinate we need
            var x0 = xScale.invert(d3.mouse(this)[0]);
            var i = bisect(dataset, x0, 1);
            var selectedData = dataset[i];
            focus
                .attr("cx", xScale(selectedData.x))
                .attr("cy", yScale(selectedData.y))
            focusText
                .html("Penetrance: " + selectedData.x)
                    .attr("x", xScale(selectedData.x) + 15)
                    .attr("y", yScale(selectedData.y) - 12)
            focusText2
                .html("MCAF: " + selectedData.y)
                    .attr("x", xScale(selectedData.x) + 15)
                    .attr("y", yScale(selectedData.y) - 3)
        }

        function mouseout() {
            focus.style("opacity", 0)
            focusText.style("opacity", 0)
            focusText2.style("opacity", 0)
        }
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