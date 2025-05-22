function preprocess(expr) {
  // 替换所有 e^后面跟的项，比如 e^x 或 e^(x+1)
  return expr.replace(/e\^(\([^)]*\)|[a-zA-Z0-9]+)/g, (match, g1) => {
    return `exp${g1}`;
  });
}

function taylorApprox(expr, a, n, x) {
  const node = math.parse(expr);
  let sum = 0;
  let derivative = node;

  for (let i = 0; i <= n; i++) {
    const val = derivative.evaluate({ x: a });
    sum += val * Math.pow(x - a, i) / math.factorial(i);
    derivative = math.derivative(derivative, 'x');
  }

  return sum;
}

function generateData(expr, a, maxN) {
  const xValues = math.range(a - 5, a + 5, 0.1).toArray();

  const original = {
    x: xValues,
    y: xValues.map(x => {
      try {
        return math.evaluate(expr, { x });
      } catch {
        return NaN;
      }
    }),
    name: 'Original f(x)',
    line: { width: 3, color: '#1f77b4' },
  };

  const taylorSeries = [];
  for (let n = 1; n <= maxN; n++) {
    taylorSeries.push({
      x: xValues,
      y: xValues.map(x => {
        try {
          return taylorApprox(expr, a, n, x);
        } catch {
          return NaN;
        }
      }),
      name: `Taylor n=${n}`,
      visible: n === 1 ? true : 'legendonly',
      line: { dash: 'dot' }
    });
  }

  return [original, ...taylorSeries];
}

function start() {
  let expr = document.getElementById("functionInput").value.trim();
  expr = preprocess(expr);

  const a = parseFloat(document.getElementById("aInput").value);
  const n = parseInt(document.getElementById("nInput").value);

  if (isNaN(a) || isNaN(n) || n < 1 || n > 20) {
    alert("Please enter valid numbers for a and n (1 ≤ n ≤ 20).");
    return;
  }

  try {
    const data = generateData(expr, a, n);
    const layout = {
      title: `Taylor Series Approximation of f(x) = ${expr}`,
      xaxis: { title: "x" },
      yaxis: { title: "y" },
      template: document.body.classList.contains("dark") ? "plotly_dark" : "plotly_white",
      legend: { orientation: "h", y: -0.3 },
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

  } catch (error) {
    alert("Error evaluating function. Please check your input.");
    console.error(error);
  }
}

function downloadPlot() {
  Plotly.downloadImage("plot", { format: "png", filename: "taylor_series" });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  Plotly.relayout("plot", {
    template: document.body.classList.contains("dark") ? "plotly_dark" : "plotly_white"
  });
}