async function build() {
  const scvData = await d3.csv("data.csv");

  const data = Object.entries(scvData)
    .map((entry, y, arr) => {
      const row = entry[1];
      const targets = scvData.columns.slice(1);
      const source = Object.values(row)[0];
      return targets
        .map((target, x) => ({
          id: `${source}-${target}`,
          x,
          y,
          weight: parseInt(entry[1][target] || "0"),
        }))
        .slice(0, arr.length);
    })
    .slice(0, Object.entries(scvData).length - 1)
    .flat();

  const headers = scvData.columns.slice(1);
  const rowNames = Object.values(scvData)
    .map((value) => Object.values(value)[0])
    .slice(0, scvData.length);

  const dimension = {
    width: window.innerWidth * 0.8,
    height: window.innerWidth * 0.8,
    margin: {
      top: 300,
      right: 10,
      bottom: 10,
      left: 400,
    },
  };

  dimension.boundedWidth =
    dimension.width - dimension.margin.right - dimension.margin.left;

  dimension.boundedHeight =
    dimension.height - dimension.margin.top - dimension.margin.bottom;

  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .attr("width", dimension.width)
    .attr("height", dimension.height);

  const bounds = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimension.margin.left}px,${dimension.margin.top}px)`
    );
  const pole = bounds
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "grid")
    .attr("width", 25)
    .attr("height", 25)
    .attr("x", (d) => d.x * 25)
    .attr("y", (d) => d.y * 25)
    .style("fill-opacity", (d) => d.weight * 0.12);

  const namesX = wrapper
    .append("g")
    .attr(
      "transform",
      `translate(${dimension.margin.left},${dimension.margin.top - 5})`
    )
    .selectAll("text")
    .data(headers)
    .enter()
    .append("text")
    .attr("y", (d, i) => i * 25 + 12.5)
    .text((d) => d)
    .style("text-anchor", "start")
    .attr("transform", "rotate(270)");

  const namesY = wrapper
    .append("g")
    .attr(
      "transform",
      `translate(${dimension.margin.left - 10},${dimension.margin.top})`
    )
    .selectAll("text")
    .data(rowNames)
    .enter()
    .append("text")
    .attr("y", (d, i) => i * 25 + 12.5)
    .text((d) => d)
    .style("text-anchor", "end");
}

build();
