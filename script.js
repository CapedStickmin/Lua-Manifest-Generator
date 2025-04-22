const GITHUB_REPO = 'CapedStickmin/Lua-Manifest-Generator';
const ADMIN_CODE = 'hello123aaa';

// DOM Elements
const gameIdInput = document.getElementById('gameId');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const notification = document.getElementById('notification');
const notificationClose = document.querySelector('.notification-close');

// Initialize database from localStorage
let gameDatabase = new Set(JSON.parse(localStorage.getItem('gameDatabase')) || []);

function saveDatabase() {
    localStorage.setItem('gameDatabase', JSON.stringify([...gameDatabase]));
}

function addGameToDatabase(gameId) {
    gameDatabase.add(gameId);
    saveDatabase();
}

function removeFromDatabase(gameId) {
    gameDatabase.delete(gameId);
    saveDatabase();
}

function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    searchBtn.disabled = show;
}

function showNotification(message, isSuccess = false) {
    const notificationElem = notification.querySelector('.notification-message');
    notificationElem.textContent = message;
    
    if (isSuccess) {
        notification.classList.add('success');
    } else {
        notification.classList.remove('success');
    }
    
    notification.style.display = 'flex';
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    notification.classList.remove('show');
    setTimeout(() => {
        notification.style.display = 'none';
        notification.classList.remove('success');
    }, 300);
}

function showAdminPanel() {
    const adminPanel = document.createElement('div');
    adminPanel.className = 'admin-panel';
    adminPanel.innerHTML = `
        <div class="admin-content">
            <h2>Add Game ID to Database</h2>
            <div class="admin-input">
                <input type="text" id="newGameId" placeholder="Enter new Game ID">
                <button id="addGameBtn">Add Game</button>
            </div>
            <div class="database-list">
                <h3>Current Database:</h3>
                <div class="game-list">
                    ${[...gameDatabase].map(id => `
                        <div class="game-item">
                            <span>${id}</span>
                            <button class="delete-btn" data-id="${id}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(adminPanel);
    
    const newGameInput = adminPanel.querySelector('#newGameId');
    const addGameBtn = adminPanel.querySelector('#addGameBtn');
    
    // Add game handler
    addGameBtn.addEventListener('click', () => {
        const newId = newGameInput.value.trim();
        if (newId && /^\d+$/.test(newId)) {
            addGameToDatabase(newId);
            showNotification('Game ID added to database', true);
            adminPanel.remove();
            showAdminPanel(); // Refresh the panel to show new entry
        } else {
            showNotification('Please enter a valid Game ID');
        }
    });
    
    // Delete game handlers
    const deleteButtons = adminPanel.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const gameId = btn.dataset.id;
            removeFromDatabase(gameId);
            showNotification('Game ID removed from database', true);
            adminPanel.remove();
            showAdminPanel(); // Refresh the panel to show updated list
        });
    });
    
    // Close panel when clicking outside
    adminPanel.addEventListener('click', (e) => {
        if (e.target === adminPanel) {
            adminPanel.remove();
        }
    });

    // Handle Enter key for adding games
    newGameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addGameBtn.click();
        }
    });
}

async function handleSearch() {
    const gameId = gameIdInput.value.trim();
    
    // Check for admin code
    if (gameId === ADMIN_CODE) {
        showAdminPanel();
        gameIdInput.value = '';
        return;
    }
    
    if (!gameId || !/^\d+$/.test(gameId)) {
        showNotification('Please enter a valid Steam Game ID');
        return;
    }

    showLoading(true);
    
    // Check if game exists in our database
    if (gameDatabase.has(gameId)) {
        const downloadUrl = `https://github.com/${GITHUB_REPO}/raw/refs/heads/main/${gameId}.zip`;
        window.open(downloadUrl, '_blank');
    } else {
        showNotification('Game ID not found in our database');
    }
    
    showLoading(false);
}

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
notificationClose.addEventListener('click', hideNotification);
gameIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
}); 