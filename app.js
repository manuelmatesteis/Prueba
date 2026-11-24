document.addEventListener("DOMContentLoaded", () => {
  initFilters();
  initDeterminantLab();
  initVectorLab();
  initQuiz();
});

/* ---------------- 1. FILTROS DE NAVEGACIÓN ---------------- */
function initFilters() {
  const buttons = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll("[data-block]");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      sections.forEach((sec) => {
        if (filter === "all" || sec.dataset.block === filter) {
          sec.classList.remove("hidden");
        } else {
          sec.classList.add("hidden");
        }
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

/* ---------------- 2. CALCULADORA DE DETERMINANTES ---------------- */
function initDeterminantLab() {
  const grid = document.getElementById("det-grid");
  const output = document.getElementById("det-output");
  const btn2 = document.getElementById("btn-det-2");
  const btn3 = document.getElementById("btn-det-3");

  let size = 2;
  const defaults = {
    2: [2, 1, 3, 4],
    3: [1, 2, 0, 0, 3, 1, 2, 1, 1],
  };

  function renderGrid(newSize) {
    size = newSize;
    grid.className = `matrix-inputs size-${size}`;
    grid.innerHTML = "";

    const vals = defaults[size];
    for (let i = 0; i < size * size; i++) {
      const input = document.createElement("input");
      input.type = "number";
      input.className = "num-input";
      input.value = vals[i];
      input.setAttribute("aria-label", `Elemento ${i + 1}`);
      input.addEventListener("input", computeDet);
      grid.appendChild(input);
    }
    computeDet();
  }

  function fmt(n) {
    const clean = Math.round(n * 1000) / 1000;
    return Object.is(clean, -0) ? "0" : String(clean);
  }

  function computeDet() {
    const vals = Array.from(grid.querySelectorAll("input")).map((el) => {
      const n = parseFloat(el.value);
      return Number.isFinite(n) ? n : 0;
    });

    let det = 0;
    let steps = "";

    if (size === 2) {
      const [a, b, c, d] = vals;
      const p1 = a * d;
      const p2 = b * c;
      det = p1 - p2;
      steps = `(${fmt(a)}·${fmt(d)}) − (${fmt(b)}·${fmt(c)}) = ${fmt(p1)} − (${fmt(p2)})`;
    } else {
      const [a11, a12, a13, a21, a22, a23, a31, a32, a33] = vals;
      const pos = a11 * a22 * a33 + a12 * a23 * a31 + a13 * a21 * a32;
      const neg = a13 * a22 * a31 + a12 * a21 * a33 + a11 * a23 * a32;
      det = pos - neg;
      steps = `Positivos (${fmt(pos)}) − Negativos (${fmt(neg)})`;
    }

    const invertible = Math.abs(det) > 1e-9;
    const statusText = invertible
      ? `<span class="badge-status badge-scd">Sí tiene inversa (|A| ≠ 0)</span> · Rango máximo (${size})`
      : `<span class="badge-status badge-si">No tiene inversa (|A| = 0)</span> · Rango &lt; ${size}`;

    output.innerHTML = `
      <p><strong>Cálculo:</strong> ${steps}</p>
      <p><strong>Resultado:</strong> <span class="res-highlight">|A| = ${fmt(det)}</span></p>
      <p>${statusText}</p>
    `;
  }

  btn2.addEventListener("click", () => {
    btn2.classList.add("active");
    btn3.classList.remove("active");
    renderGrid(2);
  });

  btn3.addEventListener("click", () => {
    btn3.classList.add("active");
    btn2.classList.remove("active");
    renderGrid(3);
  });

  renderGrid(2);
}

/* ---------------- 3. LABORATORIO DE VECTORES 3D ---------------- */
function initVectorLab() {
  const inputs = document.querySelectorAll(".vec-in");
  const output = document.getElementById("vec-output");

  function num(id) {
    const val = parseFloat(document.getElementById(id).value);
    return Number.isFinite(val) ? val : 0;
  }

  function fmt(n) {
    const clean = Math.round(n * 100) / 100;
    return Object.is(clean, -0) ? "0" : String(clean);
  }

  function update() {
    const u = [num("u1"), num("u2"), num("u3")];
    const v = [num("v1"), num("v2"), num("v3")];

    const dot = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
    const cross = [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ];

    const modU = Math.hypot(u[0], u[1], u[2]);
    const modV = Math.hypot(v[0], v[1], v[2]);
    const modCross = Math.hypot(cross[0], cross[1], cross[2]);

    let relation = "Forman un ángulo cualquiera";
    let angleStr = "—";

    if (modU < 1e-9 || modV < 1e-9) {
      relation = "Uno de los vectores es el vector nulo (0, 0, 0).";
    } else {
      const cosA = Math.max(-1, Math.min(1, dot / (modU * modV)));
      const deg = (Math.acos(cosA) * 180) / Math.PI;
      angleStr = `${fmt(deg)}°`;

      if (Math.abs(dot) < 1e-9) {
        relation = `<span class="badge-status badge-scd">Son perpendiculares (90°)</span> porque u·v = 0`;
      } else if (modCross < 1e-9) {
        relation = `<span class="badge-status badge-sci">Son paralelos</span> porque u×v = (0, 0, 0)`;
      } else {
        relation = `Ángulo entre ellos: <strong>${angleStr}</strong>`;
      }
    }

    output.innerHTML = `
      <p><strong>Producto escalar (u · v):</strong> <span class="res-highlight">${fmt(dot)}</span></p>
      <p><strong>Producto vectorial (u × v):</strong> <span class="res-highlight">(${fmt(cross[0])}, ${fmt(cross[1])}, ${fmt(cross[2])})</span></p>
      <p><strong>Módulos:</strong> |u| = ${fmt(modU)} · |v| = ${fmt(modV)} · Área paralelogramo = ${fmt(modCross)}</p>
      <p>${relation}</p>
    `;
  }

  inputs.forEach((inp) => inp.addEventListener("input", update));
  update();
}

/* ---------------- 4. MINI-TEST INTERACTIVO ---------------- */
const QUIZ_QUESTIONS = [
  {
    block: "algebra",
    tag: "Álgebra · Matrices",
    q: "¿Cuándo se pueden multiplicar dos matrices A · B?",
    options: [
      "Siempre que tengan exactamente las mismas filas y columnas.",
      "Cuando el número de columnas de A coincide con el número de filas de B.",
      "Solo cuando ambas son matrices cuadradas.",
    ],
    answer: 1,
    explain: "Para multiplicar (m × n) · (n × p) deben coincidir las dimensiones interiores: columnas de A = filas de B.",
  },
  {
    block: "algebra",
    tag: "Álgebra · Determinantes",
    q: "Si una matriz cuadrada A tiene determinante |A| = 0, entonces...",
    options: [
      "No tiene matriz inversa.",
      "Su matriz inversa es la matriz identidad.",
      "El sistema A·X = B siempre tiene una única solución.",
    ],
    answer: 0,
    explain: "Para calcular A⁻¹ hay que dividir entre |A|. Si |A| = 0, no existe inversa.",
  },
  {
    block: "algebra",
    tag: "Álgebra · Sistemas",
    q: "En un sistema de 3 incógnitas obtenemos rg(A) = 2 y rg(A*) = 2. ¿Qué tipo de sistema es?",
    options: [
      "Compatible Determinado (1 solución).",
      "Incompatible (sin solución).",
      "Compatible Indeterminado (infinitas soluciones).",
    ],
    answer: 2,
    explain: "Según Rouché-Fröbenius, si rg(A) = rg(A*) < nº de incógnitas (2 < 3), el sistema es SCI.",
  },
  {
    block: "algebra",
    tag: "Álgebra · Ecuaciones matriciales",
    q: "Queremos despejar X en la ecuación A · X = B (suponiendo que existe A⁻¹). ¿Cuál es el resultado correcto?",
    options: [
      "X = B · A⁻¹",
      "X = A⁻¹ · B",
      "X = B − A",
    ],
    answer: 1,
    explain: "El producto de matrices no es conmutativo: como A está a la izquierda de X, multiplicamos por A⁻¹ también por la izquierda.",
  },
  {
    block: "geometria",
    tag: "Geometría · Vectores",
    q: "¿Cómo comprobamos rápidamente que dos vectores u y v son perpendiculares?",
    options: [
      "Su producto escalar vale 0 (u · v = 0).",
      "Sus coordenadas son proporcionales.",
      "Su producto vectorial vale (0, 0, 0).",
    ],
    answer: 0,
    explain: "Si u · v = 0 (con vectores no nulos), cos α = 0 y por tanto el ángulo es 90°.",
  },
  {
    block: "geometria",
    tag: "Geometría · Planos",
    q: "Dado el plano π: 3x − 2y + z − 7 = 0, ¿cuál es su vector normal (perpendicular al plano)?",
    options: [
      "(3, −2, −7)",
      "(3, −2, 1)",
      "(−3, 2, 7)",
    ],
    answer: 1,
    explain: "En Ax + By + Cz + D = 0, el vector normal es siempre (A, B, C). El término D no entra en el vector.",
  },
  {
    block: "geometria",
    tag: "Geometría · Vectores",
    q: "Tienes dos vectores no paralelos de un plano y necesitas hallar su vector normal. ¿Qué operación haces?",
    options: [
      "El producto escalar.",
      "La suma de ambos vectores.",
      "El producto vectorial (u × v).",
    ],
    answer: 2,
    explain: "El producto vectorial u × v devuelve un vector perpendicular a u y a v a la vez, justo el vector normal del plano.",
  },
  {
    block: "geometria",
    tag: "Geometría · Posiciones relativas",
    q: "Si una recta (vector director d) es PARALELA a un plano (vector normal n), ¿cómo son d y n entre sí?",
    options: [
      "Perpendiculares (d · n = 0).",
      "Paralelos (proporcionales).",
      "Iguales obligatoriamente.",
    ],
    answer: 0,
    explain: "Como n sale perpendicular al plano, cualquier recta paralela al plano forma 90° con n, así que d · n = 0.",
  },
];

function initQuiz() {
  const container = document.getElementById("quiz-container");
  const scoreEl = document.getElementById("quiz-score");
  const resetBtn = document.getElementById("quiz-reset");

  let score = 0;

  function renderQuiz() {
    score = 0;
    updateScore();
    container.innerHTML = "";

    QUIZ_QUESTIONS.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "q-item";

      const optionsHtml = item.options
        .map(
          (opt, oIdx) =>
            `<button type="button" class="opt-btn" data-q="${idx}" data-o="${oIdx}">${opt}</button>`
        )
        .join("");

      card.innerHTML = `
        <div class="q-meta ${item.block}">${item.tag}</div>
        <div class="q-text">${idx + 1}. ${item.q}</div>
        <div class="q-options">${optionsHtml}</div>
        <div class="q-feedback" id="fb-${idx}"></div>
      `;

      container.appendChild(card);
    });

    container.querySelectorAll(".opt-btn").forEach((btn) => {
      btn.addEventListener("click", handleAnswer);
    });
  }

  function handleAnswer(e) {
    const btn = e.currentTarget;
    const qIdx = Number(btn.dataset.q);
    const oIdx = Number(btn.dataset.o);
    const item = QUIZ_QUESTIONS[qIdx];

    const qButtons = container.querySelectorAll(`.opt-btn[data-q="${qIdx}"]`);
    qButtons.forEach((b) => (b.disabled = true));

    const fb = document.getElementById(`fb-${qIdx}`);
    if (oIdx === item.answer) {
      btn.classList.add("correct");
      score++;
      updateScore();
      fb.className = "q-feedback show ok";
      fb.textContent = `¡Correcto! ${item.explain}`;
    } else {
      btn.classList.add("wrong");
      qButtons[item.answer].classList.add("correct");
      fb.className = "q-feedback show err";
      fb.textContent = `No exactamente. ${item.explain}`;
    }
  }

  function updateScore() {
    scoreEl.textContent = `Aciertos: ${score} / ${QUIZ_QUESTIONS.length}`;
  }

  resetBtn.addEventListener("click", renderQuiz);
  renderQuiz();
}
