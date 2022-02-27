import { DataHelper } from "./dataHelper";

var d3 = require("d3");

export class Mountains {
  constructor(_height, _width, _margins, mountains_data) {
    this.height = _height;
    this.width = _width;
    this.margins = _margins;
    this.svg = d3
      .select("svg#visualiseMountains")
      .attr("width", this.width)
      .attr("height", this.height);
    this.mountainsGroup = this.svg.append("g").attr("id", "mountainsGroup");
    //.attr("transform", "translate(0, 20)");
    this.namesGroup = this.svg.append("g").attr("id", "namesGroup");
    this.tooltipsGroup = this.svg.append("g").attr("id", "tooltipsGroup");

    this.dataHelper = new DataHelper(mountains_data);
    this.mountains_data = this.dataHelper.getTenHighestPeaks();

    // TODO make scales according to the actual mountains data (this.mountains_data);
    console.log("mountains data:");
    console.log(this.mountains_data);

    this.xScale = this.addXAxis([0, 10], false);
    this.yScale = this.addYAxis([0, 3000], false);

    this.plotMountainNames();
    this.plotMountainTopLines();
    this.plotMountains();
  }

  // DEPRECATED?
  updateAndRedraw(id) {
    switch (id) {
      case 0: {
        this.mountains_data = this.dataHelper.getTenHighestPeaks();
        break;
      }
      case 1: {
        this.mountains_data = this.dataHelper.getTenLowestPeaks();
        break;
      }
      case 2: {
        this.mountains_data = this.dataHelper.getTenMostPopular();
        break;
      }
      default:
        break;
    }
    //this.drawMountainsCurved();
  }

  plotMountainNames() {
    this.namesGroup
      .selectAll("text")
      .data(this.mountains_data)
      .join("text")
      .attr("class", (d, i) => d.name)
      .attr("x", (d, i) => this.xScale(i * 2 + 1))
      .attr("y", (d, i) => this.yScale(200))
      .text((d, i) => d.name);

    this.namesGroup.selectAll("text").each(function () {
      let element = d3.select(this);
      //console.log(element);
      let nameLength = element.node().getBoundingClientRect().width;
      element.attr("x", element.attr("x") - nameLength / 2);
    });

    /*this.tooltips.attr("x", function () {
      let nameLength = d3.select(this).node().getBoundingClientRect().width;
      console.log(nameLength);
      debugger;
    });
    */
  }

  plotMountainTopLines() {
    this.tooltipsGroup
      .append("g")
      .selectAll("line")
      .data(this.mountains_data)
      .join("line")
      .attr("x1", (d, i) => this.xScale(i * 2 + 1))
      .attr("x2", (d, i) => this.xScale(i * 2 + 1))
      .attr("y1", 0)
      .attr("y2", (d, i) => this.yScale(d.height + 100))
      .attr("stroke", "gray");
  }

  getLinePath() {
    return d3
      .line()
      .x((d) => this.xScale(d.x))
      .y((d) => this.yScale(d.height));
  }

  getMountainRoutesData() {
    let addedRoutes = [];
    let addedMountains = [];
    let i = 1;
    //this.mountains_data = this.mountains_data.slice(0, 2);
    console.log(this.mountains_data);
    this.mountains_data.forEach((mountain) => {
      let fullHeight = mountain.height;
      let scaleRoutesX = d3
        .scaleLinear()
        .domain([0, mountain.peakRoutes.length - 1])
        .range([i - 0.5, i + 0.5]);

      addedRoutes = [];
      mountain.peakRoutes.forEach((r, j) => {
        let heightDiff = fullHeight - r.heightDiff;
        addedRoutes.push({
          route: [
            { x: scaleRoutesX(j), height: heightDiff },
            { x: i, height: fullHeight },
          ],
          viewStotal: Number(
            r.viewsTotal.replaceAll(",", "").replaceAll(".", "")
          ),
          name: r.name,
          difficulty: r.difficulty,
          heightDiff: heightDiff,
          walkTime: this.getIntHours(r.walkTime),
          position: i,
        });
      });
      addedMountains.push({
        name: mountain.name,
        routes: addedRoutes,
        position: i,
      });
      i += 2;
    });

    console.log("added mountains");
    console.log(addedMountains);
    return addedMountains;
  }

