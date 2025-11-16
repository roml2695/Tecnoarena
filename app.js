/**
 * =========================================================================
 * MÓDULO DE ESTADO GLOBAL (AppState)
 * Maneja el estado central de la aplicación y la persistencia local.
 * =========================================================================
 */
const AppState = (function() {
    let state = {
        currentUser: null, // Objeto del usuario logueado
        users: [],         // Lista completa de usuarios
        rankings: {        // Rankings por juego y división
            tekken: { diamante: [], oro: [], plata: [], bronce: [] },
            smash: { diamante: [], oro: [], plata: [], bronce: [] }
        },
        clubRequests: [],  // Solicitudes pendientes de Club
        leagueRequests: [],// Solicitudes pendientes de Liga
        ui: {
            currentTab: 'welcome',
            currentRankingGame: 'tekken',
            currentRankingDivision: 'diamante',
            tekkenSearchTerm: '',
            smashSearchTerm: ''
        }
    };
    
    const subscribers = [];
    const STORAGE_KEY = 'tecnoArenaState';

    // Carga los datos desde localStorage
    function loadDataFromStorage() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const loadedState = JSON.parse(data);
                // Fusionar estado guardado con estado inicial, asegurando la estructura.
                state = { 
                    ...state, 
                    ...loadedState,
                    // Asegurar que los arrays y objetos de ranking/solicitudes existen
                    rankings: loadedState.rankings || state.rankings,
                    users: loadedState.users || state.users,
                    clubRequests: loadedState.clubRequests || state.clubRequests,
                    leagueRequests: loadedState.leagueRequests || state.leagueRequests,
                    ui: { ...state.ui, ...loadedState.ui }
                };
            }
        } catch (e) {
            console.error('Error loading state from storage:', e);
        }
    }

    // Guarda el estado en localStorage
    function saveDataToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Error saving state to storage:', e);
        }
    }

    // Inicializa la aplicación, carga datos y configura el usuario Admin inicial si no existe
    function initialize() {
        loadDataFromStorage();

        // 1. Crear usuario Admin inicial si no existe
        const adminEmail = 'admin@tecnoarena.com';
        if (!state.users.find(u => u.email === adminEmail)) {
            const initialAdmin = {
                id: crypto.randomUUID(),
                fullname: 'Administrador Principal',
                phone: '0000000000',
                username: 'admin',
                email: adminEmail,
                password: 'password123', // Usar hash en un entorno real
                age: 30,
                gender: 'not-say',
                isAdmin: true,
                isMember: true,
                clubRequestStatus: 'approved',
                leagueRequestStatus: 'approved'
            };
            state.users.push(initialAdmin);
            state.currentUser = initialAdmin;
        } else if (state.currentUser) {
             // Refrescar el currentUser si ya estaba logueado, para tener los datos más recientes
             state.currentUser = state.users.find(u => u.id === state.currentUser.id);
        }
        
        // 2. Cargar rankings de ejemplo si están vacíos
        if (Object.values(state.rankings.tekken).every(arr => arr.length === 0)) {
            loadSampleRankings();
        }

        saveDataToStorage(); // Guardar el estado inicial
        // Notificar a los suscriptores
        subscribers.forEach(callback => callback(state));
    }

    return {
        getState() {
            return { ...state };
        },
        
        setState(newState) {
            state = { ...state, ...newState };
            saveDataToStorage();
            subscribers.forEach(callback => callback(state));
        },
        
        subscribe(callback) {
            subscribers.push(callback);
            return () => {
                const index = subscribers.indexOf(callback);
                if (index > -1) subscribers.splice(index, 1);
            };
        },
        
        initialize,
        
        // Exportar saveDataToStorage para uso externo (Herramientas Admin)
        saveDataToStorage
    };
})();

/**
 * =========================================================================
 * UTILERÍAS GLOBALES (Alertas, Diálogos de Confirmación)
 * Reemplaza alert()/confirm() por modales customizados.
 * =========================================================================
 */

// Muestra un modal de alerta personalizado
function showAlert(message, type = 'info') {
    const overlay = document.getElementById('alert-overlay');
    const msgElement = document.getElementById('alert-message');
    const titleElement = document.getElementById('alert-title');
    
    if (overlay && msgElement && titleElement) {
        msgElement.textContent = message;
        titleElement.textContent = type === 'error' ? 'Error' : 
                                  type === 'success' ? 'Éxito' : 
                                  'Información';
        
        // Aplicar estilo basado en el tipo (opcional, se puede hacer con clases)
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        
        overlay.style.display = 'flex';
    }
}

