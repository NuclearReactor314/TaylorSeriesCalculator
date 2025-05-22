function taylorTerm(expr, a, n, x) {
  const f = math.parse(expr).compile();
  const scope = { x: a };
  let derivative = f;
  let term = 0;

  for (let i = 0; i <= n; i++) {
    const value = derivative.evaluate(scope);
    term += value * Math.pow(x - a, i) / math.factorial(i);
    derivative = math.derivative(derivative.toString(), 'x');
  }

  return term;
}

function generateData(expr, a, maxN, step = 0.5) {
  const xValues = math.range(a - 5, a + 5, 0.1).toArray();
  const original = {
    x: xValues,
    y: xValues.map(x => math.evaluate(expr, { x })),
    name: `f(x)`,
    line: { width: 3 },
  };

  const series = [];
  for (let n = 1; n <= maxN; n++) {
    series.push({
      x: xValues,
      y: xValues.map(x => taylorTerm(expr, a, n, x)),
      name: `Taylor n=${n}`,
      visible: n === 1 ? true : 'legendonly'
    });
  }

  return [original, ...series];
}

function start() {
  const expr = document.getElementById("functionInput").value;
  const a = parseFloat(document.getElementById("aInput").value);
  const n = parseInt(document.getElementById("nInput").value);

  try {
    const data = generateData(expr, a, n);
    const layout = {
      title: `Taylor Series Approximation of f(x) = ${expr}`,
      xaxis: { title: "x" },
      yaxis: { title: "y" },
      template: document.body.classList.contains("dark") ? "plotly_dark" : "plotly_white"
    };

    Plotly.newPlot("plot", [data[0]], layout);

    let i = 1;
    const interval = setInterval(() => {
      if (i > n) {
        clearInterval(interval);
      } else {
        Plotly.addTraces("plot", data[i]);
        i++;
      }
    }, 1000);
  } catch (err) {
    alert("Invalid input. Please check your function and try again.");
  }
}

function downloadPlot() {
  Plotly.downloadImage("plot", { format: "png", filename: "taylor_series" });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  const layoutUpdate = {
    template: document.body.classList.contains("dark") ? "plotly_dark" : "plotly_white"
  };
  Plotly.relayout("plot", layoutUpdate);
}
