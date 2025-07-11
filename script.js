const input = document.getElementById("userInput");
const sendButton = document.getElementById("send-btn");
const chatBox = document.getElementById("chatBox");
const voiceToggle = document.getElementById("vozToggle");
const micButton = document.getElementById("mic-btn");

let vozActivada = true;
let primeraSesion = true;

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
    recognition.start();
    micButton.textContent = "🎤 Escuchando...";
  });

  recognition.onresult = (event) => {
    const result = event.results[0][0].transcript;
    input.value = result;
    micButton.textContent = "🎤";
  };

  recognition.onerror = () => {
    micButton.textContent = "🎤";
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

// Detectar palabras clave
function manejarRedireccion(texto) {
  const lower = texto.toLowerCase();

  if (lower.includes("psicólogo") || lower.includes("psicologo") || lower.includes("terapia")) {
    if (primeraSesion) {
      agregarMensaje("Entiendo que necesitás hablar con un psicólogo. Te derivamos a tu primera sesión gratuita.", "ia");
      primeraSesion = false;
    } else {
      agregarMensaje("Ya usaste tu sesión gratuita. Podés hablar con nuestra IA especializada ahora mismo.", "ia");
      setTimeout(() => window.location.href = "chat.html", 3000);
      return true;
    }
    setTimeout(() => window.location.href = "psicologo.html", 3000);
    return true;
  }

  if (lower.includes("ayuda") || lower.includes("urgente") || lower.includes("emergencia")) {
    agregarMensaje("Te redirigimos al equipo de ayuda inmediata. Dejanos ayudarte...", "ia");
    setTimeout(() => window.location.href = "ayuda.html", 3000);
    return true;
  }

  if (lower.includes("relajación") || lower.includes("respirar") || lower.includes("ansiedad")) {
    agregarMensaje("Te recomiendo visitar nuestra sección de relajación. Vas a estar bien.", "ia");
    setTimeout(() => window.location.href = "relajacion.html", 3000);
    return true;
  }

  if (lower.includes("necesito hablar") || lower.includes("me siento mal") || lower.includes("charlar")) {
    agregarMensaje("Estoy acá para escucharte. ¿Querés que te lleve con nuestro psicólogo o preferís hablar conmigo?", "ia");
    return false;
  }

  return false;
}

// Enviar mensaje
sendButton.addEventListener("click", async () => {
  const textoUsuario = input.value.trim();
  if (!textoUsuario) return;

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
    agregarMensaje("⚠ Error al conectar con la IA", "ia");
    console.error(err);
  }
});
