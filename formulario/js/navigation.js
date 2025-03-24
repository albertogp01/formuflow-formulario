function showQuestion(num) {
    if (navigationInProgress) return;
    navigationInProgress = true;
    
    console.log('Navegando a pregunta:', num);
    
    const totalPages = 4; // Total de páginas en el formulario
    
    if (num < 1 || num > totalPages) {
        console.log('Número de pregunta inválido:', num);
        navigationInProgress = false;
        return;
    }
    
    const prev = currentQuestion;
    currentQuestion = num;
    
    // Actualizar botones de navegación
    const navPrev = document.querySelector('.nav-prev');
    const navNext = document.querySelector('.nav-next');
    
    if (navPrev && navNext) {
        navPrev.classList.toggle('disabled', num <= 1);
        navNext.classList.toggle('disabled', num >= totalPages);
    } else {
        console.warn('Elementos de navegación no encontrados');
    }
    
    // Actualizar indicadores de pasos
    document.querySelectorAll('.progress-step').forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        step.classList.remove('active', 'completed');
        
        if (stepNum === num) {
            step.classList.add('active');
        } else if (stepNum < num) {
            step.classList.add('completed');
        }
    });
    
    // Importante: Primero volvemos al inicio de la página ANTES de cualquier transición
    // Esto garantiza que el usuario vea la nueva sección desde arriba
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Transición entre preguntas
    if (prev > 0) {
        const prevEl = document.querySelector(`[data-question="${prev}"]`);
        const nextEl = document.querySelector(`[data-question="${num}"]`);
        
        if (!prevEl || !nextEl) {
            console.error('No se encontraron los contenedores de preguntas:', prev, num);
            navigationInProgress = false;
            return;
        }
        
        if (prev < num) {
            // Transición a la derecha
            prevEl.classList.remove('animate-out-right', 'animate-in-left', 'animate-in-right');
            nextEl.classList.remove('animate-out-left', 'animate-in-left', 'animate-in-right');
            prevEl.classList.add('animate-out-left');
            
            setTimeout(() => {
                prevEl.classList.remove('active', 'animate-out-left');
                nextEl.classList.add('active', 'animate-in-right');
                
                // Asegurar que estamos al inicio de la página después de la transición también
                window.scrollTo({
                    top: 0,
                    behavior: 'auto'
                });
                
                setTimeout(() => {
                    nextEl.classList.remove('animate-in-right');
                    navigationInProgress = false;
                }, 500);
            }, 450);
        } else {
            // Transición a la izquierda
            prevEl.classList.remove('animate-out-left', 'animate-in-left', 'animate-in-right');
            nextEl.classList.remove('animate-out-right', 'animate-in-left', 'animate-in-right');
            prevEl.classList.add('animate-out-right');
            
            setTimeout(() => {
                prevEl.classList.remove('active', 'animate-out-right');
                nextEl.classList.add('active', 'animate-in-left');
                
                // Asegurar que estamos al inicio de la página después de la transición también
                window.scrollTo({
                    top: 0,
                    behavior: 'auto'
                });
                
                setTimeout(() => {
                    nextEl.classList.remove('animate-in-left');
                    navigationInProgress = false;
                }, 500);
            }, 450);
        }
    } else {
        // Primera carga
        const activeEl = document.querySelector(`[data-question="${num}"]`);
        if (activeEl) {
            activeEl.classList.add('active');
        } else {
            console.error('No se encontró el contenedor de la pregunta:', num);
        }
        navigationInProgress = false;
    }
    
    // Actualizar barra de progreso
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        let progressPercentage = 0;
        if (num > 1) {
            progressPercentage = ((num - 1) / (totalPages - 1)) * 100;
        }
        progressBar.style.width = `${progressPercentage}%`;
    } else {
        console.warn('Barra de progreso no encontrada');
    }
}

