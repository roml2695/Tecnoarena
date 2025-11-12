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
        
        // Eliminar de cualquier división existente
        Object.keys(rankings[game]).forEach(div => {
            rankings[game][div] = rankings[game][div].filter(p => p.username !== username);
        });
        
        // Agregar a la división correspondiente
        rankings[game][division].push({ username, score });
        
        // Ordenar por puntuación
        rankings[game][division].sort((a, b) => b.score - a.score);
        
        AppState.setState({ rankings });
        
        return { success: true };
    }
    
    
    function loadRankings() {
        renderRankings();
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
                    container.innerHTML = `
                        <div class="empty-ranking-message">
                            <p>No hay jugadores en esta división</p>
                            <p class="small-text">Los rankings se mostrarán cuando un administrador cargue datos</p>
                        </div>
                    `;
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
    
    function loadSampleData() {
        const sampleRankings = {
            tekken: {
                diamante: [
                    { username: 'ProPlayer1', score: 2500 },
                    { username: 'ProPlayer2', score: 2450 },
                    { username: 'ProPlayer3', score: 2400 }
                ],
                oro: [
                    { username: 'Player4', score: 1800 },
                    { username: 'Player5', score: 1750 },
                    { username: 'Player6', score: 1700 }
                ],
                plata: [
                    { username: 'Player7', score: 1200 },
                    { username: 'Player8', score: 1150 },
                    { username: 'Player9', score: 1100 }
                ],
                bronce: [
                    { username: 'Player10', score: 800 },
                    { username: 'Player11', score: 750 },
                    { username: 'Player12', score: 700 }
                ]
            },
            smash: {
                diamante: [
                    { username: 'SmashPro1', score: 2600 },
                    { username: 'SmashPro2', score: 2550 },
                    { username: 'SmashPro3', score: 2500 }
                ],
                oro: [
                    { username: 'Player13', score: 1900 },
                    { username: 'Player14', score: 1850 },
                    { username: 'Player15', score: 1800 }
                ],
                plata: [
                    { username: 'Player16', score: 1300 },
                    { username: 'Player17', score: 1250 },
                    { username: 'Player18', score: 1200 }
                ],
                bronce: [
                    { username: 'Player19', score: 900 },
                    { username: 'Player20', score: 850 },
                    { username: 'Player21', score: 800 }
                ]
            }
        };
        
        AppState.setState({ rankings: sampleRankings });
        renderRankings();
        
        return { success: true, message: 'Datos de ejemplo cargados correctamente' };
    }
    
    function clearAllRankings() {
        const emptyRankings = {
            tekken: { diamante: [], oro: [], plata: [], bronce: [] },
            smash: { diamante: [], oro: [], plata: [], bronce: [] }
        };
        
        AppState.setState({ rankings: emptyRankings });
        renderRankings();
        
        return { success: true, message: 'Todos los rankings han sido limpiados' };
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
        loadRankings,
        renderRankings,
        loadSampleData,
        clearAllRankings,
        
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
    document.querySelectorAll('main section').forEach(section => {
        section.classList.remove('active');
    });

    const activeSection = document.getElementById(tabId);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
    if ((tabId === 'login' || tabId === 'register') && AppState.getState().currentUser) {
        // Si ya está logueado, redirige a welcome o perfil
        showTab('welcome'); 
    }

    if (tabId === 'admin-panel') {
        if (typeof renderRequests === 'function') {
            renderRequests('club'); 
            renderRequests('league');
        }
        if (typeof fillUserSelect === 'function') {
            fillUserSelect();      
        }
    }

    history.pushState(null, '', `#${tabId}`);
}

function showGameRanking(game) {
    if (game === 'tekken') {
        document.getElementById('tekken-ranking').style.display = 'block';
        document.getElementById('smash-ranking').style.display = 'none';
    } else {
        document.getElementById('tekken-ranking').style.display = 'none';
        document.getElementById('smash-ranking').style.display = 'block';
    }
    
    showDivision(game, 'diamante');
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
    const state = AppState.getState();
    // CRÍTICO: El contenedor debe existir
    const loginSection = document.getElementById('login-section'); 

    if (!loginSection) return; 

    let htmlContent = '';

    if (state.currentUser) {
        // Usuario logueado (incluye botón ADMIN)
        const isAdmin = state.currentUser.username === 'admin';
        htmlContent = `
            <div class="user-info">
                <span>Hola, <strong>${state.currentUser.username}</strong></span>
                ${isAdmin ? '<button class="btn btn-secondary btn-small" onclick="showTab(\'admin-panel\')">ADMIN</button>' : ''}
                <button class="btn btn-error btn-small" onclick="logout()">Cerrar Sesión</button>
            </div>
        `;
    } else {
        // Usuario deslogueado (Muestra los botones de LOGIN/REGISTRARSE)
        htmlContent = `
            <button class="btn btn-secondary" onclick="showTab('login')">LOGIN</button>
            <button class="btn btn-primary" onclick="showTab('register')">REGISTRARSE</button>
        `;
    }

    loginSection.innerHTML = htmlContent;
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
    const usernameInput = document.getElementById('reg-username');
    const emailInput = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-password');
    const confirmPasswordInput = document.getElementById('reg-confirm-password');
    const ageInput = document.getElementById('reg-age');
    const genderInput = document.getElementById('reg-gender');

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const age = parseInt(ageInput.value, 10);
    const gender = genderInput.value;

    function setErrorMessage(elementId, message) {
        const errorElement = document.getElementById(elementId + '-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = message ? 'block' : 'none';
        }
    }

    ['reg-username', 'reg-email', 'reg-password', 'reg-confirm-password', 'reg-age', 'reg-gender'].forEach(id => setErrorMessage(id, ''));
    
    let isValid = true;
    
    if (!username || username.length < 3) {
        setErrorMessage('reg-username', 'El nombre de usuario debe tener al menos 3 caracteres.');
        isValid = false;
    }
    if (!AuthModule.validateEmail(email)) {
        setErrorMessage('reg-email', 'El correo electrónico no es válido.');
        isValid = false;
    }
    if (password.length < 6) {
        setErrorMessage('reg-password', 'La contraseña debe tener al menos 6 caracteres.');
        isValid = false;
    }
    // VALIDACIÓN CLAVE: Las contraseñas no coinciden.
    if (password !== confirmPassword) {
        setErrorMessage('reg-confirm-password', 'Las contraseñas no coinciden.');
        isValid = false;
    }
    if (isNaN(age) || age < 13 || age > 120) {
        setErrorMessage('reg-age', 'Debes ser mayor de 13 años.');
        isValid = false;
    }
    if (!gender) {
        setErrorMessage('reg-gender', 'Debes seleccionar un sexo.');
        isValid = false;
    }

    if (!isValid) {
        showAlert('Por favor, corrige los errores en el formulario.', 'error');
        return;
    }

    try {
        AuthModule.register({ username, email, password, age, gender });
        showAlert('Registro exitoso. Ahora puedes iniciar sesión.', 'success');
        showTab('welcome');
        document.getElementById('register-form').reset();
    } catch (error) {
        if (error.message.includes('usuario ya está en uso')) {
            setErrorMessage('reg-username', error.message);
        } else if (error.message.includes('correo electrónico ya está en uso')) {
            setErrorMessage('reg-email', error.message);
        } else {
            showAlert(error.message, 'error');
        }
    }
}

function updateRankingFromAdminPanel() {
    const userSelect = document.getElementById('admin-user-select'); 
    const usernameInput = document.getElementById('admin-username-manual'); 
    const gameSelect = document.getElementById('admin-game');
    const divisionSelect = document.getElementById('admin-division');
    const scoreInput = document.getElementById('admin-score');
    
    let username = '';
    
    if (userSelect && userSelect.value) {
        // Obtener el nombre del usuario seleccionado (quitando el email)
        username = userSelect.options[userSelect.selectedIndex].textContent.split('(')[0].trim();
    } else {
        username = usernameInput.value.trim();
    }
    
    const game = gameSelect.value; 
    const division = divisionSelect.value;
    const score = parseInt(scoreInput.value, 10);
    
    if (!username || isNaN(score) || score < 0) {
        showAlert('Debes seleccionar un usuario registrado O ingresar un nombre manualmente, y una puntuación válida.', 'error');
        return;
    }
    
    const state = AppState.getState();
    let isAlreadyRanked = false;
    let existingDivision = null;

    for (const div in state.rankings[game]) {
        if (state.rankings[game][div].some(player => player.username === username)) {
            isAlreadyRanked = true;
            existingDivision = div; 
            break; 
        }
    }

    if (isAlreadyRanked) {
        RankingsModule.updateRanking(game, division, username, score, existingDivision); 
        showAlert(`Jugador ${username} actualizado: Movido a ${division} de ${game} con ${score} puntos.`, 'success');
    } else {
        // Si no está rankeado, LO AÑADIMOS por primera vez.
        RankingsModule.updateRanking(game, division, username, score);
        showAlert(`Jugador ${username} añadido a ${division} de ${game} con ${score} puntos.`, 'success');
    }

    if (userSelect) userSelect.value = '';
    usernameInput.value = '';
    scoreInput.value = '';
    RankingsModule.renderRankings();
}
    
function updateUserProfile() {
    const currentUser = AppState.getState().currentUser;
    if (!currentUser) return;
    
    document.getElementById('profile-avatar-text').textContent = currentUser.username.charAt(0).toUpperCase();
    document.getElementById('profile-username').textContent = currentUser.username;
    document.getElementById('profile-display-username').textContent = currentUser.username;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-age').textContent = currentUser.age;
    document.getElementById('profile-gender').textContent = currentUser.gender;
    
    const adminBadge = document.getElementById('profile-admin-badge');
    if (currentUser.isAdmin) {
        adminBadge.style.display = 'inline-block';
    } else {
        adminBadge.style.display = 'none';
    }
    
    const clubStatus = document.getElementById('profile-club-status');
    if (currentUser.clubMembership) {
        clubStatus.textContent = `Membresía: ${currentUser.clubMembership === 'vip' ? 'Club VIP' : 'Club Diamante'}`;
    } else {
        clubStatus.textContent = 'No tienes membresía de club activa';
    }
    
    const leaguesContainer = document.getElementById('profile-leagues');
    if (currentUser.leagues && currentUser.leagues.length > 0) {
        leaguesContainer.innerHTML = '';
        currentUser.leagues.forEach(league => {
            const leagueBadge = document.createElement('span');
            leagueBadge.className = 'league-badge';
            leagueBadge.textContent = `${league.game} - ${league.division}`;
            leaguesContainer.appendChild(leagueBadge);
        });
    } else {
        leaguesContainer.innerHTML = '<p>No estás registrado en ninguna liga</p>';
    }
}

function updateUserInfo() {
    const currentUser = AppState.getState().currentUser;
    if (!currentUser) return;
    
    if (!validateUserPanelForm()) {
        return;
    }
    
    const newUsername = document.getElementById('panel-username').value.trim();
    const newEmail = document.getElementById('panel-email').value.trim();
    const newPassword = document.getElementById('panel-password').value;
    
    if (newUsername !== currentUser.username) {
        const state = AppState.getState();
        if (state.users.find(u => u.username === newUsername)) {
            showAlert('El nombre de usuario ya está en uso', 'error');
            return;
        }
    }
    
    if (newEmail !== currentUser.email) {
        const state = AppState.getState();
        if (state.users.find(u => u.email === newEmail)) {
            showAlert('El correo electrónico ya está en uso', 'error');
            return;
        }
    }
    
    const updates = { username: newUsername, email: newEmail };
    
    if (newPassword) {
        updates.password = AuthModule.hashPassword(newPassword);
    }
    
    const success = AuthModule.updateUser(currentUser.id, updates);
    
    if (success) {
        showAlert('Información actualizada correctamente', 'success');
        updateLoginUI();
        updateUserProfile();
    } else {
        showAlert('Error al actualizar la información', 'error');
    }
}

function submitClubRequest() {
    const currentUser = AppState.getState().currentUser;
    if (!currentUser) {
        showAlert('Debes iniciar sesión para solicitar una membresía de club', 'error');
        return;
    }
    
    const clubType = document.getElementById('club-type').value;
    const message = document.getElementById('club-message').value;
    
    const request = {
        id: AuthModule.generateId(),
        username: currentUser.username,
        userId: currentUser.id,
        clubType,
        message,
        status: 'pending',
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString()
    };
    
    const state = AppState.getState();
    const clubRequests = [...state.clubRequests, request];
    AppState.setState({ clubRequests });
    
    showAlert('Solicitud enviada. Será revisada por un administrador.', 'success');
    showTab('user-panel');
}

function submitLeagueRequest() {
    const currentUser = AppState.getState().currentUser;
    if (!currentUser) {
        showAlert('Debes iniciar sesión para solicitar unirte a una liga', 'error');
        return;
    }
    
    const leagueType = document.getElementById('league-type').value;
    const message = document.getElementById('league-message').value;
    
    if (currentUser.leagues && currentUser.leagues.find(l => l.game === leagueType)) {
        showAlert('Ya estás registrado en esta liga', 'error');
        return;
    }
    
    const request = {
        id: AuthModule.generateId(),
        username: currentUser.username,
        userId: currentUser.id,
        game: leagueType,
        message,
        status: 'pending',
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString()
    };
    
    const state = AppState.getState();
    const leagueRequests = [...state.leagueRequests, request];
    AppState.setState({ leagueRequests });
    
    showAlert('Solicitud enviada. Será revisada por un administrador.', 'success');
    showTab('user-panel');
}

function loadAdminPanel() {
    const currentUser = AppState.getState().currentUser;
    if (!currentUser || !currentUser.isAdmin) return;
    
    const adminUserSelect = document.getElementById('admin-user');
    adminUserSelect.innerHTML = '';
    
    const state = AppState.getState();
    const allUsers = state.users.filter(user => !user.isAdmin || user.id !== currentUser.id);
    
    if (allUsers.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'No hay usuarios disponibles';
        option.disabled = true;
        adminUserSelect.appendChild(option);
    } else {
        allUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.username + (user.isAdmin ? ' (Admin)' : '');
            adminUserSelect.appendChild(option);
        });
    }
    
    updateAdminToggleButton();
    loadClubRequests();
    loadLeagueRequests();
    
    const adminPanel = document.getElementById('admin-panel');
    const existingRankingSection = adminPanel.querySelector('.ranking-management-section');
    
    if (!existingRankingSection) {
        const rankingSection = document.createElement('div');
        rankingSection.className = 'admin-section ranking-management-section';
        rankingSection.innerHTML = `
            <h3>Gestión de Rankings</h3>
            <div class="form-group">
                <p>Los rankings están actualmente vacíos. Puedes cargar datos de ejemplo o usar el formulario de abajo para agregar jugadores manualmente.</p>
                <button class="btn btn-success" onclick="loadSampleRankings()">Cargar Datos de Ejemplo</button>
                <button class="btn btn-warning" onclick="clearAllRankings()">Limpiar Todos los Rankings</button>
            </div>
        `;
        
        const userManagementSection = adminPanel.querySelector('.admin-section');
        userManagementSection.parentNode.insertBefore(rankingSection, userManagementSection.nextSibling);
    }
}

