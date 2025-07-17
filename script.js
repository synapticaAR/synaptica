const input = document.getElementById("userInput");
const sendButton = document.getElementById("send-btn");
const chatBox = document.getElementById("chatBox");
const voiceToggle = document.getElementById("vozToggle");

let vozActivada = true;

// Alternar voz
voiceToggle?.addEventListener("click", () => {
  vozActivada = !vozActivada;
  voiceToggle.textContent = vozActivada ? "🔊 Voz ON" : "🔇 Voz OFF";
  if (!vozActivada) speechSynthesis.cancel();
});

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

// Lógica de redirección emocional priorizada
function manejarRedireccion(texto) {
  const lower = texto.toLowerCase();

  // Si ya estamos en chat.html, NO redireccionamos
  if (document.body.classList.contains('chat')) {
    return false;
  }

  if (/(psicólogo|psicologa|psicologo|terapia|profesional|hablar con un psicólogo|necesito un psicólogo|quiero hablar con un profesional)/i.test(lower)) {
    agregarMensaje("Te llevo con un psicólogo para que puedas hablar con un profesional.", "ia");
    setTimeout(() => window.location.href = "psicologo.html", 3000);
    return true;
  }

  if (/(relajación|relajarme|ansiedad|estresado|respirar|calmarme|estres|meditación)/i.test(lower)) {
    agregarMensaje("Te llevo a la sección de relajación para que puedas calmarte.", "ia");
    setTimeout(() => window.location.href = "relajacion.html", 3000);
    return true;
  }

  if (/(ayuda urgente|emergencia|no doy más|necesito ayuda urgente)/i.test(lower)) {
    agregarMensaje("Redirigiéndote a ayuda inmediata…", "ia");
    setTimeout(() => window.location.href = "ayuda.html", 3000);
    return true;
  }

  if (/(ia|chat|conversar|inteligencia artificial|quiero hablar con la ia|synaptica)/i.test(lower)) {
    agregarMensaje("Te llevo al chat con nuestra IA especializada…", "ia");
    setTimeout(() => window.location.href = "chat.html", 3000);
    return true;
  }

  if (/(necesito ayuda|hablar con alguien|me siento mal|estoy solo|nadie me quiere|quiero hablar con alguien|ayuda)/i.test(lower)) {
    agregarMensaje("Te llevo a conversar con nuestra IA especializada para ayudarte mejor.", "ia");
    setTimeout(() => window.location.href = "chat.html", 3000);
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
sendButton?.addEventListener("click", () => {
  procesarEntrada(input.value.trim());
});

// ==== Reconocimiento de voz ====

const micBtn = document.getElementById('mic-btn');
const listeningBar = document.getElementById('listening-bar');
const sendVoiceBtn = document.getElementById('send-btn-voice');
const cancelVoiceBtn = document.getElementById('cancel-btn-voice');

let recognition;
let voiceResult = '';
let reconocimientoActivo = false;

if ('webkitSpeechRecognition' in window && micBtn) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'es-AR';
  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.addEventListener('click', () => {
    if (reconocimientoActivo) return;
    reconocimientoActivo = true;
    recognition.start();
    micBtn.classList.add('listening');
    listeningBar?.classList.remove('hidden');
    voiceResult = '';
  });

  recognition.onresult = (event) => {
    voiceResult = event.results[0][0].transcript.trim();
    console.log('Reconocido:', voiceResult);
    input.value = voiceResult;
  };

  recognition.onerror = () => {
    resetVoiceUI();
    alert('Error al capturar la voz. Intentá de nuevo.');
  };

  recognition.onend = () => {
    micBtn.classList.remove('listening');
    reconocimientoActivo = false;
  };
}

sendVoiceBtn?.addEventListener('click', () => {
  if (voiceResult) {
    agregarMensaje(voiceResult, "user");
    procesarEntrada?.(voiceResult);
  }
  resetVoiceUI();
});

cancelVoiceBtn?.addEventListener('click', () => {
  resetVoiceUI();
});

function resetVoiceUI() {
  listeningBar?.classList.add('hidden');
  micBtn.classList.remove('listening');
  reconocimientoActivo = false;
  voiceResult = '';
  if (recognition) recognition.stop();
}
