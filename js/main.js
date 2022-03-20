import "regenerator-runtime/runtime";
import { Mountains } from "./mountains";
import { mountains_data_nearly_full as mountains_data_nearly_full } from "./mountain_data";
var d3 = require("d3");

const width = 1900;
const height = 800;
const margin = {
  top: 100,
  bottom: 0,
  left: 50,
  right: 50,
};

const mountains = new Mountains(
  height,
  width,
  margin,
  mountains_data_nearly_full
);

window.onload = function () {
  console.log("test");
  console.log(document.querySelector("section#main"));
  let main = document.querySelector(".container");
  console.log(main);

  let eventX = 0;

  main.addEventListener("wheel", (event) => {
    event.preventDefault();
    eventX -= event.deltaY / 1;
    eventX -= event.deltaX / 1;

    d3.select("g.container")
      .transition()
      .duration(100)
      .attr("transform", `translate(${eventX}, 0)`);
  });

  var xStart = 0;

  main.addEventListener("touchstart", (event) => {
    console.log("touchstart");
    xStart = event.touches[0].clientX;
    console.log(xStart);
  });

  main.addEventListener("touchmove", (event) => {
    event.preventDefault();
    let xDelta = event.changedTouches[0].clientX - xStart;
    d3.select("g.container")
      .transition()
      .duration(50)
      .attr("transform", `translate(${xDelta}, 0)`);
  });

  main.addEventListener("touchend", (event) => {
    console.log("touchend");
    xStart = event.changedTouches[0].clientX;
    console.log(xStart);
  });
};