function updateAdminToggleButton() {
    const adminUserSelect = document.getElementById('admin-user');
    const selectedUserId = adminUserSelect.value;
    const state = AppState.getState();
    const selectedUser = state.users.find(u => u.id === selectedUserId);
    const toggleButton = document.getElementById('toggle-admin-btn');
    
    if (selectedUser) {
        if (selectedUser.isAdmin) {
            toggleButton.textContent = 'Revocar Permisos de Admin';
            toggleButton.className = 'btn btn-error';
        } else {
            toggleButton.textContent = 'Conceder Permisos de Admin';
            toggleButton.className = 'btn btn-warning';
        }
    }
}

async function toggleAdminStatus() {
    const userId = document.getElementById('admin-user').value;
    
    if (!userId || userId === '') {
        showAlert('Por favor selecciona un usuario', 'error');
        return;
    }
    
    const state = AppState.getState();
    const user = state.users.find(u => u.id === userId);
    
    if (!user) return;
    
    const confirmed = await UIModule.confirmAction(
        `¿Estás seguro de que quieres ${user.isAdmin ? 'revocar' : 'conceder'} permisos de administrador a ${user.username}?`
    );
    
    if (confirmed) {
        const success = AuthModule.updateUser(userId, { isAdmin: !user.isAdmin });
        
        if (success) {
            showAlert(`Permisos de administrador ${user.isAdmin ? 'revocados' : 'concedidos'} para ${user.username}`, 'success');
            
            if (AppState.getState().currentUser && AppState.getState().currentUser.id === userId) {
                updateLoginUI();
                updateUserProfile();
            }
            
            loadAdminPanel();
        } else {
            showAlert('Error al actualizar los permisos', 'error');
        }
    }
}