function hideAlert() {
    const overlay = document.getElementById('alert-overlay');
    if (overlay) overlay.style.display = 'none';
}

// Muestra un diálogo de confirmación personalizado
let pendingConfirmAction = null;

function showConfirmDialog(title, message, callback) {
    const overlay = document.getElementById('confirm-overlay');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const buttonEl = document.getElementById('confirm-action-button');

    if (overlay && titleEl && messageEl && buttonEl) {
        titleEl.textContent = title;
        messageEl.textContent = message;
        
        // Asignar la función de callback
        buttonEl.onclick = () => {
            callback();
            hideConfirmDialog();
        };

        overlay.style.display = 'flex';
    }
}

function hideConfirmDialog() {
    const overlay = document.getElementById('confirm-overlay');
    if (overlay) overlay.style.display = 'none';
}

// Utilería para manejar confirmación antes de ejecutar una función
function confirmAction(actionCode, title, message) {
    showConfirmDialog(title, message, () => {
        try {
            // Evaluar el string de código de acción. (Usar con precaución y solo con funciones controladas)
            eval(actionCode); 
        } catch (e) {
            console.error("Error al ejecutar acción confirmada:", e);
            showAlert('Ocurrió un error al ejecutar la acción.', 'error');
        }
    });
}

/**
 * =========================================================================
 * MÓDULO DE AUTENTICACIÓN (AuthModule)
 * Maneja las operaciones de login, registro y validación.
 * =========================================================================
 */
