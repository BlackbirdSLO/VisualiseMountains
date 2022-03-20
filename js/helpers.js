var d3 = require("d3");

/**
 * Set elements x position to its middle x position
 * @param {*} element
 */
export function allignToMiddle(element) {
  element.attr(
    "x",
    element.attr("x") - element.node().getBoundingClientRect().width / 2
  );
}

/**
 * Replace all unsafe characters for html classes ('/', ' ', ')'... ) with '_'
 * @param {*} name
 */
export function sanitizeString(name) {
  return name
    .replaceAll(".", "")
    .replaceAll(",", "")
    .replaceAll(" ", "_")
    .replaceAll("/", "-")
    .replaceAll("(", "_")
    .replaceAll(")", "_");
}

export function getIntHours(walkTime) {
  walkTime = walkTime.replace("15", 25).replace("30", 50).replace("45", 75);
  walkTime = walkTime.replace("min", "").replace("h", ".");
  walkTime = walkTime.replaceAll(" ", "");
  return Number(walkTime);
}

// makes the path look as if it's transiting. duration = speed
export function pathTransition(route, speed) {
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

export function getStrokeColorFromDifficulty(difficulty) {
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

export function getStrokeDashArrayFromViewsTotal(viewStotal) {
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

export function addXAxis(svg, domain, margins, width, height, shouldPlot) {
  let xScale = getXScale(domain, margins, width);
  if (shouldPlot) {
    let xAxis = (g) =>
      g
        .attr("transform", `translate(0,${height - margins.bottom})`)
        .call(d3.axisBottom(xScale));
    svg.append("g").call(xAxis);
  }
  return xScale;
}

export function addYAxis(svg, domain, margins, height, shouldPlot) {
  let yScale = getYScale(domain, margins, height);
  if (shouldPlot) {
    let yAxis = (g) =>
      g
        .attr("transform", `translate(${margins.left},0)`)
        .call(d3.axisLeft(yScale));
    svg.append("g").call(yAxis);
  }
  return yScale;
}

export function getXScale(domain, margins, width) {
  return d3
    .scaleLinear()
    .domain(domain)
    .range([margins.left, width - margins.right]);
}

export function getYScale(domain, margins, height) {
  return d3
    .scaleLinear()
    .domain(domain)
    .range([height - margins.bottom, margins.top]);
}

export function getOverheadDottedX(d, i) {
  let fullWidth = 300;
  let xMargin = (i + 1) * 100;
  let x = xMargin + fullWidth / 2;
  return x;
}

export function getOverheadDottedY(d, i) {
  return this.yScale(d.height);
}
