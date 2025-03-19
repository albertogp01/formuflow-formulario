// Variables globales
const totalQuestions = 4; // Total de páginas en el formulario
let currentQuestion = 0;
let answers = {};
const progressBar = document.querySelector('.progress-bar');
const questionContainers = document.querySelectorAll('.question-container');
const completionScreen = document.querySelector('.completion-screen');
let navigationInProgress = false;

// Inicializa la aplicación una vez que se carga el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Los listeners se inicializan en los otros archivos JS
    console.log('Formuflow inicializado con éxito.');
    
    // Inicializar tooltips para los círculos de progreso
    initProgressSteps();
    
    // Marcar visualmente los campos obligatorios
    markRequiredFields();
    
    // Asegurar validación reforzada
    setupEnhancedValidation();
});

// Función para inicializar los pasos de progreso
function initProgressSteps() {
    document.querySelectorAll('.progress-step').forEach(step => {
        // Para cada paso, agregar un ícono de verificación cuando esté completado
        const stepCircle = step.querySelector('.step-circle');
        
        // Evento de clic para navegación directa
        step.addEventListener('click', function() {
            const stepNum = parseInt(this.dataset.step);
            const currentStepNum = currentQuestion;
            
            // Solo permitir la navegación a pasos anteriores y al paso actual
            if (stepNum <= currentStepNum && !navigationInProgress) {
                showQuestion(stepNum);
            }
        });
    });
}

// Función para marcar visualmente los campos obligatorios
function markRequiredFields() {
    // Marcar visualmente los campos obligatorios
    const requiredFields = [
        'nombre', 'genero', 'email', // Sección 1
        'objetivo', 'lugar_entrenamiento', 'dias_entrenamiento', 'tiempo_sesion', // Sección 2
        'tipo_entrenamiento' // Sección 4
    ];
    
    // Para inputs de texto
    document.querySelectorAll('.question-input').forEach(input => {
        const isRequired = requiredFields.includes(input.dataset.field);
        input.dataset.required = isRequired ? 'true' : 'false';
        
        // Añadir asterisco a las etiquetas de campos obligatorios
        if (isRequired) {
            const label = input.closest('.question-item').querySelector('.field-label');
            if (label && !label.textContent.includes('*')) {
                label.innerHTML += ' <span class="required-mark">*</span>';
            }
        }
    });
    
    // Para grupos de radio
    document.querySelectorAll('.radio-options-container').forEach(container => {
        const option = container.querySelector('.radio-option');
        if (option) {
            const fieldName = option.dataset.field;
            const isRequired = requiredFields.includes(fieldName);
            
            // Añadir asterisco a las etiquetas de campos obligatorios
            if (isRequired) {
                const label = container.closest('.question-item').querySelector('.field-label');
                if (label && !label.textContent.includes('*')) {
                    label.innerHTML += ' <span class="required-mark">*</span>';
                }
            }
        }
    });
    
    // Para grupos de opciones
    document.querySelectorAll('.options-container').forEach(container => {
        const option = container.querySelector('.option-item');
        if (option) {
            const fieldName = option.dataset.field;
            const isRequired = requiredFields.includes(fieldName);
            
            // Añadir asterisco a las etiquetas de campos obligatorios
            if (isRequired) {
                const label = container.closest('.question-item').querySelector('.field-label');
                if (label && !label.textContent.includes('*')) {
                    label.innerHTML += ' <span class="required-mark">*</span>';
                }
            }
        }
    });
    
    // Añadir estilo CSS para el asterisco de campos obligatorios
    const style = document.createElement('style');
    style.textContent = `
        .required-mark {
            color: #ff3366;
            font-weight: bold;
            margin-left: 2px;
        }
    `;
    document.head.appendChild(style);
}

// Función para configurar la validación reforzada
function setupEnhancedValidation() {
    // Asegurarnos de que las validaciones se ejecuten correctamente para cada sección
    const validateButtonClick = function(event) {
        if (navigationInProgress) return;
        
        const button = event.currentTarget;
        const container = button.closest('.question-container');
        if (!container) return;
        
        const questionNum = parseInt(container.dataset.question);
        
        // Establecer el atributo data-clicked para activar validación completa
        button.setAttribute('data-clicked', 'true');
        
        // Forzar validación
        if (!validateQuestion(questionNum)) {
            console.log(`Validación falló en la pregunta ${questionNum}`);
            event.preventDefault();
            event.stopPropagation();
            
            // Eliminar el atributo después de un tiempo
            setTimeout(() => {
                button.removeAttribute('data-clicked');
            }, 2000);
            
            return false;
        }
        
        console.log(`Validación exitosa en la pregunta ${questionNum}`);
        return true;
    };
    
    // Aplicar el evento a todos los botones de continuar
    document.querySelectorAll('.button-continue, .button-submit').forEach(button => {
        // Remover cualquier evento existente (para evitar duplicados)
        button.removeEventListener('click', validateButtonClick, { capture: true });
        
        // Añadir nuestro nuevo evento al inicio de los handlers
        button.addEventListener('click', validateButtonClick, { capture: true });
    });
}

// Función para mostrar la pantalla de finalización
function showCompletionScreen() {
    // Ocultar el contenedor de preguntas actual
    const currentQuestionContainer = document.querySelector('.question-container.active');
    if (currentQuestionContainer) {
        currentQuestionContainer.classList.remove('active');
    }
    
    // Mostrar la pantalla de finalización
    const completionScreen = document.querySelector('.completion-screen');
    completionScreen.classList.add('visible');
    
    // Personalizar el mensaje de agradecimiento con el nombre del usuario (si está disponible)
    const nombreInput = document.querySelector('input[data-field="nombre"]');
    if (nombreInput && nombreInput.value) {
        const nombre = nombreInput.value.trim();
        if (nombre) {
            const titleElement = completionScreen.querySelector('.completion-title');
            if (titleElement) {
                titleElement.textContent = `¡Gracias ${nombre} por completar el formulario!`;
            }
        }
    }
    
    // Activar el confeti
    new Confetti();
    
    // Actualizar la barra de progreso al 100%
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = '100%';
    
    // Marcar todos los pasos como completados
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach(step => {
        step.classList.remove('active');
        step.classList.add('completed');
    });
    
    // Ocultar las flechas de navegación
    const navArrows = document.querySelectorAll('.nav-arrows');
    navArrows.forEach(nav => {
        nav.style.display = 'none';
    });
    
    // Scroll hacia arriba para asegurar que la pantalla de finalización sea visible
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Función para guardar las respuestas
function saveAnswers() {
    console.log('Respuestas:', answers);
    
    // Aquí podrías implementar el envío de datos a un servidor
    // Por ejemplo:
    /*
    fetch('/api/submit-form', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Datos guardados:', data);
    })
    .catch(error => {
        console.error('Error al guardar:', error);
    });
    */
}

// Asegurarse de que este código se ejecute cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Buscar el botón de enviar
    const submitButton = document.querySelector('.button-submit');
    
    // Añadir evento de clic al botón de enviar
    if (submitButton) {
        submitButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Validar usando nuestra función de validación
            const questionNum = parseInt(this.closest('.question-container').dataset.question);
            const isValid = validateQuestion(questionNum);
            
            if (isValid) {
                // Mostrar animación de carga en el botón
                this.innerHTML = '<span>Procesando...</span><div class="button-loader"></div>';
                this.disabled = true;
                
                // Simular envío de datos (en producción, aquí iría tu código para enviar datos al servidor)
                setTimeout(() => {
                    saveAnswers(); // Guardar las respuestas
                    showCompletionScreen();
                }, 1500);
            }
        });
    }
});