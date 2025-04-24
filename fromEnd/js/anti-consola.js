// Crea un archivo anti-consola.js e inclúyelo en todos tus HTML
(function() {
    // Esperar a que el DOM esté completamente cargado
    document.addEventListener('DOMContentLoaded', function() {
        initSecuritySystem();
        addSimpleDeleteConfirmation();
    });

    // Si el DOM ya está cargado, inicializar inmediatamente
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initSecuritySystem();
        addSimpleDeleteConfirmation();
    }

    // Función simple para agregar confirmación a botones de borrado
    function addSimpleDeleteConfirmation() {
        try {
            // Buscar modales en el documento
            const findModals = () => {
                const modalSelectors = [
                    '.modal', '.modal-content', '.modal-body', '.modal-dialog',
                    '[role="dialog"]', '[aria-modal="true"]', '.ui-dialog', '.popup',
                    '.lightbox', '.overlay', '[data-modal="true"]', '[data-type="modal"]'
                ];
                
                const modals = [];
                modalSelectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(modal => {
                        if (!modals.includes(modal)) {
                            modals.push(modal);
                        }
                    });
                });
                
                return modals;
            };
            
            // Buscar botones de borrado dentro de los modales
            const findDeleteButtons = (modals) => {
                const deleteButtons = [];
                
                modals.forEach(modal => {
                    // Buscar por texto o clase
                    const buttons = modal.querySelectorAll('button, a, input[type="submit"], input[type="button"]');
                    
                    buttons.forEach(button => {
                        // Verificar si es un botón de borrado
                        const buttonText = button.innerText ? button.innerText.toLowerCase() : '';
                        const buttonValue = button.value ? button.value.toLowerCase() : '';
                        
                        if (
                            // Por texto
                            buttonText.includes('eliminar') || 
                            buttonText.includes('borrar') ||
                            buttonText.includes('delete') ||
                            buttonText.includes('remove') ||
                            buttonValue.includes('eliminar') ||
                            buttonValue.includes('borrar') ||
                            buttonValue.includes('delete') ||
                            buttonValue.includes('remove') ||
                            // Por clase
                            button.classList.contains('delete-btn') ||
                            button.classList.contains('btn-delete') ||
                            button.classList.contains('remove-item') ||
                            // Por atributo
                            button.getAttribute('data-action') === 'delete' ||
                            button.getAttribute('data-type') === 'delete'
                        ) {
                            // Asegurarse de no duplicar
                            if (!deleteButtons.includes(button)) {
                                deleteButtons.push(button);
                            }
                        }
                    });
                });
                
                return deleteButtons;
            };
            
            // Aplicar la confirmación a los botones encontrados
            const applyConfirmation = () => {
                const modals = findModals();
                const deleteButtons = findDeleteButtons(modals);
                
                deleteButtons.forEach(button => {
                    // Verificar si ya aplicamos confirmación
                    if (button.getAttribute('data-has-confirmation') === 'true') {
                        return;
                    }
                    
                    // Guardar el handler de clic original
                    const originalClickHandler = button.onclick;
                    
                    // Agregar nuestro handler
                    button.onclick = function(event) {
                        // Mensaje de confirmación simple
                        const isConfirmed = window.confirm('¿Está seguro que desea eliminar este elemento? Esta acción no se puede deshacer.');
                        
                        if (isConfirmed) {
                            // Si se confirma, ejecutar el handler original si existe
                            if (originalClickHandler) {
                                return originalClickHandler.call(this, event);
                            }
                            // Si no hay handler original, permitir la acción predeterminada
                            return true;
                        } else {
                            // Si no se confirma, prevenir la acción
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                    };
                    
                    // Marcar como procesado
                    button.setAttribute('data-has-confirmation', 'true');
                });
            };
            
            // Aplicar la confirmación inicial
            applyConfirmation();
            
            // Verificar periódicamente para nuevos botones (modales cargados dinámicamente)
            setInterval(applyConfirmation, 2000);
            
        } catch (error) {
            console.error('Error al aplicar confirmación:', error);
        }
    }

    function initSecuritySystem() {
        // Variables para seguimiento
        let consoleIsOpen = false;
        let devtoolsAttempts = 0;
        const maxAttempts = 20;
        
        // Resetear los intentos almacenados
        if (sessionStorage) {
            sessionStorage.removeItem('devtoolsAttempts');
        }
        
        // Función para bloquear la página
        const blockPage = () => {
            if (document && document.body) {
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
            }
        };

        // Detección de teclas de desarrollo
        window.addEventListener('keydown', function(event) {
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
            
            // Proteger contra guardar y ver fuente
            if ((event.ctrlKey && event.keyCode === 83) || (event.ctrlKey && event.keyCode === 85)) {
                event.preventDefault();
                return false;
            }
        });

        // Deshabilitar menú contextual (con excepción para campos de texto)
        document.addEventListener('contextmenu', function(event) {
            // Permitir clic derecho en campos de texto y área de texto
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return true;
            }
            
            event.preventDefault();
            return false;
        });

        // Detectar apertura de consola mediante cambio de tamaño
        const detectDevTools = () => {
            try {
                const threshold = 180;
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
            } catch (error) {
                // Manejar silenciosamente cualquier error
            }
        };

        // Detección de consola mediante timing
        const checkConsoleOpen = () => {
            try {
                const startTime = performance.now();
                console.log("%c", "font-size:100px; padding: 100px");
                console.clear();
                const endTime = performance.now();
                const timeDiff = endTime - startTime;
                
                if (timeDiff > 200) {
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
            } catch (error) {
                // Manejar silenciosamente cualquier error
            }
        };

        // Sobreescribir funciones de consola (versión modificada para permitir inputs)
        const overrideConsole = () => {
            try {
                const originalConsole = { ...console };
                let isOverrideInitiated = false;
                
                console.log = console.info = console.warn = console.error = function(...args) {
                    // No contar como intento si es un log interno o de la aplicación
                    if (!isOverrideInitiated && args.length > 0 && typeof args[0] === 'string' && 
                        !args[0].includes('anti-consola') && !args[0].startsWith('%c')) {
                        return originalConsole.log(...args);
                    }
                    
                    if (isOverrideInitiated) {
                        devtoolsAttempts++;
                        if (devtoolsAttempts >= maxAttempts) {
                            blockPage();
                            return;
                        }
                        console.clear();
                        originalConsole.log("%cAcceso denegado", "color:red; font-size:30px; font-weight: bold");
                    } else {
                        isOverrideInitiated = true;
                        const result = originalConsole.log(...args);
                        isOverrideInitiated = false;
                        return result;
                    }
                };
                
                // Manipular onerror con menos agresividad
                let errorHandlerCalled = false;
                Object.defineProperty(window, 'onerror', {
                    get: function() {
                        if (!errorHandlerCalled) {
                            errorHandlerCalled = true;
                            return null;
                        }
                        devtoolsAttempts++;
                        if (devtoolsAttempts >= maxAttempts) {
                            blockPage();
                        }
                        return null;
                    },
                    set: function() {}
                });
            } catch (error) {
                // Manejar silenciosamente cualquier error
            }
        };

        // Protección contra acceso a fuentes - MODIFICADA para permitir inputs
        const protectSources = () => {
            try {
                // Permitir escritura en campos de texto específicos
                const allowInputsSelector = 'input, textarea, [contenteditable="true"]';
                
                // Anular la capacidad de copiar y seleccionar, con excepciones
                document.oncopy = function(e) {
                    // Permitir copia en campos de entrada
                    if (e.target.matches(allowInputsSelector)) {
                        return true;
                    }
                    return false;
                };
                
                document.onselectstart = function(e) {
                    // Permitir selección en campos de entrada
                    if (e.target.matches(allowInputsSelector)) {
                        return true;
                    }
                    return false;
                };
                
                // Aplicar protección selectiva
                if (document && document.body) {
                    // Aplicar solo al cuerpo principal, excepto inputs
                    document.body.style.userSelect = 'none';
                    
                    // Restaurar la capacidad de selección en inputs
                    document.querySelectorAll(allowInputsSelector).forEach(el => {
                        if (el && el.style) {
                            el.style.userSelect = 'text';
                            el.style.webkitUserSelect = 'text';
                            el.style.mozUserSelect = 'text';
                            el.style.msUserSelect = 'text';
                        }
                    });
                }
            } catch (error) {
                // Manejar silenciosamente cualquier error
            }
        };

        // Verificación continua
        const continuousCheck = () => {
            try {
                detectDevTools();
                setTimeout(() => {
                    checkConsoleOpen();
                    setTimeout(continuousCheck, 2000);
                }, 1000);
            } catch (error) {
                // Manejar silenciosamente cualquier error y reintentar
                setTimeout(continuousCheck, 3000);
            }
        };

        // Inicialización segura
        try {
            // Retraso inicial para permitir que la página se cargue completamente
            setTimeout(() => {
                overrideConsole();
                protectSources();
                
                // Retrasar la verificación continua
                setTimeout(continuousCheck, 2000);
                
                // Mensaje persistente ante intentos de manipulación
                setInterval(function() {
                    if (devtoolsAttempts > 5) {
                        console.clear();
                        console.log("%cSISTEMA DE SEGURIDAD ACTIVADO", "color:red; font-size:30px; font-weight: bold");
                    }
                }, 1000);
                
                // Almacenamiento de seguridad para detectar recargas
                window.addEventListener('beforeunload', function() {
                    if (sessionStorage && devtoolsAttempts > 5) {
                        sessionStorage.setItem('devtoolsAttempts', devtoolsAttempts);
                    }
                });
            }, 1500);
            
        } catch (error) {
            // Manejar silenciosamente cualquier error de inicialización
        }
    }
})();