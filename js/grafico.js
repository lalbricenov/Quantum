class PlotAnimation {
  /**
   * @param {string} container - id of the container
   * @param {function} f - function that depends on x and t
   * @param {function} V - Function that depends only on x
   * @param {object} animationParameters - {x:{min, max, N}, t:{min, max, N}}
   */
  constructor(container, f, V, animationParameters) {
    this.container = container;
    this.numPoints = animationParameters.x.N;
    // this.layout = layout
    this.xMin = animationParameters.x.min;
    this.xMax = animationParameters.x.max;
    this.stepX = (this.xMax - this.xMin) / (this.numPoints - 1);
    this.numFrames = animationParameters.t.N;
    this.tMin = animationParameters.t.min;
    this.tMax = animationParameters.t.max;
    this.stepTime = (this.tMax - this.tMin) / (this.numFrames - 1);
    this.f = f;

    this.V = V;
    this.vTrace = { x: [], y: [] };
    // this.initialFTrace = this.generateFrame(this.tMin).data[0];

    this.layout = {
      xaxis: { range: [this.xMin, this.xMax] },
      yaxis: { title: "Psi^2" },
      yaxis2: {
        title: "Energía potencial",
        overlaying: "y",
        side: "right",
        showgrid: false,
      },
    };

    this.frames = [];
  }

  generateFrame = function (time, name) {
    if (this.xMax > this.xMin && this.numPoints > 2) {
      let xArray = [];
      let yArray = [];
      let potentialY = [];
      let x = this.xMin;
      console.log(this.xMin);
      for (
        let n = 1;
        n < this.numPoints;
        n++ // The number of frames is controlled with an integer to avoid rounding errors
      ) {
        xArray.push(x);
        yArray.push(this.f(x, time));
        if (this.vTrace.x.length == 0) potentialY.push(this.V(x));
        x = x + this.stepX;
        // colorArray.push(10*x);
      }
      if (this.vTrace.x.length == 0)
        this.vTrace = {
          x: xArray,
          y: potentialY,
          type: "scatter",
          xaxis: "x",
          yaxis: "y2",
          name: "Potential",
        };
      return {
        name: name,
        data: [
          {
            x: xArray,
            y: yArray,
            type: "scatter",
            xaxis: "x",
            yaxis: "y",
            name: "Psi",
          },
          this.vTrace,
        ],
      };
    } else {
      console.log(
        `No se puede generar frame para el tiempo: ${time}, xMIn: ${this.xMIn}, xMax: ${this.xMax}, numPoints: ${this.numPoints}`
      );
      return undefined;
    }
  };

  generateFrames = function () {
    console.log("Inicio calculo");
    // console.log(this);
    // Generates N frames from tMin to tMax, including tMin and tMax
    // console.log(
    //   `tMax: ${this.tMax} tMin: ${this.tMin} numFrames: ${this.numFrames}`
    // );
    if (this.tMax > this.tMin && this.numFrames > 2) {
      let t = this.tMin;
      for (
        let n = 1;
        n <= this.numFrames;
        n++ // The number of frames is controlled with an integer to avoid rounding errors
      ) {
        // console.log(`Frame ${n}`);
        this.frames.push(this.generateFrame(t, `frame${n}`));
        t += this.stepTime;
      }
    }
    this.createPlot();
  };
  createPlot = function () {
    // console.log(this);
    Plotly.newPlot(this.container, this.frames[0].data, this.layout).then(
      function () {
        // console.log(this);
        // console.log(this.frames);
        Plotly.addFrames(this.container, this.frames);
      }.bind(this)
    );
  };

  startAnimation = function () {
    Plotly.animate(this.container, null, {
      transition: {
        duration: 0,
        easing: "linear",
      },
      frame: {
        duration: 10,
        redraw: false,
      },
      mode: "immediate",
    });
  };
  stopAnimation = function () {
    // console.log(this);
    Plotly.animate(this.container, [], { mode: "next" });
  };
}

export { PlotAnimation };
