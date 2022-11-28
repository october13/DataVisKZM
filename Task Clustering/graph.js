class Graph {
  dimensions = {
    width: 500,
    height: 500,
    margin: {
      top: 30,
      right: 30,
      bottom: 30,
      left: 30,
    },
  };
  wrapper;
  domainX;
  domainY;
  labelDomain = ["Iris-setosa", "Iris-versicolor", "Iris-virginica"];
  labelColors = ["red", "green", "blue"];
  labelScaler;
  xScaler;
  yScaler;

  constructor(data, id) {
    this.dimensions.boundedWidth =
      this.dimensions.width -
      this.dimensions.margin.right -
      this.dimensions.margin.left;

    this.dimensions.boundedHeight =
      this.dimensions.height -
      this.dimensions.margin.top -
      this.dimensions.margin.bottom;

    this.domainX = this.getDomain(data, "x");
    this.domainY = this.getDomain(data, "y");
    console.log("this.dimensions", this.dimensions);
    this.xScaler = d3
      .scaleLinear()
      .domain(this.domainX)
      .range([this.dimensions.margin.left, this.dimensions.boundedWidth])
      .nice();
    this.yScaler = d3
      .scaleLinear()
      .domain(this.domainY)
      .range([this.dimensions.margin.top, this.dimensions.boundedHeight])
      .nice();

    this.labelScaler = d3
      .scaleOrdinal()
      .domain(this.labelDomain)
      .range(this.labelColors);

    this.wrapper = d3
      .select(`#${id}`)
      .append("svg")
      .attr("width", this.dimensions.width)
      .attr("height", this.dimensions.height);

    this.yAxisGenerator = d3.axisRight(this.yScaler);
    this.xAxisGenertor = d3.axisBottom(this.xScaler);
    this.yAxis = this.wrapper
      .append("g")
      .call(this.yAxisGenerator)
      .style(
        "transform",
        `translate(${this.dimensions.boundedWidth}px, ${0}px)`
      );
    this.xAxis = this.wrapper
      .append("g")
      .call(this.xAxisGenertor)
      .style(
        "transform",
        `translate(${0}px, ${this.dimensions.boundedHeight}px)`
      );

    this.dots = this.wrapper
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("r", 2)
      .attr("fill", (d) => this.labelScaler(d.label))
      .attr("cx", (d) => this.xScaler(d.x))
      .attr("cy", (d) => this.yScaler(d.y));
  }

  getDomain(data, axis) {
    return data.reduce(
      (acc, obj) => {
        const minX = Math.min(obj[axis], acc[0]);
        const maxX = Math.max(obj[axis], acc[1]);
        return [minX, maxX];
      },
      [0, 0]
    );
  }
}
