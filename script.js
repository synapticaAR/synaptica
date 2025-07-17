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

// Mostrar mensaje en el chat principal
function agregarMensaje(texto, clase) {
  if (!chatBox) return;
  const div = document.createElement("div");
  div.className = "message " + clase;
  div.textContent = texto;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (clase === "ia" && vozActivada) {
    hablar(texto);
  }
}

// Lógica de redirección emocional priorizada
function manejarRedireccion(texto) {
  const lower = texto.toLowerCase();

  if (document.body.classList.contains('chat')) {
    return false;
  }

  if (/(psicólogo|psicologa|psicologo|terapia|profesional|hablar con un psicólogo|necesito un psicólogo|quiero hablar con un profesional)/i.test(lower)) {
    alert("Te llevo con un psicólogo.");
    setTimeout(() => window.location.href = "psicologo.html", 1000);
    return true;
  }

  if (/(relajación|relajarme|ansiedad|estresado|respirar|calmarme|estres|meditación)/i.test(lower)) {
    alert("Te llevo a la sección de relajación.");
    setTimeout(() => window.location.href = "relajacion.html", 1000);
    return true;
  }

  if (/(ayuda urgente|emergencia|no doy más|necesito ayuda urgente)/i.test(lower)) {
    alert("Redirigiéndote a ayuda inmediata.");
    setTimeout(() => window.location.href = "ayuda.html", 1000);
    return true;
  }

  if (/(ia|chat|conversar|inteligencia artificial|quiero hablar con la ia|synaptica)/i.test(lower)) {
    alert("Te llevo al chat con nuestra IA especializada.");
    setTimeout(() => window.location.href = "chat.html", 1000);
    return true;
  }

  if (/(necesito ayuda|hablar con alguien|me siento mal|estoy solo|nadie me quiere|quiero hablar con alguien|ayuda)/i.test(lower)) {
    alert("Te llevo a conversar con nuestra IA.");
    setTimeout(() => window.location.href = "chat.html", 1000);
    return true;
  }

  if (/(actividad|actividades|juegos|ejercicio|ejercicios|entretenimiento)/i.test(lower)) {
    alert("Te llevo a la sección de actividades.");
    setTimeout(() => window.location.href = "actividades.html", 1000);
    return true;
  }

  return false;
}

// Procesar entrada para chat.html
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

sendButton?.addEventListener("click", () => {
  procesarEntrada(input.value.trim());
});

// ==== Reconocimiento de voz en chat.html ====

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

// ==== LÓGICA PARA index.html ====
const introChat = document.getElementById('introChatBox');
const introInput = document.getElementById('introUserInput');

function introPush(role, txt) {
  if (!introChat) return;
  const msg = document.createElement('div');
  msg.className = 'message fade ' + (role === 'user' ? 'user' : 'ia');
  msg.textContent = txt;
  introChat.appendChild(msg);
  introChat.scrollTop = introChat.scrollHeight;
  if (role === 'ia' && vozActivada) hablar(txt);
}

function introSend() {
  const texto = introInput?.value.trim();
  if (!texto) return;

  introPush('user', texto);
  introInput.value = '';

  if (manejarRedireccion(texto)) return;

  fetch("https://eae9efbf-3f34-41bb-b03b-4ad9dbeedd61-00-23tds4nuay46d.picard.replit.dev/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: texto }] })
  })
  .then(res => res.json())
  .then(data => {
    const respuesta = data.reply || "No entendí eso. ¿Podés explicarlo un poco más?";
    introPush('ia', respuesta);
  })
  .catch(err => {
    console.error(err);
    introPush('ia', "Lo siento, hubo un error al conectarse con la IA.");
  });
}

function hablar(texto) {
  if (!vozActivada) return;
  const voz = new SpeechSynthesisUtterance(texto);
  voz.lang = 'es-AR';
  speechSynthesis.speak(voz);
}

// Mensaje inicial si estamos en index
if (introChat) {
  introPush('ia', '¿Cómo te sentís hoy? Contanos.');
  hablar('¿Cómo te sentís hoy? Contanos.');
}

function scrollToMain() {
  const hero = document.querySelector('.hero');
  const nav = document.getElementById('mainNav');
  const header = document.getElementById('mainHeader');

  hero.classList.add('ocultar-hero');

  setTimeout(() => {
    document.body.classList.remove('index');
    document.body.classList.add('mostrar-header');
    hero.remove();
    nav.classList.add('show');
    document.getElementById('main').scrollIntoView({ behavior: 'smooth' });
  }, 800);
}