// Configurar eventos para los botones de navegación
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando navegación...');
    
    // Detectar si es un dispositivo móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('¿Dispositivo móvil detectado?', isMobile ? 'Sí' : 'No');
    
    // Configuración para dispositivos móviles
    if (isMobile) {
        console.log('Aplicando configuración específica para móviles');
        
        // Función para configurar eventos táctiles
        const setupTouchEvents = () => {
            // 1. Opciones de radio con eventos táctiles
            document.querySelectorAll('.radio-option').forEach(option => {
                // Eliminar y volver a crear para evitar múltiples listeners
                option.removeEventListener('touchend', handleRadioTouch);
                option.addEventListener('touchend', handleRadioTouch);
            });
            
            // 2. Opciones de checkbox con eventos táctiles
            document.querySelectorAll('.checkbox-option').forEach(option => {
                option.removeEventListener('touchend', handleCheckboxTouch);
                option.addEventListener('touchend', handleCheckboxTouch);
            });
            
            // 3. Opciones regulares con eventos táctiles
            document.querySelectorAll('.option-item').forEach(option => {
                option.removeEventListener('touchend', handleOptionTouch);
                option.addEventListener('touchend', handleOptionTouch);
            });
            
            // 4. Botones con eventos táctiles
            document.querySelectorAll('.button-continue, .button-back, .button-submit').forEach(btn => {
                btn.removeEventListener('touchend', handleButtonTouch);
                btn.addEventListener('touchend', handleButtonTouch);
            });
            
            // 5. Flechas de navegación con eventos táctiles
            document.querySelectorAll('.nav-prev, .nav-next').forEach(arrow => {
                arrow.removeEventListener('touchend', handleArrowTouch);
                arrow.addEventListener('touchend', handleArrowTouch);
            });
            
            // 6. Pasos de progreso con eventos táctiles
            document.querySelectorAll('.progress-step').forEach(step => {
                step.removeEventListener('touchend', handleProgressTouch);
                step.addEventListener('touchend', handleProgressTouch);
            });
        }
        
        // Handlers para eventos táctiles
        function handleRadioTouch(e) {
            e.preventDefault();
            const container = this.closest('.radio-options-container');
            if (container) {
                container.querySelectorAll('.radio-option').forEach(item => {
                    item.classList.remove('selected');
                });
            }
            this.classList.add('selected');
            
            // Manejar campos condicionales
            const targetId = this.dataset.toggle;
            if (targetId) {
                const targetField = document.getElementById(targetId);
                const showField = this.dataset.value === 'Sí';
                
                if (targetField) {
                    targetField.style.display = showField ? 'block' : 'none';
                }
            }
            
            // Ocultar mensaje de validación cuando se selecciona una opción
            const parentItem = this.closest('.question-item');
            if (parentItem) {
                const validationMsg = parentItem.querySelector('.validation-message');
                if (validationMsg) {
                    validationMsg.classList.remove('visible');
                }
            }
        }
        
        function handleCheckboxTouch(e) {
            e.preventDefault();
            this.classList.toggle('selected');
        }
        
        function handleOptionTouch(e) {
            e.preventDefault();
            const container = this.closest('.options-container');
            if (container) {
                container.querySelectorAll('.option-item').forEach(item => {
                    item.classList.remove('selected');
                });
            }
            this.classList.add('selected');
            
            // Guardar el valor seleccionado
            if (this.dataset.field && this.dataset.value) {
                answers[this.dataset.field] = this.dataset.value;
            }
            
            // Ocultar mensaje de validación
            const parentItem = this.closest('.question-item');
            if (parentItem) {
                const validationMsg = parentItem.querySelector('.validation-message');
                if (validationMsg) {
                    validationMsg.classList.remove('visible');
                }
            }
        }
        
        function handleButtonTouch(e) {
            e.preventDefault();
            if (navigationInProgress) return;
            
            // Efecto visual de feedback
            this.style.transform = 'scale(0.97)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            if (this.classList.contains('button-continue')) {
                this.setAttribute('data-clicked', 'true');
                const num = parseInt(this.closest('.question-container').dataset.question);
                if (validateQuestion(num)) {
                    showQuestion(num + 1);
                } else {
                    setTimeout(() => {
                        this.removeAttribute('data-clicked');
                    }, 2000);
                }
            } else if (this.classList.contains('button-back')) {
                const num = parseInt(this.closest('.question-container').dataset.question);
                showQuestion(num - 1);
            } else if (this.classList.contains('button-submit')) {
                this.setAttribute('data-clicked', 'true');
                const num = parseInt(this.closest('.question-container').dataset.question);
                if (validateQuestion(num)) {
                    navigationInProgress = true;
                    const currentContainer = document.querySelector(`[data-question="${num}"]`);
                    currentContainer.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                    currentContainer.style.transform = 'scale(0.95)';
                    currentContainer.style.opacity = '0';
                    
                    setTimeout(() => {
                        currentContainer.classList.remove('active');
                        const completionScreen = document.querySelector('.completion-screen');
                        if (completionScreen) {
                            completionScreen.classList.add('visible');
                        }
                        
                        const progressBar = document.querySelector('.progress-bar');
                        if (progressBar) {
                            progressBar.style.width = '100%';
                        }
                        
                        document.querySelectorAll('.progress-step').forEach(step => {
                            step.classList.remove('active');
                            step.classList.add('completed');
                        });
                        
                        document.querySelectorAll('.nav-arrows').forEach(nav => {
                            nav.style.display = 'none';
                        });
                        
                        if (typeof saveAnswers === 'function') {
                            saveAnswers();
                        }
                        
                        navigationInProgress = false;
                    }, 500);
                } else {
                    setTimeout(() => {
                        this.removeAttribute('data-clicked');
                    }, 2000);
                }
            }
        }
        
        function handleArrowTouch(e) {
            e.preventDefault();
            if (navigationInProgress) return;
            
            // Efecto visual de feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            if (this.classList.contains('nav-prev') && !this.classList.contains('disabled') && currentQuestion > 1) {
                showQuestion(currentQuestion - 1);
            } else if (this.classList.contains('nav-next') && !this.classList.contains('disabled')) {
                if (currentQuestion < 4) {
                    const continueButton = document.querySelector(`[data-question="${currentQuestion}"] .button-continue`);
                    if (continueButton) {
                        continueButton.setAttribute('data-clicked', 'true');
                        
                        if (validateQuestion(currentQuestion)) {
                            showQuestion(currentQuestion + 1);
                        } else {
                            setTimeout(() => {
                                continueButton.removeAttribute('data-clicked');
                            }, 2000);
                        }
                    }
                } else if (currentQuestion === 4) {
                    const submitButton = document.querySelector(`[data-question="${currentQuestion}"] .button-submit`);
                    if (submitButton) {
                        submitButton.setAttribute('data-clicked', 'true');
                        
                        if (validateQuestion(currentQuestion)) {
                            submitButton.click();
                        } else {
                            setTimeout(() => {
                                submitButton.removeAttribute('data-clicked');
                            }, 2000);
                        }
                    }
                }
            }
        }
        
        function handleProgressTouch(e) {
            e.preventDefault();
            if (navigationInProgress) return;
            
            const stepNum = parseInt(this.dataset.step);
            if (isNaN(stepNum)) return;
            
            // Solo permitir la navegación a pasos anteriores o al paso actual
            if (stepNum <= currentQuestion) {
                showQuestion(stepNum);
            }
        }
        
        // Inicializar eventos táctiles en carga
        setupTouchEvents();
        
        // Reconfigurar los eventos cada vez que cambia la página
        const originalShowQuestion = window.showQuestion;
        if (typeof originalShowQuestion === 'function') {
            window.showQuestion = function(num) {
                const result = showQuestion(num);
                setTimeout(setupTouchEvents, 500); // Reconfigurar después de la transición
                return result;
            };
        }
    }
    
    // Configurar listeners para campos condicionales (para ambos: móvil y escritorio)
    document.querySelectorAll('[data-toggle]').forEach(option => {
        option.addEventListener('click', function() {
            if (isMobile) return; // Los dispositivos móviles ya tienen su propio manejador
            
            const targetId = this.dataset.toggle;
            const targetField = document.getElementById(targetId);
            const isSelected = this.classList.contains('selected');
            const showField = this.dataset.value === 'Sí';
            
            if (targetField) {
                targetField.style.display = isSelected && showField ? 'block' : 'none';
            }
        });
    });
    
    // Configurar listeners para casillas de verificación (para escritorio)
    document.querySelectorAll('.checkbox-option').forEach(option => {
        option.addEventListener('click', function() {
            if (isMobile) return; // Los dispositivos móviles ya tienen su propio manejador
            
            this.classList.toggle('selected');
        });
    });
    
    // Configurar listeners para opciones de radio (para escritorio)
    document.querySelectorAll('.radio-option').forEach(option => {
        option.addEventListener('click', function() {
            if (isMobile) return; // Los dispositivos móviles ya tienen su propio manejador
            
            const container = this.closest('.radio-options-container');
            container.querySelectorAll('.radio-option').forEach(item => {
                item.classList.remove('selected');
            });
            this.classList.add('selected');
            
            // Manejar campos condicionales
            const targetId = this.dataset.toggle;
            if (targetId) {
                const targetField = document.getElementById(targetId);
                const showField = this.dataset.value === 'Sí';
                
                if (targetField) {
                    targetField.style.display = showField ? 'block' : 'none';
                }
            }
            
            // NUEVO: Ocultar mensaje de validación cuando se selecciona una opción
            const parentItem = this.closest('.question-item');
            if (parentItem) {
                const validationMsg = parentItem.querySelector('.validation-message');
                if (validationMsg) {
                    validationMsg.classList.remove('visible');
                }
            }
        });
    });
    
    // Configurar listeners para opciones regulares (para escritorio)
    document.querySelectorAll('.option-item').forEach(option => {
        option.addEventListener('click', function() {
            if (isMobile) return; // Los dispositivos móviles ya tienen su propio manejador
            
            const container = this.closest('.options-container');
            container.querySelectorAll('.option-item').forEach(item => {
                item.classList.remove('selected');
            });
            this.classList.add('selected');
            
            // Guardar el valor seleccionado
            if (this.dataset.field && this.dataset.value) {
                answers[this.dataset.field] = this.dataset.value;
            }
            
            // NUEVO: Ocultar mensaje de validación también para option-item
            const parentItem = this.closest('.question-item');
            if (parentItem) {
                const validationMsg = parentItem.querySelector('.validation-message');
                if (validationMsg) {
                    validationMsg.classList.remove('visible');
                }
            }
        });
    });

    // Botones "Continuar" (para escritorio)
    document.querySelectorAll('.button-continue').forEach(btn => {
        btn.addEventListener('click', function() {
            if (isMobile) return; // Los dispositivos móviles ya tienen su propio manejador
            if (navigationInProgress) return;
            
            // Marcar el botón como clickeado para activar la validación completa
            this.setAttribute('data-clicked', 'true');
            
            const num = parseInt(this.closest('.question-container').dataset.question);
            if (validateQuestion(num)) {
                showQuestion(num + 1);
            } else {
                // La validación falló pero no ocultamos el botón, simplemente no avanzamos
                setTimeout(() => {
                    this.removeAttribute('data-clicked');
                }, 2000);
            }
        });
    });
    
    // Botones "Atrás" (para escritorio)
    document.querySelectorAll('.button-back').forEach(btn => {
        btn.addEventListener('click', function() {
            if (isMobile) return; // Los dispositivos móviles ya tienen su propio manejador
            if (navigationInProgress) return;
            
            const num = parseInt(this.closest('.question-container').dataset.question);
            showQuestion(num - 1);
        });
    });

    // Botón "Enviar respuestas" (para escritorio)
    const submitButton = document.querySelector('.button-submit');
    if (submitButton) {
        submitButton.addEventListener('click', function() {
            if (isMobile) return; // Los dispositivos móviles ya tienen su propio manejador
            if (navigationInProgress) return;
            
            // Marcar el botón como clickeado para activar la validación completa
            this.setAttribute('data-clicked', 'true');
            
            const num = parseInt(this.closest('.question-container').dataset.question);
            if (validateQuestion(num)) {
                navigationInProgress = true;
                const currentContainer = document.querySelector(`[data-question="${num}"]`);
                currentContainer.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                currentContainer.style.transform = 'scale(0.95)';
                currentContainer.style.opacity = '0';
                
                setTimeout(() => {
                    currentContainer.classList.remove('active');
                    const completionScreen = document.querySelector('.completion-screen');
                    if (completionScreen) {
                        completionScreen.classList.add('visible');
                    }
                    
                    document.querySelector('.progress-bar').style.width = '100%';
                    document.querySelectorAll('.progress-step').forEach(step => {
                        step.classList.remove('active');
                        step.classList.add('completed');
                    });
                    document.querySelectorAll('.nav-arrows').forEach(nav => {
                        nav.style.display = 'none';
                    });
                    
                    if (typeof saveAnswers === 'function') {
                        saveAnswers();
                    }
                    navigationInProgress = false;
                }, 500);
            } else {
                // La validación falló pero no ocultamos el botón
                setTimeout(() => {
                    this.removeAttribute('data-clicked');
                }, 2000);
            }
        });
    }

    // Flecha de navegación hacia atrás (para escritorio)
    const navPrev = document.querySelector('.nav-prev');
    if (navPrev) {
        navPrev.addEventListener('click', function() {
            if (isMobile) return; // Los dispositivos móviles ya tienen su propio manejador
            if (!this.classList.contains('disabled') && currentQuestion > 1 && !navigationInProgress) {
                showQuestion(currentQuestion - 1);
            }
        });
    }

    // Flecha de navegación hacia adelante (para escritorio)
    const navNext = document.querySelector('.nav-next');
    if (navNext) {
        navNext.addEventListener('click', function() {
            if (isMobile) return; // Los dispositivos móviles ya tienen su propio manejador
            if (navigationInProgress) return;
            if (!this.classList.contains('disabled') && currentQuestion < 4) {
                // Marcar el botón continuar de la página actual como clickeado
                const continueButton = document.querySelector(`[data-question="${currentQuestion}"] .button-continue`);
                if (continueButton) {
                    continueButton.setAttribute('data-clicked', 'true');
                }
                
                if (validateQuestion(currentQuestion)) {
                    showQuestion(currentQuestion + 1);
                } else if (continueButton) {
                    setTimeout(() => {
                        continueButton.removeAttribute('data-clicked');
                    }, 2000);
                }
            } else if (currentQuestion === 4) {
                // Marcar el botón submit como clickeado
                const submitButton = document.querySelector(`[data-question="${currentQuestion}"] .button-submit`);
                if (submitButton) {
                    submitButton.setAttribute('data-clicked', 'true');
                }
                
                if (validateQuestion(currentQuestion)) {
                    submitButton.click();
                } else if (submitButton) {
                    setTimeout(() => {
                        submitButton.removeAttribute('data-clicked');
                    }, 2000);
                }
            }
        });
    }

    // Navegación por teclado (para escritorio, no aplicable en móvil)
    window.addEventListener('keydown', e => {
        if (isMobile) return; // En móviles no es relevante la navegación por teclado
        if (currentQuestion === 0 || navigationInProgress) return;
        
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevenir comportamiento por defecto del Enter
            
            // Simular un clic en el botón Continuar o Submit
            const currentContainer = document.querySelector(`[data-question="${currentQuestion}"]`);
            if (!currentContainer) return;
            
            const continueButton = currentContainer.querySelector('.button-continue');
            const submitButton = currentContainer.querySelector('.button-submit');
            
            if (continueButton) {
                // Marcar el botón como clickeado para activar la validación completa
                continueButton.setAttribute('data-clicked', 'true');
                
                // Solo avanzamos si la validación es correcta
                if (validateQuestion(currentQuestion)) {
                    showQuestion(currentQuestion + 1);
                } else {
                    setTimeout(() => {
                        continueButton.removeAttribute('data-clicked');
                    }, 2000);
                }
            } else if (submitButton && currentQuestion === 4) {
                // Marcar el botón como clickeado para activar la validación completa
                submitButton.setAttribute('data-clicked', 'true');
                
                // Solo enviamos si la validación es correcta
                if (validateQuestion(currentQuestion)) {
                    submitButton.click();
                } else {
                    setTimeout(() => {
                        submitButton.removeAttribute('data-clicked');
                    }, 2000);
                }
            }
        } else if (e.key === 'ArrowLeft' && currentQuestion > 1) {
            showQuestion(currentQuestion - 1);
        } else if (e.key === 'ArrowRight' && currentQuestion < 4) {
            // Para las flechas también deberíamos validar
            const currentContainer = document.querySelector(`[data-question="${currentQuestion}"]`);
            if (!currentContainer) return;
            
            const continueButton = currentContainer.querySelector('.button-continue');
            
            if (continueButton) {
                continueButton.setAttribute('data-clicked', 'true');
                
                if (validateQuestion(currentQuestion)) {
                    showQuestion(currentQuestion + 1);
                } else {
                    setTimeout(() => {
                        continueButton.removeAttribute('data-clicked');
                    }, 2000);
                }
            }
        }
    });
});