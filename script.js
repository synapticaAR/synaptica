Así?

const input = document.getElementById("userInput");
const sendButton = document.getElementById("send-btn");
const chatBox = document.getElementById("chatBox");
const voiceToggle = document.getElementById("vozToggle");
const micButton = document.getElementById("mic-btn");

let vozActivada = true;
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

// Lógica de redirección emocional priorizada
function manejarRedireccion(texto) {
  const lower = texto.toLowerCase();

  // Psicólogo o profesional
  if (
    lower.includes("psicólogo") ||
    lower.includes("psicologa") ||
    lower.includes("psicologo") ||
    lower.includes("terapia") ||
    lower.includes("profesional") ||
    lower.includes("quiero hablar con un psicólogo") ||
    lower.includes("necesito un psicólogo")
  ) {
    agregarMensaje("Te llevo con un psicólogo para que puedas hablar con un profesional.", "ia");
    setTimeout(() => window.location.href = "psicologo.html", 3000);
    return true;
  }

  // Relajación o ansiedad
  if (
    lower.includes("relajación") ||
    lower.includes("relajarme") ||
    lower.includes("ansiedad") ||
    lower.includes("estresado") ||
    lower.includes("respirar") ||
    lower.includes("calmarme") ||
    lower.includes("estres")
  ) {
    agregarMensaje("Te llevo a la sección de relajación para que puedas calmarte.", "ia");
    setTimeout(() => window.location.href = "relajacion.html", 3000);
    return true;
  }

  // Emergencia o ayuda urgente
  if (
    lower.includes("ayuda urgente") ||
    lower.includes("emergencia") ||
    lower.includes("no doy más") ||
    lower.includes("necesito ayuda urgente")
  ) {
    agregarMensaje("Redirigiéndote a ayuda inmediata…", "ia");
    setTimeout(() => window.location.href = "ayuda.html", 3000);
    return true;
  }

  // IA Especializada
  if (
    lower.includes("ia") ||
    lower.includes("chat") ||
    lower.includes("conversar") ||
    lower.includes("inteligencia artificial") ||
    lower.includes("quiero hablar con la ia") ||
    lower.includes("quiero hablar con synaptica")
  ) {
    agregarMensaje("Te llevo al chat con nuestra IA especializada…", "ia");
    setTimeout(() => window.location.href = "chat.html", 3000);
    return true;
  }

  // Casos ambiguos o de necesidad de hablar con alguien
  if (
    lower.includes("necesito ayuda") ||
    lower.includes("necesito hablar con alguien") ||
    lower.includes("me siento mal") ||
    lower.includes("estoy solo") ||
    lower.includes("nadie me quiere") ||
    lower.includes("quiero hablar con alguien")
  ) {
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
sendButton.addEventListener("click", () => {
  procesarEntrada(input.value.trim());
});

const micBtn = document.getElementById('mic-btn');
const listeningBar = document.getElementById('listening-bar');
const sendVoiceBtn = document.getElementById('send-btn-voice');
const cancelVoiceBtn = document.getElementById('cancel-btn-voice');

let recognition;
let voiceResult = '';

if ('webkitSpeechRecognition' in window && micBtn && document.body.classList.contains('chat')) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'es-AR';
  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.addEventListener('click', () => {
    recognition.start();
    micBtn.classList.add('listening');
    listeningBar.classList.remove('hidden');
    voiceResult = '';
  });

  recognition.onresult = (event) => {
    voiceResult = event.results[0][0].transcript;
    console.log('Reconocido:', voiceResult);
  };

  recognition.onend = () => {
    micBtn.classList.remove('listening');
    // No cerramos la barra hasta que envíen o cancelen
  };

 recognition.onerror = () => {
    micBtn.classList.remove('listening');
    listeningBar.classList.add('hidden');
    alert('Error al capturar la voz. Intentá de nuevo.');
};
}

sendVoiceBtn?.addEventListener('click', () => {
  if (voiceResult) {
    procesarEntrada(voiceResult);
  }
  resetVoiceUI();
});

cancelVoiceBtn?.addEventListener('click', () => {
  resetVoiceUI();
});

function resetVoiceUI() {
  listeningBar.classList.add('hidden');
  micBtn.classList.remove('listening');
  voiceResult = '';
  if (recognition) recognition.stop();
}
