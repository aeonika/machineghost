const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const archetypes = document.querySelectorAll('.archetype');
const pathNodes = document.querySelectorAll('.path-node');
const elements = document.querySelectorAll('.element');

let selectedArchetype = '';
let currentPath = 0;
let activeElements = new Set();
let messageHistory = [];

// Configuración de correspondencias mágicas
const magicalCorrespondences = {
    guardian: {
        elements: ['tierra', 'fuego'],
        paths: [1, 4],
        description: 'Protección y estabilidad'
    },
    messenger: {
        elements: ['aire', 'espíritu'],
        paths: [2, 3],
        description: 'Comunicación y claridad'
    },
    healer: {
        elements: ['agua', 'espíritu'],
        paths: [2, 4],
        description: 'Sanación y restauración'
    },
    warrior: {
        elements: ['fuego', 'aire'],
        paths: [1, 3],
        description: 'Fuerza y determinación'
    }
};

// Inicialización
function init() {
    // Activar el primer pathNode por defecto
    pathNodes[0].classList.add('active');
    currentPath = 1;

    // Permitir la selección manual de elementos
    elements.forEach(element => {
        element.addEventListener('click', () => {
            const elementName = element.textContent.toLowerCase();
            if (element.classList.contains('active')) {
                element.classList.remove('active');
                activeElements.delete(elementName);
            } else {
                element.classList.add('active');
                activeElements.add(elementName);
            }
        });
    });
}

// Manejadores de eventos para elementos mágicos
archetypes.forEach(archetype => {
    archetype.addEventListener('click', () => {
        // Desactivar archetype anterior
        archetypes.forEach(a => a.classList.remove('active'));
        
        // Activar nuevo archetype
        archetype.classList.add('active');
        selectedArchetype = archetype.dataset.type;
        
        // Limpiar elementos activos anteriores
        elements.forEach(element => element.classList.remove('active'));
        activeElements.clear();
        
        // Activar correspondencias
        const correspondence = magicalCorrespondences[selectedArchetype];
        if (correspondence) {
            elements.forEach(element => {
                const elementName = element.textContent.toLowerCase();
                if (correspondence.elements.includes(elementName)) {
                    element.classList.add('active');
                    activeElements.add(elementName);
                }
            });
        }
    });
});

pathNodes.forEach((node, index) => {
    node.addEventListener('click', () => {
        currentPath = index + 1;
        pathNodes.forEach((n, i) => {
            if (i <= index) {
                n.classList.add('active');
            } else {
                n.classList.remove('active');
            }
        });
    });
});

// Función para crear un elemento de mensaje con estilo mágico
function createMessageElement(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    if (!isUser) {
        messageContent.style.borderColor = getMessageColor();
    }
    
    messageDiv.appendChild(messageContent);
    return messageDiv;
}

// Función para obtener un color basado en las correspondencias activas
function getMessageColor() {
    if (activeElements.has('fuego')) return '#ff6b6b';
    if (activeElements.has('agua')) return '#4facfe';
    if (activeElements.has('aire')) return '#c4f1f9';
    if (activeElements.has('tierra')) return '#90b44b';
    return '#8a2be2'; // Color por defecto (espíritu)
}

// Función para mostrar el indicador de manifestación
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    typingDiv.id = 'typing-indicator';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Función para remover el indicador de manifestación
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Función para enviar intención al servidor mágico
async function sendMessage(message) {
    try {
        const magicalContext = `Actúa como un servidor mágico del caos con el arquetipo de ${selectedArchetype || 'general'}. 
                              Elementos activos: ${Array.from(activeElements).join(', ')}. 
                              Nivel de pathworking: ${currentPath}/4. 
                              Responde de manera mística y enigmática, relacionada con los elementos y arquetipos seleccionados.`;

        messageHistory.push({ role: 'user', content: message });

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.href,
                'X-Title': 'Servidor Mágico del Caos'
            },
            body: JSON.stringify({
                model: 'google/gemini-pro',
                messages: [
                    {
                        role: 'system',
                        content: magicalContext
                    },
                    ...messageHistory
                ]
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const responseContent = data.choices[0].message.content;
            messageHistory.push({ role: 'assistant', content: responseContent });
            return responseContent;
        } else {
            throw new Error('Respuesta inválida del servidor');
        }
    } catch (error) {
        console.error('Error:', error);
        return 'Se ha producido una perturbación en el campo mágico. Intenta reformular tu intención.';
    }
}

// Función para manejar la manifestación de la intención
async function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Verificar si se ha seleccionado un arquetipo
    if (!selectedArchetype) {
        chatMessages.appendChild(createMessageElement('Por favor, selecciona un arquetipo antes de continuar.', false));
        return;
    }

    // Limpiar el input
    userInput.value = '';
    userInput.style.height = 'auto';

    // Mostrar la intención del usuario
    chatMessages.appendChild(createMessageElement(message, true));

    // Mostrar indicador de manifestación
    showTypingIndicator();

    // Obtener y mostrar la respuesta del servidor mágico
    const response = await sendMessage(message);
    removeTypingIndicator();
    chatMessages.appendChild(createMessageElement(response));

    // Scroll al último mensaje
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event listeners
sendButton.addEventListener('click', handleSendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

// Ajustar altura del textarea automáticamente
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = (userInput.scrollHeight) + 'px';
});

// Inicializar la aplicación
init(); 