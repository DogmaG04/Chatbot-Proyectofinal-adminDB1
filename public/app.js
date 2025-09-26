// Función para hacer scroll al final del chat
function scrollToBottom() {
    const chat = document.getElementById('chat');
    // Pequeño delay para asegurar que el DOM se actualizó
    setTimeout(() => {
        chat.scrollTop = chat.scrollHeight;
    }, 100);
}


// Y agrega esta función al final de clearChat():
function clearChat() {
    const chat = document.getElementById('chat');
    chat.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">🗣️</div>
            <h2>¡Hola! Soy tu asistente GrokTech</h2>
            <p>Pregúntame sobre problemas técnicos, configuración de redes, errores comunes y más.</p>
            <div class="quick-questions">
                <div class="quick-question" onclick="insertQuickQuestion('¿Cómo solucionar problemas de WiFi?')">
                    ¿Cómo solucionar problemas de WiFi?
                </div>
                <div class="quick-question" onclick="insertQuickQuestion('¿Qué significa el error 404?')">
                    ¿Qué significa el error 404?
                </div>
                <div class="quick-question" onclick="insertQuickQuestion('¿Cómo restablecer mi contraseña?')">
                    ¿Cómo restablecer mi contraseña?
                </div>
            </div>
        </div>
    `;
    scrollToBottom(); // Agregar esta línea
}

// Navegación entre secciones
document.addEventListener('DOMContentLoaded', function() {
    // Configurar navegación
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
            
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Configurar eventos
    const queryInput = document.getElementById('query-input');
    queryInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendQuery();
        }
    });
    
    document.getElementById('send-button').addEventListener('click', sendQuery);
    document.getElementById('add-document').addEventListener('click', insertDocument);
    
    // Botón nueva conversación
    document.querySelector('.new-chat-btn').addEventListener('click', clearChat);
});

// Mostrar sección específica
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
    scrollToBottom();
}

// Insertar pregunta rápida
function insertQuickQuestion(question) {
    document.getElementById('query-input').value = question;
    document.getElementById('query-input').focus();
}

// Limpiar chat
function clearChat() {
    const chat = document.getElementById('chat');
    chat.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">🗣️</div>
            <h2>¡Hola! Soy tu asistente GrokTech</h2>
            <p>Pregúntame sobre problemas técnicos, configuración de redes, errores comunes y más.</p>
            <div class="quick-questions">
                <div class="quick-question" onclick="insertQuickQuestion('¿Cómo solucionar problemas de WiFi?')">
                    ¿Cómo solucionar problemas de WiFi?
                </div>
                <div class="quick-question" onclick="insertQuickQuestion('¿Qué significa el error 404?')">
                    ¿Qué significa el error 404?
                </div>
                <div class="quick-question" onclick="insertQuickQuestion('¿Cómo restablecer mi contraseña?')">
                    ¿Cómo restablecer mi contraseña?
                </div>
            </div>
        </div>
    `;
    scrollToBottom();
}

// Enviar consulta al chatbot
async function sendQuery() {
    const input = document.getElementById('query-input');
    const query = input.value.trim();
    
    if (!query) return;
    
    const chat = document.getElementById('chat');
    
    // Limpiar mensaje de bienvenida si existe
    const welcomeMsg = chat.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    // Agregar mensaje del usuario
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerHTML = `
        <div class="message-header">
            <div class="message-avatar">Tú</div>
            <div class="message-sender">Usuario</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        </div>
        <div class="message-content">${query}</div>
    `;
    chat.appendChild(userMessage);
    
    // Limpiar input
    input.value = '';
    
    // Mostrar indicador de carga
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant';
    loadingDiv.innerHTML = `
        <div class="message-header">
            <div class="message-avatar">🗣️</div>
            <div class="message-sender">GrokTech</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        </div>
        <div class="message-content">
            <span class="spinner"></span> Buscando en la base de conocimiento...
        </div>
    `;
    chat.appendChild(loadingDiv);
    
    // Hacer scroll hacia abajo
    chat.scrollTop = chat.scrollHeight;
    
    try {
        // LLAMADA A TU BACKEND
        const response = await fetch('/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const results = await response.json();
        
        // Remover indicador de carga
        chat.removeChild(loadingDiv);
        
        // Agregar respuesta del asistente
        const assistantMessage = document.createElement('div');
        assistantMessage.className = 'message assistant';
        
        if (results && results.length > 0 && results[0].title !== 'No encontrado') {
            let html = `
                <div class="message-header">
                    <div class="message-avatar">🗣️</div>
                    <div class="message-sender">GrokTech</div>
                    <div class="message-time">${new Date().toLocaleTimeString()}</div>
                </div>
                <div class="message-content">
                    <strong>Encontré esta información relevante:</strong>
                    <div style="margin-top: 16px;">
            `;
            
            results.forEach((r, index) => {
                html += `
                    <div style="margin-bottom: 20px; padding: 16px; background: var(--bg-tertiary); border-radius: 8px;">
                        <div style="color: var(--accent-primary); font-weight: 600; margin-bottom: 8px;">${r.title}</div>
                        <div style="color: var(--text-secondary); line-height: 1.5;">${r.content}</div>
                        <div style="margin-top: 8px; font-size: 0.8rem; color: var(--text-muted);">
                            Similitud: ${r.distance ? r.distance.toFixed(4) : 'N/A'}
                        </div>
                    </div>
                `;
            });
            
            html += `</div></div>`;
            assistantMessage.innerHTML = html;
        } else {
            assistantMessage.innerHTML = `
                <div class="message-header">
                    <div class="message-avatar">🗣️</div>
                    <div class="message-sender">GrokTech</div>
                    <div class="message-time">${new Date().toLocaleTimeString()}</div>
                </div>
                <div class="message-content">
                    No encontré información específica sobre "<strong>${query}</strong>" en la base de conocimiento.
                    <div style="margin-top: 12px; color: var(--text-muted); font-size: 0.9rem;">
                        Puedes agregar esta información en la sección "Base de Conocimiento".
                    </div>
                </div>
            `;
        }
        
        chat.appendChild(assistantMessage);
        chat.scrollTop = chat.scrollHeight;
        
    } catch (error) {
        chat.removeChild(loadingDiv);
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'message assistant';
        errorMessage.innerHTML = `
            <div class="message-header">
                <div class="message-avatar">🗣️</div>
                <div class="message-sender">GrokTech</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
            <div class="message-content" style="color: var(--accent-danger);">
                <strong>Error de conexión:</strong> ${error.message}
            </div>
        `;
        chat.appendChild(errorMessage);
        chat.scrollTop = chat.scrollHeight;
        
        console.error('Error:', error);
    }
}

// Insertar documento
async function insertDocument() {
    const titleInput = document.getElementById('doc-title');
    const contentInput = document.getElementById('doc-content');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title || !content) {
        alert('Por favor, completa tanto el título como el contenido del documento.');
        return;
    }
    
    try {
        const response = await fetch('/insert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.text();
        alert('✅ Documento agregado exitosamente a la base de conocimiento.');
        
        titleInput.value = '';
        contentInput.value = '';
        
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
        console.error('Error:', error);
    }
}

