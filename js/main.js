import "regenerator-runtime/runtime";
import { Mountains } from "./mountains";
import { mountains_data_nearly_full as mountains_data_nearly_full } from "./mountain_data";
var d3 = require("d3");

const width = 1400;
const height = 600;
const margin = {
  top: 50,
  bottom: 50,
  left: 50,
  right: 50,
};

const mountains = new Mountains(
  height,
  width,
  margin,
  mountains_data_nearly_full
);
