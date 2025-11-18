// --- CONFIGURACIÓN Y ESTADO ---
const DB_KEY = 'TecnoArenaDB_v2';
const DEFAULT_ADMIN = {
    id: 'admin-01', name: 'Tecno Admin', user: 'Tecno', pass: 'Arena', 
    email: 'admin@tecno.com', phone: '0000', sex: 'O', role: 'admin', 
    club: null, leagues: [], requests: [] 
};

// Variables de estado UI
let currentRankingGame = 'tekken';
let currentRankingDiv = 'diamante';

// --- UTILIDADES DE UI ---

// Función para obtener la inicial del nombre (Punto 3)
function getUserInitial(userName) {
    if (!userName) return '?';
    // Obtener la primera letra del nombre y convertir a mayúsculas
    return userName.charAt(0).toUpperCase();
}

// Función para ocultar el modal de confirmación
function hideConfirmDialog() {
    const overlay = document.getElementById('confirm-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Función para mostrar el modal de confirmación
function showConfirmDialog(title, message, callback) {
    const overlay = document.getElementById('confirm-overlay');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    let button = document.getElementById('confirm-action-button');

    if (overlay) overlay.style.display = 'flex';
    if (titleEl) titleEl.innerText = title;
    if (messageEl) messageEl.innerText = message;
    
    // Clonar para remover listeners anteriores y evitar ejecuciones múltiples.
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    button = newButton;

    // Asignar la nueva acción al botón "Aceptar"
    button.onclick = () => {
        hideConfirmDialog();
        callback();
    };
    
    // Asignar acción al botón "Cancelar"
    const cancelButton = document.querySelector('.confirm-dialog .btn-secondary');
    if(cancelButton) {
        cancelButton.onclick = hideConfirmDialog;
    }
}


// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    initDB();
    
    // Limpiar sessionStorage al cargar
    sessionStorage.removeItem('currentUser'); 
    
    // Asegurar que el cuadro de confirmación esté oculto.
    hideConfirmDialog();

    checkSession();
    navTo('welcome');
});

function initDB() {
    if (!localStorage.getItem(DB_KEY)) {
        const initialData = {
            users: [DEFAULT_ADMIN],
            rankings: {
                tekken: [], 
                smash: []
            },
            requests: [] 
        };
        saveDB(initialData);
    } else {
        // Check integridad admin
        let db = getDB();
        if(!db.users.find(u => u.user === 'Tecno')) {
            db.users.push(DEFAULT_ADMIN);
            saveDB(db);
        }
    }
}

function getDB() { return JSON.parse(localStorage.getItem(DB_KEY)); }
function saveDB(data) { localStorage.setItem(DB_KEY, JSON.stringify(data)); }

// --- NAVEGACIÓN ---
function navTo(sectionId) {
    document.querySelectorAll('.main-section').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.add('active');
        window.scrollTo(0,0);
        
        if (sectionId === 'ranking') renderRanking();
        if (sectionId === 'profile') renderProfile();
        if (sectionId === 'config') renderConfig();
        if (sectionId === 'admin-panel') renderAdminPanel();
    }
}

// --- AUTH ---
function login() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    
    if(!u || !p) return alert("Ingrese datos");

    const db = getDB();
    const user = db.users.find(usr => (usr.user === u || usr.email === u) && usr.pass === p);
    
    if (user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        checkSession();
        document.getElementById('login-user').value = '';
        document.getElementById('login-pass').value = '';
        navTo('welcome');
    } else {
        alert("Credenciales incorrectas");
    }
}

function logout() {
    sessionStorage.removeItem('currentUser');
    checkSession();
    navTo('welcome');
}

