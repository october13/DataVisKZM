const build = async () => {
  /** preparing data */
  const data = await d3.csv("Iris.csv");
  const { x, y } = Object.entries(data).reduce(
    (acc, obj) => {
      const [key, value] = obj;
      if (key === "columns") return acc;
      const {
        PetalLengthCm,
        PetalWidthCm,
        SepalLengthCm,
        SepalWidthCm,
        Species,
      } = value;
      acc.x.push(
        [PetalLengthCm, PetalWidthCm, SepalLengthCm, SepalWidthCm].map((str) =>
          parseFloat(str)
        )
      );
      acc.y.push(Species);
      return acc;
    },
    { x: [], y: [] }
  );

  console.log("y", y);

  /** TSNE */
  const model = new TSNE({
    dim: 2,
    perplexity: 30.0,
    earlyExaggeration: 4.0,
    learningRate: 100.0,
    nIter: 1000,
    metric: "euclidean",
  });

  model.init({
    data: x,
    type: "dense",
  });

  model.run();
  const tsneData = model.getOutput();

  /** UMAP */
  const umap = new UMAP();
  const umapData = umap.fit(x);

  const spinner = document.querySelector(".spinner-wrapper");
  spinner.classList.add("hidden");

  /** UI */
  const umapDataPreMapped = umapData.map((pos, index) => ({
    x: pos[0],
    y: pos[1],
    label: y[index],
  }));
  const tsneDataPreMapped = tsneData.map((pos, index) => ({
    x: pos[0],
    y: pos[1],
    label: y[index],
  }));
  new Graph(tsneDataPreMapped, "tsne-wrapper");
  new Graph(umapDataPreMapped, "umap-wrapper");
};

build();
