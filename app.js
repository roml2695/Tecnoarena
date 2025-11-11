const AppState = (function() {
    let state = {
        currentUser: null,
        users: [],
        rankings: { 
            tekken: { diamante: [], oro: [], plata: [], bronce: [] },
            smash: { diamante: [], oro: [], plata: [], bronce: [] }
        },
        clubRequests: [],
        leagueRequests: [],
        ui: {
            loading: false,
            currentPage: {
                tekken: { diamante: 1, oro: 1, plata: 1, bronce: 1 },
                smash: { diamante: 1, oro: 1, plata: 1, bronce: 1 }
            },
            itemsPerPage: 5,
            searchTerm: ''
        }
    };
    
    const subscribers = [];
    
    return {
        getState() {
            return { ...state };
        },
        
        setState(newState) {
            state = { ...state, ...newState };
            subscribers.forEach(callback => callback(state));
            saveDataToStorage();
        },
        
        subscribe(callback) {
            subscribers.push(callback);
            return () => {
                const index = subscribers.indexOf(callback);
                if (index > -1) subscribers.splice(index, 1);
            };
        },
        
        setLoading(loading) {
            this.setState({ ui: { ...state.ui, loading } });
        },
        
        setSearchTerm(term) {
            this.setState({ ui: { ...state.ui, searchTerm: term } });
        },
        
        setCurrentPage(game, division, page) {
            const currentPage = { ...state.ui.currentPage };
            currentPage[game][division] = page;
            this.setState({ ui: { ...state.ui, currentPage } });
        }
    };
})();

const AuthModule = (function() {
    function hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    return {
        login(username, password) {
            const state = AppState.getState();
            const user = state.users.find(u => 
                u.username === username && u.password === hashPassword(password)
            );
            
            if (user) {
                AppState.setState({ currentUser: user });
                return true;
            }
            return false;
        },
        
        register(userData) {
            const state = AppState.getState();
            
            if (state.users.find(u => u.username === userData.username)) {
                throw new Error('El nombre de usuario ya está en uso');
            }
            
            if (state.users.find(u => u.email === userData.email)) {
                throw new Error('El correo electrónico ya está en uso');
            }
            
            const newUser = {
                id: generateId(),
                ...userData,
                password: hashPassword(userData.password),
                isAdmin: false,
                leagues: [],
                clubMembership: null,
                createdAt: new Date().toISOString()
            };
            
            const newUsers = [...state.users, newUser];
            AppState.setState({ users: newUsers });
            
            return newUser;
        },
        
        logout() {
            AppState.setState({ currentUser: null });
        },
        
        updateUser(userId, updates) {
            const state = AppState.getState();
            const userIndex = state.users.findIndex(u => u.id === userId);
            
            if (userIndex === -1) return false;
            
            const updatedUsers = [...state.users];
            updatedUsers[userIndex] = { ...updatedUsers[userIndex], ...updates };
            
            AppState.setState({ 
                users: updatedUsers,
                currentUser: state.currentUser && state.currentUser.id === userId ? 
                    updatedUsers[userIndex] : state.currentUser
            });
            
            return true;
        },
        
        validateEmail,
        hashPassword,
        generateId
    };
})();

