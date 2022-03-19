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
      .attr("height", this.height + 200);

    this.svg = this.svg.append("g").classed("container", true);

    this.mountainsGroup = this.svg.append("g").attr("id", "mountainsGroup");
    this.namesGroup = this.svg.append("g").attr("id", "namesGroup");
    this.tooltipsGroup = this.svg.append("g").attr("id", "tooltipsGroup");

    this.dataHelper = new DataHelper(mountains_data);
    this.mountains_data = this.dataHelper.getHighestPeaks(10);

    /*
    console.log("mountains data:");
    console.log(this.mountains_data);
    */
    this.xScale = this.addXAxis([0, 10], false);
    this.yScale = this.addYAxis([0, 3000], false);

    this.plotMountainNames();
    this.plotMountains();
  }

  // DEPRECATED?
  updateAndRedraw(id) {
    switch (id) {
      case 0: {
        this.mountains_data = this.dataHelper.getHighestPeaks(10);
        break;
      }
      case 1: {
        this.mountains_data = this.dataHelper.getLowestPeaks(10);
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
    let animatePathsFunction = this.animatePaths;
    this.namesGroup
      .selectAll("g")
      .data(this.mountains_data)
      .join((enter) => {
        const g = enter.append("g");
        g.attr("class", (d, i) => this.sanitizeString(d.name));
        g.append("text")
          .attr("x", (d, i) => this.xScale(i * 2 + 1))
          .attr("y", (d, i) => this.yScale(d.height) - 40)
          .text((d, i) => d.name);

        g.append("text")
          .attr("x", (d, i) => this.xScale(i * 2 + 1))
          .attr("y", (d, i) => this.yScale(d.height) - 20)
          .text((d, i) => d.height + "m");
        return g;
      })
      .on("mouseleave", (ev, d) => {
        animatePathsFunction(
          d3.selectAll("#" + this.sanitizeString(d.name) + " .transition_path"),
          false
        );
      });

    this.namesGroup.selectAll("text").each(function () {
      let element = d3.select(this);
      let nameLength = element.node().getBoundingClientRect().width;
      element.attr("x", element.attr("x") - nameLength / 2);
    });
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
          viewStotal: Number(this.sanitizeString(r.viewsTotal)),
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

    /*
    console.log("added mountains");
    console.log(addedMountains);
    */
    return addedMountains;
  }

  plotMountains() {
    let xScale = this.xScale;
    let yScale = this.yScale;
    let tooltipsGroup = this.tooltipsGroup;
    let mountains = this.getMountainRoutesData();

    let groupRoutes = this.mountainsGroup
      .selectAll("g")
      .data(mountains)
      //.join("g")
      //.attr("class", "mountain")
      //.attr("id", (d, i) => this.sanitizeString(d.name));
      .join((enter) => {
        const g = enter
          .append("g")
          .attr("class", "mountain")
          .attr("id", (d, i) => this.sanitizeString(d.name));
        g.append("rect")
          .classed("rectBackground", true)
          .attr("x", function (d, i) {
            //console.log(d);
            return xScale(d.position - 1);
          })
          .attr("y", 0)
          .attr("width", function (d, i) {
            //console.log(d);
            return 2 * (xScale(1) - xScale(0));
          })
          .attr("height", "800")
          .attr("fill", "lightblue")
          .attr("opacity", 0.2)
          .on("mouseenter", (ev, d, i) => {
            //console.log("mouse enter for animate 1");

            animatePathsFunction(
              d3.selectAll(
                "#" + this.sanitizeString(d.name) + " .transition_path"
              ),
              true
            );
            hideOtherMountains(this.sanitizeString(d.name));
          });
        return g;
      });

    //groupRoutes.append("rect").classed("background", true);

    let routePaths = groupRoutes
      .selectAll("path")
      .data((d, i) => d.routes)
      .join((enter) => {
        const g = enter.append("g");
        g.append("path")
          .classed("background_path", true)
          .attr("d", (d, i) => this.getLinePath()(d.route))
          .attr("opacity", "0.1")
          .attr("stroke-width", "6")
          .attr("stroke", "transparent");
        g.append("path")
          .classed("transition_path", true)
          .attr("d", (d, i) => this.getLinePath()(d.route))
          .attr("opacity", "0.8")
          .attr("stroke", (d, i) =>
            this.getStrokeColorFromDifficulty(d.difficulty)
          )
          .attr("stroke-width", (d, i) => d.popularity)
          .attr("stroke-dasharray", (d, i) =>
            this.getStrokeDashArrayFromViewsTotal(d.viewStotal)
          );
        return g;
      });

    let animatePathsFunction = this.animatePaths;
    let hideOtherMountains = this.fadeOutMountains;

    let allignToMiddle = this.allingToMiddle;
    if (true)
      routePaths.on("mouseenter", function (ev, d) {
        let pathBB = d3.select(this).node().getBoundingClientRect();
        tooltipsGroup.select("g.routeInfo").remove();
        d3.select(this)
          .select("path.transition_path")
          .attr("stroke-width", 2.5);
        let y0 = yScale(200);
        let routeInfo = tooltipsGroup.append("g").classed("routeInfo", true);

        let routeName = routeInfo
          .append("text")
          .text(d.name)
          .attr("x", xScale(d.position))
          .attr("y", y0 - 60);
        allignToMiddle(routeName);

        let height = routeInfo
          .append("text")
          .text(d.route[0].height + "m - " + d.route[1].height + "m")
          .attr("x", xScale(d.position))
          .attr("y", y0 - 40);
        allignToMiddle(height);

        let difficulty = routeInfo
          .append("text")
          .text("Zah.: " + d.difficulty)
          .attr("x", xScale(d.position))
          .attr("y", y0 - 20);
        allignToMiddle(difficulty);

        let totalViews = routeInfo
          .append("text")
          .text("Ogledi: " + d.viewStotal)
          .attr("x", xScale(d.position))
          .attr("y", y0);
        allignToMiddle(totalViews);

        let walkTime = routeInfo
          .append("text")
          .text("Čas: " + d.walkTime + "h")
          //.attr("x", pathBB.x /* - pathBB.width / 2*/)
          .attr("x", xScale(d.position))
          .attr("y", y0 + 20);
        allignToMiddle(walkTime);
      });

    routePaths.on("mouseleave", function (d, i) {
      d3.select(this).select("path.transition_path").attr("stroke-width", 1);
      //groupRoutes.attr("opacity", "1");
    });

    groupRoutes.on("mouseleave", (d, i) => {
      this.tooltipsGroup.select("g.routeInfo").remove();
      //t.select("path.transition_path").attr("stroke-width", 2.5);
      //groupRoutes.attr("opacity", "1");
      animatePathsFunction(routePaths.selectAll(".transition_path"), false);
    });

    this.mountainsGroup.on("mouseleave", (d, i) => {
      this.tooltipsGroup.select("g.routeInfo").remove();

      d3.selectAll("g#namesGroup text")
        .transition()
        .duration(300)
        .attr("opacity", 0.8);

      d3.selectAll("path.transition_path")
        .transition()
        .duration(300)
        .attr("opacity", 0.8);
      animatePathsFunction(d3.selectAll(".transition_path"), true);
    });

    this.mountainsGroup.on("mouseenter", (d, i) => {
      this.tooltipsGroup.select("g.routeInfo").remove();
      //t.select("path.transition_path").attr("stroke-width", 2.5);
      //groupRoutes.attr("opacity", "1");
      animatePathsFunction(d3.selectAll(".transition_path"), false);
    });
  }

  animatePaths(el, shouldAnimate, hideOtherMountains) {
    el.selectAll("animate").remove();
    if (shouldAnimate) {
      el.append("animate")
        .attr("attributeName", "stroke-dashoffset")
        .attr("values", "-50;-20000")
        .attr("dur", function (d) {
          return `${d.walkTime * 100}s`;
        })
        .attr("repeatCount", "indefinite");
    } else {
      el.selectAll("animate").remove();
    }
  }

  fadeOutMountains(mountainName) {
    console.log("fadeoutmountains");
    d3.selectAll("g.mountain path.transition_path")
      .transition()
      .duration(300)
      .attr("opacity", 0.4);

    d3.selectAll("g#namesGroup text")
      //.transition()
      //.duration(300)
      .attr("opacity", 0.4);

    d3.selectAll("g#" + mountainName + ".mountain path.transition_path")
      .transition()
      .duration(300)
      .attr("opacity", 0.8);

    d3.selectAll("g#namesGroup " + "g." + mountainName + " text")
      .transition()
      .duration(300)
      .attr("opacity", 0.8);
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

  /**
   * Set elements x position to its middle x position
   * @param {*} element
   */
  allingToMiddle(element) {
    element.attr(
      "x",
      element.attr("x") - element.node().getBoundingClientRect().width / 2
    );
  }

  /**
   * Replace all unsafe characters for html classes ('/', ' ', ')'... ) with '_'
   * @param {*} name
   */
  sanitizeString(name) {
    return name
      .replaceAll(".", "")
      .replaceAll(",", "")
      .replaceAll(" ", "_")
      .replaceAll("/", "-")
      .replaceAll("(", "_")
      .replaceAll(")", "_");
  }

  getStrokeColorFromDifficulty(difficulty) {
    switch (difficulty) {
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
      default:
        return "red";
    }
  }

  getStrokeDashArrayFromViewsTotal(viewStotal) {
    // TODO dinamically form groups
    if (viewStotal < 1000) {
      return "5 30";
    } else if (viewStotal >= 1000 && viewStotal < 10000) {
      return "5 25";
    } else if (viewStotal >= 10000 && viewStotal < 100000) {
      return "5 15";
    } else if (viewStotal >= 100000) {
      return "5 10";
    }
  }
}
