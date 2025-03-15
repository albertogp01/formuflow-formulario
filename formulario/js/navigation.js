function showQuestion(num) {
    if (navigationInProgress) return;
    navigationInProgress = true;
    
    const totalPages = 4; // Total de páginas en el formulario
    
    if (num < 1 || num > totalPages) {
        navigationInProgress = false;
        return;
    }
    
    const prev = currentQuestion;
    currentQuestion = num;
    
    // Actualizar botones de navegación
    const navPrev = document.querySelector('.nav-prev');
    const navNext = document.querySelector('.nav-next');
    navPrev.classList.toggle('disabled', num <= 1);
    navNext.classList.toggle('disabled', num >= totalPages);
    
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
    
    // Transición entre preguntas
    if (prev > 0) {
        const prevEl = document.querySelector(`[data-question="${prev}"]`);
        const nextEl = document.querySelector(`[data-question="${num}"]`);
        
        if (prev < num) {
            // Transición a la derecha
            prevEl.classList.remove('animate-out-right', 'animate-in-left', 'animate-in-right');
            nextEl.classList.remove('animate-out-left', 'animate-in-left', 'animate-in-right');
            prevEl.classList.add('animate-out-left');
            
            setTimeout(() => {
                prevEl.classList.remove('active', 'animate-out-left');
                nextEl.classList.add('active', 'animate-in-right');
                
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
                
                setTimeout(() => {
                    nextEl.classList.remove('animate-in-left');
                    navigationInProgress = false;
                }, 500);
            }, 450);
        }
    } else {
        // Primera carga
        document.querySelector(`[data-question="${num}"]`).classList.add('active');
        navigationInProgress = false;
    }
    
    // Actualizar barra de progreso
    let progressPercentage = 0;
    if (num > 1) {
        progressPercentage = ((num - 1) / (totalPages - 1)) * 100;
    }
    document.querySelector('.progress-bar').style.width = `${progressPercentage}%`;
}

// Configurar eventos para los botones de navegación
document.addEventListener('DOMContentLoaded', () => {
    // Configurar listeners para campos condicionales
    document.querySelectorAll('[data-toggle]').forEach(option => {
        option.addEventListener('click', function() {
            const targetId = this.dataset.toggle;
            const targetField = document.getElementById(targetId);
            const isSelected = this.classList.contains('selected');
            const showField = this.dataset.value === 'Sí';
            
            if (targetField) {
                targetField.style.display = isSelected && showField ? 'block' : 'none';
            }
        });
    });
    
    // Configurar listeners para casillas de verificación
    document.querySelectorAll('.checkbox-option').forEach(option => {
        option.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });
    
    // Configurar listeners para opciones de radio
    // Configurar listeners para opciones de radio
    document.querySelectorAll('.radio-option').forEach(option => {
        option.addEventListener('click', function() {
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
        });
    });
    
    // Configurar listeners para opciones regulares (arreglar problema de selección)
    document.querySelectorAll('.option-item').forEach(option => {
        option.addEventListener('click', function() {
            const container = this.closest('.options-container');
            container.querySelectorAll('.option-item').forEach(item => {
                item.classList.remove('selected');
            });
            this.classList.add('selected');
            
            // Guardar el valor seleccionado
            if (this.dataset.field && this.dataset.value) {
                answers[this.dataset.field] = this.dataset.value;
            }
        });
    });

    // Botones "Continuar"
    document.querySelectorAll('.button-continue').forEach(btn => {
        btn.addEventListener('click', function() {
            if (navigationInProgress) return;
            
            // Marcar el botón como clickeado para activar la validación completa
            this.setAttribute('data-clicked', 'true');
            
            const num = parseInt(this.closest('.question-container').dataset.question);
            if (validateQuestion(num)) {
                showQuestion(num + 1);
            }
        });
    });
    
    // Botones "Atrás"
    document.querySelectorAll('.button-back').forEach(btn => {
        btn.addEventListener('click', function() {
            if (navigationInProgress) return;
            
            const num = parseInt(this.closest('.question-container').dataset.question);
            showQuestion(num - 1);
        });
    });

    // Botón "Enviar respuestas"
    document.querySelector('.button-submit').addEventListener('click', function() {
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
                completionScreen.classList.add('visible');
                document.querySelector('.progress-bar').style.width = '100%';
                document.querySelectorAll('.progress-step').forEach(step => {
                    step.classList.remove('active');
                    step.classList.add('completed');
                });
                document.querySelectorAll('.nav-arrows').forEach(nav => {
                    nav.style.display = 'none';
                });
                
                saveAnswers();
                navigationInProgress = false;
            }, 500);
        }
    });

    // Flecha de navegación hacia atrás
    document.querySelector('.nav-prev').addEventListener('click', function() {
        if (!this.classList.contains('disabled') && currentQuestion > 1 && !navigationInProgress) {
            showQuestion(currentQuestion - 1);
        }
    });

    // Flecha de navegación hacia adelante
    document.querySelector('.nav-next').addEventListener('click', function() {
        if (navigationInProgress) return;
        if (!this.classList.contains('disabled') && currentQuestion < 4) {
            if (validateQuestion(currentQuestion)) {
                showQuestion(currentQuestion + 1);
            }
        } else if (currentQuestion === 4) {
            if (validateQuestion(currentQuestion)) {
                document.querySelector('.button-submit').click();
            }
        }
    });

    // Navegación por teclado
    window.addEventListener('keydown', e => {
        if (currentQuestion === 0 || navigationInProgress) return;
        if (e.key === 'Enter' && !e.shiftKey) {
            if (currentQuestion < 4) {
                if (validateQuestion(currentQuestion)) {
                    showQuestion(currentQuestion + 1);
                }
            } else {
                if (validateQuestion(currentQuestion)) {
                    document.querySelector('.button-submit').click();
                }
            }
        } else if (e.key === 'ArrowLeft' && currentQuestion > 1) {
            showQuestion(currentQuestion - 1);
        } else if (e.key === 'ArrowRight' && currentQuestion < 4) {
            if (validateQuestion(currentQuestion)) {
                showQuestion(currentQuestion + 1);
            }
        }
    });
});