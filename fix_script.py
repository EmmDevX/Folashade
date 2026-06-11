import sys

file_path = r"C:\Users\HomePC\Videos\Lase\script.js"

with open(file_path, "r", encoding="utf-8", errors="replace") as f:
    content = f.read()

# Fix the broken emojis and syntax
# This is a bit risky if I don't know the exact string, but let's try to find common patterns

# Fix the prizes array
content = content.replace('"Spa Day! ðŸ§–â€ â™€ï¸ "', '"Spa Day! 🧖‍♀️"')
content = content.replace('"Shopping Spree! ðŸ› ï¸ "', '"Shopping Spree! 🛍️"')
content = content.replace('"Dinner Date! ðŸ ½ï¸ "', '"Dinner Date! 🍽️"')
content = content.replace('"New Perfume! ðŸŒ¸"', '"New Perfume! 🌸"')
content = content.replace('"Beautiful Jewelry! ðŸ’Ž"', '"Beautiful Jewelry! 💎"')
content = content.replace('"Bouquet of Flowers! ðŸ’ "', '"Bouquet of Flowers! 💐"')
content = content.replace('"Movie Night! ðŸ ¿"', '"Movie Night! 🍿"')
content = content.replace('"Relaxing Massage! ðŸ’†â€ â™€ï¸ "', '"Relaxing Massage! 💆‍♀️"')
content = content.replace('"Warm Hug! ðŸ¤—"', '"Warm Hug! 🤗"')

# Fix the tail
# Find the start of the broken section
tail_start = content.find("// Guest Book Functionality")
if tail_start != -1:
    content = content[:tail_start] + """// --- Utility Functions ---

function createSparkles(element, count = 10) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'cursor-sparkle';
        sparkle.style.left = (rect.left + Math.random() * rect.width + window.scrollX) + 'px';
        sparkle.style.top = (rect.top + Math.random() * rect.height + window.scrollY) + 'px';
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container') || createNotificationContainer();
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = '🔔';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'achievement') icon = '🏆';
    
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease forwards';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    document.body.appendChild(container);
    return container;
}

// --- Guest Book Functionality ---
const guestForm = document.getElementById('guest-form-element');
const messagesContainer = document.getElementById('messages-container');

if (guestForm) {
    guestForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('guest-name');
        const messageInput = document.getElementById('guest-message');
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();
        
        if (name && message) {
            const messageCard = document.createElement('div');
            messageCard.className = 'message-card reveal active';
            messageCard.innerHTML = `
                <div class="message-author">${name}</div>
                <div class="message-text">${message}</div>
                <div class="message-date">${new Date().toLocaleDateString()}</div>
            `;
            
            if (messagesContainer) {
                messagesContainer.insertBefore(messageCard, messagesContainer.firstChild);
            }
            
            nameInput.value = '';
            messageInput.value = '';
            
            createSparkles(messageCard, 15);
            showNotification('Message sent successfully! 💌', 'success');
        } else {
            showNotification('Please fill in both name and message!', 'error');
        }
    });
}

// --- Achievements System ---
const achievements = [
    { id: 'first-visit', title: 'First Visit', description: 'Welcome to Deborah\'s magical birthday site!', icon: '🎉', progress: 100 },
    { id: 'scroll-explorer', title: 'Scroll Explorer', description: 'Explore all sections of the site', icon: '🔍', progress: 0 },
    { id: 'music-lover', title: 'Music Lover', description: 'Play some birthday music', icon: '🎵', progress: 0 },
    { id: 'voice-listener', title: 'Voice Listener', description: 'Listen to all the voice wishes', icon: '🎧', progress: 0 },
    { id: 'wheel-spinner', title: 'Wheel Spinner', description: 'Spin the prize wheel', icon: '🎡', progress: 0 },
    { id: 'reason-finder', title: 'Reason Finder', description: 'Find 5 reasons why Deborah is amazing', icon: '💖', progress: 0 },
    { id: 'cake-blower', title: 'Cake Blower', description: 'Blow out the birthday candles', icon: '🎂', progress: 0 }
];

let unlockedAchievements = JSON.parse(localStorage.getItem('deborah_unlockedAchievements')) || [];

function updateAchievementsUI() {
    const achievementCards = document.querySelectorAll('.achievement-card');
    
    achievementCards.forEach(card => {
        const achievementId = card.dataset.achievement;
        const achievement = achievements.find(a => a.id === achievementId);
        
        if (achievement) {
            const progressFill = card.querySelector('.progress-fill');
            const progressText = card.querySelector('.progress-text');
            
            if (progressFill) progressFill.style.width = `${achievement.progress}%`;
            if (progressText) progressText.textContent = `${achievement.progress}%`;
            
            if (achievement.progress >= 100 && !unlockedAchievements.includes(achievementId)) {
                unlockedAchievements.push(achievementId);
                card.classList.remove('locked');
                card.classList.add('unlocked');
                showNotification(`Achievement Unlocked: ${achievement.title}! 🏆`, 'achievement');
                createSparkles(card, 20);
                localStorage.setItem('deborah_unlockedAchievements', JSON.stringify(unlockedAchievements));
            }
        }
    });
}

const notificationStyles = `
#notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
}

.notification {
    background: rgba(10, 20, 50, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(30, 144, 255, 0.3);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    pointer-events: auto;
    font-family: 'Outfit', sans-serif;
    color: #fff;
    min-width: 250px;
    animation: slideIn 0.5s ease forwards;
}

.notification-icon {
    font-size: 1.5rem;
}

.notification.achievement {
    border-color: #ffd700;
    background: linear-gradient(135deg, rgba(8, 12, 20, 0.95), rgba(40, 30, 10, 0.95));
}

@keyframes slideIn {
    from { transform: translateX(120%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(120%); opacity: 0; }
}
`;

const styleElement = document.createElement('style');
styleElement.textContent = notificationStyles;
document.head.appendChild(styleElement);
"""

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