// Función para revisar sesión y actualizar UI (Punto 2 y 3)
function checkSession() {
    const session = JSON.parse(sessionStorage.getItem('currentUser'));
    const authBtns = document.getElementById('auth-buttons');
    const userPanel = document.getElementById('user-panel');
    const btnAdmin = document.getElementById('btn-admin-panel');
    const profileAvatarSmall = document.getElementById('profile-avatar'); 
    
    const clubGuest = document.getElementById('club-req-guest');
    const clubAuth = document.getElementById('club-req-auth');
    const leagueGuest = document.getElementById('league-req-guest');
    const leagueAuth = document.getElementById('league-req-auth');

    if (session) {
        authBtns.style.display = 'none';
        userPanel.style.display = 'flex';
        
        // Renderizar inicial del avatar (Punto 3)
        if (profileAvatarSmall) {
            profileAvatarSmall.innerText = getUserInitial(session.name); 
            profileAvatarSmall.title = session.name; 
        }

        if (session.role === 'admin') btnAdmin.classList.remove('hidden');
        else btnAdmin.classList.add('hidden');

        if(clubGuest) clubGuest.classList.add('hidden');
        if(clubAuth) clubAuth.classList.remove('hidden');
        if(leagueGuest) leagueGuest.classList.add('hidden');
        if(leagueAuth) leagueAuth.classList.remove('hidden');
    } else {
        authBtns.style.display = 'flex';
        userPanel.style.display = 'none';
        
        if(clubGuest) clubGuest.classList.remove('hidden');
        if(clubAuth) clubAuth.classList.add('hidden');
        if(leagueGuest) leagueGuest.classList.remove('hidden');
        if(leagueAuth) leagueAuth.classList.add('hidden');
    }
}

function register() {
    const name = document.getElementById('reg-name').value;
    const user = document.getElementById('reg-user').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const sex = document.getElementById('reg-sex').value;
    const pass = document.getElementById('reg-pass').value;

    if (!name || !user || !pass) return alert("Datos incompletos");

    const db = getDB();
    if (db.users.find(u => u.user === user)) return alert("El usuario ya existe");

    const newUser = {
        id: Date.now().toString(),
        name, user, email, phone, sex, pass,
        role: 'user', club: null, leagues: [], requests: []
    };

    db.users.push(newUser);
    saveDB(db);
    alert("Registro exitoso. Inicia sesión.");
    navTo('welcome');
}

// --- PERFIL & CONFIG ---
// Función para renderizar el perfil (Punto 3 y 4)
function renderProfile() {
    const session = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!session) return;
    const db = getDB();
    const freshUser = db.users.find(u => u.id === session.id);
    
    // Set avatar initial (Punto 3)
    document.getElementById('p-avatar').innerText = getUserInitial(freshUser.name); 

    // Rellenar la información del perfil
    document.getElementById('p-name').innerText = freshUser.name;
    document.getElementById('p-nick').innerText = freshUser.user;
    document.getElementById('p-role').innerText = freshUser.role.toUpperCase(); 
    document.getElementById('p-email').innerText = freshUser.email || 'N/A';
    document.getElementById('p-phone').innerText = freshUser.phone || 'N/A';
    document.getElementById('p-club').innerText = freshUser.club ? freshUser.club : "Sin Membresía";

    const leaguesContainer = document.getElementById('p-leagues');
    leaguesContainer.innerHTML = '';
    let html = '';
    ['tekken', 'smash'].forEach(game => {
        const entry = db.rankings[game].find(r => r.user === freshUser.user);
        if (entry) html += `<p><strong>${game.toUpperCase()}:</strong> ${entry.division.toUpperCase()} - ${entry.score} pts</p>`;
    });
    if(html === '') html = '<p>No participas en ligas activas.</p>';
    leaguesContainer.innerHTML = html;
    
    // NOTA: El botón redundante de Configuración fue removido del HTML.
}

