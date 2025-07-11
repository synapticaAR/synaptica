const input = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");
const chatBox = document.getElementById("chat-box");
const voiceToggle = document.getElementById("voice-toggle");

let vozActivada = true;

if (voiceToggle) {
  voiceToggle.addEventListener("click", () => {
    vozActivada = !vozActivada;
    voiceToggle.textContent = vozActivada ? "🔊 Voz activada" : "🔇 Voz desactivada";
  });
}

function agregarMensaje(texto, clase) {
  const div = document.createElement("div");
  div.className = "message " + clase;
  div.textContent = texto;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function reproducirTexto(texto) {
  if (!vozActivada) return;
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = "es-AR";
  speechSynthesis.cancel(); // Cancela cualquier voz en curso
  speechSynthesis.speak(utterance);
}

sendButton.addEventListener("click", async () => {
  const textoUsuario = input.value.trim();
  if (!textoUsuario) return;

  agregarMensaje(textoUsuario, "user");
  input.value = "";

  // Detectar palabras clave
  const lower = textoUsuario.toLowerCase();
  if (lower.includes("psicólogo") || lower.includes("psicologo")) {
    window.location.href = "psicologo.html";
    return;
  }
  if (lower.includes("ayuda")) {
    window.location.href = "ayuda.html";
    return;
  }
  if (lower.includes("hablar con alguien") || lower.includes("charlar") || lower.includes("necesito hablar")) {
    window.location.href = "chat.html";
    return;
  }

  try {
    const res = await fetch("https://TU-USUARIO.replit.dev/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: textoUsuario }]
      })
    });

    const data = await res.json();
    const respuestaIA = data.reply || "Lo siento, no entendí. ¿Podés repetirlo?";

    agregarMensaje(respuestaIA, "ia");
    reproducirTexto(respuestaIA);
  } catch (err) {
    agregarMensaje("⚠ Error al conectar con la IA", "ia");
    console.error(err);
  }
});
