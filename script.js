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

// Agregar mensaje al chat
function agregarMensaje(texto, clase) {
  const div = document.createElement("div");
  div.className = "message " + clase;
  div.textContent = texto;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (clase === "ia" && vozActivada) {
    reproducirVoz(texto);
  }
}

// Reproducir voz solo si está activada
function reproducirVoz(texto) {
  if (!vozActivada) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = "es-AR";
  speechSynthesis.speak(utterance);
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
    const result = event.results[0][0].transcript.trim();
    micButton.textContent = "🎤";
    input.value = result;
    procesarEntrada(result); // Proceso directo lo dicho
  };

  recognition.onerror = () => {
    micButton.textContent = "🎤";
  };

  recognition.onend = () => {
    micButton.textContent = "🎤";
  };
}

// Detectar palabras clave críticas
function manejarRedireccion(texto) {
  const lower = texto.toLowerCase();

  if (lower.includes("psicólogo") || lower.includes("psicologo") || lower.includes("terapia")) {
    if (primeraSesion) {
      agregarMensaje("Te llevamos con un psicólogo para tu primera sesión gratuita.", "ia");
      primeraSesion = false;
    } else {
      agregarMensaje("Ya usaste tu sesión gratuita. Podés hablar con nuestra IA especializada.", "ia");
      setTimeout(() => window.location.href = "chat.html", 2000);
      return true;
    }
    setTimeout(() => window.location.href = "psicologo.html", 2000);
    return true;
  }

  if (lower.includes("ayuda") || lower.includes("urgente") || lower.includes("emergencia") || lower.includes("hablar con alguien")) {
    agregarMensaje("Te redirigimos a la sección de ayuda inmediata.", "ia");
    setTimeout(() => window.location.href = "ayuda.html", 2000);
    return true;
  }

  if (lower.includes("relajación") || lower.includes("respirar") || lower.includes("ansiedad")) {
    agregarMensaje("Vamos a la sección de relajación. Respirá hondo, todo va a estar bien.", "ia");
    setTimeout(() => window.location.href = "relajacion.html", 2000);
    return true;
  }

  if (lower.includes("me siento mal") || lower.includes("necesito hablar") || lower.includes("charlar")) {
    agregarMensaje("Entiendo cómo te sentís. Te recomiendo hablar con nuestro psicólogo.", "ia");
    setTimeout(() => window.location.href = "psicologo.html", 2000);
    return true;
  }

  return false;
}

// Procesar texto (voz o texto escrito)
async function procesarEntrada(textoUsuario) {
  const texto = textoUsuario.trim();
  if (!texto) return;

  agregarMensaje(texto, "user");
  input.value = "";

  if (manejarRedireccion(texto)) return;

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
        messages: [{ role: "user", content: texto }]
      })
    });

    const data = await res.json();
    typing.remove();

    let respuestaIA = data.reply || "Lo siento, no entendí. ¿Querés repetirlo?";

    // Antibug idioma/respuesta incoherente
    if (/portugu/i.test(respuestaIA) || /(sou|estou|psic[oó]logo)/i.test(respuestaIA)) {
      respuestaIA = "¿Querés hablar con un psicólogo? Podemos ayudarte.";
    }

    agregarMensaje(respuestaIA, "ia");
  } catch (err) {
    typing.remove();
    agregarMensaje("⚠ Error al conectar con la IA", "ia");
    console.error(err);
  }
}

// Evento de botón enviar
sendButton.addEventListener("click", () => {
  const textoUsuario = input.value.trim();
  procesarEntrada(textoUsuario);
});
