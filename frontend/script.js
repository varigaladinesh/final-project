/* ============================
   PAGE FADE-IN
============================ */
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.remove("opacity-0");
});

/* ============================
   FLOATING SECURITY SYMBOLS
============================ */
const bgCanvas = document.getElementById("bgCanvas");
const ctx = bgCanvas.getContext("2d");

function resizeBG() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resizeBG();
window.addEventListener("resize", resizeBG);

const symbols = ["🔑", "🗝️", "📁", "📄", "🔒"];
const particles = [];

for (let i = 0; i < 40; i++) {
  particles.push({
    x: Math.random() * bgCanvas.width,
    y: Math.random() * bgCanvas.height,
    size: 16 + Math.random() * 22,
    speed: 0.2 + Math.random() * 0.6,
    alpha: 0.1 + Math.random() * 0.35,
    symbol: symbols[Math.floor(Math.random() * symbols.length)]
  });
}

function drawSymbols() {
  ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  for (const p of particles) {
    ctx.font = `${p.size}px monospace`;
    ctx.fillStyle = `rgba(255, 60, 80, ${p.alpha})`;
    ctx.fillText(p.symbol, p.x, p.y);

    p.y -= p.speed;
    if (p.y < -40) {
      p.y = bgCanvas.height + 40;
      p.x = Math.random() * bgCanvas.width;
    }
  }
}


/* ============================
   MATRIX BINARY RAIN
============================ */
const columns = Math.floor(bgCanvas.width / 20);
const drops = Array(columns).fill(0);

function drawMatrix() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

  ctx.fillStyle = "rgba(255, 0, 60, 0.35)";
  ctx.font = "14px monospace";

  for (let i = 0; i < drops.length; i++) {
    const text = Math.random() > 0.5 ? "1" : "0";
    ctx.fillText(text, i * 20, drops[i] * 20);

    if (drops[i] * 20 > bgCanvas.height && Math.random() > 0.97) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

/* ============================
   BACKGROUND ANIMATION LOOP
============================ */
function animateBackground() {
  drawSymbols();
  drawMatrix();
  requestAnimationFrame(animateBackground);
}

animateBackground();

/* ============================
   ENCRYPT API (UPDATED UI)
============================ */
document.getElementById("encryptForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const status = document.getElementById("encryptStatus");
  const cryptoBox = document.getElementById("cryptoInfo");
  const shaText = document.getElementById("shaText");
  const downloadLink = document.getElementById("downloadLink");

  const formData = new FormData(e.target);

  status.innerText = "Encrypting...";
  cryptoBox.classList.add("hidden");

  try {
    const res = await fetch("https://secure-image-uiwh.onrender.com/encrypt", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    status.innerText = data.status ?? "Encryption completed";

    // ✅ Populate modern UI elements
    shaText.innerText = data.sha256;
    downloadLink.onclick = async (e) => {
      e.preventDefault();

      const response = await fetch(data.download_url);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = data.download_url.split("/").pop();
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
};

    cryptoBox.classList.remove("hidden");

  } catch (err) {
    status.innerText = "Encryption failed";
  }
});


/* ============================
   DECRYPT API (WITH LOADER)
============================ */
document.getElementById("decryptForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const box = document.getElementById("decryptResult");
  const btn = document.getElementById("decryptBtn");
  const btnText = document.getElementById("decryptBtnText");
  const spinner = document.getElementById("decryptSpinner");

  const formData = new FormData(e.target);

  // 🔄 Show loader
  btn.disabled = true;
  btnText.innerText = "Decrypting...";
  spinner.classList.remove("hidden");

  box.className =
    "mt-5 p-4 rounded-xl bg-white/10 text-white/70 text-sm";
  box.classList.remove("hidden");
  box.innerHTML = "🔄 Processing decryption…";

  try {
    const res = await fetch("https://secure-image-uiwh.onrender.com/decrypt", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    // ✅ Handle responses with visualization
    if (data.status === "Integrity Verified") {
      box.className =
        "mt-5 p-4 rounded-xl bg-green-500/20 text-green-300 text-sm";
      box.innerHTML = `
        ✅ <b>Integrity Verified</b><br/>
        <span class="block mt-1">${data.message}</span>
      `;
    }
    else if (data.status === "Integrity Failed") {
      box.className =
        "mt-5 p-4 rounded-xl bg-red-500/20 text-red-300 text-sm";
      box.innerHTML = `
        ❌ <b>Image Tampered</b><br/>
        Hash mismatch detected
      `;
    }
    else if (data.status === "Invalid Image") {
      box.className =
        "mt-5 p-4 rounded-xl bg-orange-500/20 text-orange-300 text-sm";
      box.innerHTML = `
        ⚠️ <b>Invalid Image</b><br/>
        Not generated by this system
      `;
    }
    else {
      box.className =
        "mt-5 p-4 rounded-xl bg-red-500/20 text-red-300 text-sm";
      box.innerHTML = `
        ❌ <b>Decryption Failed</b><br/>
        Wrong password or corrupted image
      `;
    }

  } catch {
    box.className =
      "mt-5 p-4 rounded-xl bg-red-500/20 text-red-300 text-sm";
    box.innerText = "❌ Decryption error";
  }

  // 🔁 Reset button
  btn.disabled = false;
  btnText.innerText = "Decrypt Message";
  spinner.classList.add("hidden");
});

const pwdInput = document.querySelector('input[name="password"]');
const pwdBar = document.getElementById("pwdBar");
const pwdText = document.getElementById("pwdText");

pwdInput?.addEventListener("input", () => {
  const v = pwdInput.value;
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;

  if (score <= 1) {
    pwdBar.className = "h-2 rounded w-1/4 bg-red-500";
    pwdText.innerText = "Weak password";
  } else if (score === 2) {
    pwdBar.className = "h-2 rounded w-2/4 bg-yellow-400";
    pwdText.innerText = "Medium strength";
  } else {
    pwdBar.className = "h-2 rounded w-full bg-green-500";
    pwdText.innerText = "Strong password";
  }
});