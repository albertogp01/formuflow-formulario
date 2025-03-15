// Función para validar una pregunta específica
function validateQuestion(num) {
    const container = document.querySelector(`[data-question="${num}"]`);
    
    // Recopilar todos los elementos a validar
    const inputs = container.querySelectorAll('.question-input');
    const radioGroups = container.querySelectorAll('.radio-options-container');
    const optionsGroups = container.querySelectorAll('.options-container');
    const checkboxGroups = container.querySelectorAll('.checkbox-options-container');
    
    let valid = true;
    
    // Validar campos de texto
    inputs.forEach(input => {
        const parentItem = input.closest('.question-item');
        const validationMsg = parentItem.querySelector('.validation-message');
        const numberValidationMsg = parentItem.querySelector('.number-validation');
        const emailValidationMsg = parentItem.querySelector('.email-validation');
        
        // Solo restablecer si el botón está marcado como clickeado
        const navButton = container.querySelector('.nav-button');
        const isValidationActive = navButton && navButton.hasAttribute('data-clicked');
        
        if (isValidationActive) {
            // Restablecer mensajes de error solo si estamos en modo validación
            if (validationMsg) validationMsg.classList.remove('visible');
            if (numberValidationMsg) numberValidationMsg.classList.remove('visible');
            if (emailValidationMsg) emailValidationMsg.classList.remove('visible');
        }
        
        // Solo validar si es visible (para campos condicionales)
        const isVisible = window.getComputedStyle(input).display !== 'none' && 
                          window.getComputedStyle(parentItem).display !== 'none';
        
        if (isVisible) {
            // Si hay contenido o estamos validando activamente
            const hasValue = input.value.trim() !== '';
            const shouldValidate = isValidationActive || hasValue;
            
            if (shouldValidate) {
                // Validar campo requerido - solo si estamos validando activamente
                if (isValidationActive && input.dataset.required === 'true' && !hasValue) {
                    input.classList.add('error');
                    if (validationMsg) validationMsg.classList.add('visible');
                    valid = false;
                } 
                // Validar solo números - solo si tiene valor
                else if (hasValue && input.dataset.numbersOnly === 'true' && !/^\d+$/.test(input.value)) {
                    input.classList.add('error');
                    if (numberValidationMsg) numberValidationMsg.classList.add('visible');
                    valid = false;
                }
                // Validar sin números - solo si tiene valor
                else if (hasValue && input.dataset.noNumbers === 'true' && /\d/.test(input.value)) {
                    input.classList.add('error');
                    if (numberValidationMsg) numberValidationMsg.classList.add('visible');
                    valid = false;
                }
                // Validar email - solo si tiene valor
                else if (hasValue && input.dataset.email === 'true' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                    input.classList.add('error');
                    if (emailValidationMsg) emailValidationMsg.classList.add('visible');
                    valid = false;
                }
                else {
                    input.classList.remove('error');
                    // Guardar respuesta
                    if (hasValue) {
                        answers[input.dataset.field] = input.value.trim();
                    }
                }
            }
        }
    });
    
    // Validar grupos de opciones de radio
    radioGroups.forEach(group => {
        const parentItem = group.closest('.question-item');
        const validationMsg = parentItem.querySelector('.validation-message');
        const fieldName = group.querySelector('.radio-option').dataset.field;
        const selected = group.querySelector('.radio-option.selected');
        
        // Solo validar si es visible
        const isVisible = window.getComputedStyle(group).display !== 'none' && 
                          window.getComputedStyle(parentItem).display !== 'none';
        
        // Solo validar si el botón está marcado como clickeado
        const navButton = container.querySelector('.nav-button');
        const isValidationActive = navButton && navButton.hasAttribute('data-clicked');
        
        if (isVisible && isValidationActive) {
            if (!selected) {
                if (validationMsg) validationMsg.classList.add('visible');
                valid = false;
            } else {
                if (validationMsg) validationMsg.classList.remove('visible');
                // Guardar respuesta
                answers[fieldName] = selected.dataset.value;
            }
        } else if (isVisible && selected) {
            // Guardar la respuesta si ya hay una selección, sin mostrar error
            answers[fieldName] = selected.dataset.value;
        }
    });
    
    // Validar grupos de opciones estándar
    optionsGroups.forEach(group => {
        const parentItem = group.closest('.question-item');
        const validationMsg = parentItem.querySelector('.validation-message');
        const fieldName = group.querySelector('.option-item').dataset.field;
        const selected = group.querySelector('.option-item.selected');
        
        // Solo validar si es visible
        const isVisible = window.getComputedStyle(group).display !== 'none' && 
                          window.getComputedStyle(parentItem).display !== 'none';
        
        // Solo validar si el botón está marcado como clickeado
        const navButton = container.querySelector('.nav-button');
        const isValidationActive = navButton && navButton.hasAttribute('data-clicked');
        
        if (isVisible && isValidationActive) {
            if (!selected) {
                if (validationMsg) validationMsg.classList.add('visible');
                valid = false;
            } else {
                if (validationMsg) validationMsg.classList.remove('visible');
                // Guardar respuesta
                answers[fieldName] = selected.dataset.value;
            }
        } else if (isVisible && selected) {
            // Guardar la respuesta si ya hay una selección, sin mostrar error
            answers[fieldName] = selected.dataset.value;
        }
    });
    
    // Validar grupos de casillas de verificación
    checkboxGroups.forEach(group => {
        const parentItem = group.closest('.question-item');
        const validationMsg = parentItem.querySelector('.validation-message');
        const fieldName = group.querySelector('.checkbox-option').dataset.field;
        const selected = group.querySelectorAll('.checkbox-option.selected');
        
        // Solo validar si es visible
        const isVisible = window.getComputedStyle(group).display !== 'none' && 
                          window.getComputedStyle(parentItem).display !== 'none';
        
        // Solo validar si el botón está marcado como clickeado
        const navButton = container.querySelector('.nav-button');
        const isValidationActive = navButton && navButton.hasAttribute('data-clicked');
        
        if (isVisible && isValidationActive) {
            if (selected.length === 0) {
                if (validationMsg) validationMsg.classList.add('visible');
                valid = false;
            } else {
                if (validationMsg) validationMsg.classList.remove('visible');
                // Guardar respuestas (múltiples)
                const selectedValues = Array.from(selected).map(option => option.dataset.value);
                answers[fieldName] = selectedValues;
            }
        } else if (isVisible && selected.length > 0) {
            // Guardar respuestas si ya hay selecciones, sin mostrar error
            const selectedValues = Array.from(selected).map(option => option.dataset.value);
            answers[fieldName] = selectedValues;
        }
    });
    
    // Mostrar/ocultar botones según validación
    const navButtons = container.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        if (!valid && (button.classList.contains('button-continue') || button.classList.contains('button-submit'))) {
            button.classList.add('hidden');
            button.classList.remove('visible');
        } else {
            button.classList.remove('hidden');
            button.classList.add('visible');
        }
    });
    
    return valid;
}