function updateUserScore() {
    const userId = document.getElementById('admin-user').value;
    const division = document.getElementById('admin-division').value;
    const score = parseInt(document.getElementById('admin-score').value);
    const game = document.getElementById('admin-game').value;
    
    if (!userId || userId === '') {
        showAlert('Por favor selecciona un usuario', 'error');
        return;
    }
    
    if (isNaN(score) || score < 0) {
        showAlert('Por favor ingresa una puntuación válida', 'error');
        return;
    }
    
    const state = AppState.getState();
    const user = state.users.find(u => u.id === userId);
    
    if (!user) return;
    
    const username = user.username;
    let userLeague = user.leagues ? user.leagues.find(l => l.game === game) : null;
    
    if (!userLeague) {
        showAlert(`El usuario ${username} no está registrado en la liga de ${game}`, 'error');
        return;
    }
    
    userLeague.division = division;
    
    const success = AuthModule.updateUser(userId, { leagues: user.leagues });
    
    if (success) {
        const rankingsResult = RankingsModule.updateRanking(game, division, username, score);
        
        if (rankingsResult.success) {
            showAlert('Puntuación actualizada correctamente', 'success');
            
            if (AppState.getState().currentUser && AppState.getState().currentUser.id === userId) {
                updateUserPanel();
                updateUserProfile();
            }
        } else {
            showAlert('Error al actualizar el ranking', 'error');
        }
    } else {
        showAlert('Error al actualizar el usuario', 'error');
    }
}

