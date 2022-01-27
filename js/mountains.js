import { DataPreparer } from "./dataPreparer";

var d3 = require("d3");

export class Mountains {
  constructor(_height, _width, _margins, mountains_data) {
    this.dataPreparer = new DataPreparer(mountains_data);
    this.mountains_data = this.dataPreparer.getTenLowestPeaks();
    console.log(this.mountains_data);
    this.height = _height;
    this.width = _width;
    this.margins = _margins;
    this.svg = d3
      .select("svg#visualiseMountains")
      .attr("width", this.width)
      .attr("height", this.height);
    this.xScale = this.getXScale([0, 1]);
    this.yScale = this.getYScale([0, 3000]);
    this.tooltips = undefined;
    this.mountains = undefined;
    this.addXAxis();
    this.addYAxis();
    this.mountains = this.svg.append("g").attr("id", "mountains");
    this.tooltips = this.svg.append("g").attr("id", "tooltips");
    this.drawMountainsCurved();
  }

  updateAndRedraw(id) {
    switch (id) {
      case 0: {
        this.mountains_data = this.dataPreparer.getTenHighestPeaks();
        break;
      }
      case 1: {
        this.mountains_data = this.dataPreparer.getTenLowestPeaks();
        break;
      }
      case 2: {
        this.mountains_data = this.dataPreparer.getTenMostPopular();
        break;
      }
      default:
        break;
    }
    //this.drawMountainsCurved();
  }

  drawMountains() {
    this.addTooltips();
    this.addMountainPolygons();
  }

  drawMountainsCurved() {
    //this.addTooltips();
    //this.addMountainPolygons();
    this.addMountainsCurved();
  }

  addTooltips() {
    this.tooltips
      .selectAll("line")
      .data(this.mountains_data)
      .join("line")
      .transition()
      .delay(50)
      .attr("x1", (d, i) => this.getOverheadDottedX(d, i))
      .attr("x2", (d, i) => this.getOverheadDottedX(d, i))
      .attr("y1", 0)
      .attr("y2", (d, i) => this.getOverheadDottedY(d, i))
      .attr("stroke", "black")
      .attr("stroke-dasharray", "6 6");

    this.tooltips
      .selectAll("text")
      .data(this.mountains_data)
      .join("text")
      .attr("id", (d, i) => d.name)
      .attr("x", (d, i) => this.getOverheadDottedX(d, i) + 5)
      .attr("y", (d, i) => 20)
      .text((d, i) => d.name);

    /*
    this.tooltips
      .selectAll("g")
      .append("text")
      .attr("x", (d, i) => this.getOverheadDottedX(d, i) + 5)
      .attr("y", (d, i) => 40)
      .text((d, i) => `${d.Size}m`);
      */
  }

  getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
  }

  addMountainPolygons() {
    console.log("mountain polygons");
    console.log(this.mountains_data);
    this.mountains
      .selectAll("polygon")
      .data(this.mountains_data)
      .join("polygon")
      .transition()
      .attr("points", (d, i) => this.getTrianglePoints(d, i))
      .attr("fill", "darkgreen")
      .attr("stroke", "gray")
      .attr("stroke-width", "2");
  }

  addMountainsCurved() {
    // TODO make scale values global
    let mountainScaleX = d3.scaleLinear().domain([0, 5]).range([50, 1350]);
    let mountainScaleY = d3.scaleLinear().domain([0, 3000]).range([550, 50]);

    let mountainPath = d3
      .line()
      //.curve(d3.curveCardinal)
      //.curve(d3.curveBumpX) // seems to be the best for now...
      .curve(d3.curveNatural) //
      .x((d) => mountainScaleX(d.step))
      .y((d) => mountainScaleY(d.value));

    let mountainData = [
      { step: 0, value: 0 },
      { step: 1, value: 3000 },
      { step: 2, value: 1400 },
      { step: 3, value: 2600 },
      { step: 4, value: 1300 },
    ];

    let routeScaleX = d3.scaleLinear().domain([0, 5]).range([50, 1350]);
    let routeScaleY = d3.scaleLinear().domain([0, 3000]).range([550, 50]);

    let routePath = d3
      .line()
      //.curve(d3.curveBumpY) // seems like the best so fat
      .curve(d3.curveNatural) // seems like the best so fat
      //.lineRadial()

      .x((d) => routeScaleX(d.step))
      .y((d) => routeScaleY(d.value));

    let route1 = [
      /*{ step: 1.15, value: 300 },*/
      /*{ step: 0.85, value: 600 },
      { step: 1.15, value: 1200 },
      { step: 0.85, value: 2400 },*/
    ];

    if (false)
      for (let i = 0; i < 1; i++) {
        route1.push({ step: this.getRandomInt(70, 130) / 100, value: i * 150 });
      }

    route1.push({ step: 1.5, value: 600 });
    route1.push({ step: 1.25, value: 2200 });
    route1.push({ step: 1, value: 3000 });

    console.log(route1);

    let route2 = [
      { step: 1.35, value: 500 },
      /*{ step: 0.75, value: 700 },
      { step: 1.15, value: 1400 },
      { step: 0.85, value: 2200 },*/
      { step: 1, value: 3000 },
    ];

    let route3 = [
      { step: 0.85, value: 800 },
      /*{ step: 0.95, value: 1200 },
      { step: 0.95, value: 1600 },
      { step: 1.05, value: 2300 },*/
      { step: 1, value: 3000 },
    ];

    //let pathData = [{start:300},{},{},{}];

    let el = d3.select("#visualiseMountains");
    el.append("path")
      .attr("d", mountainPath(mountainData))
      .attr("stroke", "black")
      .attr("fill", "none");

    let route1_path = el
      .append("path")
      .classed("route1", true)
      .attr("d", routePath(route1))
      .attr("stroke", "gray")
      .attr("stroke-width", "3")
      .attr("stroke-dasharray", 10)
      .attr("fill", "none");

    // Trying to animate route1

    let str_offset_1 = -50;
    let str_offset_2 = -50;
    let str_offset_3 = -50;

    function pathTransition(route, str_offset, duration) {
      route
        .transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", str_offset)
        .on("end", () => {
          str_offset -= 50;
          pathTransition(route, str_offset, duration);
        });
    }
    pathTransition(route1_path, str_offset_1, 500);

    if (true) {
      let route2_path = el
        .append("path")
        .classed("route2", true)
        .attr("d", routePath(route2))
        .attr("stroke", "gray")
        .attr("stroke-dasharray", 10)
        .attr("fill", "none");

      pathTransition(route2_path, str_offset_2, 5000);

      let route3_path = el
        .append("path")
        .classed("route3", true)
        .attr("d", routePath(route3))
        .attr("stroke", "gray")
        .attr("stroke-dasharray", 10)
        .attr("fill", "none");

      pathTransition(route3_path, str_offset_3, 2000);
    }
    /*
    el.selectAll("path").on("mouseenter", function () {
      d3.select(this).attr("stroke", "black");
    });

    el.selectAll("path").on("mouseleave", function () {
      d3.select(this).attr("stroke", "lightgray");
    });
    */
    /*
    this.mountains
      .selectAll("polygon")
      .data(this.mountains_data)
      .join("polygon")
      .transition()
      .attr("points", (d, i) => this.getTrianglePoints(d, i))
      .attr("fill", "darkgreen")
      .attr("stroke", "gray")
      .attr("stroke-width", "2");*/
  }

  getOverheadDottedX(d, i) {
    let fullWidth = 300;
    let xMargin = (i + 1) * 100;
    let x = xMargin + fullWidth / 2;
    return x;
  }

  getOverheadDottedY(d, i) {
    return this.yScale(d.height);
  }

  getTrianglePoints(d, i) {
    let fullWidth = 300;
    let fullHeight = this.height - /*yScale(d.Size)*/ this.margins.top;
    let y = this.yScale(d.height);
    let xMargin = (i + 1) * 100;

    let topX = 250;
    topX = xMargin + fullWidth / 2;
    let topY = 60;
    topY = y;
    let leftX = 100;
    leftX = xMargin;
    let leftY = 400;
    leftY = fullHeight;
    let rightX = 400;
    rightX = fullWidth + xMargin;
    let rightY = 400;
    rightY = fullHeight;

    return `${topX},${topY} ${leftX},${leftY} ${rightX},${rightY}`;
  }

  addXAxis() {
    let xAxis = (g) =>
      g
        .attr("transform", `translate(0,${this.height - this.margins.bottom})`)
        .call(d3.axisBottom(this.xScale));
    this.svg.append("g").call(xAxis);
  }

  addYAxis() {
    let yAxis = (g) =>
      g
        .attr("transform", `translate(${this.margins.left},0)`)
        .call(d3.axisLeft(this.yScale));
    this.svg.append("g").call(yAxis);
  }

  getXScale(domain) {
    return (
      d3
        .scaleLinear()
        //.domain([0, 3000])
        .domain(domain)
        .range([this.margins.left, this.width - this.margins.right])
    );
  }

  getYScale(domain) {
    return (
      d3
        .scaleLinear()
        //.domain([0, 3000])
        .domain(domain)
        .range([this.height - this.margins.bottom, this.margins.top])
    );
  }
}
//initChart();
