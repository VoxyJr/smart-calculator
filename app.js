const go = new Go();

WebAssembly.instantiateStreaming(
  fetch("calc.wasm"),
  go.importObject
).then((result) => {
  go.run(result.instance);
});

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;

ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mousemove", draw);

canvas.addEventListener("touchstart", (e) => {
  drawing = true;
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  ctx.beginPath();
  ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
});

canvas.addEventListener("touchend", () => drawing = false);
canvas.addEventListener("touchmove", drawTouch);

function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function drawTouch(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

document.getElementById("clearBtn").addEventListener("click", () => {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  document.getElementById("result").textContent = "Result will appear here";
});

document.getElementById("calcBtn").addEventListener("click", async () => {
  const result = document.getElementById("result");
  result.textContent = "Reading...";

  const worker = await Tesseract.createWorker("eng");
  await worker.setParameters({
    tessedit_char_whitelist: "0123456789+-*/.()",
  });

  const { data: { text } } = await worker.recognize(canvas);
  await worker.terminate();

  const expr = text.trim().replace(/\s/g, "");
  result.textContent = "Saw: " + expr;

  if (expr) {
    const answer = goEvaluate(expr);
    result.textContent = expr + " = " + answer;
  } else {
    result.textContent = "Could not read expression";
  }
});