function loadClubRequests() {
    const requestsList = document.getElementById('club-requests-list');
    requestsList.innerHTML = '';
    
    const state = AppState.getState();
    const pendingRequests = state.clubRequests.filter(request => request.status === 'pending');
    
    if (pendingRequests.length === 0) {
        requestsList.innerHTML = '<p>No hay solicitudes de club pendientes</p>';
        return;
    }
    
    pendingRequests.forEach((request) => {
        const requestDiv = document.createElement('div');
        requestDiv.className = 'club-request';
        requestDiv.style.border = '1px solid rgba(156, 39, 176, 0.3)';
        requestDiv.style.padding = '15px';
        requestDiv.style.marginBottom = '10px';
        requestDiv.style.borderRadius = '5px';
        requestDiv.style.background = 'rgba(26, 42, 56, 0.7)';
        
        requestDiv.innerHTML = `
            <p><strong>Usuario:</strong> ${request.username}</p>
            <p><strong>Tipo de Club:</strong> ${request.clubType === 'vip' ? 'Club VIP' : 'Club Diamante'}</p>
            <p><strong>Fecha:</strong> ${request.date}</p>
            ${request.message ? `<p><strong>Mensaje:</strong> ${request.message}</p>` : ''}
            <button class="btn btn-success" onclick="approveClubRequest('${request.id}')">Aprobar</button>
            <button class="btn btn-error" onclick="rejectClubRequest('${request.id}')">Rechazar</button>
        `;
        
        requestsList.appendChild(requestDiv);
    });
}