  plotMountains() {
    let xScale = this.xScale;
    let tooltipsGroup = this.tooltipsGroup;
    let mountains = this.getMountainRoutesData();
    console.log("addedRoutes");
    console.log(mountains);
    console.log(mountains.routes);

    let groupRoutes = this.mountainsGroup
      .selectAll("g")
      .data(mountains)
      .join("g")
      .attr("class", (d, i) => d.name.replaceAll(" ", "_"));

    let backgroundRoutes = groupRoutes
      .append("g")
      .classed("background-routes", true)
      .selectAll("path")
      .data((d, i) => d.routes)
      .join("path")
      .attr("d", (d, i) => this.getLinePath()(d.route))
      .attr("opacity", "0.1")
      .attr("stroke-width", "6")
      .attr("stroke", "lightgray");

    let transitionRoutes = groupRoutes
      .append("g")
      .classed("transition-routes", true)
      .selectAll("path")
      .data((d, i) => d.routes)
      .join("path")
      .attr("d", (d, i) => this.getLinePath()(d.route))
      .attr("opacity", "0.8")
      .attr("stroke", (d, i) => {
        switch (d.difficulty) {
          case "zelo zahtevna označena pot":
            return "red";

          case "zelo zahtevna neoznačena steza":
            return "blue";

          case "zelo zahtevna označena pot":
            return "red";

          case "izjemno zahtevna označena pot":
            return "green";

          case "zelo zahtevno brezpotje":
            return "gray";

          case "alpinistični vzpon":
            return "black";

          case "zahtevna označena pot":
            return "lightgray";

          default:
            break;
        }
      })
      .attr("stroke-width", (d, i) => d.popularity)
      //.attr("stroke-dasharray", "5 10") // 10
      .attr("stroke-dasharray", (d, i) => {
        // TODO dinamically form groups
        if (d.viewStotal < 1000) {
          return "5 30";
        } else if (d.viewStotal >= 1000 && d.viewStotal < 10000) {
          return "5 25";
        } else if (d.viewStotal >= 10000 && d.viewStotal < 100000) {
          return "5 15";
        } else if (d.viewStotal >= 100000) {
          return "5 10";
        }
      }); // 10;

    if (false)
      transitionRoutes
        .append("animate")
        .attr("attributeName", "stroke-dashoffset")
        .attr("values", "-50;-20000")
        .attr("dur", "500s")
        .attr("repeatCount", "indefinite");
    /*
      <animate attributeName="stroke-dashoffset" values="-50;-200" dur="5s" repeatCount="indefinite"></animate>

    <animate
      attributeName="stroke-dashoffset"
      values="-50;-200"
      dur="5s"
      repeatCount="indefinite"
    ></animate>;
*/
    groupRoutes.on("mouseenter", function (ev, d) {
      // append route name, heightDiff, Time
      tooltipsGroup.select("g.routeInfo").remove();
      debugger;
      let routeInfo = tooltipsGroup.append("g").classed("routeInfo", true);

      routeInfo
        .append("text")
        .text(d.name)
        .attr("x", xScale(d.position))
        .attr("y", 15);

      routeInfo
        .append("text")
        .text(d.difficulty)
        .attr("x", xScale(d.position))
        .attr("y", 35);

      routeInfo
        .append("text")
        .text(d.viewStotal)
        .attr("x", xScale(d.position))
        .attr("y", 55);

      routeInfo
        .append("text")
        .text(d.walkTime + "h")
        .attr("x", xScale(d.position))
        .attr("y", 75);

      //console.log(d3.select(this));

      //this.mountainsGroup.selectAll("path").attr("opacity", "0.2");
      //routePathElement.attr("opacity", "0.1");

      //console.log(d3.select(this));
      //d3.select(this).attr("opacity", "1");

      if (false)
        d3.select(this)
          .transition()
          .duration(10000000)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", (d, i) => {
            if (d.walkTime <= 3) {
              return -500000;
            } else if (d.walkTime > 3 && d.walkTime <= 5) {
              return -300000;
            } else {
              return -100000;
            }
          });

      console.log(d);
      //console.log(i);
    });

    groupRoutes.on("mouseleave", (d, i) => {
      this.tooltipsGroup.select("g.routeInfo").remove();
      groupRoutes.attr("opacity", "1");
    });

    if (false)
      groupRoutes
        .append("path")
        .attr("d", (d, i) => this.getLinePath()(d.route))
        .attr("opacity", "0.8")
        .attr("stroke", "transparent")
        .attr("stroke-width", 2)
        .attr("fill", "blue")
        .on("mouseenter", (d, i) => {
          console.log(d3.select(this));
          console.log(d);
          console.log(i);
        });

    if (false)
      groupRoutes
        .transition()
        .duration(10000000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", (d, i) => {
          if (d.walkTime <= 3) {
            return -500000;
          } else if (d.walkTime > 3 && d.walkTime <= 5) {
            return -300000;
          } else {
            return -100000;
          }
        });

    //this.pathTransition(transitionRoutes, 1);
  }

  getIntHours(walkTime) {
    walkTime = walkTime.replace("15", 25).replace("30", 50).replace("45", 75);
    walkTime = walkTime.replace("min", "").replace("h", ".");
    walkTime = walkTime.replaceAll(" ", "");
    return Number(walkTime);
  }

  // makes the path look as if it's transiting. duration = speed
  pathTransition(route, speed) {
    let duration = 100000;
    let str_offset = 0;
    if (speed === 1) {
      str_offset = -5000;
    } else if (speed === 2) {
      str_offset = -3000;
    } else if (speed === 3) {
      str_offset = -1000;
    }

    route
      .transition()
      .duration(duration)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", str_offset);
    /*
      .on("end", () => {
        str_offset -= 50;
        console.log("str_offset:" + str_offset);
        console.log("duration:" + duration);
        //this.pathTransition(route, str_offset, duration);
      });
      */
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

  addXAxis(domain, shouldPlot) {
    let xScale = this.getXScale(domain);
    if (shouldPlot) {
      let xAxis = (g) =>
        g
          .attr(
            "transform",
            `translate(0,${this.height - this.margins.bottom})`
          )
          .call(d3.axisBottom(xScale));
      this.svg.append("g").call(xAxis);
    }
    return xScale;
  }

  addYAxis(domain, shouldPlot) {
    let yScale = this.getYScale(domain);
    if (shouldPlot) {
      let yAxis = (g) =>
        g
          .attr("transform", `translate(${this.margins.left},0)`)
          .call(d3.axisLeft(yScale));
      this.svg.append("g").call(yAxis);
    }

    return yScale;
  }

  getXScale(domain) {
    return d3
      .scaleLinear()
      .domain(domain)
      .range([this.margins.left, this.width - this.margins.right]);
  }

  getYScale(domain) {
    return d3
      .scaleLinear()
      .domain(domain)
      .range([this.height - this.margins.bottom, this.margins.top]);
  }
}
//initChart();
