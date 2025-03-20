// Fix para asegurar que los mensajes de error aparezcan en campos numéricos
(function() {
    // Función para mostrar mensajes de error en un campo específico
    function showErrorMessage(inputElement, errorType) {
        // Marcar el campo visualmente como error
        inputElement.classList.add('error');
        
        // Encontrar el contenedor del mensaje
        const questionItem = inputElement.closest('.question-item');
        if (!questionItem) return;
        
        // Determinar qué mensaje mostrar
        let messageElement;
        if (errorType === 'required') {
            messageElement = questionItem.querySelector('.validation-message');
        } else if (errorType === 'numeric') {
            messageElement = questionItem.querySelector('.number-validation');
        } else if (errorType === 'range') {
            messageElement = questionItem.querySelector('.range-validation');
        }
        
        // Mostrar el mensaje si existe
        if (messageElement) {
            messageElement.classList.add('visible');
        }
    }
    
    // Función para ocultar mensajes de error
    function hideErrorMessages(inputElement) {
        // Quitar marca visual de error
        inputElement.classList.remove('error');
        
        // Encontrar el contenedor del mensaje
        const questionItem = inputElement.closest('.question-item');
        if (!questionItem) return;
        
        // Ocultar todos los tipos de mensajes de error
        const errorMessages = questionItem.querySelectorAll('.validation-message, .number-validation, .range-validation');
        errorMessages.forEach(msg => {
            msg.classList.remove('visible');
        });
    }
    
    // Función para validar un campo numérico
    function validateNumericField(inputElement) {
        const value = inputElement.value.trim();
        
        // Comprobar si el campo está vacío pero es requerido
        if (inputElement.dataset.required === 'true' && value === '') {
            showErrorMessage(inputElement, 'required');
            return false;
        }
        
        // Si el campo no está vacío, comprobar si solo debe contener números
        if (value !== '' && inputElement.dataset.numbersOnly === 'true' && !/^\d+$/.test(value)) {
            showErrorMessage(inputElement, 'numeric');
            return false;
        }
        
        // Comprobar si el valor está dentro del rango permitido
        if (value !== '' && inputElement.dataset.min && inputElement.dataset.max) {
            const numValue = parseInt(value);
            const min = parseInt(inputElement.dataset.min);
            const max = parseInt(inputElement.dataset.max);
            
            if (numValue < min || numValue > max) {
                showErrorMessage(inputElement, 'range');
                return false;
            }
        }
        
        // Si pasa todas las validaciones, ocultar mensajes de error
        hideErrorMessages(inputElement);
        return true;
    }
    
    // Función para configurar la validación en los campos numéricos
    function setupNumericValidation() {
        // Encontrar todos los campos numéricos
        const numericInputs = document.querySelectorAll('input[data-numbers-only="true"], input[data-min], input[data-max]');
        
        numericInputs.forEach(input => {
            // Validar cuando el campo pierde el foco
            input.addEventListener('blur', function() {
                validateNumericField(this);
            });
            
            // Validar cuando el usuario escribe (para feedback inmediato)
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateNumericField(this);
                }
            });
        });
        
        // Asegurarse de que los campos se validen al hacer clic en Continuar
        const continueButtons = document.querySelectorAll('.button-continue, .button-submit');
        continueButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                const container = this.closest('.question-container');
                if (!container) return;
                
                const numericInputs = container.querySelectorAll('input[data-numbers-only="true"], input[data-min], input[data-max]');
                
                numericInputs.forEach(input => {
                    validateNumericField(input);
                });
            }, true); // Usar captura para ejecutar antes que otros listeners
        });
    }
    
    // Ejecutar configuración cuando el DOM está listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupNumericValidation);
    } else {
        setupNumericValidation();
    }
    
    // También ejecutar después de un pequeño retraso para asegurarse de que todo está cargado
    setTimeout(setupNumericValidation, 500);
})();