const input = document.getElementById("userInput");
const sendButton = document.querySelector("button[onclick='sendMessage()']");
const chatBox = document.getElementById("chatBox");
const voiceToggle = document.getElementById("vozToggle");

let vozActivada = true;
const memoria = [];

// Cambiar texto del botón de voz
if (voiceToggle) {
  voiceToggle.addEventListener("click", () => {
    vozActivada = !vozActivada;
    voiceToggle.textContent = vozActivada ? "🔊 Voz ON" : "🔇 Voz OFF";
    if (!vozActivada) speechSynthesis.cancel();
  });
}

// Mostrar mensaje en el chat
function agregarMensaje(texto, clase) {
  const div = document.createElement("div");
  div.className = "message " + clase;
  div.textContent = texto;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (clase === "ia" && vozActivada) {
    reproducirTexto(texto);
  }

  memoria.push({
    role: clase === "user" ? "user" : "assistant",
    content: texto
  });
}

// Hablar en voz alta
function reproducirTexto(texto) {
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = "es-AR";
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

// Enviar mensaje
async function sendMessage() {
  const textoUsuario = input.value.trim();
  if (!textoUsuario) return;

  agregarMensaje(textoUsuario, "user");
  input.value = "";

  // Detectar redirecciones por palabras clave
  const texto = textoUsuario.toLowerCase();
  if (/psic[oó]log/.test(texto)) {
    agregarMensaje("Te acompaño a la sección de psicólogo…", "ia");
    setTimeout(() => window.location.href = "psicologo.html", 1200);
    return;
  }
  if (/ayuda|urgencia|contenci[oó]n/.test(texto)) {
    agregarMensaje("Vamos a la sección de ayuda urgente…", "ia");
    setTimeout(() => window.location.href = "ayuda.html", 1200);
    return;
  }
  if (/relajaci[oó]n|ansiedad|meditaci[oó]n|respira/.test(texto)) {
    agregarMensaje("Puedo guiarte a una actividad relajante…", "ia");
    setTimeout(() => window.location.href = "relajacion.html", 1200);
    return;
  }

  // Mostrar "escribiendo..."
  const escribiendo = document.createElement("div");
  escribiendo.className = "message ia";
  escribiendo.textContent = "Synaptica está escribiendo…";
  chatBox.appendChild(escribiendo);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch("https://TU-USUARIO.replit.dev/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: memoria })
    });

    const data = await res.json();
    escribiendo.remove();

    let respuestaIA = data.reply || "Lo siento, no entendí. ¿Podés repetirlo?";

    // Respuesta empática si detecta estados emocionales
    if (/mal|triste|angustia|solo|ansiedad/.test(textoUsuario)) {
      respuestaIA += "\nNo estás solo. Si necesitás hablar con alguien, estoy acá para ayudarte.";
    }

    agregarMensaje(respuestaIA, "ia");

  } catch (err) {
    escribiendo.remove();
    agregarMensaje("⚠️ Error al conectar con la IA", "ia");
    console.error(err);
  }
}

// Listeners alternativos si se importa el script externamente
if (sendButton) {
  sendButton.addEventListener("click", sendMessage);
}
