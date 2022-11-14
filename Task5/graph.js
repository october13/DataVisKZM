const waitForFrame = async () =>
  new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });

async function createForceLayout() {
  const nodes = await d3.csv("nodelist.csv");
  const edges = await d3.csv("edgelist.csv");
  const roleScale = d3
    .scaleOrdinal()
    .domain(["contractor", "employee", "manager"])
    .range(["#75739F", "#41A368", "#FE9922"]);

  const nodeHash = nodes.reduce((hash, node) => {
    hash[node.id] = node;
    return hash;
  }, {});

  edges.forEach((edge) => {
    edge.weight = parseInt(edge.weight);
    edge.source = nodeHash[edge.source];
    edge.target = nodeHash[edge.target];
  });

  const linkForce = d3.forceLink();

  const simulation = d3
    .forceSimulation()
    .force("charge", d3.forceManyBody().strength(-40))
    .force("center", d3.forceCenter().x(300).y(300))
    .force("link", linkForce)
    .nodes(nodes)
    .on("tick", forceTick);

  simulation.force("link").links(edges);

  // change nodes, links
  const getIndex = (data) => {
    const sourceId = data.source.id;
    const targetId = data.target.id;
    return edges.findIndex(
      (d) => d.target.id === targetId && d.source.id === sourceId
    );
  };
  const deleteLink = (data) => {
    const index = getIndex(data);
    edges.splice(index, 1);
    wrapper
      .selectAll("line.link")
      .data(edges, (d) => `${d.source.id}-${d.target.id}`)
      .exit()
      .remove();
  };
  const createLink = async (source, target) => {
    edges.push({
      source: nodeHash[source],
      target: nodeHash[target],
      weight: 4,
    });
    simulation.force("link").links(edges);
    wrapper
      .selectAll("line.link")
      .data(edges, (d) => `${d.source.id}-${d.target.id}`)
      .enter()
      .append("line")
      .attr("class", "link")
      .style("opacity", 0.5)
      .on("click", (event, d) => {
        if (!event.altKey) return;
        deleteLink(d);
      })
      .style("stroke-width", (d) => d.weight);
  };

  // graph
  const dimension = {
    width: window.innerWidth * 0.8,
    height: window.innerWidth * 0.8,
    margin: {
      top: 50,
      right: 10,
      bottom: 10,
      left: 55,
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

  wrapper
    .selectAll("line.link")
    .data(edges, (d) => `${d.source.id}-${d.target.id}`)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("opacity", 0.5)
    .style("cursor", "not-allowed")
    .on("click", (event, d) => {
      console.log("event", event);
      if (!event.altKey) return;
      deleteLink(d);
    })
    .style("stroke-width", (d) => d.weight);

  const nodeEnter = wrapper
    .selectAll("g.node")
    .data(nodes, (d) => d.id)
    .enter()
    .append("g")
    .call(drag(simulation))
    .attr("class", "node");

  let sourceNodeId = null;
  const clearSelection = () => {
    sourceNodeId = null;
    nodeEnter
      .selectAll("circle")
      .attr("stroke", "#9A8B7A")
      .attr("stroke-width", "1px");
  };
  document.body.addEventListener("mousedown", (event) => {
    if (event.target.nodeName !== "circle") clearSelection();
  });
  const handleSelection = async (event, data) => {
    const { id } = data;
    const isAlreadyLinked = edges.some((node) => {
      const iDs = [node.target.id, node.source.id];
      return iDs.includes(id) && iDs.includes(sourceNodeId);
    });
    if (isAlreadyLinked) return;
    if (event.ctrlKey && sourceNodeId) {
      createLink(sourceNodeId, id);
      await waitForFrame();
      clearSelection();
      return;
    }
    clearSelection();
    sourceNodeId = nodeEnter
      .selectAll("circle")
      .filter((data) => data.id === id)
      .attr("stroke-width", "3px")
      .attr("stroke", "lightblue")
      .datum().id;
  };

  nodeEnter
    .append("circle")
    .style("cursor", "pointer")
    .attr("r", 5)
    .style("fill", (d) => roleScale(d.role))
    .on("click", handleSelection);
  nodeEnter
    .append("foreignObject")
    .classed("node-text", true)
    .attr("x", -25)
    .attr("y", 8)
    .append("xhtml:body")
    .append("xhtml:span")
    .attr("contenteditable", true)
    .html((d) => d.id)
    .on("click", function () {
      nodeEnter.on(".drag", null);
    })
    .on("blur", function () {
      nodeEnter.call(drag(simulation));
    });

  function forceTick() {
    d3.selectAll("line.link")
      .attr("x1", (d) => d.source.x)
      .attr("x2", (d) => d.target.x)
      .attr("y1", (d) => d.source.y)
      .attr("y2", (d) => d.target.y);
    d3.selectAll("g.node").attr("transform", (d) => `translate(${d.x},${d.y})`);
  }

  function drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
      // const nodeEl = event.sourceEvent.srcElement?.closest(".node");
      // const circleEl = nodeEl?.firstChild;
      // if (!circleEl) return;

      // const { top, left } = circleEl.getBoundingClientRect();
      // const { id } = event.subject;

      // const closeNotLinkedNodes = wrapper.selectAll("circle").filter((d) => {
      //   const isSameNode = d.id === id;
      //   const isLinked = edges.some((node) => {
      //     return (
      //       (node.target.id === id || node.source.id === id) &&
      //       (node.target.id === d.id || node.source.id === d.id)
      //     );
      //   });
      //   if (isLinked || isSameNode) return false;
      //   const distanceX = Math.abs(d.x - left);
      //   const distanceY = Math.abs(d.y - top);
      //   const isCloseEnough = distanceX < 30 && distanceY < 30;
      //   return isCloseEnough;
      // });

      // if (!closeNotLinkedNodes.size()) return;
      // createLink(id, closeNotLinkedNodes);
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }
}

createForceLayout();
