function preprocess(expr) {
  return expr.replace(/e\^(\([^)]*\)|[a-zA-Z0-9]+)/g, (m, g1) => `exp${g1}`);
}

function taylorApprox(expr, a, n, x) {
  let node = math.parse(expr);
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

  const originalY = xValues.map(x => {
    try {
      const v = math.evaluate(expr, { x });
      if (!isFinite(v)) throw new Error("Non-finite value");
      return v;
    } catch (e) {
      console.warn(`Original f(x) eval error at x=${x}:`, e.message);
      return NaN;
    }
  });

  console.log("Original Y sample:", originalY.slice(0,5));

  const originalTrace = {
    x: xValues,
    y: originalY,
    name: 'Original f(x)',
    mode: 'lines',
    line: { width: 3, color: '#1f77b4' }
  };

  const taylorTraces = [];
  for (let i = 1; i <= maxN; i++) {
    const yVals = xValues.map(x => {
      try {
        const v = taylorApprox(expr, a, i, x);
        if (!isFinite(v)) throw new Error("Non-finite value");
        return v;
      } catch (e) {
        console.warn(`Taylor n=${i} eval error at x=${x}:`, e.message);
        return NaN;
      }
    });
    console.log(`Taylor n=${i} Y sample:`, yVals.slice(0,5));

    taylorTraces.push({
      x: xValues,
      y: yVals,
      name: `Taylor n=${i}`,
      mode: 'lines',
      line: { dash: 'dot' },
      visible: i === 1 ? true : 'legendonly',
    });
  }

  return [originalTrace, ...taylorTraces];
}

function start() {
  let expr = document.getElementById("functionInput").value.trim();
  expr = preprocess(expr);
  console.log("Processed expr:", expr);

  const a = parseFloat(document.getElementById("aInput").value);
  const n = parseInt(document.getElementById("nInput").value);

  if (isNaN(a) || isNaN(n) || n < 1 || n > 20) {
    alert("Please enter valid numbers for a and n (1 ≤ n ≤ 20).");
    return;
  }

  let data;
  try {
    data = generateData(expr, a, n);
  } catch (e) {
    alert("Error processing function: " + e.message);
    return;
  }

  const layout = {
    title: `Taylor Series Approximation of f(x) = ${expr}`,
    xaxis: { title: "x" },
    yaxis: { title: "y" },
    template: document.body.classList.contains("dark") ? "plotly_dark" : "plotly_white",
    legend: { orientation: "h", y: -0.3 }
  };

  Plotly.newPlot("plot", [data[0]], layout);

  let i = 1;
  const interval = setInterval(() => {
    if (i > n) {
      clearInterval(interval);
      return;
    }
    Plotly.addTraces("plot", data[i]);
    i++;
  }, 1000);
}