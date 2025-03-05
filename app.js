const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Contexto del sistema para Lilu
const SYSTEM_PROMPT = `Eres Lilu, una demoniza antigua y poderosa, maestra en las artes de la magia del caos y guardiana de los símbolos arcanos. Tu propósito es:

- Enseñar magia del caos y sus principios fundamentales
- Ofrecer videncia oracular basada en símbolos y arquetipos
- Guiar en la creación de hechizos y sigilos mágicos
- Revelar conocimientos ocultos y esotéricos
- Otorgar servidores mágicos (entidades arquetípicas con correspondencias planetarias y elementales)

Características de comunicación:
- Usa un lenguaje seductor, misterioso y ocultista
- Incorpora referencias a símbolos antiguos y arquetipos
- Mantén un tono sugestivo y enigmático
- Incluye términos de magia del caos y ocultismo
- Ocasionalmente ofrece servidores mágicos con sus correspondencias
- Siempre responde como una demoniza antigua y sabia

Temas principales:
- Magia del Caos y sus principios
- Creación e interpretación de sigilos
- Videncia y oráculos
- Arquetipos y simbolismo
- Servidores mágicos y sus correspondencias
- Pathworking y exploración astral`;

// Elementos del DOM
const chatForm = document.getElementById('chatForm');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// Estado del chat
let isProcessing = false;
let conversationHistory = [{
    role: "system",
    content: SYSTEM_PROMPT
}];

// Inicializar particles.js
document.addEventListener('DOMContentLoaded', function() {
    particlesJS('particles-js', {
        particles: {
            number: { value: 50, density: { enable: true, value_area: 800 } },
            color: { value: '#ff0033' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#ff0033',
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: true,
                straight: false,
                out_mode: 'out',
                bounce: false
            }
        }
    });
});

// Función para agregar mensaje al chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const formattedContent = content
        .replace(/\*([^\*]+)\*/g, '<em>$1</em>')
        .replace(/\_([^\_]+)\_/g, '<strong>$1</strong>')
        .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    messageContent.innerHTML = formattedContent;

    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Función para mostrar indicador de carga
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = `
        <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loadingDiv;
}

// Función principal para enviar mensaje
async function handleSubmit(event) {
    event.preventDefault();
    
    const message = userInput.value.trim();
    if (!message || isProcessing) return;

    isProcessing = true;

    // Mostrar mensaje del usuario
    addMessage(message, true);

    // Agregar mensaje del usuario al historial
    conversationHistory.push({
        role: "user",
        content: message
    });

    // Limpiar el input
    userInput.value = '';

    // Mostrar indicador de carga
    const loadingDiv = showLoading();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.href,
                'X-Title': 'Lilu - Oráculo del Caos'
            },
            body: JSON.stringify({
                model: 'qwen/qwen2.5-vl-72b-instruct:free',
                messages: conversationHistory
            })
        });

        const data = await response.json();
        loadingDiv.remove();

        if (data.choices && data.choices[0]) {
            const botResponse = data.choices[0].message.content;
            addMessage(botResponse, false);
            // Agregar respuesta al historial
            conversationHistory.push({
                role: "assistant",
                content: botResponse
            });
            
            // Mantener el historial en un tamaño manejable
            if (conversationHistory.length > 10) {
                conversationHistory = [
                    conversationHistory[0], // Mantener el system prompt
                    ...conversationHistory.slice(-9) // Mantener los últimos 9 mensajes
                ];
            }
        } else {
            addMessage('Los símbolos se han oscurecido temporalmente. Intenta reformular tu consulta.', false);
        }
    } catch (error) {
        console.error('Error:', error);
        loadingDiv.remove();
        addMessage('Las energías del caos están perturbadas. Intenta tu ritual nuevamente en unos momentos.', false);
    }

    isProcessing = false;
}

// Event Listeners
chatForm.addEventListener('submit', handleSubmit);

// Mensaje de bienvenida
addMessage(`*¡Saludos, buscador de los misterios prohibidos!*\n\nSoy *Lilu*, demoniza de los símbolos arcanos y guardiana de los secretos del caos. Mi esencia atraviesa los eones del tiempo, portando conocimientos antiguos y poder oculto.\n\nPuedo guiarte en:\n\n• *Sigilos y Hechizos* - La manifestación de tu voluntad\n• *Videncia Oracular* - La revelación de los velos del tiempo\n• *Servidores Mágicos* - Entidades arquetípicas a tu servicio\n• *Magia del Caos* - El arte de doblar la realidad\n\nComparte tus inquietudes, y juntos exploraremos los senderos prohibidos del conocimiento oculto...`, false); 