async function approveClubRequest(requestId) {
    const confirmed = await UIModule.confirmAction('¿Estás seguro de que quieres aprobar esta solicitud de club?');
    
    if (!confirmed) return;
    
    const state = AppState.getState();
    const requestIndex = state.clubRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) return;
    
    const request = state.clubRequests[requestIndex];
    request.status = 'approved';
    
    const userIndex = state.users.findIndex(u => u.id === request.userId);
    if (userIndex !== -1) {
        const success = AuthModule.updateUser(request.userId, { clubMembership: request.clubType });
        
        if (success) {
            const clubRequests = [...state.clubRequests];
            clubRequests[requestIndex] = request;
            AppState.setState({ clubRequests });
            
            showAlert(`Solicitud de club de ${request.username} aprobada`, 'success');
            loadClubRequests();
        } else {
            showAlert('Error al actualizar el usuario', 'error');
        }
    }
}

async function rejectClubRequest(requestId) {
    const confirmed = await UIModule.confirmAction('¿Estás seguro de que quieres rechazar esta solicitud de club?');
    
    if (!confirmed) return;
    
    const state = AppState.getState();
    const requestIndex = state.clubRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) return;
    
    const request = state.clubRequests[requestIndex];
    request.status = 'rejected';
    
    const clubRequests = [...state.clubRequests];
    clubRequests[requestIndex] = request;
    AppState.setState({ clubRequests });
    
    showAlert(`Solicitud de club de ${request.username} rechazada`, 'success');
    loadClubRequests();
}

