class BrightBridgeChatbot {
    constructor() {
        this.userName = '';
        this.isTyping = false;
        this.initializeElements();
        this.attachEventListeners();
        this.loadUserName();
    }

    initializeElements() {
        // Main sections
        this.welcomeSection = document.getElementById('welcomeSection');
        this.chatContainer = document.getElementById('chatContainer');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // Input elements
        this.userNameInput = document.getElementById('userName');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        
        // Chat elements
        this.chatMessages = document.getElementById('chatMessages');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        // Action buttons
        this.actionButtons = document.querySelectorAll('.action-btn');
    }

    attachEventListeners() {
        // User name input
        this.userNameInput.addEventListener('input', (e) => {
            this.userName = e.target.value.trim();
            this.saveUserName();
        });

        // Action buttons
        this.actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const message = e.currentTarget.dataset.message;
                this.startChat(message);
            });
        });

        // Message input
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Send button
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        // Auto-resize message input
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
        });
    }

    loadUserName() {
        const savedName = localStorage.getItem('brightbridge_username');
        if (savedName) {
            this.userName = savedName;
            this.userNameInput.value = savedName;
        }
    }

    saveUserName() {
        if (this.userName) {
            localStorage.setItem('brightbridge_username', this.userName);
        } else {
            localStorage.removeItem('brightbridge_username');
        }
    }

    startChat(initialMessage = null) {
        // Hide welcome section and show chat
        this.welcomeSection.style.display = 'none';
        this.chatContainer.style.display = 'flex';
        
        // Enable input
        this.messageInput.disabled = false;
        this.sendButton.disabled = false;
        this.messageInput.focus();

        // Add welcome message from bot
        this.addMessage('bot', this.getWelcomeMessage());

        // Send initial message if provided
        if (initialMessage) {
            setTimeout(() => {
                this.sendMessage(initialMessage);
            }, 1000);
        }
    }

    getWelcomeMessage() {
        const greeting = this.userName ? `Hi ${this.userName}! 👋` : 'Hello there! 👋';
        return `${greeting} I'm BrightBridge, your AI support companion. I'm here to help you with whatever you need - whether it's learning strategies, emotional support, social skills, daily living tips, or just someone to talk to. What's on your mind today?`;
    }

    async sendMessage(messageText = null) {
        const message = messageText || this.messageInput.value.trim();
        
        if (!message || this.isTyping) return;

        // Add user message
        this.addMessage('user', message);
        
        // Clear input if it was typed by user
        if (!messageText) {
            this.messageInput.value = '';
            this.messageInput.style.height = 'auto';
        }

        // Show typing indicator
        this.showTyping();

        try {
            const response = await this.callAPI(message);
            this.hideTyping();
            this.addMessage('bot', response);
        } catch (error) {
            this.hideTyping();
            this.addMessage('bot', this.getErrorMessage());
            console.error('Chat error:', error);
        }
    }

    async callAPI(message) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                userName: this.userName
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        return data.response;
    }

    addMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTyping() {
        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        this.messageInput.disabled = true;
        this.sendButton.disabled = true;
        this.scrollToBottom();
    }

    hideTyping() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
        this.messageInput.disabled = false;
        this.sendButton.disabled = false;
        this.messageInput.focus();
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    getErrorMessage() {
        const errorMessages = [
            "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
            "Something went wrong on my end. Let me try to help you again - please resend your message.",
            "I'm experiencing some technical difficulties. Please try your request again.",
            "Sorry about that! I encountered an issue. Could you please try asking again?"
        ];
        return errorMessages[Math.floor(Math.random() * errorMessages.length)];
    }

    // Public method to show loading overlay
    showLoading() {
        this.loadingOverlay.style.display = 'flex';
    }

    // Public method to hide loading overlay
    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.brightBridge = new BrightBridgeChatbot();
    
    // Add some helpful keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape key to go back to welcome screen
        if (e.key === 'Escape' && window.brightBridge.chatContainer.style.display !== 'none') {
            if (confirm('Are you sure you want to return to the welcome screen? Your conversation will be lost.')) {
                location.reload();
            }
        }
    });

    // Add connection status indicator
    window.addEventListener('online', () => {
        console.log('Connection restored');
    });

    window.addEventListener('offline', () => {
        console.log('Connection lost');
        if (window.brightBridge) {
            window.brightBridge.addMessage('bot', 'It looks like you\'ve lost internet connection. Please check your connection and try again.');
        }
    });
});

// Service worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}