const RankingsModule = (function() {
    function filterAndPaginateRankings(rankings, searchTerm, page, itemsPerPage) {
        let filtered = rankings;
        if (searchTerm) {
            filtered = rankings.filter(player => 
                player.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginated = filtered.slice(startIndex, endIndex);
        
        return {
            items: paginated,
            totalPages: Math.ceil(filtered.length / itemsPerPage),
            totalItems: filtered.length,
            currentPage: page
        };
    }
    
    function updateRanking(game, division, username, score) {
        const state = AppState.getState();
        const rankings = { ...state.rankings };
        
        Object.keys(rankings[game]).forEach(div => {
            rankings[game][div] = rankings[game][div].filter(p => p.username !== username);
        });
        
        rankings[game][division].push({ username, score });
        
        rankings[game][division].sort((a, b) => b.score - a.score);
        
        AppState.setState({ rankings });
    }
    
    function loadRankingsIfNeeded() {
        const state = AppState.getState();
        const hasRankings = Object.values(state.rankings.tekken).some(div => div.length > 0) ||
                          Object.values(state.rankings.smash).some(div => div.length > 0);
        
        if (!hasRankings) {
            AppState.setLoading(true);
            setTimeout(() => {
                const rankings = {
                    tekken: {
                        diamante: [
                            { username: 'ProPlayer1', score: 2500 },
                            { username: 'ProPlayer2', score: 2450 },
                            { username: 'ProPlayer3', score: 2400 },
                            { username: 'ProPlayer4', score: 2350 },
                            { username: 'ProPlayer5', score: 2300 }
                        ],
                        oro: [
                            { username: 'Player6', score: 1800 },
                            { username: 'Player7', score: 1750 },
                            { username: 'Player8', score: 1700 },
                            { username: 'Player9', score: 1650 },
                            { username: 'Player10', score: 1600 }
                        ],
                        plata: [
                            { username: 'Player11', score: 1200 },
                            { username: 'Player12', score: 1150 },
                            { username: 'Player13', score: 1100 },
                            { username: 'Player14', score: 1050 },
                            { username: 'Player15', score: 1000 }
                        ],
                        bronce: [
                            { username: 'Player16', score: 800 },
                            { username: 'Player17', score: 750 },
                            { username: 'Player18', score: 700 },
                            { username: 'Player19', score: 650 },
                            { username: 'Player20', score: 600 }
                        ]
                    },
                    smash: {
                        diamante: [
                            { username: 'SmashPro1', score: 2600 },
                            { username: 'SmashPro2', score: 2550 },
                            { username: 'SmashPro3', score: 2500 },
                            { username: 'SmashPro4', score: 2450 },
                            { username: 'SmashPro5', score: 2400 }
                        ],
                        oro: [
                            { username: 'Player21', score: 1900 },
                            { username: 'Player22', score: 1850 },
                            { username: 'Player23', score: 1800 },
                            { username: 'Player24', score: 1750 },
                            { username: 'Player25', score: 1700 }
                        ],
                        plata: [
                            { username: 'Player26', score: 1300 },
                            { username: 'Player27', score: 1250 },
                            { username: 'Player28', score: 1200 },
                            { username: 'Player29', score: 1150 },
                            { username: 'Player30', score: 1100 }
                        ],
                        bronce: [
                            { username: 'Player31', score: 900 },
                            { username: 'Player32', score: 850 },
                            { username: 'Player33', score: 800 },
                            { username: 'Player34', score: 750 },
                            { username: 'Player35', score: 700 }
                        ]
                    }
                };
                
                AppState.setState({ rankings });
                AppState.setLoading(false);
                
                if (document.getElementById('ranking').classList.contains('active')) {
                    renderRankings();
                }
            }, 1000);
        }
    }
    
    function renderRankings() {
        const state = AppState.getState();
        const { searchTerm, currentPage, itemsPerPage } = state.ui;
        
        const games = ['tekken', 'smash'];
        const divisions = ['diamante', 'oro', 'plata', 'bronce'];
        
        games.forEach(game => {
            const gameVisible = document.getElementById(`${game}-ranking`).style.display !== 'none';
            if (!gameVisible) return;
            
            divisions.forEach(division => {
                const container = document.getElementById(`${game}-${division}-container`);
                if (!container) return;
                
                const result = filterAndPaginateRankings(
                    state.rankings[game][division], 
                    searchTerm, 
                    currentPage[game][division], 
                    itemsPerPage
                );
                
                if (result.items.length === 0) {
                    container.innerHTML = '<p>No hay jugadores en esta división</p>';
                    return;
                }
                
                let tableHTML = `
                    <table class="data-table" aria-label="Ranking de ${game} división ${division}">
                        <thead>
                            <tr>
                                <th scope="col">Posición</th>
                                <th scope="col">Jugador</th>
                                <th scope="col">Puntuación</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                result.items.forEach((player, index) => {
                    const position = ((currentPage[game][division] - 1) * itemsPerPage) + index + 1;
                    tableHTML += `
                        <tr>
                            <td>${position}</td>
                            <td>${player.username}</td>
                            <td>${player.score}</td>
                        </tr>
                    `;
                });
                
                tableHTML += `
                        </tbody>
                    </table>
                `;
                
                if (result.totalPages > 1) {
                    tableHTML += `
                        <div class="pagination" role="navigation" aria-label="Paginación para ${game} ${division}">
                    `;
                    
                    tableHTML += `
                        <button 
                            ${currentPage[game][division] === 1 ? 'disabled' : ''}
                            onclick="RankingsModule.goToPage('${game}', '${division}', ${currentPage[game][division] - 1})"
                            aria-label="Página anterior"
                        >
                            &laquo;
                        </button>
                    `;
                    
                    for (let i = 1; i <= result.totalPages; i++) {
                        tableHTML += `
                            <button 
                                ${i === currentPage[game][division] ? 'class="active"' : ''}
                                onclick="RankingsModule.goToPage('${game}', '${division}', ${i})"
                                aria-label="Página ${i}"
                                ${i === currentPage[game][division] ? 'aria-current="page"' : ''}
                            >
                                ${i}
                            </button>
                        `;
                    }
                    
                    tableHTML += `
                        <button 
                            ${currentPage[game][division] === result.totalPages ? 'disabled' : ''}
                            onclick="RankingsModule.goToPage('${game}', '${division}', ${currentPage[game][division] + 1})"
                            aria-label="Página siguiente"
                        >
                            &raquo;
                        </button>
                    `;
                    
                    tableHTML += `</div>`;
                    
                    tableHTML += `
                        <div role="status" aria-live="polite" class="sr-only">
                            Mostrando página ${currentPage[game][division]} de ${result.totalPages}, 
                            ${((currentPage[game][division] - 1) * itemsPerPage) + 1} a 
                            ${Math.min(currentPage[game][division] * itemsPerPage, result.totalItems)} de 
                            ${result.totalItems} resultados
                        </div>
                    `;
                }
                
                container.innerHTML = tableHTML;
            });
        });
    }
    
    return {
        getRankings(game, division) {
            const state = AppState.getState();
            const { searchTerm, currentPage, itemsPerPage } = state.ui;
            const rankings = state.rankings[game][division];
            
            return filterAndPaginateRankings(
                rankings, 
                searchTerm, 
                currentPage[game][division], 
                itemsPerPage
            );
        },
        
        updateRanking,
        loadRankingsIfNeeded,
        renderRankings,
        
        goToPage(game, division, page) {
            AppState.setCurrentPage(game, division, page);
            this.renderRankings();
        },
        
        searchRankings(term) {
            AppState.setSearchTerm(term);
            const state = AppState.getState();
            const games = ['tekken', 'smash'];
            const divisions = ['diamante', 'oro', 'plata', 'bronce'];
            
            games.forEach(game => {
                divisions.forEach(division => {
                    AppState.setCurrentPage(game, division, 1);
                });
            });
            
            this.renderRankings();
        }
    };
})();

const UIModule = (function() {
    const Components = {
        ConfirmDialog: function(message, onConfirm, onCancel) {
            const dialog = document.createElement('dialog');
            dialog.innerHTML = `
                <div class="confirm-dialog" role="dialog" aria-labelledby="confirm-title" aria-modal="true">
                    <h3 id="confirm-title">Confirmar acción</h3>
                    <p>${message}</p>
                    <div class="dialog-actions">
                        <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                        <button class="btn btn-error" data-action="confirm">Confirmar</button>
                    </div>
                </div>
            `;
            
            dialog.querySelector('[data-action="confirm"]').addEventListener('click', () => {
                onConfirm();
                dialog.close();
                document.body.removeChild(dialog);
            });
            
            dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                if (onCancel) onCancel();
                dialog.close();
                document.body.removeChild(dialog);
            });
            
            dialog.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (onCancel) onCancel();
                    dialog.close();
                    document.body.removeChild(dialog);
                } else if (e.key === 'Tab') {
                    const focusableElements = dialog.querySelectorAll('button');
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            });
            
            document.body.appendChild(dialog);
            dialog.showModal();
            
            dialog.querySelector('button').focus();
        },
        
        LoadingSpinner: function(message = 'Cargando...') {
            return `
                <div class="loading-spinner" role="status" aria-live="polite">
                    <div class="spinner" aria-hidden="true"></div>
                    <span class="sr-only">${message}</span>
                    <p>${message}</p>
                </div>
            `;
        }
    };
    
    function setLoadingState(loading) {
        const mainElement = document.querySelector('main');
        const container = document.querySelector('.container');
        
        if (loading) {
            container.classList.add('loading');
            const spinner = Components.LoadingSpinner();
            mainElement.insertAdjacentHTML('beforeend', spinner);
        } else {
            container.classList.remove('loading');
            const spinner = document.querySelector('.loading-spinner');
            if (spinner) spinner.remove();
        }
    }
    
    function initAccessibility() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        
        const tabs = document.querySelectorAll('[onclick*="showTab"]');
        tabs.forEach(tab => {
            const match = tab.getAttribute('onclick').match(/'([^']+)'/);
            if (match) {
                const tabId = match[1];
                const target = document.getElementById(tabId);
                
                if (target) {
                    tab.setAttribute('aria-controls', tabId);
                    if (target.classList.contains('active') || target.id === 'welcome') {
                        tab.setAttribute('aria-selected', 'true');
                    } else {
                        tab.setAttribute('aria-selected', 'false');
                    }
                }
            }
        });
        
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.setAttribute('novalidate', 'true');
        });
    }
    
    return {
        Components,
        setLoadingState,
        initAccessibility,
        
        confirmAction(message) {
            return new Promise((resolve) => {
                Components.ConfirmDialog(message, () => resolve(true), () => resolve(false));
            });
        },
        
        updateAriaStates(activeTabId) {
            const tabs = document.querySelectorAll('[onclick*="showTab"]');
            tabs.forEach(tab => {
                const match = tab.getAttribute('onclick').match(/'([^']+)'/);
                if (match) {
                    const tabId = match[1];
                    if (tabId === activeTabId) {
                        tab.setAttribute('aria-selected', 'true');
                    } else {
                        tab.setAttribute('aria-selected', 'false');
                    }
                }
            });
        }
    };
})();

function showTab(tabId) {
    const tabs = document.querySelectorAll('.tabs');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    const welcomeSection = document.getElementById('welcome');
    if (welcomeSection) {
        welcomeSection.style.display = 'none';
    }
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        if (tabId === 'welcome') {
            welcomeSection.style.display = 'block';
        } else {
            targetTab.classList.add('active');
        }
        
        UIModule.updateAriaStates(tabId);
        
        if (tabId === 'user-panel' && AppState.getState().currentUser) {
            updateUserPanel();
        } else if (tabId === 'user-profile' && AppState.getState().currentUser) {
            updateUserProfile();
        } else if (tabId === 'admin-panel' && AppState.getState().currentUser && AppState.getState().currentUser.isAdmin) {
            loadAdminPanel();
        } else if (tabId === 'ranking') {
            RankingsModule.loadRankingsIfNeeded();
            RankingsModule.renderRankings();
        }
    }
}

function showGameRanking(game) {
    AppState.setLoading(true);
    
    setTimeout(() => {
        RankingsModule.loadRankingsIfNeeded();
        
        if (game === 'tekken') {
            document.getElementById('tekken-ranking').style.display = 'block';
            document.getElementById('smash-ranking').style.display = 'none';
        } else {
            document.getElementById('tekken-ranking').style.display = 'none';
            document.getElementById('smash-ranking').style.display = 'block';
        }
        
        showDivision(game, 'diamante');
        AppState.setLoading(false);
    }, 500);
}

function showDivision(game, division) {
    const gameElement = document.getElementById(`${game}-ranking`);
    const divisionContents = gameElement.querySelectorAll('.division-content');
    divisionContents.forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(`${game}-${division}`).classList.add('active');
    
    const divisionTabs = gameElement.querySelectorAll('.division-tab');
    divisionTabs.forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
    });
    
    const activeTab = gameElement.querySelector(`.division-tab:nth-child(${getDivisionIndex(division)})`);
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-selected', 'true');
    
    RankingsModule.renderRankings();
}

function getDivisionIndex(division) {
    switch(division) {
        case 'diamante': return 1;
        case 'oro': return 2;
        case 'plata': return 3;
        case 'bronce': return 4;
        default: return 1;
    }
}

function updateLoginUI() {
    const loginSection = document.getElementById('login-section');
    const state = AppState.getState();
    
    if (state.currentUser) {
        loginSection.innerHTML = `
            <div class="user-menu">
                <div class="user-info">
                    <div class="user-avatar">${state.currentUser.username.charAt(0).toUpperCase()}</div>
                    <span class="user-name">${state.currentUser.username}</span>
                </div>
                <button class="btn btn-secondary" onclick="showTab('user-profile')">Mi Perfil</button>
                <button class="btn btn-secondary" onclick="showTab('user-panel')">Configuración</button>
                ${state.currentUser.isAdmin ? '<button class="btn" onclick="showTab(\'admin-panel\')">Admin</button>' : ''}
                <button class="btn btn-secondary" onclick="logout()">Cerrar Sesión</button>
            </div>
        `;
    } else {
        loginSection.innerHTML = `
            <div class="login-form">
                <input type="text" id="username" placeholder="Usuario" aria-label="Nombre de usuario">
                <input type="password" id="password" placeholder="Contraseña" aria-label="Contraseña">
                <button onclick="login()">Iniciar Sesión</button>
                <button class="btn" onclick="showTab('register')">Registrarse</button>
            </div>
        `;
    }
}

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showAlert('Por favor, completa todos los campos', 'error');
        return;
    }
    
    if (AuthModule.login(username, password)) {
        showAlert('Inicio de sesión exitoso', 'success');
        showTab('welcome');
        updateLoginUI();
    } else {
        showAlert('Usuario o contraseña incorrectos', 'error');
    }
}

function registerUser() {
    if (!validateRegistrationForm()) {
        return;
    }
    
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const age = parseInt(document.getElementById('reg-age').value);
    const gender = document.getElementById('reg-gender').value;
    
    try {
        AuthModule.register({
            username,
            email,
            password,
            age,
            gender
        });
        
        showAlert('Registro exitoso. Ahora puedes iniciar sesión.', 'success');
        showTab('welcome');
        
        document.getElementById('register-form').reset();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

function logout() {
    AuthModule.logout();
    updateLoginUI();
    showTab('welcome');
    showAlert('Sesión cerrada correctamente', 'success');
}

function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alert-container');
    const alertId = 'alert-' + Date.now();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.id = alertId;
    alert.textContent = message;
    alert.style.display = 'block';
    
    alert.setAttribute('role', 'alert');
    alert.setAttribute('aria-live', 'assertive');
    
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        const alertToRemove = document.getElementById(alertId);
        if (alertToRemove) {
            alertToRemove.remove();
        }
    }, 5000);
}

function saveDataToStorage() {
    const state = AppState.getState();
    try {
        localStorage.setItem('tecnoArenaUsers', JSON.stringify(state.users));
        localStorage.setItem('tecnoArenaRankings', JSON.stringify(state.rankings));
        localStorage.setItem('tecnoArenaClubRequests', JSON.stringify(state.clubRequests));
        localStorage.setItem('tecnoArenaLeagueRequests', JSON.stringify(state.leagueRequests));
        
        if (state.currentUser) {
            localStorage.setItem('tecnoArenaCurrentUser', JSON.stringify(state.currentUser));
        }
    } catch (error) {
        console.error('Error al guardar datos:', error);
        showAlert('Error al guardar los datos.', 'error');
    }
}

function loadDataFromStorage() {
    try {
        const users = JSON.parse(localStorage.getItem('tecnoArenaUsers')) || [];
        const rankings = JSON.parse(localStorage.getItem('tecnoArenaRankings')) || { 
            tekken: { diamante: [], oro: [], plata: [], bronce: [] },
            smash: { diamante: [], oro: [], plata: [], bronce: [] }
        };
        const clubRequests = JSON.parse(localStorage.getItem('tecnoArenaClubRequests')) || [];
        const leagueRequests = JSON.parse(localStorage.getItem('tecnoArenaLeagueRequests')) || [];
        
        const savedUser = localStorage.getItem('tecnoArenaCurrentUser');
        const currentUser = savedUser ? JSON.parse(savedUser) : null;
        
        AppState.setState({ users, rankings, clubRequests, leagueRequests, currentUser });
        
        if (users.length === 0) {
            createDefaultAdmin();
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
        showAlert('Error al cargar los datos. Se utilizarán datos por defecto.', 'error');
        createDefaultAdmin();
    }
}

function createDefaultAdmin() {
    const adminUser = {
        id: AuthModule.generateId(),
        username: 'admin',
        email: 'admin@tecnoarena.com',
        password: AuthModule.hashPassword('admin123'),
        age: 30,
        gender: 'masculino',
        isAdmin: true,
        leagues: [],
        clubMembership: null,
        createdAt: new Date().toISOString()
    };
    
    AppState.setState({ users: [adminUser] });
}

document.addEventListener('DOMContentLoaded', function() {
    AppState.subscribe((state) => {
        if (state.ui.loading) {
            UIModule.setLoadingState(true);
        } else {
            UIModule.setLoadingState(false);
        }
    });
    
    loadDataFromStorage();
    
    UIModule.initAccessibility();
    
    const searchInput = document.getElementById('ranking-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            RankingsModule.searchRankings(this.value);
        });
    }
    
    showTab('welcome');
    updateLoginUI();
});

window.RankingsModule = RankingsModule;
window.showTab = showTab;
window.showGameRanking = showGameRanking;
window.showDivision = showDivision;
window.login = login;
window.registerUser = registerUser;
window.logout = logout;
window.updateLoginUI = updateLoginUI;

async function resetAllData() {
    const confirmed = await UIModule.confirmAction(
        '¿Estás seguro de que quieres restablecer todos los datos? Esta acción no se puede deshacer.'
    );
    
    if (confirmed) {
        AppState.setState({
            users: [],
            rankings: { 
                tekken: { diamante: [], oro: [], plata: [], bronce: [] },
                smash: { diamante: [], oro: [], plata: [], bronce: [] }
            },
            clubRequests: [],
            leagueRequests: [],
            currentUser: null
        });
        
        createDefaultAdmin();
        updateLoginUI();
        showAlert('Todos los datos han sido restablecidos', 'success');
        showTab('welcome');
    }
}
