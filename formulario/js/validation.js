// Función para validar una pregunta específica
function validateQuestion(num) {
    const container = document.querySelector(`[data-question="${num}"]`);
    if (!container) {
        console.error(`No se encontró contenedor para la pregunta ${num}`);
        return false;
    }
    
    console.log(`Validando sección ${num}`);
    
    let valid = true;
    let firstErrorElement = null;
    
    // VALIDACIONES ESPECÍFICAS POR SECCIÓN
    
    // Sección 1: Datos personales (nombre, género, email)
    if (num === 1) {
        // Validar nombre (campo de texto)
        const nombreInput = container.querySelector('input[data-field="nombre"]');
        if (nombreInput) {
            const nombre = nombreInput.value.trim();
            if (nombre === '') {
                nombreInput.classList.add('error');
                const validationMsg = nombreInput.closest('.question-item').querySelector('.validation-message');
                if (validationMsg) {
                    validationMsg.textContent = "Este campo es obligatorio";
                    validationMsg.classList.add('visible');
                }
                valid = false;
                if (!firstErrorElement) firstErrorElement = nombreInput.closest('.question-item');
            } else if (nombreInput.dataset.noNumbers === 'true' && /\d/.test(nombre)) {
                nombreInput.classList.add('error');
                const numberValidationMsg = nombreInput.closest('.question-item').querySelector('.number-validation');
                if (numberValidationMsg) {
                    numberValidationMsg.classList.add('visible');
                }
                if (!firstErrorElement) firstErrorElement = nombreInput.closest('.question-item');
            } else {
                nombreInput.classList.remove('error');
                answers[nombreInput.dataset.field] = nombre;
            }
        }
        
        // Validar edad (campo de texto - no obligatorio pero con validación de rango)
        const edadInput = container.querySelector('input[data-field="edad"]');
        if (edadInput) {
            const edad = edadInput.value.trim();
            if (edad !== '') {
                if (edadInput.dataset.numbersOnly === 'true' && !/^\d+$/.test(edad)) {
                    edadInput.classList.add('error');
                    const numberValidationMsg = edadInput.closest('.question-item').querySelector('.number-validation');
                    if (numberValidationMsg) {
                        numberValidationMsg.classList.add('visible');
                    }
                    if (!firstErrorElement) firstErrorElement = edadInput.closest('.question-item');
                } else if (edadInput.dataset.min && edadInput.dataset.max && 
                          (parseInt(edad) < parseInt(edadInput.dataset.min) || 
                           parseInt(edad) > parseInt(edadInput.dataset.max))) {
                    edadInput.classList.add('error');
                    const rangeValidationMsg = edadInput.closest('.question-item').querySelector('.range-validation');
                    if (rangeValidationMsg) {
                        rangeValidationMsg.classList.add('visible');
                    }
                    if (!firstErrorElement) firstErrorElement = edadInput.closest('.question-item');
                } else {
                    edadInput.classList.remove('error');
                    answers[edadInput.dataset.field] = edad;
                }
            }
        }
        
        // Validar peso (campo de texto - no obligatorio pero con validación de rango)
        const pesoInput = container.querySelector('input[data-field="peso"]');
        if (pesoInput) {
            const peso = pesoInput.value.trim();
            if (peso !== '') {
                if (pesoInput.dataset.numbersOnly === 'true' && !/^\d+$/.test(peso)) {
                    pesoInput.classList.add('error');
                    const numberValidationMsg = pesoInput.closest('.question-item').querySelector('.number-validation');
                    if (numberValidationMsg) {
                        numberValidationMsg.classList.add('visible');
                    }
                    if (!firstErrorElement) firstErrorElement = pesoInput.closest('.question-item');
                } else if (pesoInput.dataset.min && pesoInput.dataset.max && 
                          (parseInt(peso) < parseInt(pesoInput.dataset.min) || 
                           parseInt(peso) > parseInt(pesoInput.dataset.max))) {
                    pesoInput.classList.add('error');
                    const rangeValidationMsg = pesoInput.closest('.question-item').querySelector('.range-validation');
                    if (rangeValidationMsg) {
                        rangeValidationMsg.classList.add('visible');
                    }
                    if (!firstErrorElement) firstErrorElement = pesoInput.closest('.question-item');
                } else {
                    pesoInput.classList.remove('error');
                    answers[pesoInput.dataset.field] = peso;
                }
            }
        }
        
        // Validar altura (campo de texto - no obligatorio pero con validación de rango)
        const alturaInput = container.querySelector('input[data-field="altura"]');
        if (alturaInput) {
            const altura = alturaInput.value.trim();
            if (altura !== '') {
                if (alturaInput.dataset.numbersOnly === 'true' && !/^\d+$/.test(altura)) {
                    alturaInput.classList.add('error');
                    const numberValidationMsg = alturaInput.closest('.question-item').querySelector('.number-validation');
                    if (numberValidationMsg) {
                        numberValidationMsg.classList.add('visible');
                    }
                    if (!firstErrorElement) firstErrorElement = alturaInput.closest('.question-item');
                } else if (alturaInput.dataset.min && alturaInput.dataset.max && 
                          (parseInt(altura) < parseInt(alturaInput.dataset.min) || 
                           parseInt(altura) > parseInt(alturaInput.dataset.max))) {
                    alturaInput.classList.add('error');
                    const rangeValidationMsg = alturaInput.closest('.question-item').querySelector('.range-validation');
                    if (rangeValidationMsg) {
                        rangeValidationMsg.classList.add('visible');
                    }
                    if (!firstErrorElement) firstErrorElement = alturaInput.closest('.question-item');
                } else {
                    alturaInput.classList.remove('error');
                    answers[alturaInput.dataset.field] = altura;
                }
            }
        }
        
        // Validar género (opción de radio)
        const generoSelected = container.querySelector('.radio-option.selected[data-field="genero"]');
        if (!generoSelected) {
            const generoContainer = container.querySelector('.radio-options-container');
            if (generoContainer) {
                const validationMsg = generoContainer.closest('.question-item').querySelector('.validation-message');
                if (validationMsg) {
                    validationMsg.textContent = "Este campo es obligatorio";
                    validationMsg.classList.add('visible');
                }
                valid = false;
                if (!firstErrorElement) firstErrorElement = generoContainer.closest('.question-item');
            }
        } else {
            answers[generoSelected.dataset.field] = generoSelected.dataset.value;
        }
        
        // Validar email (campo de texto)
        const emailInput = container.querySelector('input[data-field="email"]');
        if (emailInput) {
            const email = emailInput.value.trim();
            if (email === '') {
                emailInput.classList.add('error');
                const validationMsg = emailInput.closest('.question-item').querySelector('.validation-message');
                if (validationMsg) {
                    validationMsg.textContent = "Este campo es obligatorio";
                    validationMsg.classList.add('visible');
                }
                valid = false;
                if (!firstErrorElement) firstErrorElement = emailInput.closest('.question-item');
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                emailInput.classList.add('error');
                const emailValidationMsg = emailInput.closest('.question-item').querySelector('.email-validation');
                if (emailValidationMsg) {
                    emailValidationMsg.classList.add('visible');
                }
                valid = false;
                if (!firstErrorElement) firstErrorElement = emailInput.closest('.question-item');
            } else {
                emailInput.classList.remove('error');
                answers[emailInput.dataset.field] = email;
            }
        }
    }
    
    // Sección 2: Entrenamiento (objetivo, lugar, días, tiempo)
    else if (num === 2) {
        console.log("Validando sección 2 - Entrenamiento");
        
        // Validar objetivo principal (opción)
        const objetivoSelected = container.querySelector('.option-item.selected[data-field="objetivo"]');
        if (!objetivoSelected) {
            console.log("Error: No hay objetivo seleccionado");
            const objetivoContainer = container.querySelector('.options-container');
            if (objetivoContainer) {
                const validationMsg = objetivoContainer.closest('.question-item').querySelector('.validation-message');
                if (validationMsg) {
                    validationMsg.textContent = "Este campo es obligatorio";
                    validationMsg.classList.add('visible');
                }
                valid = false;
                if (!firstErrorElement) firstErrorElement = objetivoContainer.closest('.question-item');
            }
        } else {
            console.log(`Objetivo seleccionado: ${objetivoSelected.dataset.value}`);
            answers[objetivoSelected.dataset.field] = objetivoSelected.dataset.value;
        }
        
        // Validar lugar de entrenamiento (radio)
        const lugarSelected = container.querySelector('.radio-option.selected[data-field="lugar_entrenamiento"]');
        if (!lugarSelected) {
            console.log("Error: No hay lugar de entrenamiento seleccionado");
            const lugarContainer = container.querySelector('.radio-options-container');
            if (lugarContainer && lugarContainer.querySelector('.radio-option[data-field="lugar_entrenamiento"]')) {
                const validationMsg = lugarContainer.closest('.question-item').querySelector('.validation-message');
                if (validationMsg) {
                    validationMsg.textContent = "Este campo es obligatorio";
                    validationMsg.classList.add('visible');
                }
                valid = false;
                if (!firstErrorElement) firstErrorElement = lugarContainer.closest('.question-item');
            }
        } else {
            console.log(`Lugar seleccionado: ${lugarSelected.dataset.value}`);
            answers[lugarSelected.dataset.field] = lugarSelected.dataset.value;
        }
        
        // Validar días de entrenamiento (radio)
        const diasSelected = container.querySelector('.radio-option.selected[data-field="dias_entrenamiento"]');
        if (!diasSelected) {
            console.log("Error: No hay días de entrenamiento seleccionados");
            // Buscar el contenedor específico para días de entrenamiento
            const diasContainer = Array.from(container.querySelectorAll('.radio-options-container')).find(
                container => container.querySelector('.radio-option[data-field="dias_entrenamiento"]')
            );
            
            if (diasContainer) {
                const validationMsg = diasContainer.closest('.question-item').querySelector('.validation-message');
                if (validationMsg) {
                    validationMsg.textContent = "Este campo es obligatorio";
                    validationMsg.classList.add('visible');
                }
                valid = false;
                if (!firstErrorElement) firstErrorElement = diasContainer.closest('.question-item');
            }
        } else {
            console.log(`Días seleccionados: ${diasSelected.dataset.value}`);
            answers[diasSelected.dataset.field] = diasSelected.dataset.value;
        }
        
        // Validar tiempo por sesión (radio)
        const tiempoSelected = container.querySelector('.radio-option.selected[data-field="tiempo_sesion"]');
        if (!tiempoSelected) {
            console.log("Error: No hay tiempo por sesión seleccionado");
            // Buscar el contenedor específico para tiempo por sesión
            const tiempoContainer = Array.from(container.querySelectorAll('.radio-options-container')).find(
                container => container.querySelector('.radio-option[data-field="tiempo_sesion"]')
            );
            
            if (tiempoContainer) {
                const validationMsg = tiempoContainer.closest('.question-item').querySelector('.validation-message');
                if (validationMsg) {
                    validationMsg.textContent = "Este campo es obligatorio";
                    validationMsg.classList.add('visible');
                }
                valid = false;
                if (!firstErrorElement) firstErrorElement = tiempoContainer.closest('.question-item');
            }
        } else {
            console.log(`Tiempo seleccionado: ${tiempoSelected.dataset.value}`);
            answers[tiempoSelected.dataset.field] = tiempoSelected.dataset.value;
        }
    }
    
    // Sección 3: Historial Médico (todos opcionales)
    else if (num === 3) {
        // Todos los campos en esta sección son opcionales
        valid = true;
        
        // Recolectar respuestas de radio en esta sección
        container.querySelectorAll('.radio-option.selected').forEach(option => {
            if (option.dataset.field && option.dataset.value) {
                answers[option.dataset.field] = option.dataset.value;
                
                // Si el valor es "Sí", verificamos si hay un campo de descripción asociado
                if (option.dataset.value === "Sí" && option.dataset.toggle) {
                    const descripcionTextarea = document.querySelector(`#${option.dataset.toggle} textarea`);
                    if (descripcionTextarea && descripcionTextarea.value.trim() !== '') {
                        answers[descripcionTextarea.dataset.field] = descripcionTextarea.value.trim();
                    }
                }
            }
        });
    }
    
    // Sección 4: Ejercicios y Preferencias (tipo de entrenamiento)
    else if (num === 4) {
        console.log("Validando sección 4 - Ejercicios y Preferencias");
        
        // Validar tipo de entrenamiento (opción)
        const tipoSelected = container.querySelector('.option-item.selected[data-field="tipo_entrenamiento"]');
        if (!tipoSelected) {
            console.log("Error: No hay tipo de entrenamiento seleccionado");
            // Buscar el contenedor específico para tipo de entrenamiento
            const tipoContainer = Array.from(container.querySelectorAll('.options-container')).find(
                container => container.querySelector('.option-item[data-field="tipo_entrenamiento"]')
            );
            
            if (tipoContainer) {
                const validationMsg = tipoContainer.closest('.question-item').querySelector('.validation-message');
                if (validationMsg) {
                    validationMsg.textContent = "Este campo es obligatorio";
                    validationMsg.classList.add('visible');
                }
                valid = false;
                if (!firstErrorElement) firstErrorElement = tipoContainer.closest('.question-item');
            }
        } else {
            console.log(`Tipo de entrenamiento seleccionado: ${tipoSelected.dataset.value}`);
            answers[tipoSelected.dataset.field] = tipoSelected.dataset.value;
        }
        
        // Recolectar respuestas de radio en esta sección
        container.querySelectorAll('.radio-option.selected').forEach(option => {
            if (option.dataset.field && option.dataset.value) {
                answers[option.dataset.field] = option.dataset.value;
                
                // Si el valor es "Sí", verificamos si hay un campo de descripción asociado
                if (option.dataset.value === "Sí" && option.dataset.toggle) {
                    const descripcionTextarea = document.querySelector(`#${option.dataset.toggle} textarea`);
                    if (descripcionTextarea && descripcionTextarea.value.trim() !== '') {
                        answers[descripcionTextarea.dataset.field] = descripcionTextarea.value.trim();
                    }
                }
            }
        });
    }
    
    // Recolectar todas las respuestas adicionales
    collectAdditionalAnswers(container);
    
    // Si encontramos un error, desplazamos a ese elemento
    if (!valid && firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    console.log(`Validación de sección ${num}: ${valid ? 'EXITOSA' : 'FALLIDA'}`);
    return valid;
}

// Función para recolectar respuestas adicionales
function collectAdditionalAnswers(container) {
    // Recolectar inputs que no se hayan procesado específicamente
    container.querySelectorAll('.question-input').forEach(input => {
        const fieldName = input.dataset.field;
        // Verificar si este campo no se ha procesado ya específicamente
        if (input.value.trim() !== '' && !answers[fieldName]) {
            answers[fieldName] = input.value.trim();
        }
    });
    
    // Recolectar checkboxes seleccionados
    container.querySelectorAll('.checkbox-option.selected').forEach(option => {
        if (option.dataset.field && option.dataset.value) {
            if (!answers[option.dataset.field]) {
                answers[option.dataset.field] = [];
            }
            answers[option.dataset.field].push(option.dataset.value);
        }
    });
}

// Limpiar mensajes de error cuando se selecciona una opción
document.addEventListener('DOMContentLoaded', () => {
    // Para opciones de radio
    document.querySelectorAll('.radio-option').forEach(option => {
        option.addEventListener('click', function() {
            const container = this.closest('.radio-options-container');
            container.querySelectorAll('.radio-option').forEach(item => {
                item.classList.remove('selected');
            });
            this.classList.add('selected');
            
            // Ocultar mensaje de error
            const parentItem = this.closest('.question-item');
            if (parentItem) {
                const validationMsg = parentItem.querySelector('.validation-message');
                if (validationMsg) {
                    validationMsg.classList.remove('visible');
                }
            }
            
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
    
    // Para opciones normales
    document.querySelectorAll('.option-item').forEach(option => {
        option.addEventListener('click', function() {
            const container = this.closest('.options-container');
            container.querySelectorAll('.option-item').forEach(item => {
                item.classList.remove('selected');
            });
            this.classList.add('selected');
            
            // Ocultar mensaje de error
            const parentItem = this.closest('.question-item');
            if (parentItem) {
                const validationMsg = parentItem.querySelector('.validation-message');
                if (validationMsg) {
                    validationMsg.classList.remove('visible');
                }
            }
            
            // Guardar el valor seleccionado
            if (this.dataset.field && this.dataset.value) {
                answers[this.dataset.field] = this.dataset.value;
            }
        });
    });
    
    // Para campos de texto
    document.querySelectorAll('.question-input').forEach(input => {
        input.addEventListener('input', function() {
            const questionItem = this.closest('.question-item');
            const validationMsg = questionItem.querySelector('.validation-message');
            const numberValidationMsg = questionItem.querySelector('.number-validation');
            const emailValidationMsg = questionItem.querySelector('.email-validation');
            const rangeValidationMsg = questionItem.querySelector('.range-validation');
            
            // Ocultar todos los mensajes de error
            if (validationMsg) validationMsg.classList.remove('visible');
            if (numberValidationMsg) numberValidationMsg.classList.remove('visible');
            if (emailValidationMsg) emailValidationMsg.classList.remove('visible');
            if (rangeValidationMsg) rangeValidationMsg.classList.remove('visible');
            
            // Si el campo tiene valor, eliminar la clase de error
            if (this.value.trim() !== '') {
                this.classList.remove('error');
            }
        });
    });
});