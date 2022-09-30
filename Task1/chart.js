async function buildPlot() {
    console.log("Hello world");
    const data = await d3.json("my_weather_data.json");
    //console.table(data);
    const dateParser = d3.timeParse("%Y-%m-%d");
    const yAccessor = (d) => d.temperatureMin;
    const xAccessor = (d) => dateParser(d.date);
    const yAccessor_2 = (d) => d.temperatureHigh;
    // Функции для инкапсуляции доступа к колонкам набора данных

    var dimension = {
        width: window.innerWidth*0.9,
        height: 400,
        margin: {
            top: 15,
            left: 0,
            bottom: 15,
            right: 15
        }
    };

    dimension.boundedWidth = dimension.width - dimension.margin.left - dimension.margin.right;
    dimension.boundedHeight = dimension.height - dimension.margin.top - dimension.margin.bottom;

    const wrapper = d3.select("#wrapper");
    const svg = wrapper.append("svg")
    svg.attr("height",dimension.height);
    svg.attr("width",dimension.width);
    const bounded = svg.append("g");
    bounded.style("transform",`translate(${dimension.margin.left}px, ${dimension.margin.top})`);

    const yScaler = d3.scaleLinear()
        .domain(d3.extent(data,yAccessor))
        .range([dimension.boundedHeight,0]);

    const xScaler = d3.scaleTime()
        .domain(d3.extent(data,xAccessor))
        .range([0,dimension.boundedWidth]);

    var lineGenerator = d3.line()
        .x(d => xScaler(xAccessor(d)))
        .y(d => yScaler(yAccessor(d)));

    bounded.append("path")
        .attr("d",lineGenerator(data))
        .attr("fill","none")
        .attr("stroke","grey")

    const yScaler_y = d3.scaleLinear()
        .domain(d3.extent(data, yAccessor_2))
        .range([dimension.boundedHeight, 0])
    var lineGenerator_2 = d3.line()
        .x(d => xScaler(xAccessor(d)))
        .y(d => yScaler_y(yAccessor_2(d)));
    bounded.append("path")
        .attr("d",lineGenerator_2(data))
        .attr("fill","none")
        .attr("stroke","blue")

    var x_axis = d3.axisBottom().scale(xScaler)
    var xAxisTranslate = dimension.boundedHeight;
    bounded.append('g')
        .attr("transform", "translate(0, " + xAxisTranslate + ")")
        .call(x_axis)
    var y_axis = d3.axisRight().scale(yScaler);
    bounded.append('g')
        .attr("transform", "translate(0,0)")
        .call(y_axis)

}
buildPlot();
