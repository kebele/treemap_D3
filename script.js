// {
// name: "Kickstarter",
// children: [
// {
// name: "Product Design",
// children: [
// {
// name: "Pebble Time - Awesome Smartwatch, No Compromises",
// category: "Product Design",
// value: "20338986"
// },
// {
// name: "COOLEST COOLER: 21st Century Cooler that's Actually Cooler",
// category: "Product Design",
// value: "13285226"
// }....

 const url =
"https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";

document.addEventListener("DOMContentLoaded", () => {
  fetch(url).
  then(response => response.json())
  // .then(data => console.log(data))
  .then(data => drawDiagram(data));
});


function drawDiagram(data) {
  //dimensions
  const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10 },

  width = 1280 - margin.left - margin.right,
  height = 920 - margin.top - margin.bottom,
  heightLegend = 120,
  heightTree = height - heightLegend;

  //Container
  const svg = d3.
  select("body").
  append("svg").
  attr(
  "viewBox",
  `0 0 ${width + margin.left + margin.right} ${
  height + margin.top + margin.bottom
  }`).

  style("text-align", "center").
  style("color", "black");

  //Create treemap
  //https://www.d3-graph-gallery.com/treemap

  // color scale
  // https://observablehq.com/@d3/d3-scaleordinal  //https://bl.ocks.org/pstuffa/3393ff2711a53975040077b7453781a9
  //https://github.com/d3/d3-scale-chromatic/blob/master/README.md#schemeCategory10
  // const scaleColor = d3.scaleOrdinal(d3.schemeCategory20);
  const scaleColor = d3.scaleOrdinal(d3.schemePaired);
  //https://www.d3-graph-gallery.com/graph/treemap_custom.html
  const treemap = d3.treemap().size([width, heightTree]).paddingInner(1);

  //tooltip
  const tooltip = d3.
  select("body").
  append("div").
  attr("id", "tooltip").
  style("background-color", "orange").
  style("padding", "5px").
  style("position", "absolute").
  style("border-radius", "8px").
  style("color", "black");

  // compose Root
  //https://observablehq.com/@d3/d3-hierarchy
  //https://observablehq.com/@d3/visiting-a-d3-hierarchy
  //id define
  let root = d3.
  hierarchy(data).
  eachBefore(
  (d) =>
  d.data.id =
  (d.parent ? d.parent.data.id + "." : "") +
  d.data.name.replace(/[: '.\\)(]/g, "")).

  sum(d => d.value).
  sort((a, b) => b.height - a.height || b.value - a.value);

  //https://www.d3-graph-gallery.com/treemap
  treemap(root);

  const tile = (d) =>
  tiles.select(".tile").filter(v => v.data.id == d.data.id);

  //Create chart
  const tiles = svg.
  append("g").
  selectAll("g").
  data(root.leaves()).
  enter().
  append("g").
  attr("transform", d => "translate(" + d.x0 + ", " + d.y0 + ")")
  //
  .on("mousemove", d => {
    tile(d).attr("stroke", "#ffffff").attr("stroke-width", "2");
    const aux = [...d.data.name.split(/ - |: |, /g, 2), format(d.data.value)];
    tooltip.
    attr("data-value", d.data.value || 0).
    style("left", d3.event.pageX + "px").
    style("top", d3.event.pageY + "px").
    style("display", "inline-block").
    html(aux.join("<br/>"));
  }).
  on("mouseout", d => {
    tile(d).attr("stroke", "none");
    tooltip.style("display", "none");
  });

  tiles.
  append("rect").
  attr("class", "tile").
  attr("id", d => d.data.id).
  attr("data-name", d => d.data.name).
  attr("data-category", d => d.data.category).
  attr("data-value", d => d.data.value).
  attr("width", d => d.x1 - d.x0).
  attr("height", d => d.y1 - d.y0).
  attr("fill", d => scaleColor(d.data.category));

  tiles.
  append("clipPath").
  attr("id", d => "clip-" + d.data.id)
  //duplicates the rects element
  .append("use").
  attr("href", d => "#" + d.data.id);

  const format = d3.format("$,.2s"); //Format for the data-value

  tiles.
  append("text").
  classed("text", true).
  attr("clip-path", d => "url(#clip-" + d.data.id + ")").
  selectAll("tspan").
  data(d => [...d.data.name.split(/ - |: |, /g, 2), format(d.data.value)]).
  enter().
  append("tspan").
  text(d => d).
  attr("x", 2).
  attr("y", (d, i) => 14 + 14 * i).
  attr("width", 25);

  //Legend
  let categories = root.
  leaves().
  map(v => v.data.category).
  filter((v, i, arr) => arr.indexOf(v) == i);

  const legend = svg.
  append("g").
  attr("id", "legend").
  attr("transform", "translate(0, " + (heightTree + 100) + ")");
  const legendItem = legend.
  selectAll("g").
  data(categories).
  enter().
  append("g").
  attr("transform", (d, i) => "translate(" + i * 30 + ", 0)");
  legendItem.
  append("rect").
  attr("class", "legend-item").
  attr("x", 0).
  attr("y", 0).
  attr("height", 20).
  attr("width", 20).
  attr("fill", d => scaleColor(d));
  legendItem.
  append("text").
  attr("class", "legend-item-text").
  attr("x", 30).
  attr("y", 5).
  attr("transform", "rotate(-45)").
  text(d => d);
}
