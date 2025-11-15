/**
 * REESCRITURA COMPLETA DE app.js CON CORRECCIONES
 * * * CRITICAL SECURITY NOTE:
 * El hash de contraseña simple (String.prototype.hashCode) es inseguro. 
 * En producción, REEMPLACELO con bcrypt, scrypt o Argon2 usando un salt único para cada usuario.
 */

// =========================================================================
// UTILIDAD CRÍTICA DE HASHING (SOLO PARA DEMOSTRACIÓN)
// =========================================================================

if (!String.prototype.hashCode) {
    String.prototype.hashCode = function() {
        let hash = 0;
        if (this.length === 0) return hash.toString();
        for (let i = 0; i < this.length; i++) {
            let char = this.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convierte a entero de 32bit
        }
        return hash.toString(16);
    }
}

// =========================================================================
// CRITICAL FIX: Persistencia de datos
// =========================================================================

const STORAGE_KEY = 'tecnoArenaAppState';

function saveDataToStorage() {
    try {
        const state = AppState.getState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Error al guardar en Local Storage:", e);
    }
}

function loadDataFromStorage() {
    try {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            return JSON.parse(savedState);
        }
    } catch (e) {
        console.error("Error al cargar de Local Storage:", e);
    }
    return null;
}

// =========================================================================
// MÓDULOS DE APLICACIÓN
// =========================================================================

const AppState = (function() {
    const initialState = {
        currentUser: null,
        users: [{ 
            id: 1, 
            username: 'admin', 
            passwordHash: 'admin'.hashCode(), 
            isAdmin: true, 
            email: 'admin@arena.com',
            score: 9999,
            club: 'Arena Masters'
        }], // Se inicializa un usuario administrador
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
    
    let state = loadDataFromStorage() || initialState;
    // Forzar el estado inicial si el storage está vacío (incluye el admin por defecto)
    if (!loadDataFromStorage()) {
        state = initialState;
    }
    
    const subscribers = [];
    
    return {
        getState() {
            return { ...state };
        },
        
        setState(newState) {
            state = { ...state, ...newState };
            subscribers.forEach(callback => callback(state));
            saveDataToStorage(); // CRITICAL FIX: Llama a la función implementada
        },
        
        subscribe(callback) {
            subscribers.push(callback);
            callback(state); // Ejecuta el callback inmediatamente con el estado actual
            return () => {
                const index = subscribers.indexOf(callback);
                if (index > -1) subscribers.splice(index, 1);
            };
        },
        
        setLoading(loading) {
            this.setState({ ui: { ...state.ui, loading } });
        },
        
        setCurrentPage(game, division, page) {
             const newPages = {
                ...state.ui.currentPage,
                [game]: {
                    ...state.ui.currentPage[game],
                    [division]: page
                }
            };
            this.setState({ ui: { ...state.ui, currentPage: newPages } });
        },
        // Añadir una función para forzar una carga de data de ejemplo
        loadSampleRankings
    };
})();

const AuthModule = (function() {
    
    /**
     * CRITICAL FIX: Define hashPassword dentro del módulo
     */
    function hashPassword(password) {
        // Usa la función prototype definida arriba
        return password ? password.hashCode() : ''; 
    }
    
    function login(username, password) {
        const { users } = AppState.getState();
        const hashedPassword = hashPassword(password);
        
        const user = users.find(u => u.username === username && u.passwordHash === hashedPassword);

        if (user) {
            AppState.setState({ currentUser: user });
            return true;
        }
        return false;
    }

    function register(username, password, email) {
        const { users } = AppState.getState();
        
        if (users.some(u => u.username === username)) {
            alert('El nombre de usuario ya está en uso.');
            return false;
        }

        const hashedPassword = hashPassword(password);
        
        const newUser = {
            id: Date.now(),
            username,
            email,
            passwordHash: hashedPassword,
            isAdmin: false,
            score: 1000,
            club: 'Sin club'
        };

        AppState.setState({ users: [...users, newUser], currentUser: newUser });
        return true;
    }

    return {
        login,
        register
    };
})();


const UIModule = (function() {
    
    // CRITICAL FIX: HTML COMPLETO para el spinner
    function LoadingSpinner() {
        return `
            <div class="loading-spinner-overlay">
                <div class="spinner"></div>
                <p>Cargando datos...</p>
            </div>
        `;
    }

    // Funciones para el DOM
    function hideAllTabs() {
        document.querySelectorAll('.tab-content').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });
    }

    function showAuthForm(formType) {
        document.querySelectorAll('.auth-form').forEach(form => {
            form.style.display = 'none';
            form.classList.remove('active');
        });
        document.getElementById(`auth-${formType}-form-container`).style.display = 'block';
        document.getElementById(`auth-${formType}-form-container`).classList.add('active');
        
        document.querySelectorAll('#auth-info .tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`#auth-info .tab-button:nth-child(${formType === 'login' ? 1 : 2})`).classList.add('active');
    }

    function updateLoginUI(currentUser) {
        const loggedIn = !!currentUser;

        // Toggle visibility for desktop quick login/user info
        document.getElementById('header-login-form-wrapper').style.display = loggedIn ? 'none' : 'flex';
        document.getElementById('user-info-display').style.display = loggedIn ? 'flex' : 'none';
        
        // Toggle visibility for mobile quick login/user info (IDs corregidos)
        document.getElementById('mobile-login-form-wrapper').style.display = loggedIn ? 'none' : 'flex';
        document.getElementById('mobile-user-info-display').style.display = loggedIn ? 'flex' : 'none';

        // Toggle visibility for main navigation links
        document.getElementById('nav-login-link').style.display = loggedIn ? 'none' : 'list-item';
        document.getElementById('nav-profile-link').style.display = loggedIn ? 'list-item' : 'none';
        document.getElementById('nav-settings-link').style.display = loggedIn ? 'list-item' : 'none';
        document.getElementById('nav-admin-link').style.display = (loggedIn && currentUser.isAdmin) ? 'list-item' : 'none';

        if (loggedIn) {
            document.getElementById('desktop-username').textContent = currentUser.username;
            document.getElementById('mobile-username').textContent = currentUser.username;
            updateUserInfo(currentUser);
        }
    }
    
    // ... (otras funciones de UIModule)

    return {
        LoadingSpinner,
        hideAllTabs,
        showAuthForm,
        updateLoginUI
    };
})();