function renderConfig() {
    const session = JSON.parse(sessionStorage.getItem('currentUser'));
    if(!session) return;
    const db = getDB();
    const freshUser = db.users.find(u => u.id === session.id);

    document.getElementById('conf-name').value = freshUser.name;
    document.getElementById('conf-phone').value = freshUser.phone;

    const reqContainer = document.getElementById('config-requests-status');
    reqContainer.innerHTML = '';
    const allReqs = db.requests.filter(r => r.userId === freshUser.id);
    
    if (allReqs.length === 0) reqContainer.innerHTML = '<p>No tienes solicitudes enviadas.</p>';
    else {
        allReqs.forEach(req => {
            let statusText = req.status;
            let statusColor = '#ffea00'; // Pendiente
            if (req.status === 'Aprobada') { statusColor = '#00e676'; statusText = 'Aprobada (Acción tomada)'; }
            else if (req.status === 'Rechazada') { statusColor = '#ff4081'; statusText = 'Rechazada'; }
            
            reqContainer.innerHTML += `<div style="background:#222; padding:10px; margin:5px; border:1px solid #444;">
                Solicitud <strong>${req.type.toUpperCase()}</strong> (${req.detail}): <span style="color:${statusColor}">${statusText}</span>
            </div>`;
        });
    }
}

function updateUser() {
    const session = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!session) return;
    const name = document.getElementById('conf-name').value;
    const phone = document.getElementById('conf-phone').value;
    const pass = document.getElementById('conf-pass').value;
    
    const db = getDB();
    const userIdx = db.users.findIndex(u => u.id === session.id);
    if(userIdx !== -1) {
        db.users[userIdx].name = name;
        db.users[userIdx].phone = phone;
        if(pass) db.users[userIdx].pass = pass;
        saveDB(db);
        // Actualizar sessionStorage con los datos más frescos
        sessionStorage.setItem('currentUser', JSON.stringify(db.users[userIdx]));
        alert("Datos actualizados");
        checkSession(); // Refrescar el avatar en el header
        renderConfig();
    }
}

function deleteUser() {
    showConfirmDialog(
        "Borrar Cuenta",
        "¿Estás seguro de que quieres borrar tu cuenta permanentemente? Esta acción es irreversible.",
        () => {
            const session = JSON.parse(sessionStorage.getItem('currentUser'));
            if (!session) return;
            let db = getDB();
            db.users = db.users.filter(u => u.id !== session.id);
            db.rankings.tekken = db.rankings.tekken.filter(r => r.user !== session.user);
            db.rankings.smash = db.rankings.smash.filter(r => r.user !== session.user);
            db.requests = db.requests.filter(r => r.userId !== session.id);
            saveDB(db);
            logout();
        }
    );
}

// --- SOLICITUDES ---
function submitRequest(type) {
    const session = JSON.parse(sessionStorage.getItem('currentUser'));
    if(!session) return alert("Inicia sesión para enviar una solicitud.");
    
    const db = getDB();
    
    // Check pending requests
    const hasPending = db.requests.find(r => r.userId === session.id && r.type === type && r.status === 'Pendiente');
    if(hasPending) return alert(`Ya tienes una solicitud de ${type.toUpperCase()} pendiente.`);
    
    let detail, msg;
    if (type === 'club') {
        detail = document.getElementById('req-club-select').value;
        msg = document.getElementById('req-club-msg').value;
        if(!detail) return alert("Seleccione un club.");
        if (session.club) return alert(`Ya perteneces al club ${session.club}.`);
    } else { // league
        detail = document.getElementById('req-liga-game').value;
        msg = document.getElementById('req-liga-msg').value;
        if(!detail) return alert("Seleccione un juego.");
        const inRank = db.rankings[detail].find(r => r.user === session.user);
        if(inRank) return alert(`Ya estás inscrito en la liga de ${detail.toUpperCase()}.`);
    }
    
    const newReq = {
        id: Date.now(),
        userId: session.id,
        userName: session.user,
        type, detail, message: msg, status: 'Pendiente'
    };
    
    db.requests.push(newReq);
    saveDB(db);
    alert("Solicitud enviada. Revisa su estado en Configuración.");
    navTo('config');
}

