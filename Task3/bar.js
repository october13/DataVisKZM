const min = 0;
const max = 100;
const getRandomNumber = () => {
  return Math.floor(
    Math.random() * (max - min + 1) + min
  )
}
const getPoints = () => Array(100).fill().map((point) => ({
  isCircle: Math.random() > 0.5,
  x: getRandomNumber(),
  y: getRandomNumber(),
}));

const dataset = getPoints();

const circleColor = '#6CA9FF';
const rectColor = '#C067EC';
const pointSize = 10;

//Accessor
const domain = [min, max]

const width = 600
let dimensions = {
  width: width,
  height: width,
  margin: {
    top: 20,
    right: 30,
    bottom: 20,
    left: 30,
  },
}

dimensions.boundedWidth = dimensions.width
  - dimensions.margin.left
  - dimensions.margin.right;
dimensions.boundedHeight = dimensions.height
  - dimensions.margin.top
  - dimensions.margin.bottom;

async function drawBar() {
  // 3. Draw canvas

  const wrapper = d3.select("#graph")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const bounds = wrapper.append("g")
    .style("translate", `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`);

  const xScaler = d3.scaleLinear()
    .domain(domain)
    .range([dimensions.margin.left, dimensions.boundedWidth])
    .nice()

  const yScaler = d3.scaleLinear()
    .domain(domain)
    .range([dimensions.boundedHeight - dimensions.margin.bottom, dimensions.margin.top])
    .nice();

  const rhombs = bounds.append('g').classed('points', true)
    .selectAll('polygon')
    .data(dataset.filter(d => !d.isCircle))
    .enter()
    .append('polygon')
    .attr('points', d => {
      const p1 = [xScaler(d.x) - 5, yScaler(d.y)].map(n => Math.round(n));
      const p2 = [xScaler(d.x), yScaler(d.y) - 5].map(n => Math.round(n));
      const p3 = [xScaler(d.x) + 5, yScaler(d.y)].map(n => Math.round(n));
      const p4 = [xScaler(d.x), yScaler(d.y) + 5].map(n => Math.round(n));
      return `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]}`
    })
    .attr("fill", rectColor);

  const circles = bounds.select('.points')
    .selectAll('circle')
    .data(dataset.filter(d => d.isCircle))
    .enter()
    .append('circle')
    .attr('cx', d => xScaler(d.x))
    .attr('cy', d => yScaler(d.y))
    .attr('r', 4)
    .attr("fill", circleColor);

  const xAxisGen = d3.axisBottom()
    .scale(xScaler)
    .tickValues([])
    .tickSize([0])
  const yAxisGen = d3.axisLeft()
    .scale(yScaler)
    .tickValues([])
    .tickSize([0])

  const axisArrow = bounds.append("defs").append("marker")
    .attr('id', 'arrow')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', '1')
    .attr('refY', '5')
    .attr('markerUnits', 'strokeWidth')
    .attr('markerWidth', '10')
    .attr('markerHeight', '10')
    .attr('orient', 'auto')
    .append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z");

  const xAxis = bounds.append("g")
    .call(xAxisGen)
    .style("transform", `translateY(${dimensions.boundedHeight - dimensions.margin.bottom}px)`)
    .select('path')
    .attr('stroke-width', 1)
    .attr("marker-end", "url(#arrow)");
  const yAxis = bounds.append("g")
    .call(yAxisGen)
    .style("transform", `translateX(${dimensions.margin.left}px)`)
    .select('path')
    .attr('stroke-width', 1)
    .attr("marker-end", "url(#arrow)");

  const xLabel = bounds.append("g")
    .append("text")
    .attr("font-size", "12px")
    .attr("text-anchor", "end")
    .attr("x", dimensions.boundedWidth)
    .attr("y", dimensions.boundedHeight)
    .text("X");

  const yLabel = bounds.append("g")
    .append("text")
    .attr("font-size", "12px")
    .attr("text-anchor", "end")
    .attr("x", 20)
    .attr("y", dimensions.margin.top + 10)
    .text("Y");
}

drawBar()

// interactions
const addPoints = () => {
  dataset.push(...getPoints())
}
const clearDataset = () => {
  dataset.splice(0, dataset.length)
}

const buttons = document.querySelectorAll('button');

const onClick = (event) => {
  const { target } = event;
  const button = target.closest('button');
  if (!button) return;

  const id = button.id;

  if (id === 'refresh-button') refresh()
  if (id === 'clear-button') clear()
}

const reDraw = () => {
  document.querySelector('#graph').innerHTML = '';
  drawBar();
}

const refresh = () => {
  addPoints();
  reDraw();
}

const clear = () => {
  clearDataset();
  reDraw();
}

document.addEventListener('click', onClick)