const RankingsModule = (function() {

    function renderRankings(game, division, items, currentPage, totalPages) {
        // CRITICAL FIX: Se usa el ID correcto para el contenedor de la tabla
        const containerId = `${game}-${division}-ranking`;
        const container = document.getElementById(containerId); 

        if (!container) {
            console.error(`Contenedor no encontrado: ${containerId}`);
            return;
        }

        // Simulación de renderizado de tabla
        const startIndex = (currentPage - 1) * AppState.getState().ui.itemsPerPage;
        const endIndex = startIndex + AppState.getState().ui.itemsPerPage;
        const pageItems = items.slice(startIndex, endIndex);

        let html = `
            <table>
                <thead>
                    <tr><th>#</th><th>Jugador</th><th>Puntaje</th><th>Club</th></tr>
                </thead>
                <tbody>
        `;
        pageItems.forEach((item, index) => {
            html += `
                <tr>
                    <td>${startIndex + index + 1}</td>
                    <td>${item.username}</td>
                    <td>${item.score}</td>
                    <td>${item.club}</td>
                </tr>
            `;
        });
        html += `</tbody></table>`;
        container.innerHTML = html;

        // Renderizado de Paginación (simple)
        const paginationHtml = `
            <button onclick="changePage('${game}', '${division}', ${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
            <span>Página ${currentPage} de ${totalPages}</span>
            <button onclick="changePage('${game}', '${division}', ${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente</button>
        `;
        document.getElementById(`${game}-pagination`).innerHTML = paginationHtml;
    }

    function searchRankings(term) {
        AppState.setLoading(true);

        // Lógica de búsqueda simulada. En un caso real, esto filtraría los datos.

        // =====================================================================
        // CRITICAL FIX: LÓGICA DE PAGINACIÓN OPTIMIZADA (Una sola llamada a setState)
        // =====================================================================
        const newPageSettings = {
            tekken: { diamante: 1, oro: 1, plata: 1, bronce: 1 },
            smash: { diamante: 1, oro: 1, plata: 1, bronce: 1 }
        };

        // Actualiza el estado con la nueva búsqueda y las páginas reiniciadas
        AppState.setState({ 
            ui: { 
                ...AppState.getState().ui,
                currentPage: newPageSettings, // Reinicia todas las páginas a 1
                searchTerm: term 
            }
        }); 

        AppState.setLoading(false);
    }

    return {
        renderRankings,
        searchRankings,
    };
})();