const AuthModule = (function() {

    function validateEmail(email) {
        // Validación de formato de correo simple
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function findUser(identifier) {
        const state = AppState.getState();
        // Busca por username o email
        return state.users.find(u => u.username === identifier || u.email === identifier);
    }

    function login(identifier, password) {
        const user = findUser(identifier);

        if (!user) {
            throw new Error('Usuario o correo no encontrado.');
        }

        // Validación de contraseña simple (comparación de texto plano)
        if (user.password !== password) {
            throw new Error('Contraseña incorrecta.');
        }

        // Iniciar sesión
        AppState.setState({ currentUser: user });
    }

    function register(userData) {
        const state = AppState.getState();
        
        if (findUser(userData.username)) {
            throw new Error('El nombre de usuario ya está en uso.');
        }

        if (state.users.find(u => u.email === userData.email)) {
            throw new Error('El correo electrónico ya está en uso.');
        }

        const newUser = {
            id: crypto.randomUUID(),
            fullname: userData.fullname,
            phone: userData.phone,
            username: userData.username,
            email: userData.email,
            password: userData.password, // En un entorno real, la contraseña debe ser hasheada
            age: userData.age,
            gender: userData.gender,
            isAdmin: false,
            isMember: false,
            clubRequestStatus: 'none', // none, pending, approved, rejected
            leagueRequestStatus: 'none'
        };

        const updatedUsers = [...state.users, newUser];
        AppState.setState({ users: updatedUsers });
    }

    function logout() {
        AppState.setState({ currentUser: null });
        showAlert('Sesión cerrada correctamente.', 'success');
        showTab('welcome');
    }
    
    return {
        login,
        register,
        logout,
        validateEmail,
        findUser
    };
})();

/**
 * =========================================================================
 * MÓDULO DE RANKINGS (RankingsModule)
 * Maneja la visualización y filtrado de los rankings.
 * =========================================================================
 */
const RankingsModule = (function() {

    function renderRankingTable(game, division) {
        const state = AppState.getState();
        const container = document.getElementById(`${game}-ranking-content`);
        const searchTerm = state.ui[`${game}SearchTerm`].toLowerCase();
        
        if (!container) return;

        // 1. Obtener y filtrar los datos
        const divisionRankings = state.rankings[game][division] || [];
        
        let filteredRankings = divisionRankings.filter(player => {
            return player.username.toLowerCase().includes(searchTerm);
        });

        // 2. Ordenar por puntuación (mayor a menor)
        filteredRankings.sort((a, b) => b.score - a.score);

        // 3. Construir la tabla
        let tableHTML = `
            <table class="ranking-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Jugador</th>
                        <th>División</th>
                        <th>Puntuación</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (filteredRankings.length === 0) {
            tableHTML += `<tr><td colspan="4" style="text-align: center; color: var(--primary-light);">No hay jugadores en esta división/filtro.</td></tr>`;
        } else {
            filteredRankings.forEach((player, index) => {
                const rank = index + 1;
                const divisionClass = `division-${division}`;
                tableHTML += `
                    <tr>
                        <td>${rank}</td>
                        <td>${player.username}</td>
                        <td class="${divisionClass}">${division.charAt(0).toUpperCase() + division.slice(1)}</td>
                        <td>${player.score}</td>
                    </tr>
                `;
            });
        }

        tableHTML += `</tbody></table>`;
        container.innerHTML = tableHTML;
    }
    
    function updateSearchTerm(game, term) {
        const state = AppState.getState();
        const newState = {
            ui: {
                ...state.ui,
                [`${game}SearchTerm`]: term
            }
        };
        AppState.setState(newState);
        // El renderizado se disparará a través del listener de AppState
    }

    return {
        renderRankingTable,
        updateSearchTerm
    };
})();


/**
 * =========================================================================
 * MÓDULO DE INTERFAZ DE USUARIO (UI)
 * Maneja el routing (pestañas), la visibilidad de elementos y eventos.
 * =========================================================================
 */

// Muestra la pestaña seleccionada en el cuerpo principal
function showTab(tabId) {
    const sections = document.querySelectorAll('.main-content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(tabId);
    if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Oculta el formulario de login del header al cambiar de pestaña
        if (tabId !== 'register') {
            toggleLoginForm(false); 
        }

        // Actualiza el estado de la aplicación
        AppState.setState({ 
            ui: { 
                ...AppState.getState().ui, 
                currentTab: tabId 
            } 
        });

        // Lógica específica al mostrar una pestaña
        if (tabId === 'profile') updateProfileInfo();
        if (tabId === 'ranking-divisions') {
             // Asegura que se renderice el ranking al entrar a la pestaña
             const { currentRankingGame, currentRankingDivision } = AppState.getState().ui;
             showGameRanking(currentRankingGame, currentRankingDivision);
        }
        if (tabId === 'admin-panel') {
            fillUserSelect('admin-ranking-user');
            fillUserSelect('admin-user-select');
            fillUserSelect('member-user-select');
            renderRequests();
            // Asegura que la primera pestaña de Admin esté activa
            showAdminTab('ranking-management'); 
        }
        if (tabId === 'requests') updateRequestButtons();
    }
}

// Muestra/Oculta la interfaz de login en el header
function toggleLoginForm(show) {
    const loginFormWrapper = document.getElementById('header-login-form-wrapper');
    const authUnloggedActions = document.getElementById('auth-unlogged-actions');
    
    if (loginFormWrapper && authUnloggedActions) {
        if (show) {
            // Muestra el formulario en el header
            loginFormWrapper.style.display = 'flex'; 
            authUnloggedActions.style.display = 'none'; // Oculta los botones
        } else {
            loginFormWrapper.style.display = 'none'; // Oculta el formulario
            updateLoginUI(AppState.getState()); // Revisa qué mostrar (logged/unlogged)
        }
    }
}

// Actualiza la interfaz del header (Login/Registro vs. Perfil/Admin/Config)
function updateLoginUI(state) {
    const isLogged = state.currentUser !== null;
    const isAdmin = isLogged && state.currentUser.isAdmin;

    // Elementos a gestionar
    const unlogged = document.getElementById('auth-unlogged-actions');
    const logged = document.getElementById('profile-actions');
    const adminButton = document.getElementById('admin-button');
    const userNameEl = document.getElementById('user-display-name');
    
    // Ocultar prompts de login en otras secciones si está logueado
    const clubLogin = document.getElementById('club-login-prompt');
    const leagueLogin = document.getElementById('league-login-prompt');
    const clubRequest = document.getElementById('club-request-prompt');
    const leagueRequest = document.getElementById('league-request-prompt');

    if (unlogged) unlogged.style.display = isLogged ? 'none' : 'flex';
    if (logged) logged.style.display = isLogged ? 'flex' : 'none';
    
    if (isLogged) {
        if (userNameEl) userNameEl.textContent = state.currentUser.username;
        if (adminButton) adminButton.style.display = isAdmin ? 'block' : 'none';
        
        // Mostrar botones de solicitud en Info del Club/Liga
        if (clubLogin) clubLogin.style.display = 'none';
        if (leagueLogin) leagueLogin.style.display = 'none';
        if (clubRequest) clubRequest.style.display = 'block';
        if (leagueRequest) leagueRequest.style.display = 'block';
    } else {
        // Mostrar prompts de login en Info del Club/Liga
        if (clubLogin) clubLogin.style.display = 'block';
        if (leagueLogin) leagueLogin.style.display = 'block';
        if (clubRequest) clubRequest.style.display = 'none';
        if (leagueRequest) leagueRequest.style.display = 'none';
    }
}

// Renderiza el contenido del ranking al cambiar de juego
function showGameRanking(game) {
    const state = AppState.getState();
    const otherGame = game === 'tekken' ? 'smash' : 'tekken';
    
    // 1. Mostrar/Ocultar contenedores de juego
    const gameContainer = document.getElementById(`${game}-ranking`);
    const otherContainer = document.getElementById(`${otherGame}-ranking`);
    const gameTab = document.getElementById(`tab-${game}`);
    const otherTab = document.getElementById(`tab-${otherGame}`);

    if (gameContainer) gameContainer.style.display = 'block';
    if (otherContainer) otherContainer.style.display = 'none';
    if (gameTab) gameTab.classList.add('active');
    if (otherTab) otherTab.classList.remove('active');

    // 2. Usar la última división activa para el juego, o 'diamante' por defecto
    const currentDivision = state.ui.currentRankingDivision;

    // 3. Renderizar y actualizar el estado
    AppState.setState({ 
        ui: { 
            ...state.ui, 
            currentRankingGame: game 
        } 
    });
    showDivision(game, currentDivision);
}

// Renderiza el contenido del ranking al cambiar de división
function showDivision(game, division) {
    const state = AppState.getState();

    // 1. Marcar el botón de la división como activo
    const divisionTabsContainer = document.getElementById(`${game}-division-tabs`);
    if (divisionTabsContainer) {
        divisionTabsContainer.querySelectorAll('.btn-tab').forEach(btn => {
            if (btn.textContent.toLowerCase().includes(division)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // 2. Renderizar la tabla de la división y juego seleccionados
    RankingsModule.renderRankingTable(game, division);
    
    // 3. Actualizar el estado (esto dispara el re-renderizado para otros listeners si es necesario)
    AppState.setState({ 
        ui: { 
            ...state.ui, 
            currentRankingGame: game, 
            currentRankingDivision: division
        } 
    });
}

// Muestra la pestaña dentro del Panel de Administración
function showAdminTab(tabId) {
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.querySelectorAll('.admin-tabs .btn-tab').forEach(btn => {
        btn.classList.remove('active');
    });

    const target = document.getElementById(tabId);
    const targetButton = document.querySelector(`.admin-tabs .btn-tab[onclick*="${tabId}"]`);
    
    if (target) target.style.display = 'block';
    if (targetButton) targetButton.classList.add('active');

    if (tabId === 'request-review') renderRequests();
}


/**
 * =========================================================================
 * FUNCIONES DE PERFIL Y SOLICITUDES
 * =========================================================================
 */

// Rellena la información de la página de perfil
function updateProfileInfo() {
    const user = AppState.getState().currentUser;
    if (!user) return;

    // Rellenar elementos
    document.getElementById('profile-name').textContent = user.fullname;
    document.getElementById('profile-nick').textContent = `@${user.username}`;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-phone').textContent = user.phone;
    document.getElementById('profile-age').textContent = user.age;
    document.getElementById('profile-gender').textContent = user.gender.charAt(0).toUpperCase() + user.gender.slice(1);
    document.getElementById('profile-is-member').textContent = user.isMember ? 'Sí' : 'No';
    document.getElementById('profile-role').textContent = user.isAdmin ? 'Administrador' : 'Usuario Normal';
}

// Actualiza el estado de los botones de solicitud
function updateRequestButtons() {
    const state = AppState.getState();
    const user = state.currentUser;
    if (!user) return;
    
    const clubBtn = document.getElementById('submit-club-request-btn');
    const clubStatus = document.getElementById('club-request-status');
    const leagueBtn = document.getElementById('submit-league-request-btn');
    const leagueStatus = document.getElementById('league-request-status');

    // Estado del Club
    if (clubStatus) clubStatus.className = 'request-status';
    if (user.clubRequestStatus === 'approved') {
        if (clubBtn) clubBtn.style.display = 'none';
        if (clubStatus) { clubStatus.textContent = '¡Membresía APROBADA!'; clubStatus.classList.add('success'); }
    } else if (user.clubRequestStatus === 'pending') {
        if (clubBtn) clubBtn.style.display = 'none';
        if (clubStatus) { clubStatus.textContent = 'Solicitud PENDIENTE de revisión.'; clubStatus.classList.add('pending'); }
    } else {
        if (clubBtn) clubBtn.style.display = 'block';
        if (clubStatus) clubStatus.textContent = '';
    }

    // Estado de Liga
    if (leagueStatus) leagueStatus.className = 'request-status';
    if (user.leagueRequestStatus === 'approved') {
        if (leagueBtn) leagueBtn.style.display = 'none';
        if (leagueStatus) { leagueStatus.textContent = '¡Ingreso a Liga APROBADO!'; leagueStatus.classList.add('success'); }
    } else if (user.leagueRequestStatus === 'pending') {
        if (leagueBtn) leagueBtn.style.display = 'none';
        if (leagueStatus) { leagueStatus.textContent = 'Solicitud PENDIENTE de revisión.'; leagueStatus.classList.add('pending'); }
    } else {
        if (leagueBtn) leagueBtn.style.display = 'block';
        if (leagueStatus) leagueStatus.textContent = '';
    }
}

// Envía solicitud de Membresía del Club
function submitClubRequest() {
    const state = AppState.getState();
    const user = state.currentUser;
    if (!user) return showAlert('Debes iniciar sesión para solicitar membresía.', 'error');
    if (user.clubRequestStatus !== 'none') return showAlert('Tu solicitud ya está pendiente o ha sido procesada.', 'warning');

    const newRequest = {
        id: crypto.randomUUID(),
        userId: user.id,
        username: user.username,
        type: 'club',
        date: new Date().toLocaleDateString('es-ES'),
        status: 'pending'
    };
    
    const updatedUser = { ...user, clubRequestStatus: 'pending' };
    
    AppState.setState({
        clubRequests: [...state.clubRequests, newRequest],
        users: state.users.map(u => u.id === user.id ? updatedUser : u),
        currentUser: updatedUser
    });

    showAlert('Solicitud de membresía enviada con éxito.', 'success');
    updateRequestButtons();
}

// Envía solicitud de Ingreso a Liga
function submitLeagueRequest() {
    const state = AppState.getState();
    const user = state.currentUser;
    if (!user) return showAlert('Debes iniciar sesión para solicitar ingreso a liga.', 'error');
    if (user.leagueRequestStatus !== 'none') return showAlert('Tu solicitud ya está pendiente o ha sido procesada.', 'warning');

    const gameSelect = document.getElementById('league-game-select');
    const selectedGame = gameSelect ? gameSelect.value : null;

    if (!selectedGame) return showAlert('Por favor, selecciona un juego.', 'error');

    const newRequest = {
        id: crypto.randomUUID(),
        userId: user.id,
        username: user.username,
        type: 'league',
        game: selectedGame,
        date: new Date().toLocaleDateString('es-ES'),
        status: 'pending'
    };
    
    const updatedUser = { ...user, leagueRequestStatus: 'pending' };

    AppState.setState({
        leagueRequests: [...state.leagueRequests, newRequest],
        users: state.users.map(u => u.id === user.id ? updatedUser : u),
        currentUser: updatedUser
    });

    showAlert(`Solicitud de ingreso a liga (${selectedGame}) enviada con éxito.`, 'success');
    updateRequestButtons();
}


/**
 * =========================================================================
 * FUNCIONES DE ADMINISTRACIÓN
 * =========================================================================
 */

// Rellena los selectores de usuarios en el panel de admin
function fillUserSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const users = AppState.getState().users.filter(u => u.id !== AppState.getState().currentUser.id); // Excluir al admin actual
    
    let optionsHTML = '<option value="" disabled selected>Selecciona un usuario</option>';
    users.forEach(user => {
        optionsHTML += `<option value="${user.id}">${user.username} (${user.fullname})</option>`;
    });

    select.innerHTML = optionsHTML;
}

// Renderiza las solicitudes pendientes para revisión
function renderRequests() {
    const state = AppState.getState();
    const container = document.getElementById('pending-requests-container');
    if (!container) return;

    const allRequests = [
        ...state.clubRequests.map(r => ({ ...r, displayType: 'Membresía Club' })),
        ...state.leagueRequests.map(r => ({ ...r, displayType: `Ingreso Liga (${r.game})` }))
    ];

    if (allRequests.length === 0) {
        container.innerHTML = '<p style="color: var(--primary-light);">No hay solicitudes pendientes.</p>';
        return;
    }

    let html = '';
    allRequests.forEach(req => {
        html += `
            <div class="admin-request-item">
                <div class="request-info">
                    <strong>${req.displayType}</strong>
                    <p>Usuario: @${req.username}</p>
                    <p>Fecha: ${req.date}</p>
                </div>
                <div class="request-actions">
                    <button class="btn btn-success" onclick="handleRequest('${req.id}', '${req.type}', true)">Aprobar</button>
                    <button class="btn btn-error" onclick="handleRequest('${req.id}', '${req.type}', false)">Rechazar</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Maneja la aprobación/rechazo de una solicitud
function handleRequest(requestId, type, approve) {
    const state = AppState.getState();

    let requestsKey = type === 'club' ? 'clubRequests' : 'leagueRequests';
    
    const request = state[requestsKey].find(r => r.id === requestId);
    if (!request) return showAlert('Solicitud no encontrada.', 'error');
    
    const updatedUsers = state.users.map(user => {
        if (user.id === request.userId) {
            // Actualizar el estado de solicitud y la propiedad de membresía/liga
            const updatedUser = { ...user };
            
            if (type === 'club') {
                updatedUser.clubRequestStatus = approve ? 'approved' : 'rejected';
                updatedUser.isMember = approve;
            } else if (type === 'league') {
                updatedUser.leagueRequestStatus = approve ? 'approved' : 'rejected';
                // No se agrega una propiedad 'isLeaguePlayer' para simplificar, 
                // ya que su estado está implícito en leagueRequestStatus.
            }
            
            // Si el usuario logueado es el afectado, actualizar el currentUser
            if (state.currentUser && state.currentUser.id === user.id) {
                AppState.setState({ currentUser: updatedUser });
            }
            
            return updatedUser;
        }
        return user;
    });

    // Remover la solicitud de la lista (ya fue procesada)
    const updatedRequests = state[requestsKey].filter(r => r.id !== requestId);
    
    const newState = {
        users: updatedUsers,
        [requestsKey]: updatedRequests
    };
    
    AppState.setState(newState);
    showAlert(`Solicitud de @${request.username} ${approve ? 'APROBADA' : 'RECHAZADA'} con éxito.`, 'success');
    renderRequests();
}

// Concede o revoca el estado de Administrador
function toggleAdminStatus() {
    const select = document.getElementById('admin-user-select');
    const actionSelect = document.getElementById('admin-status-action');
    const userId = select.value;
    const action = actionSelect.value;
    
    if (!userId) return showAlert('Selecciona un usuario.', 'error');
    
    const isAdmin = action === 'grant';
    
    const state = AppState.getState();
    const updatedUsers = state.users.map(u => {
        if (u.id === userId) {
            return { ...u, isAdmin: isAdmin };
        }
        return u;
    });
    
    AppState.setState({ users: updatedUsers });
    showAlert(`Permiso de Admin ${isAdmin ? 'CONCEDIDO' : 'REVOCADO'}.`, 'success');
}

// Concede Membresía de Club
function grantClubMembership() {
    const select = document.getElementById('member-user-select');
    const userId = select.value;

    if (!userId) return showAlert('Selecciona un usuario.', 'error');

    const state = AppState.getState();
    const userToUpdate = state.users.find(u => u.id === userId);

    if (userToUpdate.isMember) return showAlert('El usuario ya es miembro.', 'warning');

    const updatedUsers = state.users.map(u => {
        if (u.id === userId) {
            return { ...u, isMember: true, clubRequestStatus: 'approved' };
        }
        return u;
    });
    
    AppState.setState({ users: updatedUsers });
    showAlert(`Membresía de Club concedida a @${userToUpdate.username}.`, 'success');
}


// Actualiza la puntuación y división de un jugador
function updateRankingFromAdminPanel() {
    const userId = document.getElementById('admin-ranking-user').value;
    const game = document.getElementById('admin-ranking-game').value;
    const division = document.getElementById('admin-ranking-division').value;
    const score = parseInt(document.getElementById('admin-ranking-score').value);
    
    if (!userId) return showAlert('Selecciona un usuario.', 'error');
    if (isNaN(score) || score < 0) return showAlert('La puntuación debe ser un número válido.', 'error');
    
    const state = AppState.getState();
    const user = state.users.find(u => u.id === userId);
    if (!user) return showAlert('Usuario no encontrado.', 'error');

    // 1. Eliminar al jugador de cualquier otra división en ese juego
    let newRankings = { ...state.rankings };

    ['diamante', 'oro', 'plata', 'bronce'].forEach(div => {
        newRankings[game][div] = newRankings[game][div].filter(p => p.userId !== userId);
    });

    // 2. Agregar al jugador a la nueva división
    const newPlayerEntry = { userId: user.id, username: user.username, score: score };
    newRankings[game][division].push(newPlayerEntry);
    
    AppState.setState({ rankings: newRankings });
    showAlert(`Ranking de @${user.username} actualizado a ${division.toUpperCase()} con ${score} puntos.`, 'success');
    
    // Forzar el renderizado del ranking si la pestaña está activa
    const { currentRankingGame, currentRankingDivision } = state.ui;
    if (state.ui.currentTab === 'ranking-divisions' && currentRankingGame === game) {
        showDivision(currentRankingGame, currentRankingDivision);
    }
}

// Resetea todos los datos (excepto el admin inicial) y carga ejemplos
function resetData() {
    const state = AppState.getState();
    const adminUser = state.users.find(u => u.isAdmin);
    
    const newState = {
        currentUser: adminUser, // Mantener al admin logueado
        users: [adminUser], // Solo el admin
        rankings: { 
            tekken: { diamante: [], oro: [], plata: [], bronce: [] },
            smash: { diamante: [], oro: [], plata: [], bronce: [] }
        },
        clubRequests: [],
        leagueRequests: [],
        ui: state.ui
    };
    
    AppState.setState(newState);
    loadSampleRankings(); // Volver a cargar los ejemplos
    showAlert('Todos los datos han sido restablecidos y cargados con ejemplos.', 'warning');
    showTab('welcome'); // Regresar a la pantalla de bienvenida
}


/**
 * =========================================================================
 * DATOS DE EJEMPLO Y UTILIDADES PEQUEÑAS
 * =========================================================================
 */

// Carga rankings de ejemplo
function loadSampleRankings() {
    const users = AppState.getState().users;
    const userAdmin = users.find(u => u.isAdmin);
    
    const sampleRankings = {
        tekken: {
            diamante: [
                { userId: userAdmin.id, username: userAdmin.username, score: 3200 }
            ],
            oro: [
                { userId: crypto.randomUUID(), username: 'BladeRunner', score: 1850 },
                { userId: crypto.randomUUID(), username: 'ShadowKing', score: 1590 }
            ],
            plata: [
                { userId: crypto.randomUUID(), username: 'NeoFighter', score: 1120 },
                { userId: crypto.randomUUID(), username: 'MatrixUser', score: 980 }
            ],
            bronce: [
                { userId: crypto.randomUUID(), username: 'Trainee01', score: 550 }
            ]
        },
        smash: {
            diamante: [
                { userId: crypto.randomUUID(), username: 'SmashPro', score: 3500 }
            ],
            oro: [
                { userId: crypto.randomUUID(), username: 'FalconPunch', score: 1700 }
            ],
            plata: [
                { userId: crypto.randomUUID(), username: 'JigglyPuff', score: 1050 }
            ],
            bronce: [
                { userId: crypto.randomUUID(), username: 'Newcomer', score: 400 }
            ]
        }
    };
    
    AppState.setState({ rankings: sampleRankings });
}

// Alterna la visibilidad del campo de contraseña
function togglePasswordVisibility(id, iconElement) {
    const input = document.getElementById(id);
    const icon = iconElement.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}


/**
 * =========================================================================
 * FUNCIONES DE INICIO DE SESIÓN Y REGISTRO
 * Implementación de Login/Registro, usando AuthModule.
 * =========================================================================
 */
function login() {
    const identifier = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!identifier || !password) {
        return showAlert('Por favor, ingresa tu usuario/correo y contraseña.', 'error');
    }

    try {
        AuthModule.login(identifier, password);
        showAlert(`Bienvenido, ${AppState.getState().currentUser.username}.`, 'success');
        // Limpiar formulario y ocultar
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        toggleLoginForm(false); 
        showTab('welcome');
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

function registerUser() {
    const fullname = document.getElementById('reg-fullname').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const age = parseInt(document.getElementById('reg-age').value);
    const gender = document.getElementById('reg-gender').value;

    // Función auxiliar para mostrar errores
    const setErrorMessage = (id, message) => {
        const element = document.getElementById(id + '-error');
        if (element) {
            element.textContent = message;
            element.style.display = message ? 'block' : 'none';
        }
    };
    
    // Resetear mensajes de error
    ['reg-fullname', 'reg-phone', 'reg-username', 'reg-email', 'reg-password', 'reg-confirm-password', 'reg-age', 'reg-gender'].forEach(id => setErrorMessage(id, ''));

    let isValid = true;
    
    if (!fullname) { setErrorMessage('reg-fullname', 'El nombre y apellido son obligatorios.'); isValid = false; }
    if (!phone || !/^\+?[0-9\s-]{7,}$/.test(phone)) { setErrorMessage('reg-phone', 'El formato del teléfono no es válido.'); isValid = false; }
    if (!username) { setErrorMessage('reg-username', 'El nombre de usuario es obligatorio.'); isValid = false; }
    if (!email || !AuthModule.validateEmail(email)) { setErrorMessage('reg-email', 'Ingresa un correo electrónico válido.'); isValid = false; }
    if (password.length < 6) { setErrorMessage('reg-password', 'La contraseña debe tener al menos 6 caracteres.'); isValid = false; }
    if (password !== confirmPassword) { setErrorMessage('reg-confirm-password', 'Las contraseñas no coinciden.'); isValid = false; }
    if (isNaN(age) || age < 13 || age > 120) { setErrorMessage('reg-age', 'Debes ingresar una edad válida (mínimo 13 años).'); isValid = false; }
    if (!gender) { setErrorMessage('reg-gender', 'Debes seleccionar un sexo.'); isValid = false; }

    if (!isValid) {
        showAlert('Por favor, corrige los errores en el formulario.', 'error');
        return;
    }

    try {
        AuthModule.register({ fullname, phone, username, email, password, age, gender });
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


/**
 * =========================================================================
 * INICIALIZACIÓN Y SUSCRIPCIÓN GLOBAL
 * =========================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa el estado de la aplicación (carga datos, crea admin si es necesario)
    AppState.initialize();

    // 2. Suscribirse a cambios de estado para actualizar la UI
    AppState.subscribe(state => {
        // Actualizar la UI de Login/Perfil/Admin en el header
        updateLoginUI(state);
        
        // Renderizar el ranking si la pestaña está activa
        if (state.ui.currentTab === 'ranking-divisions') {
            RankingsModule.renderRankingTable(state.ui.currentRankingGame, state.ui.currentRankingDivision);
        }
        
        // Actualizar la info de perfil si la pestaña está activa
        if (state.ui.currentTab === 'profile') {
            updateProfileInfo();
        }

        // Actualizar los botones de solicitud
        if (state.ui.currentTab === 'requests') {
            updateRequestButtons();
        }
    });

    // 3. Mostrar la pestaña inicial
    showTab(AppState.getState().ui.currentTab);
});

// Exportar funciones globales necesarias para onclick en HTML
window.showTab = showTab;
window.toggleLoginForm = toggleLoginForm;
window.login = login;
window.registerUser = registerUser;
window.logout = AuthModule.logout;
window.togglePasswordVisibility = togglePasswordVisibility;
window.submitClubRequest = submitClubRequest;
window.submitLeagueRequest = submitLeagueRequest;
window.showGameRanking = showGameRanking;
window.showDivision = showDivision;
window.confirmAction = confirmAction;

// Funciones Admin
window.showAdminTab = showAdminTab;
window.updateRankingFromAdminPanel = updateRankingFromAdminPanel;
window.toggleAdminStatus = toggleAdminStatus;
window.grantClubMembership = grantClubMembership;
window.handleRequest = handleRequest;
window.resetData = resetData; // Usado por confirmAction

// Exportar módulo de rankings para filtros de búsqueda
window.RankingsModule = RankingsModule;
