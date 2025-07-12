const input = document.getElementById("userInput");
const sendButton = document.getElementById("send-btn");
const chatBox = document.getElementById("chatBox");
const voiceToggle = document.getElementById("vozToggle");
const micButton = document.getElementById("mic-btn");

let vozActivada = true;
let primeraSesion = true;
let reconocimientoActivo = false;

// Alternar voz
voiceToggle?.addEventListener("click", () => {
  vozActivada = !vozActivada;
  voiceToggle.textContent = vozActivada ? "🔊 Voz ON" : "🔇 Voz OFF";
  if (!vozActivada) speechSynthesis.cancel();
});

// Reconocimiento de voz
if (micButton && "webkitSpeechRecognition" in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "es-AR";
  recognition.continuous = false;
  recognition.interimResults = false;

  micButton.addEventListener("click", () => {
    if (reconocimientoActivo) return;
    reconocimientoActivo = true;
    recognition.start();
    micButton.textContent = "🎙️ Escuchando...";
    micButton.disabled = true;
  });

  recognition.onresult = (event) => {
    const result = event.results[0][0].transcript.trim();
    input.value = result;
    micButton.textContent = "🎤";
    micButton.disabled = false;
    reconocimientoActivo = false;
    recognition.stop();
    if (result) procesarEntrada(result);
  };

  recognition.onerror = recognition.onend = () => {
    micButton.textContent = "🎤";
    micButton.disabled = false;
    reconocimientoActivo = false;
    recognition.stop();
  };
}

// Mostrar mensaje
function agregarMensaje(texto, clase) {
  const div = document.createElement("div");
  div.className = "message " + clase;
  div.textContent = texto;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (clase === "ia" && vozActivada) {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "es-AR";
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }
}

// Lógica de redirección emocional
function manejarRedireccion(texto) {
  const lower = texto.toLowerCase();

  if (lower.includes("psicólogo") || lower.includes("terapia")) {
    if (primeraSesion) {
      agregarMensaje("Te derivamos a tu primera sesión gratuita con un psicólogo humano.", "ia");
      primeraSesion = false;
    } else {
      agregarMensaje("Ya usaste tu sesión gratuita. Podés hablar con la IA o agendar una sesión paga.", "ia");
    }
    setTimeout(() => window.location.href = "psicologo.html", 3000);
    return true;
  }

  if (
    lower.includes("ayuda urgente") ||
    lower.includes("emergencia") ||
    lower.includes("no doy más")
  ) {
    agregarMensaje("Redirigiéndote a ayuda inmediata…", "ia");
    setTimeout(() => window.location.href = "ayuda.html", 3000);
    return true;
  }

  if (
    lower.includes("me siento mal") ||
    lower.includes("necesito ayuda") ||
    lower.includes("estoy solo") ||
    lower.includes("nadie me quiere")
  ) {
    if (primeraSesion) {
      agregarMensaje("Veo que estás mal. Te paso con un psicólogo para tu primera sesión gratuita.", "ia");
      primeraSesion = false;
      setTimeout(() => window.location.href = "psicologo.html", 3000);
    } else {
      agregarMensaje("Ya tuviste tu primera sesión. Podés hablar con nuestra IA especializada o agendar otra.", "ia");
    }
    return true;
  }

  if (
    lower.includes("relajación") ||
    lower.includes("ansiedad") ||
    lower.includes("respirar") ||
    lower.includes("estresado")
  ) {
    agregarMensaje("Te llevo a la sección de relajación para calmarte…", "ia");
    setTimeout(() => window.location.href = "relajacion.html", 3000);
    return true;
  }

  return false;
}

// Procesar entrada
async function procesarEntrada(textoUsuario) {
  if (!textoUsuario.trim()) return;

  agregarMensaje(textoUsuario, "user");
  input.value = "";

  if (manejarRedireccion(textoUsuario)) return;

  const typing = document.createElement("div");
  typing.className = "message ia";
  typing.textContent = "Synaptica está escribiendo…";
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch("https://eae9efbf-3f34-41bb-b03b-4ad9dbeedd61-00-23tds4nuay46d.picard.replit.dev/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: textoUsuario }] })
    });

    const data = await res.json();
    typing.remove();

    let respuestaIA = data.reply || "No entendí eso. ¿Podés explicarlo un poco más?";
    agregarMensaje(respuestaIA, "ia");

  } catch (err) {
    typing.remove();
    agregarMensaje("⚠️ Error al conectar con el servidor", "ia");
    console.error(err);
  }
}

// Enviar al hacer click
sendButton.addEventListener("click", () => {
  procesarEntrada(input.value.trim());
});