function loadLeagueRequests() {
    const requestsList = document.getElementById('league-requests-list');
    requestsList.innerHTML = '';
    
    const state = AppState.getState();
    const pendingRequests = state.leagueRequests.filter(request => request.status === 'pending');
    
    if (pendingRequests.length === 0) {
        requestsList.innerHTML = '<p>No hay solicitudes de liga pendientes</p>';
        return;
    }
    
    pendingRequests.forEach((request) => {
        const requestDiv = document.createElement('div');
        requestDiv.className = 'league-request';
        requestDiv.style.border = '1px solid rgba(156, 39, 176, 0.3)';
        requestDiv.style.padding = '15px';
        requestDiv.style.marginBottom = '10px';
        requestDiv.style.borderRadius = '5px';
        requestDiv.style.background = 'rgba(26, 42, 56, 0.7)';
        
        const gameName = request.game === 'tekken' ? 'Tekken 8' : 'Super Smash Ultimate';
        
        requestDiv.innerHTML = `
            <p><strong>Usuario:</strong> ${request.username}</p>
            <p><strong>Liga:</strong> ${gameName}</p>
            <p><strong>Fecha:</strong> ${request.date}</p>
            ${request.message ? `<p><strong>Mensaje:</strong> ${request.message}</p>` : ''}
            <button class="btn btn-success" onclick="approveLeagueRequest('${request.id}')">Aprobar</button>
            <button class="btn btn-error" onclick="rejectLeagueRequest('${request.id}')">Rechazar</button>
        `;
        
        requestsList.appendChild(requestDiv);
    });
}

