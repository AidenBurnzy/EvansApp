// ClearCup App JavaScript
// This will later connect to your backend via n8n

// Prevent pull-to-refresh and overscroll on mobile
document.addEventListener('DOMContentLoaded', function() {
    // Prevent pull-to-refresh
    document.body.addEventListener('touchmove', function(e) {
        if (e.target.closest('.main-content')) {
            return; // Allow scrolling in main content
        }
        e.preventDefault();
    }, { passive: false });
    
    // Prevent bounce/overscroll
    let lastTouchY = 0;
    document.body.addEventListener('touchstart', function(e) {
        lastTouchY = e.touches[0].clientY;
    }, { passive: true });
    
    document.body.addEventListener('touchmove', function(e) {
        const touchY = e.touches[0].clientY;
        const touchYDelta = touchY - lastTouchY;
        lastTouchY = touchY;
        
        const mainContent = document.querySelector('.main-content');
        if (e.target.closest('.main-content')) {
            const scrollTop = mainContent.scrollTop;
            const scrollHeight = mainContent.scrollHeight;
            const clientHeight = mainContent.clientHeight;
            
            // Prevent overscroll at top and bottom
            if ((scrollTop === 0 && touchYDelta > 0) || 
                (scrollTop + clientHeight >= scrollHeight && touchYDelta < 0)) {
                e.preventDefault();
            }
        } else {
            e.preventDefault();
        }
    }, { passive: false });
});
// App State - In production, this will be stored in Neon DB
let appState = {
    currentCaffeine: 0,
    dailyGoal: 200,
    streak: 0,
    achievements: [],
    currentTheme: 'default'
};

// Load state from localStorage (temporary solution until DB is connected)
function loadState() {
    const savedState = localStorage.getItem('clearCupState');
    if (savedState) {
        appState = JSON.parse(savedState);
        updateUI();
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('clearCupState', JSON.stringify(appState));
}

// Initialize the app
function init() {
    loadState();
    setupEventListeners();
    updateUI();
}

// Setup event listeners
function setupEventListeners() {
    // Quick action buttons for logging caffeine
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.dataset.amount);
            logCaffeine(amount);
        });
    });

    // Theme button (will open theme selector later)
    const themeBtn = document.getElementById('themeBtn');
    themeBtn.addEventListener('click', () => {
        showThemeSelector();
    });

    // Navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            navigateTo(index);
        });
    });
}

// Log caffeine intake
function logCaffeine(amount) {
    appState.currentCaffeine += amount;
    
    // Check if exceeded goal
    if (appState.currentCaffeine > appState.dailyGoal) {
        showNotification('⚠️ Goal exceeded!', 'warning');
    } else {
        showNotification(`+${amount}mg logged`, 'success');
    }
    
    saveState();
    updateUI();
    
    // Add a little animation to the button that was clicked
    event.target.closest('.action-btn').style.transform = 'scale(0.95)';
    setTimeout(() => {
        event.target.closest('.action-btn').style.transform = '';
    }, 100);
}

// Update UI with current state
function updateUI() {
    // Update streak
    document.getElementById('streakNumber').textContent = appState.streak;
    
    // Update streak message
    const streakMessage = document.getElementById('streakMessage');
    if (appState.streak === 0) {
        streakMessage.textContent = 'Start your journey today!';
    } else if (appState.streak === 1) {
        streakMessage.textContent = 'Great start! Keep it up!';
    } else if (appState.streak < 7) {
        streakMessage.textContent = `${appState.streak} days strong! 💪`;
    } else {
        streakMessage.textContent = `Amazing ${appState.streak} day streak! 🔥`;
    }
    
    // Update caffeine amount
    document.getElementById('currentAmount').textContent = appState.currentCaffeine;
    document.getElementById('goalAmount').textContent = appState.dailyGoal;
    
    // Update progress bar
    const progressPercentage = (appState.currentCaffeine / appState.dailyGoal) * 100;
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = Math.min(progressPercentage, 100) + '%';
    
    // Change progress bar color if exceeded
    if (appState.currentCaffeine > appState.dailyGoal) {
        progressFill.style.background = 'linear-gradient(90deg, #ff4444, #ff0066)';
    } else {
        progressFill.style.background = 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))';
    }
}

// Show notification (simple version)
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'warning' ? '#ff4444' : '#4CAF50'};
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-weight: 600;
        z-index: 1000;
        animation: slideDown 0.3s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 2 seconds
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Theme selector (placeholder for now)
function showThemeSelector() {
    const unlockedThemes = appState.achievements.length;
    
    if (unlockedThemes === 0) {
        showNotification('Complete achievements to unlock themes! 🎨', 'info');
    } else {
        // This will later open a full theme selection modal
        alert(`You have ${unlockedThemes} theme(s) unlocked!\n\nTheme selection coming soon!`);
    }
}

// Navigation (placeholder for now)
function navigateTo(index) {
    const pages = ['Home', 'Stats', 'Achievements', 'Settings'];
    
    // Update active state
    document.querySelectorAll('.nav-btn').forEach((btn, i) => {
        if (i === index) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // For now, just show which page was clicked
    if (index !== 0) {
        showNotification(`${pages[index]} page coming soon!`, 'info');
    }
}

// CSS Animation keyframes (add to document)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Debug function to increment streak (for testing)
// You can remove this later
window.debugIncrementStreak = function() {
    appState.streak++;
    saveState();
    updateUI();
    console.log('Streak incremented to:', appState.streak);
}

// Debug function to reset app (for testing)
window.debugReset = function() {
    appState = {
        currentCaffeine: 0,
        dailyGoal: 200,
        streak: 0,
        achievements: [],
        currentTheme: 'default'
    };
    saveState();
    updateUI();
    console.log('App reset!');
}