// --- RANKING ---
function setRankingGame(game) {
    currentRankingGame = game;
    // Lógica para activar/desactivar el botón
    document.querySelectorAll('.btn-game').forEach(b => b.classList.remove('active'));
    const targetButton = event.target || document.querySelector(`.game-selector .btn-game[onclick*="'${game}'"]`);
    if (targetButton) {
        targetButton.classList.add('active');
    }
    renderRanking();
}

function setRankingDiv(div) {
    currentRankingDiv = div;
    // Lógica para activar/desactivar el botón
    document.querySelectorAll('.division-selector .btn-div').forEach(b => b.classList.remove('active'));
    const targetButton = event.target || document.querySelector(`.division-selector .btn-div[onclick*="'${div}'"]`);
    if (targetButton) {
        targetButton.classList.add('active');
    }
    renderRanking();
}

function renderRanking() {
    const db = getDB();
    const tbody = document.getElementById('ranking-body');
    tbody.innerHTML = '';
    
    let list = db.rankings[currentRankingGame] || [];
    // Inicialmente, solo muestra la división actual
    list = list.filter(item => item.division === currentRankingDiv);
    list.sort((a,b) => b.score - a.score);
    
    list.forEach((item, index) => {
        tbody.innerHTML += `<tr><td>${index + 1}</td><td>${item.user}</td><td>${item.score}</td></tr>`;
    });
}

function filterRanking() {
    const term = document.getElementById('ranking-search').value.toLowerCase();
    const db = getDB();
    let list = db.rankings[currentRankingGame] || [];
    
    if (term.length > 0) {
        // Al buscar, se muestran todos los resultados del juego, independientemente de la división
        document.querySelectorAll('.division-selector .btn-div').forEach(b => b.classList.remove('active'));
        list = list.filter(item => item.user.toLowerCase().includes(term));
    } else {
        // Si no hay búsqueda, volver a filtrar por la división activa
        list = list.filter(item => item.division === currentRankingDiv);
        const activeDivButton = document.querySelector(`.division-selector .btn-div[onclick*="'${currentRankingDiv}'"]`);
        if (activeDivButton) activeDivButton.classList.add('active');
    }
    
    list.sort((a,b) => b.score - a.score);
    const tbody = document.getElementById('ranking-body');
    tbody.innerHTML = '';
    list.forEach((item, index) => {
        const divisionInfo = term.length > 0 ? ` (${item.division})` : '';
        tbody.innerHTML += `<tr><td>${index + 1}</td><td>${item.user}${divisionInfo}</td><td>${item.score}</td></tr>`;
    });
}


// --- ADMIN ---
// Función para asegurar la carga del Admin Panel (Punto 6)
function renderAdminPanel() { 
    const session = JSON.parse(sessionStorage.getItem('currentUser'));
    if(!session || session.role !== 'admin') {
        navTo('welcome');
        return;
    }
    
    const db = getDB();
    const userSelects = ['adm-div-user', 'adm-club-user', 'adm-perm-user'];
    
    // 1. Rellenar Selectores de Usuario
    userSelects.forEach(selId => {
        const sel = document.getElementById(selId);
        // Mantener la opción por defecto, rellenar desde la segunda opción.
        sel.innerHTML = '<option value="">Seleccionar Usuario</option>'; 
        // Solo listar usuarios regulares
        db.users.filter(u => u.role !== 'admin').forEach(u => {
            sel.innerHTML += `<option value="${u.user}">${u.name} (${u.user})</option>`;
        });
    });

    // 2. Renderizar Solicitudes Recibidas
    const list = document.getElementById('admin-requests-list');
    list.innerHTML = '';
    const pending = db.requests.filter(r => r.status === 'Pendiente');
    
    if(pending.length === 0) {
        list.innerHTML = '<li style="color:var(--text-muted); text-align:center;">No hay solicitudes pendientes.</li>';
        return;
    }
    
    pending.forEach(req => {
        list.innerHTML += `
            <li class="req-item">
                <div class="req-info">
                    <strong>${req.userName}</strong>: ${req.type.toUpperCase()} (${req.detail})<br>
                    <small>Mensaje: ${req.message || 'N/A'}</small>
                </div>
                <div class="req-actions">
                    <button class="btn-neon-sm" style="color:#00e676; border-color:#00e676" onclick="adminHandleReq(${req.id}, true)">Aprobar</button>
                    <button class="btn-neon-sm" style="color:red; border-color:red" onclick="adminHandleReq(${req.id}, false)">Rechazar</button>
                </div>
            </li>
        `;
    });
}