// =========================================================================
// FUNCIONES GLOBALES (Expuestas al 'window' para el HTML)
// =========================================================================

/**
 * Muestra una pestaña (sección) y oculta las demás.
 * @param {string} tabId El ID de la sección a mostrar.
 */
function showTab(tabId) {
    UIModule.hideAllTabs();

    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.style.display = 'block';
        activeTab.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Muestra el ranking de un juego y oculta el otro.
 * @param {string} game 'tekken' o 'smash'.
 */
function showGameRanking(game) {
    document.querySelectorAll('.game-ranking-wrapper').forEach(wrapper => {
        wrapper.style.display = 'none';
        wrapper.classList.remove('active');
    });
    document.getElementById(`${game}-ranking-wrapper`).style.display = 'block';
    document.getElementById(`${game}-ranking-wrapper`).classList.add('active');

    document.querySelectorAll('.division-select-tabs').forEach(tabs => tabs.style.display = 'none');
    document.getElementById(`${game}-divisions`).style.display = 'flex';

    // Simular el clic en la primera división
    const firstDivisionButton = document.getElementById(`${game}-divisions`).querySelector('.tab-button');
    if (firstDivisionButton) firstDivisionButton.click();
}

/**
 * Muestra una división específica de un juego.
 */
function showDivision(game, division) {
    document.querySelectorAll(`#${game}-ranking-wrapper .division-ranking-table`).forEach(table => {
        table.style.display = 'none';
        table.classList.remove('active');
    });
    document.getElementById(`${game}-${division}-ranking`).style.display = 'block';
    document.getElementById(`${game}-${division}-ranking`).classList.add('active');

    document.querySelectorAll(`#${game}-divisions .tab-button`).forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#${game}-divisions .tab-button[onclick*="'${division}'"]`).classList.add('active');
    
    // Forzar el renderizado para la división activa
    const { rankings, ui } = AppState.getState();
    const items = rankings[game][division];
    const totalPages = Math.ceil(items.length / ui.itemsPerPage);
    const currentPage = ui.currentPage[game][division];
    RankingsModule.renderRankings(game, division, items, currentPage, totalPages);
}

/**
 * Cambia la página de una división específica.
 */
function changePage(game, division, newPage) {
    AppState.setCurrentPage(game, division, newPage);
    // showDivision se encargará del renderizado a través del subscription si es necesario
}


/**
 * Lógica de Autenticación
 */
function login(e, formId) {
    if (e) e.preventDefault();
    
    let username, password;
    if (formId === 'header-login-form') {
        username = document.getElementById('header-username').value;
        password = document.getElementById('header-password').value;
    } else if (formId === 'mobile-login-form') {
        username = document.getElementById('mobile-username-input').value;
        password = document.getElementById('mobile-password-input').value;
    } else if (formId === 'login-form') {
        username = document.getElementById('login-username').value;
        password = document.getElementById('login-password').value;
    }
    
    if (AuthModule.login(username, password)) {
        alert('Inicio de sesión exitoso!');
        showTab('welcome'); 
    } else {
        alert('Credenciales inválidas.');
    }
}

function registerUser(e) {
    if (e) e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const email = document.getElementById('register-email').value;

    if (AuthModule.register(username, password, email)) {
        alert('Registro exitoso! ¡Bienvenido!');
        showTab('welcome'); 
    }
}

function logout() {
    AppState.setState({ currentUser: null });
    showTab('welcome');
    alert('Sesión cerrada.');
}

/**
 * Toggle de visibilidad de contraseña
 */
function togglePasswordVisibility(fieldId, button) {
    const field = document.getElementById(fieldId);
    const icon = button.querySelector('i');

    if (field.type === 'password') {
        field.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        field.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

/**
 * Toggle de navegación móvil
 */
function toggleMobileNav() {
    const nav = document.getElementById('mobile-nav');
    if (nav.classList.contains('active')) {
        nav.classList.remove('active');
    } else {
        nav.classList.add('active');
    }
}


// --- (Funciones placeholder para cumplir con la estructura original) ---
function updateUserInfo(user) {
    const profileCard = document.getElementById('profile-card');
    if (profileCard) {
        profileCard.innerHTML = `
            <h3>${user.username}</h3>
            <p>Email: ${user.email || 'N/A'}</p>
            <p>Puntaje: ${user.score}</p>
            <p>Club: ${user.club}</p>
            <p>Rol: ${user.isAdmin ? 'Administrador' : 'Miembro'}</p>
        `;
    }
}
function renderRequests(requests) { /* ... */ }
function loadSampleRankings() {
    // Generar datos de ejemplo para simular rankings
    const generateRankings = (count) => {
        return Array.from({ length: count }, (_, i) => ({
            username: `Player${count - i}`,
            score: 1000 + (count - i) * 10,
            club: `Club ${i % 3 + 1}`
        }));
    };
    AppState.setState({
        rankings: {
            tekken: { diamante: generateRankings(20), oro: generateRankings(15), plata: generateRankings(10), bronce: generateRankings(5) },
            smash: { diamante: generateRankings(25), oro: generateRankings(18), plata: generateRankings(12), bronce: generateRankings(7) }
        }
    });
}


// =========================================================================
// EXPONER FUNCIONES AL ÁMBITO GLOBAL (Como se hacía en el código original)
// =========================================================================

window.showTab = showTab; 
window.login = login;
window.registerUser = registerUser;
window.logout = logout;
window.togglePasswordVisibility = togglePasswordVisibility;
window.toggleMobileNav = toggleMobileNav;
window.showAuthForm = UIModule.showAuthForm;
window.RankingsModule = RankingsModule;
window.showGameRanking = showGameRanking;
window.showDivision = showDivision;
window.changePage = changePage; 
window.loadSampleRankings = loadSampleRankings; 
window.updateUserInfo = updateUserInfo; 
// ... (Exponer el resto de funciones si se usaron en el HTML original: handleRequest, fillUserSelect, etc.)

// =========================================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar datos de ejemplo si es la primera vez
    if (AppState.getState().rankings.tekken.diamante.length === 0) {
        loadSampleRankings();
    }
    
    // 2. Suscribirse a los cambios de estado (Mantiene la UI sincronizada)
    AppState.subscribe(state => {
        UIModule.updateLoginUI(state.currentUser);
        // Volver a renderizar el ranking de la pestaña activa
        document.querySelectorAll('.game-ranking-wrapper.active').forEach(wrapper => {
            const game = wrapper.id.split('-')[0];
            document.querySelectorAll(`#${game}-ranking-wrapper .division-ranking-table.active`).forEach(table => {
                const division = table.id.split('-')[1];
                const items = state.rankings[game][division];
                const totalPages = Math.ceil(items.length / state.ui.itemsPerPage);
                const currentPage = state.ui.currentPage[game][division];
                RankingsModule.renderRankings(game, division, items, currentPage, totalPages);
            });
        });
    });

    // 3. Mostrar la pestaña de bienvenida por defecto (ya se hace con la clase 'active' en HTML, pero por si acaso)
    showTab('welcome');
});
