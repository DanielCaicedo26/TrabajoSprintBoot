// Crea un archivo anti-consola.js e inclúyelo en todos tus HTML
(function() {
    // Variables para seguimiento
    let consoleIsOpen = false;
    let devtoolsAttempts = 0;
    const maxAttempts =1;
    
    // Función para redirigir o bloquear la página
    const blockPage = () => {
        document.body.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        background-color: #f44336; color: white; display: flex; 
                        flex-direction: column; justify-content: center; align-items: center; 
                        font-family: Arial, sans-serif; z-index: 9999;">
                <h1>Acceso Bloqueado</h1>
                <p>Se ha detectado un intento de manipulación de la página.</p>
                <p>Por motivos de seguridad, esta sesión ha sido terminada.</p>
                <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; 
                          background-color: white; color: #f44336; border: none; 
                          border-radius: 4px; cursor: pointer;">
                    Reiniciar
                </button>
            </div>
        `;
    };

    // 1. Deshabilitar atajos de teclado comunes
    window.addEventListener('keydown', function(event) {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
        if (
            event.keyCode === 123 || 
            (event.ctrlKey && event.shiftKey && (event.keyCode === 73 || event.keyCode === 74 || event.keyCode === 67))
        ) {
            event.preventDefault();
            devtoolsAttempts++;
            if (devtoolsAttempts >= maxAttempts) {
                blockPage();
            }
            return false;
        }
        
        // Ctrl+S y Ctrl+U (guardar página y ver código fuente)
        if ((event.ctrlKey && event.keyCode === 83) || (event.ctrlKey && event.keyCode === 85)) {
            event.preventDefault();
            return false;
        }
    });

    // 2. Deshabilitar menú contextual (click derecho)
    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
        return false;
    });

    // 3. Detectar apertura de consola mediante cambio de tamaño
    const detectDevTools = () => {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
            if (!consoleIsOpen) {
                consoleIsOpen = true;
                devtoolsAttempts++;
                console.clear();
                console.log("%cSistema de seguridad activado", "color:red; font-size:60px; font-weight: bold");
                console.log("%cEsta acción ha sido registrada", "color:black; font-size:20px;");
                
                if (devtoolsAttempts >= maxAttempts) {
                    blockPage();
                }
            }
        } else {
            consoleIsOpen = false;
        }
    };

    // 4. Detección de consola mediante timing
    const checkConsoleOpen = () => {
        const startTime = performance.now();
        
        // La siguiente línea se ejecuta mucho más lento cuando la consola está abierta
        console.log("%c", "font-size:100px; padding: 100px");
        console.clear();
        
        const endTime = performance.now();
        const timeDiff = endTime - startTime;
        
        if (timeDiff > 100) { // Un umbral que puede necesitar ajuste
            if (!consoleIsOpen) {
                consoleIsOpen = true;
                devtoolsAttempts++;
                if (devtoolsAttempts >= maxAttempts) {
                    blockPage();
                }
            }
        } else {
            consoleIsOpen = false;
        }
    };

    // 5. Sobreescribir funciones de consola
    const overrideConsole = () => {
        const originalConsole = { ...console };
        
        // Sobreescribir funciones de consola
        console.log = console.info = console.warn = console.error = function() {
            devtoolsAttempts++;
            if (devtoolsAttempts >= maxAttempts) {
                blockPage();
                return;
            }
            console.clear();
            originalConsole.log("%cAcceso denegado", "color:red; font-size:30px; font-weight: bold");
        };
        
        // Devolver errores manipulados para disuadir debugging
        Object.defineProperty(window, 'onerror', {
            get: function() {
                devtoolsAttempts++;
                if (devtoolsAttempts >= maxAttempts) {
                    blockPage();
                }
                return null;
            },
            set: function() {}
        });
    };

    // 6. Protección contra acceso a fuentes
    const protectSources = () => {
        // Anular la capacidad de copiar y seleccionar
        document.oncopy = () => false;
        document.onselectstart = () => false;
        
        // Obscurecer elementos
        document.querySelectorAll('*').forEach(el => {
            el.style.userSelect = 'none';
        });
    };

    // 7. Verificación continua
    const continuousCheck = () => {
        detectDevTools();
        checkConsoleOpen();
        
        setTimeout(continuousCheck, 1000);
    };

    // Inicialización
    overrideConsole();
    protectSources();
    continuousCheck();
    
    // Mensaje persistente ante intentos de manipulación
    setInterval(function() {
        if (devtoolsAttempts > 0) {
            console.clear();
            console.log("%cSISTEMA DE SEGURIDAD ACTIVADO", "color:red; font-size:30px; font-weight: bold");
        }
    }, 500);
    
    // Almacenamiento de seguridad para detectar recargas
    if (sessionStorage.getItem('devtoolsAttempts')) {
        devtoolsAttempts = parseInt(sessionStorage.getItem('devtoolsAttempts'));
        if (devtoolsAttempts >= maxAttempts) {
            blockPage();
        }
    }
    
    window.addEventListener('beforeunload', function() {
        sessionStorage.setItem('devtoolsAttempts', devtoolsAttempts);
    });
})();