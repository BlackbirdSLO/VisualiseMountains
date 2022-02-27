import "regenerator-runtime/runtime";
import { Mountains } from "./mountains";
import { mountains_data_nearly_full as mountains_data_nearly_full } from "./mountain_data";
var d3 = require("d3");

const width = 2600;
const height = 700;
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

  if (false)
    main.addEventListener("wheel", (event) => {
      event.preventDefault();
      console.log("test");
      console.log(event);
      main.scrollBy({
        left: event.deltaY < 0 ? -30 : 30,
      });
    });
};
