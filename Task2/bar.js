let currentAccessor = 0;

async function drawBar() {
  const dataset = await d3.json("./my_weather_data.json");
  //Accessor
  const accessors = [
    {
      title: 'Temp Low',
      value: 'temperatureLow'
    },
    {
      title: 'Temp High',
      value: 'temperatureHigh'
    },
    {
      title: 'Temp Min',
      value: 'temperatureMin'
    },
    {
      title: 'Temp Max',
      value: 'temperatureMax'
    },
  ];
  const temparatureAccessor = d => d[accessors[currentAccessor].value];
  const yAccessor = d => d.bin.length;

  const width = 800
  let dimensions = {
    width: width,
    height: width * 0.6,
    margin: {
      top: 20,
      right: 30,
      bottom: 20,
      left: 30,
    },
  }
  dimensions.boundedWidth = dimensions.width
    - dimensions.margin.left
    - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top
    - dimensions.margin.bottom

  // 3. Draw canvas

  const xDomain = [-20, 100];
  const yDomain = [0, 100];

  const wrapper = d3.select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const bounds = wrapper.append("g")
    .classed('bounds', true)
    .style("translate", `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`);

  const xScaler = d3.scaleLinear()
    .domain(xDomain)
    .range([dimensions.margin.left, dimensions.boundedWidth])
    .nice()

  const yScaler = d3.scaleLinear()
    .domain(yDomain)
    .range([dimensions.boundedHeight, dimensions.margin.top])
    .nice();

  const binsGen = d3.bin()
    .domain(xDomain)
    .value(temparatureAccessor)
    .thresholds(10);

  const f = d3.format(".1f")
  let bins = binsGen(dataset).map(bin => ({
    average: f(d3.mean(bin, temparatureAccessor)),
    bin,
  }));

  const binGroup = bounds.append("g").classed('bin-group', true);
  const binGroups = binGroup.selectAll("g")
    .data(bins)
    .enter()
    .append("g")
    .classed('bin-bar', true);


  const barPadding = 9
  const barRect = binGroups.append("rect")
    .classed('bar-rect', true)
    .attr("x", d => xScaler(d.bin.x0) + barPadding / 2)
    .attr("y", d => yScaler(yAccessor(d)))
    .attr("width", d => d3.max([0, xScaler(d.bin.x1) - xScaler(d.bin.x0) - barPadding]))
    .attr("height", d => dimensions.boundedHeight - yScaler(yAccessor(d)))
    .attr("fill", "#DAE8FC")
    .attr("stroke", "#6C8EBF");

  const xAxisScaler = d3.scalePow()
    .domain(xDomain)
    .range([dimensions.margin.left, dimensions.boundedWidth]);

  const xAxisGen = d3.axisBottom()
    .scale(xAxisScaler)
    .tickSizeInner([0])
    .tickSizeOuter([0])
    .tickPadding([10]);
  const xAxis = bounds.append("g")
    .call(xAxisGen)
    .classed('x-axis', true)
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);

  const yAxisGen = d3.axisLeft()
    .scale(yScaler)
    .tickSizeInner([0])
    .tickSizeOuter([0])
    .tickPadding([10])
    .ticks(2);
  const yAxis = bounds.append("g")
    .call(yAxisGen)
    .classed('y-axis', true)
    .style("transform", `translateX(${dimensions.margin.left}px)`);

  const xLabel = bounds.append("g")
    .append("text")
    .attr("font-size", "12px")
    .attr("text-anchor", "end")
    .attr("x", dimensions.boundedWidth)
    .attr("y", dimensions.boundedHeight + 35)
    .text("Temperature");

  const yLabel = bounds.append("g")
    .append("text")
    .attr("font-size", "12px")
    .attr("text-anchor", "end")
    .attr("x", 30)
    .attr("y", dimensions.margin.top - 8)
    .text("Count");

  const reDraw = (e) => {
    const { target } = e;
    const value = target.dataset.value;
    const index = accessors.findIndex(item => item.value === value);

    currentAccessor = index;

    d3.select("#wrapper").remove();
    const newWrapper = document.createElement('div');
    newWrapper.id = 'wrapper'
    document.body.append(newWrapper);
    drawBar()
  };

  const barText = binGroups.filter(yAccessor)
  .append("text")
  .attr("x", d => xScaler(d.bin.x0) + (xScaler(d.bin.x1)-xScaler(d.bin.x0))/2)
  .attr("y", d => yScaler(yAccessor(d)) - 5)
  .text(d => d.average)
  .attr("fill","darkgrey")
  .attr("font-size","12px")
  .attr("text-anchor","middle");

  const buttons = d3.select("#wrapper")
    .append('div')
    .classed('buttons', true)
    .selectAll('button')
    .data(accessors)
    .enter()
    .append('button')
    .text(a => a.title)
    .attr('data-value', d => d.value)
    .on('click', reDraw)
}

drawBar()
