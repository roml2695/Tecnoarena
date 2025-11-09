<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tecno Arena</title>
    <style>
        :root {
            --primary-color: #00b4d8;
            --primary-dark: #0096c7;
            --secondary-color: #0f1923;
            --secondary-light: #1a2a38;
            --accent-color: #ff2e63;
            --text-color: #f0f0f0;
            --background-color: #000000;
            --success-color: #4caf50;
            --warning-color: #ff9800;
            --error-color: #f44336;
            --diamond-color: #b9f2ff;
            --gold-color: #ffd700;
            --silver-color: #c0c0c0;
            --bronze-color: #cd7f32;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background-color: var(--background-color);
            color: var(--text-color);
            line-height: 1.6;
            background-image: 
                radial-gradient(circle at 20% 30%, rgba(0, 180, 216, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(255, 46, 99, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(157, 78, 221, 0.1) 0%, transparent 50%),
                linear-gradient(to bottom, #000000, #0a0a0a);
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
        }

        body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                linear-gradient(90deg, transparent 95%, rgba(0, 180, 216, 0.05) 100%) 0 0 / 30px 30px,
                linear-gradient(transparent 95%, rgba(255, 46, 99, 0.05) 100%) 0 0 / 40px 40px,
                linear-gradient(90deg, transparent 97%, rgba(157, 78, 221, 0.05) 100%) 0 0 / 50px 50px;
            z-index: -1;
            opacity: 0.5;
            animation: wave 20s infinite linear;
        }

        @keyframes wave {
            0% { background-position: 0 0, 0 0, 0 0; }
            100% { background-position: 30px 30px, 40px 40px, 50px 50px; }
        }

        .container {
            width: 90%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        header {
            background: rgba(15, 25, 35, 0.9);
            padding: 15px 0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            position: sticky;
            top: 0;
            z-index: 1000;
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(0, 180, 216, 0.2);
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo h1 {
            color: var(--primary-color);
            font-size: 2.2rem;
            text-shadow: 0 0 10px rgba(0, 180, 216, 0.5);
            font-weight: 700;
            letter-spacing: 1px;
            white-space: nowrap;
        }

        .logo a {
            text-decoration: none;
            color: inherit;
        }

        nav {
            flex-grow: 1;
            display: flex;
            justify-content: center;
        }

        nav ul {
            display: flex;
            list-style: none;
        }

        nav li {
            position: relative;
            margin: 0 15px;
        }

        nav a {
            color: var(--text-color);
            text-decoration: none;
            font-weight: 600;
            padding: 10px 15px;
            border-radius: 5px;
            transition: all 0.3s ease;
            display: block;
            position: relative;
            overflow: hidden;
            white-space: nowrap;
        }

        nav a::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--primary-color);
            transition: width 0.3s ease;
        }

        nav a:hover, nav a:focus {
            color: var(--primary-color);
            outline: none;
        }

        nav a:hover::before, nav a:focus::before {
            width: 100%;
        }

        .dropdown-content {
            display: none;
            position: absolute;
            background-color: rgba(15, 25, 35, 0.95);
            min-width: 200px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
            border-radius: 5px;
            z-index: 1;
            padding: 10px 0;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 180, 216, 0.2);
        }

        .dropdown:hover .dropdown-content,
        .dropdown:focus-within .dropdown-content {
            display: block;
        }

        .login-section {
            display: flex;
            align-items: center;
            white-space: nowrap;
        }

        .login-form {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .login-form input {
            padding: 10px 15px;
            border: 1px solid rgba(0, 180, 216, 0.3);
            border-radius: 4px;
            background-color: rgba(26, 42, 56, 0.7);
            color: var(--text-color);
            transition: all 0.3s ease;
            min-width: 150px;
        }

        .login-form input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 5px rgba(0, 180, 216, 0.5);
        }

        .login-form button, .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            color: var(--background-color);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            position: relative;
            overflow: hidden;
        }

        .login-form button:hover, .btn:hover,
        .login-form button:focus, .btn:focus {
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(0, 0, 0, 0.4);
        }

        .login-form button::after, .btn::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .login-form button:hover::after, .btn:hover::after {
            left: 100%;
        }

        .btn-secondary {
            background: linear-gradient(135deg, var(--secondary-light), #2a3f54);
            color: var(--text-color);
        }

        .btn-success {
            background: linear-gradient(135deg, var(--success-color), #3d8b40);
        }

        .btn-warning {
            background: linear-gradient(135deg, var(--warning-color), #cc7a00);
        }

        .btn-error {
            background: linear-gradient(135deg, var(--error-color), #c13535);
        }

        .user-menu {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: var(--background-color);
        }

        .user-name {
            font-weight: 600;
            color: var(--primary-color);
        }

        main {
            min-height: calc(100vh - 200px);
            padding: 40px 0;
        }

        .welcome-section {
            background: rgba(15, 25, 35, 0.7);
            padding: 40px;
            border-radius: 10px;
            margin-bottom: 40px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(0, 180, 216, 0.2);
            position: relative;
            overflow: hidden;
        }

        .welcome-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
        }

        .welcome-section h2 {
            color: var(--primary-color);
            margin-bottom: 20px;
            font-size: 2rem;
            text-shadow: 0 0 5px rgba(0, 180, 216, 0.3);
        }

        .welcome-section p {
            margin-bottom: 15px;
            font-size: 1.1rem;
        }

        .tabs {
            display: none;
            background: rgba(15, 25, 35, 0.7);
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 40px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
            animation: fadeIn 0.5s ease;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(0, 180, 216, 0.2);
            position: relative;
            overflow: hidden;
        }

        .tabs::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .tabs.active {
            display: block;
        }

        .tabs h2 {
            color: var(--primary-color);
            margin-bottom: 20px;
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 10px;
            text-shadow: 0 0 5px rgba(0, 180, 216, 0.3);
        }

        .tabs h3 {
            color: var(--primary-color);
            margin: 20px 0 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: rgba(26, 42, 56, 0.7);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid rgba(0, 180, 216, 0.2);
        }

        th {
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            color: var(--background-color);
            font-weight: 600;
        }

        tr:hover {
            background-color: rgba(0, 180, 216, 0.1);
        }

        .form-container {
            background: rgba(15, 25, 35, 0.7);
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 40px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(0, 180, 216, 0.2);
            position: relative;
            overflow: hidden;
        }

        .form-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--primary-color);
        }

        .form-group input, .form-group select, .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid rgba(0, 180, 216, 0.3);
            border-radius: 5px;
            background-color: rgba(26, 42, 56, 0.7);
            color: var(--text-color);
            transition: all 0.3s ease;
        }

        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 5px rgba(0, 180, 216, 0.5);
        }

        .error-message {
            color: var(--error-color);
            font-size: 0.9rem;
            margin-top: 5px;
            display: none;
        }

        .alert {
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            display: none;
            border-left: 4px solid;
        }

        .alert-success {
            background-color: rgba(76, 175, 80, 0.2);
            border-left-color: var(--success-color);
            color: var(--success-color);
        }

        .alert-error {
            background-color: rgba(244, 67, 54, 0.2);
            border-left-color: var(--error-color);
            color: var(--error-color);
        }

        .alert-warning {
            background-color: rgba(255, 152, 0, 0.2);
            border-left-color: var(--warning-color);
            color: var(--warning-color);
        }

        footer {
            background: rgba(15, 25, 35, 0.9);
            padding: 30px 0;
            border-top: 1px solid rgba(0, 180, 216, 0.2);
            backdrop-filter: blur(10px);
        }

        .footer-content {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
        }

        .footer-section {
            flex: 1;
            min-width: 250px;
            margin-bottom: 20px;
        }

        .footer-section h3 {
            color: var(--primary-color);
            margin-bottom: 15px;
            font-size: 1.2rem;
        }

        .footer-section p {
            margin-bottom: 8px;
        }

        .footer-bottom {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(0, 180, 216, 0.2);
        }

        @media (max-width: 992px) {
            .header-content {
                flex-direction: column;
                gap: 15px;
            }
            
            nav {
                order: 2;
                width: 100%;
            }
            
            .login-section {
                order: 3;
                width: 100%;
                justify-content: center;
            }
        }

        @media (max-width: 768px) {
            nav ul {
                flex-direction: column;
                width: 100%;
                margin: 15px 0;
            }

            nav li {
                margin: 5px 0;
            }

            .dropdown-content {
                position: static;
                box-shadow: none;
                width: 100%;
            }

            .login-form {
                flex-direction: column;
                width: 100%;
            }

            .login-form input, .login-form button {
                width: 100%;
                margin: 5px 0;
            }

            .welcome-section, .tabs, .form-container {
                padding: 20px;
            }

            .footer-content {
                flex-direction: column;
            }

            .user-menu {
                flex-direction: column;
                width: 100%;
            }
        }

        @media (max-width: 480px) {
            .container {
                width: 95%;
                padding: 10px;
            }

            .logo h1 {
                font-size: 1.8rem;
            }
        }

        .game-selector {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }

        .club-benefits {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }

        .benefit-card {
            background: rgba(26, 42, 56, 0.7);
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid var(--primary-color);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            transition: transform 0.3s ease;
        }

        .benefit-card:hover {
            transform: translateY(-5px);
        }

        .benefit-card h4 {
            color: var(--primary-color);
            margin-bottom: 10px;
        }

        .admin-section {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(0, 180, 216, 0.2);
        }

        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 4px solid var(--primary-color);
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
            display: none;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .division-diamond {
            color: var(--diamond-color);
            font-weight: bold;
            text-shadow: 0 0 5px rgba(185, 242, 255, 0.5);
        }

        .division-gold {
            color: var(--gold-color);
            font-weight: bold;
            text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
        }

        .division-silver {
            color: var(--silver-color);
            font-weight: bold;
            text-shadow: 0 0 5px rgba(192, 192, 192, 0.5);
        }

        .division-bronze {
            color: var(--bronze-color);
            font-weight: bold;
            text-shadow: 0 0 5px rgba(205, 127, 50, 0.5);
        }

        .profile-header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
        }

        .profile-avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            color: var(--background-color);
            margin-right: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .profile-info h2 {
            color: var(--primary-color);
            margin-bottom: 5px;
            text-shadow: 0 0 5px rgba(0, 180, 216, 0.3);
        }

        .profile-badge {
            display: inline-block;
            padding: 3px 8px;
            background: linear-gradient(135deg, var(--accent-color), #d91e5a);
            color: white;
            border-radius: 4px;
            font-size: 0.8rem;
            margin-left: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .profile-details {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
        }

        .profile-card {
            background: rgba(26, 42, 56, 0.7);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(0, 180, 216, 0.2);
        }

        .profile-card h3 {
            color: var(--primary-color);
            margin-bottom: 15px;
            border-bottom: 1px solid rgba(0, 180, 216, 0.2);
            padding-bottom: 10px;
        }

        .division-tabs {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(0, 180, 216, 0.2);
        }

        .division-tab {
            padding: 10px 20px;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            transition: all 0.3s ease;
            font-weight: 600;
        }

        .division-tab.active {
            border-bottom: 3px solid var(--primary-color);
            color: var(--primary-color);
        }

        .division-content {
            display: none;
        }

        .division-content.active {
            display: block;
        }

        .league-badge {
            display: inline-block;
            padding: 5px 10px;
            background: linear-gradient(135deg, var(--primary-dark), #0077a3);
            color: white;
            border-radius: 4px;
            margin-right: 5px;
            margin-bottom: 5px;
            font-size: 0.9rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <h1><a href="#" onclick="showTab('welcome')">Tecno Arena</a></h1>
                </div>
                <nav>
                    <ul>
                        <li><a href="#" onclick="showTab('welcome')">Inicio</a></li>
                        <li class="dropdown">
                            <a href="#" tabindex="0">Club Tecno Arena</a>
                            <div class="dropdown-content">
                                <a href="#" onclick="showTab('club-info')">Información</a>
                            </div>
                        </li>
                        <li class="dropdown">
                            <a href="#" tabindex="0">Liga Tecno Arena</a>
                            <div class="dropdown-content">
                                <a href="#" onclick="showTab('liga-info')">Información</a>
                                <a href="#" onclick="showTab('ranking')">Ranking de Divisiones</a>
                            </div>
                        </li>
                        <li class="dropdown">
                            <a href="#" tabindex="0">Eventos</a>
                            <div class="dropdown-content">
                                <a href="#" onclick="showTab('eventos-info')">Información</a>
                            </div>
                        </li>
                    </ul>
                </nav>
                <div class="login-section" id="login-section"></div>
            </div>
        </div>
    </header>

    <main>
        <div class="container">
            <div id="alert-container"></div>

            <section id="welcome" class="welcome-section">
                <h2>Bienvenido a Tecno Arena</h2>
                <p>En Tecno Arena nos dedicamos a crear la comunidad de gaming más vibrante y competitiva. Somos un espacio donde los jugadores pueden conectarse, competir y crecer juntos.</p>
                <p>Ofrecemos ligas competitivas, eventos especiales y un sistema de clubes exclusivos para nuestros miembros más dedicados.</p>
                <p>¡Únete a nuestra comunidad y lleva tu experiencia de gaming al siguiente nivel!</p>
            </section>

            <section id="club-info" class="tabs">
                <h2>Club Tecno Arena</h2>
                <p>Los Clubes de Tecno Arena ofrecen beneficios exclusivos para nuestros miembros más comprometidos. Disponemos de dos niveles de membresía:</p>
                
                <div class="club-benefits">
                    <div class="benefit-card">
                        <h3>Club VIP</h3>
                        <ul>
                            <li>Acceso prioritario a eventos</li>
                            <li>Descuentos en productos oficiales</li>
                            <li>Participación en torneos exclusivos</li>
                            <li>Soporte personalizado</li>
                            <li><strong>Costo: $20/mes</strong></li>
                        </ul>
                    </div>
                    
                    <div class="benefit-card">
                        <h3>Club Diamante</h3>
                        <ul>
                            <li>Todos los beneficios del Club VIP</li>
                            <li>Acceso anticipado a nuevos juegos</li>
                            <li>Entradas gratuitas a eventos especiales</li>
                            <li>Mentoría personalizada con jugadores profesionales</li>
                            <li>Invitaciones a meet & greets</li>
                            <li><strong>Costo: $50/mes</strong></li>
                        </ul>
                    </div>
                </div>
                
                <button class="btn" onclick="showTab('club-request')">Solicitar Membresía</button>
            </section>

            <section id="liga-info" class="tabs">
                <h2>Liga Tecno Arena</h2>
                <p>La Liga Tecno Arena es nuestra competencia principal, donde jugadores de todos los niveles pueden demostrar sus habilidades y ascender en las divisiones.</p>
                
                <h3>Sistema de Divisiones</h3>
                <p>Nuestra liga cuenta con 4 divisiones competitivas:</p>
                <ul>
                    <li><strong class="division-diamond">Diamante:</strong> Los mejores jugadores de la comunidad</li>
                    <li><strong class="division-gold">Oro:</strong> Jugadores experimentados con habilidades sólidas</li>
                    <li><strong class="division-silver">Plata:</strong> Jugadores intermedios en desarrollo</li>
                    <li><strong class="division-bronze">Bronce:</strong> Jugadores principiantes</li>
                </ul>
                
                <h3>Juegos Incluidos</h3>
                <p>Actualmente, nuestra liga incluye competencias en:</p>
                <ul>
                    <li>Tekken 8</li>
                    <li>Super Smash Bros. Ultimate</li>
                </ul>
                
                <h3>Cómo Participar</h3>
                <p>Para unirte a la liga, simplemente regístrate en nuestra plataforma y selecciona "Solicitar Unirse a Liga" en tu panel de control.</p>
            </section>

            <section id="ranking" class="tabs">
                <h2>Ranking de Divisiones</h2>
                
                <div class="game-selector">
                    <button class="btn" onclick="showGameRanking('tekken')">Tekken 8</button>
                    <button class="btn" onclick="showGameRanking('smash')">Super Smash Ultimate</button>
                </div>
                
                <div class="spinner" id="ranking-spinner"></div>
                
                <div id="tekken-ranking">
                    <h3>Tekken 8 - Ranking por División</h3>
                    
                    <div class="division-tabs">
                        <div class="division-tab active" onclick="showDivision('tekken', 'diamante')">Diamante</div>
                        <div class="division-tab" onclick="showDivision('tekken', 'oro')">Oro</div>
                        <div class="division-tab" onclick="showDivision('tekken', 'plata')">Plata</div>
                        <div class="division-tab" onclick="showDivision('tekken', 'bronce')">Bronce</div>
                    </div>
                    
                    <div id="tekken-diamante" class="division-content active">
                        <h4 class="division-diamond">División Diamante</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Posición</th>
                                    <th>Jugador</th>
                                    <th>Puntuación</th>
                                </tr>
                            </thead>
                            <tbody id="tekken-diamante-body"></tbody>
                        </table>
                    </div>
                    
                    <div id="tekken-oro" class="division-content">
                        <h4 class="division-gold">División Oro</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Posición</th>
                                    <th>Jugador</th>
                                    <th>Puntuación</th>
                                </tr>
                            </thead>
                            <tbody id="tekken-oro-body"></tbody>
                        </table>
                    </div>
                    
                    <div id="tekken-plata" class="division-content">
                        <h4 class="division-silver">División Plata</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Posición</th>
                                    <th>Jugador</th>
                                    <th>Puntuación</th>
                                </tr>
                            </thead>
                            <tbody id="tekken-plata-body"></tbody>
                        </table>
                    </div>
                    
                    <div id="tekken-bronce" class="division-content">
                        <h4 class="division-bronze">División Bronce</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Posición</th>
                                    <th>Jugador</th>
                                    <th>Puntuación</th>
                                </tr>
                            </thead>
                            <tbody id="tekken-bronce-body"></tbody>
                        </table>
                    </div>
                </div>
                
                <div id="smash-ranking" style="display: none;">
                    <h3>Super Smash Ultimate - Ranking por División</h3>
                    
                    <div class="division-tabs">
                        <div class="division-tab active" onclick="showDivision('smash', 'diamante')">Diamante</div>
                        <div class="division-tab" onclick="showDivision('smash', 'oro')">Oro</div>
                        <div class="division-tab" onclick="showDivision('smash', 'plata')">Plata</div>
                        <div class="division-tab" onclick="showDivision('smash', 'bronce')">Bronce</div>
                    </div>
                    
                    <div id="smash-diamante" class="division-content active">
                        <h4 class="division-diamond">División Diamante</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Posición</th>
                                    <th>Jugador</th>
                                    <th>Puntuación</th>
                                </tr>
                            </thead>
                            <tbody id="smash-diamante-body"></tbody>
                        </table>
                    </div>
                    
                    <div id="smash-oro" class="division-content">
                        <h4 class="division-gold">División Oro</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Posición</th>
                                    <th>Jugador</th>
                                    <th>Puntuación</th>
                                </tr>
                            </thead>
                            <tbody id="smash-oro-body"></tbody>
                        </table>
                    </div>
                    
                    <div id="smash-plata" class="division-content">
                        <h4 class="division-silver">División Plata</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Posición</th>
                                    <th>Jugador</th>
                                    <th>Puntuación</th>
                                </tr>
                            </thead>
                            <tbody id="smash-plata-body"></tbody>
                        </table>
                    </div>
                    
                    <div id="smash-bronce" class="division-content">
                        <h4 class="division-bronze">División Bronce</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Posición</th>
                                    <th>Jugador</th>
                                    <th>Puntuación</th>
                                </tr>
                            </thead>
                            <tbody id="smash-bronce-body"></tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section id="eventos-info" class="tabs">
                <h2>Eventos Tecno Arena</h2>
                <p>En Tecno Arena organizamos eventos regulares para nuestra comunidad, incluyendo:</p>
                
                <h3>Torneos Mensuales</h3>
                <p>Cada mes organizamos torneos oficiales con premios en efectivo y productos exclusivos.</p>
                
                <h3>Encuentros Comunitarios</h3>
                <p>Eventos sociales donde los miembros pueden conocerse, intercambiar estrategias y jugar de forma casual.</p>
                
                <h3>Clínicas de Entrenamiento</h3>
                <p>Sesiones dirigidas por jugadores profesionales para ayudar a los miembros a mejorar sus habilidades.</p>
                
                <h3>Próximos Eventos</h3>
                <ul>
                    <li><strong>Torneo de Primavera:</strong> 15 de Abril - Premio: $1000</li>
                    <li><strong>Clínica de Tekken 8:</strong> 22 de Abril - Impartida por "TheKing"</li>
                    <li><strong>Encuentro Comunitario:</strong> 29 de Abril - Zona de juegos libre</li>
                </ul>
            </section>

            <section id="register" class="tabs form-container">
                <h2>Registro de Usuario</h2>
                <form id="register-form">
                    <div class="form-group">
                        <label for="reg-username">Nombre de usuario:</label>
                        <input type="text" id="reg-username" required minlength="3" maxlength="20">
                        <div class="error-message" id="reg-username-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="reg-email">Correo electrónico:</label>
                        <input type="email" id="reg-email" required>
                        <div class="error-message" id="reg-email-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="reg-password">Contraseña:</label>
                        <input type="password" id="reg-password" required minlength="6">
                        <div class="error-message" id="reg-password-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="reg-confirm-password">Confirmar contraseña:</label>
                        <input type="password" id="reg-confirm-password" required>
                        <div class="error-message" id="reg-confirm-password-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="reg-age">Edad:</label>
                        <input type="number" id="reg-age" min="13" max="120" required>
                        <div class="error-message" id="reg-age-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="reg-gender">Sexo:</label>
                        <select id="reg-gender" required>
                            <option value="">Selecciona una opción</option>
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                            <option value="otro">Otro</option>
                            <option value="prefiero-no-decir">Prefiero no decir</option>
                        </select>
                        <div class="error-message" id="reg-gender-error"></div>
                    </div>
                    <button type="button" class="btn" onclick="registerUser()">Registrarse</button>
                </form>
            </section>

            <section id="user-profile" class="tabs">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <span id="profile-avatar-text">U</span>
                    </div>
                    <div class="profile-info">
                        <h2 id="profile-username">Usuario</h2>
                        <span id="profile-admin-badge" class="profile-badge" style="display: none;">Administrador</span>
                    </div>
                </div>
                
                <div class="profile-details">
                    <div class="profile-card">
                        <h3>Información Personal</h3>
                        <p><strong>Nombre de usuario:</strong> <span id="profile-display-username">-</span></p>
                        <p><strong>Correo electrónico:</strong> <span id="profile-email">-</span></p>
                        <p><strong>Edad:</strong> <span id="profile-age">-</span></p>
                        <p><strong>Sexo:</strong> <span id="profile-gender">-</span></p>
                    </div>
                    
                    <div class="profile-card">
                        <h3>Estado del Club</h3>
                        <p id="profile-club-status">No tienes membresía de club activa</p>
                    </div>
                    
                    <div class="profile-card">
                        <h3>Ligas y Divisiones</h3>
                        <div id="profile-leagues">
                            <p>No estás registrado en ninguna liga</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="user-panel" class="tabs form-container">
                <h2>Panel de Control</h2>
                <div class="form-group">
                    <label for="panel-username">Nombre de usuario:</label>
                    <input type="text" id="panel-username">
                    <div class="error-message" id="panel-username-error"></div>
                </div>
                <div class="form-group">
                    <label for="panel-email">Correo electrónico:</label>
                    <input type="email" id="panel-email">
                    <div class="error-message" id="panel-email-error"></div>
                </div>
                <div class="form-group">
                    <label for="panel-password">Nueva contraseña:</label>
                    <input type="password" id="panel-password" placeholder="Dejar en blanco para no cambiar">
                    <div class="error-message" id="panel-password-error"></div>
                </div>
                <div class="form-group">
                    <label for="panel-confirm-password">Confirmar nueva contraseña:</label>
                    <input type="password" id="panel-confirm-password" placeholder="Dejar en blanco para no cambiar">
                    <div class="error-message" id="panel-confirm-password-error"></div>
                </div>
                <button class="btn" onclick="updateUserInfo()">Actualizar Información</button>
                
                <div style="margin-top: 30px;">
                    <h3>Información de Liga</h3>
                    <p id="league-status">No estás registrado en ninguna liga</p>
                    <button class="btn" id="join-league-btn" onclick="showTab('league-request')">Solicitar Unirse a Liga</button>
                </div>
                
                <div style="margin-top: 30px;">
                    <h3>Estado del Club</h3>
                    <p id="club-status">No tienes membresía de club activa</p>
                    <button class="btn" onclick="showTab('club-request')">Solicitar Membresía</button>
                </div>
            </section>

            <section id="club-request" class="tabs form-container">
                <h2>Solicitud de Membresía de Club</h2>
                <div class="form-group">
                    <label for="club-type">Tipo de Club:</label>
                    <select id="club-type">
                        <option value="vip">Club VIP</option>
                        <option value="diamante">Club Diamante</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="club-message">Mensaje (opcional):</label>
                    <textarea id="club-message" rows="4" style="width: 100%; padding: 10px; border-radius: 5px; background-color: rgba(26, 42, 56, 0.7); color: var(--text-color); border: 1px solid rgba(0, 180, 216, 0.3);"></textarea>
                </div>
                <button class="btn" onclick="submitClubRequest()">Enviar Solicitud</button>
            </section>

            <section id="league-request" class="tabs form-container">
                <h2>Solicitud de Unión a Liga</h2>
                <div class="form-group">
                    <label for="league-type">Liga a la que deseas unirte:</label>
                    <select id="league-type">
                        <option value="tekken">Tekken 8</option>
                        <option value="smash">Super Smash Ultimate</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="league-message">Mensaje (opcional):</label>
                    <textarea id="league-message" rows="4" style="width: 100%; padding: 10px; border-radius: 5px; background-color: rgba(26, 42, 56, 0.7); color: var(--text-color); border: 1px solid rgba(0, 180, 216, 0.3);"></textarea>
                </div>
                <button class="btn" onclick="submitLeagueRequest()">Enviar Solicitud</button>
            </section>

            <section id="admin-panel" class="tabs form-container">
                <h2>Panel de Administrador</h2>
                
                <div class="admin-section">
                    <h3>Gestión de Usuarios</h3>
                    <div class="form-group">
                        <label for="admin-user">Seleccionar Usuario:</label>
                        <select id="admin-user"></select>
                    </div>
                    
                    <div class="form-group">
                        <label for="admin-division">Asignar División:</label>
                        <select id="admin-division">
                            <option value="diamante">Diamante</option>
                            <option value="oro">Oro</option>
                            <option value="plata">Plata</option>
                            <option value="bronce">Bronce</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="admin-score">Puntuación:</label>
                        <input type="number" id="admin-score" min="0">
                        <div class="error-message" id="admin-score-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="admin-game">Juego:</label>
                        <select id="admin-game">
                            <option value="tekken">Tekken 8</option>
                            <option value="smash">Super Smash Ultimate</option>
                        </select>
                    </div>
                    
                    <button class="btn" onclick="updateUserScore()">Actualizar Puntuación</button>
                    
                    <div style="margin-top: 20px;">
                        <button class="btn btn-warning" onclick="toggleAdminStatus()" id="toggle-admin-btn">Conceder Permisos de Admin</button>
                        <p class="small-text">Convierte a un usuario normal en administrador o viceversa</p>
                    </div>
                </div>
                
                <div class="admin-section">
                    <h3>Solicitudes de Club</h3>
                    <div id="club-requests-list"></div>
                </div>
                
                <div class="admin-section">
                    <h3>Solicitudes de Liga</h3>
                    <div id="league-requests-list"></div>
                </div>
                
                <div class="admin-section">
                    <h3>Acciones Rápidas</h3>
                    <button class="btn btn-warning" onclick="resetAllData()">Restablecer Todos los Datos</button>
                    <p class="small-text">Advertencia: Esta acción no se puede deshacer</p>
                </div>
            </section>
        </div>
    </main>

    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Tecno Arena</h3>
                    <p>La comunidad de gaming más vibrante y competitiva.</p>
                    <p>Conectamos jugadores, organizamos eventos y creamos experiencias únicas.</p>
                </div>
                
                <div class="footer-section">
                    <h3>Contacto</h3>
                    <p><strong>Instagram:</strong> @tecnoarena.pzo</p>
                    <p><strong>Teléfono:</strong> +58 424-9033619</p>
                    <p><strong>Correo:</strong> Tecnoarenasoporte01@gmail.com</p>
                </div>
                
                <div class="footer-section">
                    <h3>Enlaces Rápidos</h3>
                    <p><a href="#" onclick="showTab('welcome')" style="color: var(--text-color);">Inicio</a></p>
                    <p><a href="#" onclick="showTab('liga-info')" style="color: var(--text-color);">Ligas</a></p>
                    <p><a href="#" onclick="showTab('eventos-info')" style="color: var(--text-color);">Eventos</a></p>
                    <p><a href="#" onclick="showTab('club-info')" style="color: var(--text-color);">Clubes</a></p>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2023 Tecno Arena. Todos los derechos reservados.</p>
            </div>
        </div>
    </footer>

    <script>
        let currentUser = null;
        let users = [];
        let rankings = { 
            tekken: { diamante: [], oro: [], plata: [], bronce: [] },
            smash: { diamante: [], oro: [], plata: [], bronce: [] }
        };
        let clubRequests = [];
        let leagueRequests = [];

        document.addEventListener('DOMContentLoaded', function() {
            loadDataFromStorage();
            showTab('welcome');
            updateLoginUI();
            loadRankings();
            if (currentUser && currentUser.isAdmin) {
                loadAdminPanel();
            }
            setupFormValidation();
        });

        function loadDataFromStorage() {
            try {
                users = JSON.parse(localStorage.getItem('tecnoArenaUsers')) || [];
                rankings = JSON.parse(localStorage.getItem('tecnoArenaRankings')) || { 
                    tekken: { diamante: [], oro: [], plata: [], bronce: [] },
                    smash: { diamante: [], oro: [], plata: [], bronce: [] }
                };
                clubRequests = JSON.parse(localStorage.getItem('tecnoArenaClubRequests')) || [];
                leagueRequests = JSON.parse(localStorage.getItem('tecnoArenaLeagueRequests')) || [];
                
                const savedUser = localStorage.getItem('tecnoArenaCurrentUser');
                if (savedUser) {
                    currentUser = JSON.parse(savedUser);
                }
                
                if (users.length === 0) {
                    createDefaultAdmin();
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
                showAlert('Error al cargar los datos. Se utilizarán datos por defecto.', 'error');
                createDefaultAdmin();
            }
        }

        function saveDataToStorage() {
            try {
                localStorage.setItem('tecnoArenaUsers', JSON.stringify(users));
                localStorage.setItem('tecnoArenaRankings', JSON.stringify(rankings));
                localStorage.setItem('tecnoArenaClubRequests', JSON.stringify(clubRequests));
                localStorage.setItem('tecnoArenaLeagueRequests', JSON.stringify(leagueRequests));
                
                if (currentUser) {
                    localStorage.setItem('tecnoArenaCurrentUser', JSON.stringify(currentUser));
                }
            } catch (error) {
                console.error('Error al guardar datos:', error);
                showAlert('Error al guardar los datos.', 'error');
            }
        }

        function createDefaultAdmin() {
            const adminUser = {
                id: generateId(),
                username: 'admin',
                email: 'admin@tecnoarena.com',
                password: hashPassword('admin123'),
                age: 30,
                gender: 'masculino',
                isAdmin: true,
                leagues: [],
                clubMembership: null,
                createdAt: new Date().toISOString()
            };
            
            users.push(adminUser);
            saveDataToStorage();
        }

        function generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

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

        function showAlert(message, type = 'success') {
            const alertContainer = document.getElementById('alert-container');
            const alertId = 'alert-' + Date.now();
            
            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            alert.id = alertId;
            alert.textContent = message;
            alert.style.display = 'block';
            
            alertContainer.appendChild(alert);
            
            setTimeout(() => {
                const alertToRemove = document.getElementById(alertId);
                if (alertToRemove) {
                    alertToRemove.remove();
                }
            }, 5000);
        }

        function showTab(tabId) {
            // Ocultar todas las secciones con clase 'tabs'
            const tabs = document.querySelectorAll('.tabs');
            tabs.forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Ocultar la sección de bienvenida
            const welcomeSection = document.getElementById('welcome');
            if (welcomeSection) {
                welcomeSection.style.display = 'none';
            }
            
            // Mostrar la sección objetivo
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                // Si la sección objetivo es la de bienvenida, la mostramos
                if (tabId === 'welcome') {
                    welcomeSection.style.display = 'block';
                } else {
                    // Para las demás, usamos la clase 'active' (que las muestra)
                    targetTab.classList.add('active');
                }
                
                // Llamar a las funciones específicas de cada pestaña
                if (tabId === 'user-panel' && currentUser) {
                    updateUserPanel();
                } else if (tabId === 'user-profile' && currentUser) {
                    updateUserProfile();
                } else if (tabId === 'admin-panel' && currentUser && currentUser.isAdmin) {
                    loadAdminPanel();
                }
            }
        }

        function showGameRanking(game) {
            document.getElementById('ranking-spinner').style.display = 'block';
            
            setTimeout(() => {
                if (game === 'tekken') {
                    document.getElementById('tekken-ranking').style.display = 'block';
                    document.getElementById('smash-ranking').style.display = 'none';
                } else {
                    document.getElementById('tekken-ranking').style.display = 'none';
                    document.getElementById('smash-ranking').style.display = 'block';
                }
                document.getElementById('ranking-spinner').style.display = 'none';
                
                showDivision(game, 'diamante');
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
            });
            
            gameElement.querySelector(`.division-tab:nth-child(${getDivisionIndex(division)})`).classList.add('active');
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
            
            if (currentUser) {
                loginSection.innerHTML = `
                    <div class="user-menu">
                        <div class="user-info">
                            <div class="user-avatar">${currentUser.username.charAt(0).toUpperCase()}</div>
                            <span class="user-name">${currentUser.username}</span>
                        </div>
                        <button class="btn btn-secondary" onclick="showTab('user-profile')">Mi Perfil</button>
                        <button class="btn btn-secondary" onclick="showTab('user-panel')">Configuración</button>
                        ${currentUser.isAdmin ? '<button class="btn" onclick="showTab(\'admin-panel\')">Admin</button>' : ''}
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
            
            const user = users.find(u => u.username === username && u.password === hashPassword(password));
            
            if (user) {
                currentUser = user;
                saveDataToStorage();
                updateLoginUI();
                showAlert('Inicio de sesión exitoso', 'success');
                showTab('welcome');
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
            
            if (users.find(u => u.username === username)) {
                showAlert('El nombre de usuario ya está en uso', 'error');
                return;
            }
            
            if (users.find(u => u.email === email)) {
                showAlert('El correo electrónico ya está en uso', 'error');
                return;
            }
            
            const newUser = {
                id: generateId(),
                username,
                email,
                password: hashPassword(password),
                age,
                gender,
                isAdmin: false,
                leagues: [],
                clubMembership: null,
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            saveDataToStorage();
            
            showAlert('Registro exitoso. Ahora puedes iniciar sesión.', 'success');
            showTab('welcome');
            
            document.getElementById('register-form').reset();
        }

        function logout() {
            currentUser = null;
            localStorage.removeItem('tecnoArenaCurrentUser');
            updateLoginUI();
            showTab('welcome');
            showAlert('Sesión cerrada correctamente', 'success');
        }

        function updateUserPanel() {
            if (!currentUser) return;
            
            document.getElementById('panel-username').value = currentUser.username;
            document.getElementById('panel-email').value = currentUser.email;
            
            const leagueStatus = document.getElementById('league-status');
            const joinLeagueBtn = document.getElementById('join-league-btn');
            
            if (currentUser.leagues && currentUser.leagues.length > 0) {
                let leagueText = 'Estás registrado en: ';
                currentUser.leagues.forEach(league => {
                    leagueText += `${league.game} (${league.division}), `;
                });
                leagueStatus.textContent = leagueText.slice(0, -2);
                joinLeagueBtn.textContent = 'Solicitar Unirse a Otra Liga';
            } else {
                leagueStatus.textContent = 'No estás registrado en ninguna liga';
                joinLeagueBtn.textContent = 'Solicitar Unirse a Liga';
            }
            
            const clubStatus = document.getElementById('club-status');
            if (currentUser.clubMembership) {
                clubStatus.textContent = `Tienes membresía: ${currentUser.clubMembership === 'vip' ? 'Club VIP' : 'Club Diamante'}`;
            } else {
                clubStatus.textContent = 'No tienes membresía de club activa';
            }
        }

        function updateUserProfile() {
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
            if (!currentUser) return;
            
            if (!validateUserPanelForm()) {
                return;
            }
            
            const newUsername = document.getElementById('panel-username').value.trim();
            const newEmail = document.getElementById('panel-email').value.trim();
            const newPassword = document.getElementById('panel-password').value;
            
            if (newUsername !== currentUser.username && users.find(u => u.username === newUsername)) {
                showAlert('El nombre de usuario ya está en uso', 'error');
                return;
            }
            
            if (newEmail !== currentUser.email && users.find(u => u.email === newEmail)) {
                showAlert('El correo electrónico ya está en uso', 'error');
                return;
            }
            
            currentUser.username = newUsername;
            currentUser.email = newEmail;
            
            if (newPassword) {
                currentUser.password = hashPassword(newPassword);
            }
            
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
                saveDataToStorage();
            }
            
            showAlert('Información actualizada correctamente', 'success');
            updateLoginUI();
            updateUserProfile();
        }

        function submitClubRequest() {
            if (!currentUser) {
                showAlert('Debes iniciar sesión para solicitar una membresía de club', 'error');
                return;
            }
            
            const clubType = document.getElementById('club-type').value;
            const message = document.getElementById('club-message').value;
            
            const request = {
                id: generateId(),
                username: currentUser.username,
                userId: currentUser.id,
                clubType,
                message,
                status: 'pending',
                date: new Date().toLocaleDateString(),
                createdAt: new Date().toISOString()
            };
            
            clubRequests.push(request);
            saveDataToStorage();
            
            showAlert('Solicitud enviada. Será revisada por un administrador.', 'success');
            showTab('user-panel');
        }

        function submitLeagueRequest() {
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
                id: generateId(),
                username: currentUser.username,
                userId: currentUser.id,
                game: leagueType,
                message,
                status: 'pending',
                date: new Date().toLocaleDateString(),
                createdAt: new Date().toISOString()
            };
            
            leagueRequests.push(request);
            saveDataToStorage();
            
            showAlert('Solicitud enviada. Será revisada por un administrador.', 'success');
            showTab('user-panel');
        }

        function loadRankings() {
            const games = ['tekken', 'smash'];
            const divisions = ['diamante', 'oro', 'plata', 'bronce'];
            
            games.forEach(game => {
                divisions.forEach(division => {
                    const tableBody = document.getElementById(`${game}-${division}-body`);
                    tableBody.innerHTML = '';
                    
                    if (rankings[game][division].length === 0) {
                        const row = document.createElement('tr');
                        row.innerHTML = `<td colspan="3" style="text-align: center;">No hay jugadores en esta división</td>`;
                        tableBody.appendChild(row);
                    } else {
                        rankings[game][division].sort((a, b) => b.score - a.score);
                        
                        rankings[game][division].forEach((player, index) => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${index + 1}</td>
                                <td>${player.username}</td>
                                <td>${player.score}</td>
                            `;
                            tableBody.appendChild(row);
                        });
                    }
                });
            });
        }

        function loadAdminPanel() {
            if (!currentUser || !currentUser.isAdmin) return;
            
            const adminUserSelect = document.getElementById('admin-user');
            adminUserSelect.innerHTML = '';
            
            const allUsers = users.filter(user => !user.isAdmin || user.id !== currentUser.id);
            
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
        }

        function updateAdminToggleButton() {
            const adminUserSelect = document.getElementById('admin-user');
            const selectedUserId = adminUserSelect.value;
            const selectedUser = users.find(u => u.id === selectedUserId);
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

        function toggleAdminStatus() {
            const userId = document.getElementById('admin-user').value;
            
            if (!userId || userId === '') {
                showAlert('Por favor selecciona un usuario', 'error');
                return;
            }
            
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex === -1) return;
            
            const user = users[userIndex];
            const newAdminStatus = !user.isAdmin;
            
            if (confirm(`¿Estás seguro de que quieres ${newAdminStatus ? 'conceder' : 'revocar'} permisos de administrador a ${user.username}?`)) {
                users[userIndex].isAdmin = newAdminStatus;
                saveDataToStorage();
                
                showAlert(`Permisos de administrador ${newAdminStatus ? 'concedidos' : 'revocados'} para ${user.username}`, 'success');
                
                if (currentUser && currentUser.id === userId) {
                    currentUser = users[userIndex];
                    saveDataToStorage();
                    updateLoginUI();
                    updateUserProfile();
                }
                
                loadAdminPanel();
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
            
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex === -1) return;
            
            const user = users[userIndex];
            const username = user.username;
            
            let userLeague = user.leagues ? user.leagues.find(l => l.game === game) : null;
            
            if (!userLeague) {
                showAlert(`El usuario ${username} no está registrado en la liga de ${game}`, 'error');
                return;
            }
            
            userLeague.division = division;
            
            users[userIndex] = user;
            saveDataToStorage();
            
            const divisions = ['diamante', 'oro', 'plata', 'bronce'];
            divisions.forEach(div => {
                rankings[game][div] = rankings[game][div].filter(p => p.username !== username);
            });
            
            rankings[game][division].push({
                username,
                score
            });
            
            saveDataToStorage();
            
            showAlert('Puntuación actualizada correctamente', 'success');
            loadRankings();
            
            if (currentUser && currentUser.id === userId) {
                currentUser = users[userIndex];
                saveDataToStorage();
                updateUserPanel();
                updateUserProfile();
            }
        }

        function loadClubRequests() {
            const requestsList = document.getElementById('club-requests-list');
            requestsList.innerHTML = '';
            
            const pendingRequests = clubRequests.filter(request => request.status === 'pending');
            
            if (pendingRequests.length === 0) {
                requestsList.innerHTML = '<p>No hay solicitudes de club pendientes</p>';
                return;
            }
            
            pendingRequests.forEach((request) => {
                const requestDiv = document.createElement('div');
                requestDiv.className = 'club-request';
                requestDiv.style.border = '1px solid rgba(0, 180, 216, 0.3)';
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

        function approveClubRequest(requestId) {
            const requestIndex = clubRequests.findIndex(r => r.id === requestId);
            if (requestIndex === -1) return;
            
            const request = clubRequests[requestIndex];
            request.status = 'approved';
            
            const userIndex = users.findIndex(u => u.id === request.userId);
            if (userIndex !== -1) {
                users[userIndex].clubMembership = request.clubType;
                saveDataToStorage();
            }
            
            saveDataToStorage();
            
            showAlert(`Solicitud de club de ${request.username} aprobada`, 'success');
            loadClubRequests();
        }

        function rejectClubRequest(requestId) {
            const requestIndex = clubRequests.findIndex(r => r.id === requestId);
            if (requestIndex === -1) return;
            
            const request = clubRequests[requestIndex];
            request.status = 'rejected';
            saveDataToStorage();
            
            showAlert(`Solicitud de club de ${request.username} rechazada`, 'success');
            loadClubRequests();
        }

        function loadLeagueRequests() {
            const requestsList = document.getElementById('league-requests-list');
            requestsList.innerHTML = '';
            
            const pendingRequests = leagueRequests.filter(request => request.status === 'pending');
            
            if (pendingRequests.length === 0) {
                requestsList.innerHTML = '<p>No hay solicitudes de liga pendientes</p>';
                return;
            }
            
            pendingRequests.forEach((request) => {
                const requestDiv = document.createElement('div');
                requestDiv.className = 'league-request';
                requestDiv.style.border = '1px solid rgba(0, 180, 216, 0.3)';
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

        function approveLeagueRequest(requestId) {
            const requestIndex = leagueRequests.findIndex(r => r.id === requestId);
            if (requestIndex === -1) return;
            
            const request = leagueRequests[requestIndex];
            request.status = 'approved';
            
            const userIndex = users.findIndex(u => u.id === request.userId);
            if (userIndex !== -1) {
                const user = users[userIndex];
                
                if (!user.leagues) {
                    user.leagues = [];
                }
                
                user.leagues.push({
                    game: request.game,
                    division: 'bronce'
                });
                
                rankings[request.game].bronce.push({
                    username: user.username,
                    score: 0
                });
                
                saveDataToStorage();
            }
            
            saveDataToStorage();
            
            showAlert(`Solicitud de liga de ${request.username} aprobada`, 'success');
            loadLeagueRequests();
            loadRankings();
        }

        function rejectLeagueRequest(requestId) {
            const requestIndex = leagueRequests.findIndex(r => r.id === requestId);
            if (requestIndex === -1) return;
            
            const request = leagueRequests[requestIndex];
            request.status = 'rejected';
            saveDataToStorage();
            
            showAlert(`Solicitud de liga de ${request.username} rechazada`, 'success');
            loadLeagueRequests();
        }

        function resetAllData() {
            if (!confirm('¿Estás seguro de que quieres restablecer todos los datos? Esta acción no se puede deshacer.')) {
                return;
            }
            
            users = [];
            rankings = { 
                tekken: { diamante: [], oro: [], plata: [], bronce: [] },
                smash: { diamante: [], oro: [], plata: [], bronce: [] }
            };
            clubRequests = [];
            leagueRequests = [];
            currentUser = null;
            
            localStorage.removeItem('tecnoArenaUsers');
            localStorage.removeItem('tecnoArenaRankings');
            localStorage.removeItem('tecnoArenaClubRequests');
            localStorage.removeItem('tecnoArenaLeagueRequests');
            localStorage.removeItem('tecnoArenaCurrentUser');
            
            createDefaultAdmin();
            updateLoginUI();
            loadRankings();
            
            showAlert('Todos los datos han sido restablecidos', 'success');
            showTab('welcome');
        }

        function setupFormValidation() {
            const regUsername = document.getElementById('reg-username');
            const regEmail = document.getElementById('reg-email');
            const regPassword = document.getElementById('reg-password');
            const regConfirmPassword = document.getElementById('reg-confirm-password');
            const regAge = document.getElementById('reg-age');
            const regGender = document.getElementById('reg-gender');
            
            if (regUsername) {
                regUsername.addEventListener('input', function() {
                    validateUsername(this.value, 'reg-username-error');
                });
            }
            
            if (regEmail) {
                regEmail.addEventListener('input', function() {
                    validateEmailField(this.value, 'reg-email-error');
                });
            }
            
            if (regPassword) {
                regPassword.addEventListener('input', function() {
                    validatePassword(this.value, 'reg-password-error');
                });
            }
            
            if (regConfirmPassword) {
                regConfirmPassword.addEventListener('input', function() {
                    validatePasswordMatch(regPassword.value, this.value, 'reg-confirm-password-error');
                });
            }
            
            if (regAge) {
                regAge.addEventListener('input', function() {
                    validateAge(this.value, 'reg-age-error');
                });
            }
            
            if (regGender) {
                regGender.addEventListener('change', function() {
                    validateGender(this.value, 'reg-gender-error');
                });
            }
            
            const adminUserSelect = document.getElementById('admin-user');
            if (adminUserSelect) {
                adminUserSelect.addEventListener('change', updateAdminToggleButton);
            }
        }

        function validateRegistrationForm() {
            const username = document.getElementById('reg-username').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;
            const age = document.getElementById('reg-age').value;
            const gender = document.getElementById('reg-gender').value;
            
            let isValid = true;
            
            if (!validateUsername(username, 'reg-username-error')) isValid = false;
            if (!validateEmailField(email, 'reg-email-error')) isValid = false;
            if (!validatePassword(password, 'reg-password-error')) isValid = false;
            if (!validatePasswordMatch(password, confirmPassword, 'reg-confirm-password-error')) isValid = false;
            if (!validateAge(age, 'reg-age-error')) isValid = false;
            if (!validateGender(gender, 'reg-gender-error')) isValid = false;
            
            return isValid;
        }

        function validateUserPanelForm() {
            const username = document.getElementById('panel-username').value.trim();
            const email = document.getElementById('panel-email').value.trim();
            const password = document.getElementById('panel-password').value;
            const confirmPassword = document.getElementById('panel-confirm-password').value;
            
            let isValid = true;
            
            if (username.length < 3) {
                showError('panel-username-error', 'El nombre de usuario debe tener al menos 3 caracteres');
                isValid = false;
            } else {
                hideError('panel-username-error');
            }
            
            if (!validateEmailField(email, 'panel-email-error')) isValid = false;
            
            if (password && password.length < 6) {
                showError('panel-password-error', 'La contraseña debe tener al menos 6 caracteres');
                isValid = false;
            } else {
                hideError('panel-password-error');
            }
            
            if (password && password !== confirmPassword) {
                showError('panel-confirm-password-error', 'Las contraseñas no coinciden');
                isValid = false;
            } else {
                hideError('panel-confirm-password-error');
            }
            
            return isValid;
        }

        function validateUsername(username, errorElementId) {
            if (username.length < 3) {
                showError(errorElementId, 'El nombre de usuario debe tener al menos 3 caracteres');
                return false;
            } else if (username.length > 20) {
                showError(errorElementId, 'El nombre de usuario no puede tener más de 20 caracteres');
                return false;
            } else {
                hideError(errorElementId);
                return true;
            }
        }

        function validateEmailField(email, errorElementId) {
            if (!validateEmail(email)) {
                showError(errorElementId, 'Por favor ingresa un correo electrónico válido');
                return false;
            } else {
                hideError(errorElementId);
                return true;
            }
        }

        function validatePassword(password, errorElementId) {
            if (password.length < 6) {
                showError(errorElementId, 'La contraseña debe tener al menos 6 caracteres');
                return false;
            } else {
                hideError(errorElementId);
                return true;
            }
        }

        function validatePasswordMatch(password, confirmPassword, errorElementId) {
            if (password !== confirmPassword) {
                showError(errorElementId, 'Las contraseñas no coinciden');
                return false;
            } else {
                hideError(errorElementId);
                return true;
            }
        }

        function validateAge(age, errorElementId) {
            const ageNum = parseInt(age);
            if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
                showError(errorElementId, 'La edad debe estar entre 13 y 120 años');
                return false;
            } else {
                hideError(errorElementId);
                return true;
            }
        }

        function validateGender(gender, errorElementId) {
            if (!gender) {
                showError(errorElementId, 'Por favor selecciona una opción');
                return false;
            } else {
                hideError(errorElementId);
                return true;
            }
        }

        function showError(elementId, message) {
            const errorElement = document.getElementById(elementId);
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
        }

        function hideError(elementId) {
            const errorElement = document.getElementById(elementId);
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }
    </script>
</body>
</html>
