// Fix para asegurar que los asteriscos aparezcan en campos obligatorios
(function() {
    // Añadir estilos CSS para los asteriscos
    function addRequiredStyles() {
        // Verificar si ya existe el estilo
        if (document.getElementById('required-marks-styles')) {
            return;
        }
        
        // Crear elemento de estilo
        const styleElement = document.createElement('style');
        styleElement.id = 'required-marks-styles';
        styleElement.innerHTML = `
            .required-mark {
                color: #e32 !important;
                font-weight: bold !important;
                font-size: 1.2em !important;
                font-family: Arial, sans-serif !important;
                margin-left: 4px !important;
                display: inline-block !important;
                position: relative !important;
                line-height: 1 !important;
            }
            
            /* Asegurar que el asterisco siempre sea visible */
            .field-label .required-mark,
            .question-label .required-mark {
                display: inline-block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
        `;
        
        // Añadir al head del documento
        document.head.appendChild(styleElement);
        console.log('Estilos para asteriscos añadidos');
    }

    // Función para añadir los asteriscos a los campos obligatorios
    function addRequiredMarks() {
        console.log('Añadiendo asteriscos a campos obligatorios');
        
        // Lista de campos obligatorios
        const requiredFields = [
            'nombre', 'genero', 'email', // Sección 1
            'objetivo', 'lugar_entrenamiento', 'dias_entrenamiento', 'tiempo_sesion', // Sección 2
            'tipo_entrenamiento' // Sección 4
        ];
        
        // Función auxiliar para añadir asterisco a una etiqueta
        function addAsteriskToLabel(label, fieldName) {
            // Verificar si ya tiene un asterisco
            if (label.innerHTML.includes('<span class="required-mark">*</span>')) {
                return; // Ya tiene un asterisco, no hacer nada
            }
            
            // Si no tiene asterisco, añadirlo
            console.log(`Añadiendo asterisco a ${fieldName}`);
            label.innerHTML += '<span class="required-mark">*</span>';
        }
        
        // Para inputs de texto
        document.querySelectorAll('.question-input').forEach(input => {
            if (!input.dataset.field) return;
            
            const fieldName = input.dataset.field;
            const isRequired = requiredFields.includes(fieldName);
            
            if (isRequired) {
                const questionItem = input.closest('.question-item');
                if (!questionItem) return;
                
                const label = questionItem.querySelector('.field-label');
                if (label) {
                    addAsteriskToLabel(label, fieldName);
                }
            }
        });
        
        // Para grupos de radio y opciones
        document.querySelectorAll('.radio-option, .option-item').forEach(option => {
            if (!option.dataset.field) return;
            
            const fieldName = option.dataset.field;
            const isRequired = requiredFields.includes(fieldName);
            
            if (isRequired) {
                const container = option.closest('.radio-options-container, .options-container');
                if (!container) return;
                
                const questionItem = container.closest('.question-item');
                if (!questionItem) return;
                
                const label = questionItem.querySelector('.field-label');
                if (label) {
                    addAsteriskToLabel(label, fieldName);
                }
            }
        });
    }
    
    // Función para ejecutar después de que el DOM esté completamente cargado
    function initRequiredMarks() {
        // Añadir estilos primero
        addRequiredStyles();
        
        // Ejecutar inmediatamente
        addRequiredMarks();
        
        // Ejecutar nuevamente después de un retraso para asegurar que todo está cargado
        setTimeout(addRequiredMarks, 500);
        setTimeout(addRequiredMarks, 1000);
        
        // Observar cambios en el DOM para detectar nuevos elementos
        const observer = new MutationObserver(function(mutations) {
            addRequiredMarks();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style', 'data-question']
        });
        
        // Añadir función personalizada para mostrar una pregunta
        const originalShowQuestion = window.showQuestion;
        if (typeof originalShowQuestion === 'function') {
            window.showQuestion = function(num) {
                // Llamar a la función original
                originalShowQuestion(num);
                
                // Añadir asteriscos después de mostrar la pregunta
                setTimeout(addRequiredMarks, 300);
            };
        }
    }
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRequiredMarks);
    } else {
        initRequiredMarks();
    }
})();