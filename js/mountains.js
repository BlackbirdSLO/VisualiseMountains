import { DataHelper } from "./dataHelper";
import {
  sanitizeString,
  getStrokeColorFromDifficulty,
  getStrokeDashArrayFromViewsTotal,
  allignToMiddle,
  getIntHours,
  pathTransition,
  getOverheadDottedX,
  getOverheadDottedY,
  getXScale,
  getYScale,
  addXAxis,
  addYAxis,
} from "./helpers";

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
    this.routePaths = undefined;
    this.groupRoutes = undefined;
    this.dataHelper = new DataHelper(mountains_data);
    this.mountains_data = this.dataHelper.getHighestPeaks(10);
    this.xScale = addXAxis(
      this.svg,
      [0, 10],
      this.margins,
      this.width,
      this.height,
      false
    );
    this.yScale = addYAxis(
      this.svg,
      [0, 3000],
      this.margins,
      this.height,
      false
    );
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
  }

  plotMountainNames() {
    this.namesGroup
      .selectAll("g")
      .data(this.mountains_data)
      .join((enter) => {
        const g = enter.append("g");
        g.attr("class", (d, i) => sanitizeString(d.name));
        g.append("text")
          .attr("x", (d, i) => this.xScale(i * 2 + 1))
          .attr("y", (d, i) => this.yScale(d.height) - 40)
          .text((d, i) => d.name);

        g.append("text")
          .attr("x", (d, i) => this.xScale(i * 2 + 1))
          .attr("y", (d, i) => this.yScale(d.height) - 20)
          .text((d, i) => d.height + "m");
        return g;
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
          viewStotal: Number(sanitizeString(r.viewsTotal)),
          name: r.name,
          difficulty: r.difficulty,
          heightDiff: heightDiff,
          walkTime: getIntHours(r.walkTime),
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
    return addedMountains;
  }

  plotMountains() {
    let xScale = this.xScale;
    let mountains = this.getMountainRoutesData();

    this.groupRoutes = this.mountainsGroup
      .selectAll("g")
      .data(mountains)
      .join((enter) => {
        const g = enter
          .append("g")
          .attr("class", "mountain")
          .attr("id", (d, i) => sanitizeString(d.name));
        g.append("rect")
          .classed("rectBackground", true)
          .attr("x", function (d, i) {
            return xScale(d.position - 1);
          })
          .attr("y", 0)
          .attr("width", function (d, i) {
            return 2 * (xScale(1) - xScale(0));
          })
          .attr("height", "800")
          .attr("fill", "lightblue")
          .attr("opacity", 0.2)
          .on("mouseenter", (ev, d, i) => {
            animatePathsFunction(
              d3.selectAll("#" + sanitizeString(d.name) + " .transition_path"),
              true
            );
            hideOtherMountains(sanitizeString(d.name));
          });
        return g;
      });

    this.routePaths = this.groupRoutes
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
          .attr("stroke", (d, i) => getStrokeColorFromDifficulty(d.difficulty))
          .attr("stroke-width", (d, i) => d.popularity)
          .attr("stroke-dasharray", (d, i) =>
            getStrokeDashArrayFromViewsTotal(d.viewStotal)
          );
        return g;
      });

    let animatePathsFunction = this.animatePaths;
    let hideOtherMountains = this.fadeOutMountains;

    this.addMouseEvents(this.tooltipsGroup);
  }

  animatePaths(el, shouldAnimate) {
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
    d3.selectAll("g.mountain path.transition_path")
      .transition()
      .duration(300)
      .attr("opacity", 0.4);

    d3.selectAll("g#namesGroup text").attr("opacity", 0.4);

    d3.selectAll("g#" + mountainName + ".mountain path.transition_path")
      .transition()
      .duration(300)
      .attr("opacity", 0.8);

    d3.selectAll("g#namesGroup " + "g." + mountainName + " text")
      .transition()
      .duration(300)
      .attr("opacity", 0.8);
  }

  addMouseEvents() {
    let yScale = this.yScale;
    let xScale = this.xScale;
    let tooltipsGroup = this.tooltipsGroup;
    let animatePaths = this.animatePaths;
    let routePaths = this.routePaths;
    let groupRoutes = this.groupRoutes;
    let mountainsGroup = this.mountainsGroup;

    routePaths.on("mouseenter", function (ev, d) {
      tooltipsGroup.select("g.routeInfo").remove();
      d3.select(this).select("path.transition_path").attr("stroke-width", 2.5);
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
        .attr("x", xScale(d.position))
        .attr("y", y0 + 20);
      allignToMiddle(walkTime);
    });

    routePaths.on("mouseleave", function (d, i) {
      d3.select(this).select("path.transition_path").attr("stroke-width", 1);
    });

    groupRoutes.on("mouseleave", (d, i) => {
      tooltipsGroup.select("g.routeInfo").remove();
      animatePaths(routePaths.selectAll(".transition_path"), false);
    });

    mountainsGroup.on("mouseleave", (d, i) => {
      tooltipsGroup.select("g.routeInfo").remove();

      d3.selectAll("g#namesGroup text")
        .transition()
        .duration(300)
        .attr("opacity", 0.8);

      d3.selectAll("path.transition_path")
        .transition()
        .duration(300)
        .attr("opacity", 0.8);
      animatePaths(d3.selectAll(".transition_path"), true);
    });

    mountainsGroup.on("mouseenter", (d, i) => {
      tooltipsGroup.select("g.routeInfo").remove();
      animatePaths(d3.selectAll(".transition_path"), false);
    });
  }
}