function adminAssignLeague() {
    const uSelect = document.getElementById('adm-div-user').value;
    const uManual = document.getElementById('adm-div-manual').value;
    const game = document.getElementById('adm-div-game').value;
    const div = document.getElementById('adm-div-rank').value;
    const score = parseInt(document.getElementById('adm-div-score').value);
    
    const target = uManual || uSelect;
    if(!target || !game || !div || isNaN(score)) return alert("Datos incompletos o puntaje inválido");
    
    const db = getDB();
    let list = db.rankings[game];
    const idx = list.findIndex(r => r.user === target);
    const entry = { user: target, division: div, score: score };
    
    if(idx !== -1) list[idx] = entry;
    else list.push(entry);
    
    saveDB(db);
    alert("Ranking actualizado");
    renderAdminPanel();
}

function adminAssignClub() {
    const uSelect = document.getElementById('adm-club-user').value;
    const uManual = document.getElementById('adm-club-manual').value;
    const type = document.getElementById('adm-club-type').value;
    const target = uManual || uSelect;
    
    if(!target) return alert("Seleccione usuario");
    const db = getDB();
    const idx = db.users.findIndex(u => u.user === target);
    
    if(idx !== -1) {
        db.users[idx].club = type === 'No' ? null : type;
        saveDB(db);
        alert("Club asignado");
        renderAdminPanel();
    } else alert("Usuario no encontrado");
}

function adminMakeAdmin() {
    const u = document.getElementById('adm-perm-user').value;
    if(!u) return alert("Seleccione un usuario");
    const db = getDB();
    const idx = db.users.findIndex(user => user.user === u);
    if(idx!==-1){
        db.users[idx].role = 'admin';
        saveDB(db);
        alert("Permisos concedidos");
        renderAdminPanel();
    } else alert("Usuario no encontrado");
}

function adminResetDB() {
    showConfirmDialog(
        "Resetear Base de Datos",
        "¿Estás absolutamente seguro de que quieres borrar TODA la base de datos? Esto borrará TODAS las cuentas (excepto Admin) y rankings.",
        () => {
            localStorage.removeItem(DB_KEY);
            initDB();
            location.reload();
        }
    );
}

function adminHandleReq(id, approve) {
    const db = getDB();
    const idx = db.requests.findIndex(r => r.id === id);
    if(idx===-1) return;
    
    const req = db.requests[idx];
    
    if(approve) {
        const uIdx = db.users.findIndex(u => u.id === req.userId);
        if(uIdx !== -1) {
            const user = db.users[uIdx];
            if(req.type === 'club') {
                user.club = req.detail;
            }
            else { // league
                const game = req.detail;
                const exists = db.rankings[game].find(r => r.user === req.userName);
                if(!exists) {
                    db.rankings[game].push({ user: req.userName, division: 'bronce', score: 0 });
                }
            }
            // Marcar como Aprobada para que quede en el historial
            db.requests[idx].status = 'Aprobada'; 
        }
    } else {
        db.requests[idx].status = 'Rechazada';
    }
    
    // Almacenar el cambio de estado y refrescar
    saveDB(db);
    renderAdminPanel();
    renderConfig();
}