// Configurar eventos para la validación de campos
document.addEventListener('DOMContentLoaded', () => {
    // Configurar eventos para campos de texto
    document.querySelectorAll('.question-input').forEach(input => {
        let hasInteracted = false;
        
        // Solo mostrar errores después de que el usuario haya interactuado
        input.addEventListener('focus', function() {
            hasInteracted = true;
        });
        
        input.addEventListener('input', function() {
            // Solo validar si el usuario ya ha interactuado con el campo
            if (!hasInteracted) return;
            
            const questionItem = this.closest('.question-item');
            const validationMsg = questionItem.querySelector('.validation-message');
            const numberValidationMsg = questionItem.querySelector('.number-validation');
            const emailValidationMsg = questionItem.querySelector('.email-validation');
            
            // Solo validar el campo actual, no toda la página
            // Validar campo vacío
            if (this.value.trim() === '' && this.dataset.required === 'true') {
                this.classList.add('error');
                if (validationMsg) validationMsg.classList.add('visible');
                if (numberValidationMsg) numberValidationMsg.classList.remove('visible');
                if (emailValidationMsg) emailValidationMsg.classList.remove('visible');
            } 
            // Validar solo números
            else if (this.dataset.numbersOnly === 'true' && !/^\d+$/.test(this.value) && this.value.trim() !== '') {
                this.classList.add('error');
                if (validationMsg) validationMsg.classList.remove('visible');
                if (numberValidationMsg) numberValidationMsg.classList.add('visible');
                if (emailValidationMsg) emailValidationMsg.classList.remove('visible');
            }
            // Validar no números
            else if (this.dataset.noNumbers === 'true' && /\d/.test(this.value) && this.value.trim() !== '') {
                this.classList.add('error');
                if (validationMsg) validationMsg.classList.remove('visible');
                if (numberValidationMsg) numberValidationMsg.classList.add('visible');
                if (emailValidationMsg) emailValidationMsg.classList.remove('visible');
            }
            // Validar email
            else if (this.dataset.email === 'true' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value) && this.value.trim() !== '') {
                this.classList.add('error');
                if (validationMsg) validationMsg.classList.remove('visible');
                if (numberValidationMsg) numberValidationMsg.classList.remove('visible');
                if (emailValidationMsg) emailValidationMsg.classList.add('visible');
            }
            else {
                this.classList.remove('error');
                if (validationMsg) validationMsg.classList.remove('visible');
                if (numberValidationMsg) numberValidationMsg.classList.remove('visible');
                if (emailValidationMsg) emailValidationMsg.classList.remove('visible');
                
                // Guardar respuesta si es válida
                if (this.value.trim() !== '') {
                    answers[this.dataset.field] = this.value.trim();
                }
            }
            
            // Verificamos solo este campo para el botón, no toda la página
            const navButton = questionItem.closest('.question-container').querySelector('.nav-button');
            if (this.classList.contains('error')) {
                navButton.classList.add('hidden');
                navButton.classList.remove('visible');
            } else {
                navButton.classList.remove('hidden');
                navButton.classList.add('visible');
            }
        });
        
        // Validar cuando el usuario sale del campo
        input.addEventListener('blur', function() {
            if (!hasInteracted) return;
            
            const questionItem = this.closest('.question-item');
            const validationMsg = questionItem.querySelector('.validation-message');
            const numberValidationMsg = questionItem.querySelector('.number-validation');
            const emailValidationMsg = questionItem.querySelector('.email-validation');
            
            if (this.value.trim() === '' && this.dataset.required === 'true') {
                this.classList.add('error');
                if (validationMsg) validationMsg.classList.add('visible');
            } else if (this.dataset.numbersOnly === 'true' && !/^\d+$/.test(this.value) && this.value.trim() !== '') {
                this.classList.add('error');
                if (numberValidationMsg) numberValidationMsg.classList.add('visible');
            } else if (this.dataset.noNumbers === 'true' && /\d/.test(this.value) && this.value.trim() !== '') {
                this.classList.add('error');
                if (numberValidationMsg) numberValidationMsg.classList.add('visible');
            } else if (this.dataset.email === 'true' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value) && this.value.trim() !== '') {
                this.classList.add('error');
                if (emailValidationMsg) emailValidationMsg.classList.add('visible');
            }
        });
    });
});