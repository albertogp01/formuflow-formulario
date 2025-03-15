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

// Añadir al archivo main.js o crear uno nuevo si no existe

// Actualización para la función showCompletionScreen en main.js

function showCompletionScreen() {
    // Ocultar el contenedor de preguntas actual
    const currentQuestion = document.querySelector('.question-container.active');
    if (currentQuestion) {
        currentQuestion.classList.remove('active');
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
    
    // Scroll hacia arriba para asegurar que la pantalla de finalización sea visible
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Asegurarse de que este código se ejecute cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Buscar el botón de enviar
    const submitButton = document.querySelector('.button-submit');
    
    // Añadir evento de clic al botón de enviar
    if (submitButton) {
        submitButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Aquí iría la validación final del formulario
            const currentQuestionContainer = document.querySelector('.question-container.active');
            const isValid = validateQuestionContainer(currentQuestionContainer);
            
            if (isValid) {
                // Mostrar animación de carga en el botón
                this.innerHTML = '<span>Procesando...</span><div class="button-loader"></div>';
                this.disabled = true;
                
                // Simular envío de datos (en producción, aquí iría tu código para enviar datos al servidor)
                setTimeout(() => {
                    showCompletionScreen();
                }, 1500);
            }
        });
    }
    
    // Función para validar el contenedor de preguntas
    function validateQuestionContainer(container) {
        // Implementar la validación según tus necesidades
        // Por ahora, simplemente retornamos true para demostración
        return true;
    }
});

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
