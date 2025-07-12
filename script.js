const input = document.getElementById("userInput");
const sendButton = document.getElementById("send-btn");
const chatBox = document.getElementById("chatBox");
const voiceToggle = document.getElementById("vozToggle");
const micButton = document.getElementById("mic-btn");

let vozActivada = true;
let reconocimientoActivo = false;
let primeraSesion = localStorage.getItem("primeraSesion") !== "false"; // Recordar entre sesiones

// Alternar voz
if (voiceToggle) {
  voiceToggle.addEventListener("click", () => {
    vozActivada = !vozActivada;
    voiceToggle.textContent = vozActivada ? "🔊 Voz ON" : "🔇 Voz OFF";
    if (!vozActivada) speechSynthesis.cancel();
  });
}

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

  recognition.onerror = () => {
    micButton.textContent = "🎤";
    micButton.disabled = false;
    reconocimientoActivo = false;
    recognition.stop();
  };

  recognition.onend = () => {
    micButton.textContent = "🎤";
    micButton.disabled = false;
    reconocimientoActivo = false;
  };
}

// Agregar mensaje al chat
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

// Redirección según urgencia
function manejarRedireccion(texto) {
  const lower = texto.toLowerCase();

  if (
    lower.includes("me siento mal") ||
    lower.includes("necesito ayuda") ||
    lower.includes("no doy más") ||
    lower.includes("nadie me quiere") ||
    lower.includes("estoy solo")
  ) {
    if (primeraSesion) {
      agregarMensaje("Veo que estás mal. Te paso con un psicólogo para tu primera sesión gratuita.", "ia");
      primeraSesion = false;
      localStorage.setItem("primeraSesion", "false");
      setTimeout(() => window.location.href = "psicologo.html", 3000);
    } else {
      agregarMensaje("Ya usaste tu sesión gratuita. Podemos derivarte con ayuda urgente o seguir por el chat.", "ia");
      setTimeout(() => window.location.href = "ayuda.html", 3000);
    }
    return true;
  }

  if (lower.includes("ayuda") || lower.includes("urgente") || lower.includes("emergencia") || lower.includes("contención")) {
    agregarMensaje("Redirigiéndote a ayuda inmediata…", "ia");
    setTimeout(() => window.location.href = "ayuda.html", 3000);
    return true;
  }

  if (lower.includes("psicólogo") || lower.includes("terapia")) {
    if (primeraSesion) {
      agregarMensaje("Te derivamos a tu primera sesión gratuita con un psicólogo.", "ia");
      primeraSesion = false;
      localStorage.setItem("primeraSesion", "false");
    } else {
      agregarMensaje("Ya usaste tu sesión gratuita. Podés hablar con nuestra IA o agendar una sesión paga.", "ia");
    }
    setTimeout(() => window.location.href = "psicologo.html", 3000);
    return true;
  }

  if (
    lower.includes("relajación") || lower.includes("respirar") ||
    lower.includes("ansiedad") || lower.includes("estresado")
  ) {
    agregarMensaje("Te llevo a la sección de relajación para que respires y te calmes…", "ia");
    setTimeout(() => window.location.href = "relajacion.html", 3000);
    return true;
  }

  return false;
}

// Procesar mensaje del usuario
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
    const res = await fetch("https://TU-USUARIO.replit.dev/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: textoUsuario }]
      })
    });

    const data = await res.json();
    typing.remove();

    let respuestaIA = data.reply || "Lo siento, no entendí. ¿Podés repetirlo?";

    if (/portugu/i.test(respuestaIA) || /(sou|estou|psic[oó]logo)/i.test(respuestaIA)) {
      respuestaIA = "¿Querés hablar con un psicólogo? Podemos ayudarte.";
    }

    agregarMensaje(respuestaIA, "ia");
  } catch (err) {
    typing.remove();
    agregarMensaje("⚠️ Error al conectar con el servidor", "ia");
    console.error(err);
  }
}

// Enviar al hacer click
sendButton.addEventListener("click", () => {
  const textoUsuario = input.value.trim();
  procesarEntrada(textoUsuario);
});