async function approveLeagueRequest(requestId) {
    const confirmed = await UIModule.confirmAction('¿Estás seguro de que quieres aprobar esta solicitud de liga?');
    
    if (!confirmed) return;
    
    const state = AppState.getState();
    const requestIndex = state.leagueRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) return;
    
    const request = state.leagueRequests[requestIndex];
    request.status = 'approved';
    
    const userIndex = state.users.findIndex(u => u.id === request.userId);
    if (userIndex !== -1) {
        const user = state.users[userIndex];
        
        if (!user.leagues) {
            user.leagues = [];
        }
        
        user.leagues.push({
            game: request.game,
            division: 'bronce'
        });
        
        const success = AuthModule.updateUser(request.userId, { leagues: user.leagues });
        
        if (success) {
            const rankingsResult = RankingsModule.updateRanking(request.game, 'bronce', user.username, 0);
            
            if (rankingsResult.success) {
                const leagueRequests = [...state.leagueRequests];
                leagueRequests[requestIndex] = request;
                AppState.setState({ leagueRequests });
                
                showAlert(`Solicitud de liga de ${request.username} aprobada`, 'success');
                loadLeagueRequests();
            } else {
                showAlert('Error al actualizar el ranking', 'error');
            }
        } else {
            showAlert('Error al actualizar el usuario', 'error');
        }
    }
}

async function rejectLeagueRequest(requestId) {
    const confirmed = await UIModule.confirmAction('¿Estás seguro de que quieres rechazar esta solicitud de liga?');
    
    if (!confirmed) return;
    
    const state = AppState.getState();
    const requestIndex = state.leagueRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) return;
    
    const request = state.leagueRequests[requestIndex];
    request.status = 'rejected';
    
    const leagueRequests = [...state.leagueRequests];
    leagueRequests[requestIndex] = request;
    AppState.setState({ leagueRequests });
    
    showAlert(`Solicitud de liga de ${request.username} rechazada`, 'success');
    loadLeagueRequests();
}

async function loadSampleRankings() {
    const confirmed = await UIModule.confirmAction(
        '¿Estás seguro de que quieres cargar datos de ejemplo en los rankings? Esto reemplazará cualquier dato existente.'
    );
    
    if (confirmed) {
        const result = RankingsModule.loadSampleData();
        if (result.success) {
            showAlert(result.message, 'success');
        } else {
            showAlert('Error al cargar datos de ejemplo', 'error');
        }
    }
}

async function clearAllRankings() {
    const confirmed = await UIModule.confirmAction(
        '¿Estás seguro de que quieres limpiar todos los rankings? Esta acción no se puede deshacer.'
    );
    
    if (confirmed) {
        const result = RankingsModule.clearAllRankings();
        if (result.success) {
            showAlert(result.message, 'success');
        } else {
            showAlert('Error al limpiar los rankings', 'error');
        }
    }
}

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
        const storedUsers = localStorage.getItem('tecnoArenaUsers');
        const storedRankings = localStorage.getItem('tecnoArenaRankings');
        const storedClubRequests = localStorage.getItem('tecnoArenaClubRequests');
        const storedLeagueRequests = localStorage.getItem('tecnoArenaLeagueRequests');
        const storedCurrentUser = localStorage.getItem('tecnoArenaCurrentUser'); 
        
        const users = storedUsers ? JSON.parse(storedUsers) : [];
        const rankings = storedRankings ? JSON.parse(storedRankings) : { 
            tekken: { diamante: [], oro: [], plata: [], bronce: [] }, 
            smash: { diamante: [], oro: [], plata: [], bronce: [] } 
        };
        const clubRequests = storedClubRequests ? JSON.parse(storedClubRequests) : [];
        const leagueRequests = storedLeagueRequests ? JSON.parse(storedLeagueRequests) : [];
        
        const currentUser = null; 
        
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
    AppState.subscribe(state => {
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

function renderRequests(requestType) {
    const state = AppState.getState();
    const requests = requestType === 'club' ? state.clubRequests : state.leagueRequests;
    const containerId = requestType === 'club' ? 'club-requests-list' : 'league-requests-list';
    const container = document.getElementById(containerId);

    if (!container) return;

    if (requests.length === 0) {
        container.innerHTML = `<p class="empty-state">No hay solicitudes de ${requestType} pendientes.</p>`;
        return;
    }

    let html = '<table><thead><tr><th>Usuario</th><th>Email</th><th>Fecha</th><th>Acción</th></tr></thead><tbody>';

    requests.forEach((req, index) => {
        html += `
            <tr>
                <td>${req.username}</td>
                <td>${req.email}</td>
                <td>${new Date(req.timestamp).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-success btn-small" onclick="handleRequest('${requestType}', ${index}, 'accept')">Aceptar</button>
                    <button class="btn btn-error btn-small" onclick="handleRequest('${requestType}', ${index}, 'reject')">Rechazar</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function handleRequest(requestType, index, action) {
    const state = AppState.getState();
    const requestsKey = requestType === 'club' ? 'clubRequests' : 'leagueRequests';
    
    const updatedRequests = [...state[requestsKey]];
    const request = updatedRequests.splice(index, 1)[0]; 

    if (action === 'accept') {
        showAlert(`Solicitud de ${request.username} para ${requestType} aceptada.`, 'success');
    } else {
        showAlert(`Solicitud de ${request.username} para ${requestType} rechazada.`, 'error');
    }

    AppState.setState({ 
        [requestsKey]: updatedRequests 
    });
    
    // Re-renderizar las listas actualizadas
    renderRequests('club');
    renderRequests('league');
}
    
function fillUserSelect() {
    const userSelect = document.getElementById('admin-user-select');
    if (!userSelect) return;

    const state = AppState.getState();
    const users = state.users.filter(u => u.username !== 'admin'); 

    userSelect.innerHTML = '<option value="">-- Seleccionar un usuario registrado --</option>';

    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id || user.username; 
        option.textContent = `${user.username} (${user.email})`;
        userSelect.appendChild(option);
    });
}

function togglePasswordVisibility(inputId, buttonElement) {
    const input = document.getElementById(inputId);
    if (!input) {
        console.error('Input no encontrado para el ID:', inputId);
        return;
    }
    
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    
    const svgIcon = buttonElement.querySelector('svg');

    if (isPassword) {
        // Mostrando (cambiar color a uno más visible)
        buttonElement.setAttribute('aria-label', 'Ocultar contraseña');
        if (svgIcon) svgIcon.style.color = 'var(--accent-color)'; 
    } else {
        // Ocultando (restaurar color)
        buttonElement.setAttribute('aria-label', 'Mostrar contraseña');
        if (svgIcon) svgIcon.style.color = ''; 
    }
}

// PRIORITY 1: Funciones de Interfaz de Usuario para el Header y Enlaces
window.showTab = showTab; 
window.updateLoginUI = updateLoginUI; 
window.login = login;
window.registerUser = registerUser;
window.logout = logout;

// PRIORITY 2: Funciones y Módulos de Estado
window.RankingsModule = RankingsModule;
window.showGameRanking = showGameRanking;
window.showDivision = showDivision;
window.updateUserInfo = updateUserInfo;
window.submitClubRequest = submitClubRequest;
window.submitLeagueRequest = submitLeagueRequest;

// PRIORITY 3: Funciones del Panel de Administración y Utilidades
window.togglePasswordVisibility = togglePasswordVisibility;
window.updateRankingFromAdminPanel = updateRankingFromAdminPanel;
window.renderRequests = renderRequests;
window.handleRequest = handleRequest;
window.fillUserSelect = fillUserSelect; 

// PRIORITY 4: Herramientas de Administración
window.toggleAdminStatus = toggleAdminStatus;
window.updateUserScore = updateUserScore;
window.approveClubRequest = approveClubRequest;
window.rejectClubRequest = rejectClubRequest;
window.approveLeagueRequest = approveLeagueRequest;
window.rejectLeagueRequest = rejectLeagueRequest;
window.loadSampleRankings = loadSampleRankings;
window.clearAllRankings = clearAllRankings;
window.resetAllData = resetAllData;











