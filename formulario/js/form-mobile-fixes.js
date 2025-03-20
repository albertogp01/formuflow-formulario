/**
 * form-mobile-fixes.js
 * Script para corregir problemas específicos de la versión móvil del formulario:
 * 1. Las flechas arriba/abajo deben validar igual que los botones Atrás/Continuar
 * 2. Evitar el solapamiento de mensajes de error
 * 3. Mostrar errores solo al intentar avanzar y solo en campos obligatorios con datos incorrectos
 * 4. Scroll al inicio de cada sección al navegar
 * 5. Scroll automático al primer error encontrado
 * 6. Mejorada compatibilidad con navegadores no-incógnito
 */

(function() {
  // Inicializar cuando el DOM esté listo
  function initMobileFixes() {
    console.log('[MobileFixes] Inicializando mejoras para experiencia móvil...');
    
    // Verificar si las funciones necesarias existen
    if (typeof window.validateQuestion !== 'function' || typeof window.showQuestion !== 'function') {
      console.warn('[MobileFixes] Esperando a que las funciones del formulario se inicialicen...');
      // Intentar de nuevo en 200ms
      setTimeout(initMobileFixes, 200);
      return;
    }
    
    // Referencias a elementos importantes
    const navPrevArrow = document.querySelector('.nav-arrow.nav-prev');
    const navNextArrow = document.querySelector('.nav-arrow.nav-next');
    const questionContainers = document.querySelectorAll('.question-container');
    
    if (!navPrevArrow || !navNextArrow || questionContainers.length === 0) {
      console.warn('[MobileFixes] Esperando a que los elementos del DOM estén disponibles...');
      // Intentar de nuevo en 200ms
      setTimeout(initMobileFixes, 200);
      return;
    }
    
    /**
     * Encuentra el primer error en un contenedor y hace scroll hacia él
     */
    function scrollToFirstError(container) {
      if (!container) return false;
      
      // Limpiar mensajes de error solapados primero
      cleanupOverlappingErrors(container);
      
      const errorMessages = container.querySelectorAll('.validation-message.visible, .number-validation.visible, .email-validation.visible');
      
      // Si hay al menos un error, hacer scroll al primero
      if (errorMessages.length > 0) {
        const firstErrorField = errorMessages[0].closest('.question-item');
        
        if (firstErrorField) {
          // Aplicar efecto visual para resaltar el error
          firstErrorField.classList.add('bounce');
          setTimeout(() => {
            firstErrorField.classList.remove('bounce');
          }, 1000);
          
          // Scroll al error (considerando el header fijo)
          const headerHeight = document.querySelector('.progress-container')?.offsetHeight || 0;
          const errorPosition = firstErrorField.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
          
          window.scrollTo({
            top: errorPosition,
            behavior: 'smooth'
          });
          
          return true;
        }
      }
      
      return false;
    }
    
    /**
     * Limpia mensajes de error solapados en un contenedor
     */
    function cleanupOverlappingErrors(container) {
      if (!container) return;
      
      const questionItems = container.querySelectorAll('.question-item');
      
      questionItems.forEach(item => {
        const validationMessages = [
          item.querySelector('.validation-message'),
          item.querySelector('.number-validation'),
          item.querySelector('.email-validation')
        ].filter(el => el);
        
        // Si hay más de un mensaje visible, priorizar el mensaje principal
        let visibleCount = validationMessages.filter(msg => msg && msg.classList.contains('visible')).length;
        
        if (visibleCount > 1) {
          // Priorizar el mensaje principal (general)
          const mainMessage = item.querySelector('.validation-message');
          if (mainMessage && mainMessage.classList.contains('visible')) {
            // Ocultar los demás mensajes
            validationMessages.forEach(msg => {
              if (msg !== mainMessage) {
                msg.classList.remove('visible');
              }
            });
          }
        }
      });
    }
    
    /**
     * Hace scroll al inicio de una sección
     */
    function scrollToSectionTop(sectionNum) {
      const section = document.querySelector(`.question-container[data-question="${sectionNum}"]`);
      if (!section) return;
      
      // Calcular posición considerando el header fijo
      const headerHeight = document.querySelector('.progress-container')?.offsetHeight || 0;
      const sectionPosition = section.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      
      // Scroll a la posición
      window.scrollTo({
        top: Math.max(0, sectionPosition),
        behavior: 'smooth'
      });
    }
    
    /**
     * Valida una sección y navega o muestra errores según corresponda
     */
    function validateAndNavigate(currentSection, targetSection) {
      // Verificar que las funciones necesarias existan
      if (typeof window.validateQuestion !== 'function' || typeof window.showQuestion !== 'function') {
        console.error('[MobileFixes] Funciones de validación no disponibles');
        return false;
      }
      
      // Solo validar si estamos intentando avanzar
      if (targetSection > currentSection) {
        // Obtener el contenedor de la sección actual
        const container = document.querySelector(`.question-container[data-question="${currentSection}"]`);
        if (container) {
          // Marcar el botón para activar validación completa
          const navButton = container.querySelector('.nav-button');
          if (navButton) {
            navButton.setAttribute('data-clicked', 'true');
          }
          
          // Validar con la función original
          const isValid = window.validateQuestion(currentSection);
          
          if (!isValid) {
            // Si hay errores, hacer scroll al primero
            scrollToFirstError(container);
            return false;
          }
        }
      }
      
      // Si no hay errores o estamos retrocediendo, navegar a la sección destino
      window.showQuestion(targetSection);
      
      // Hacer scroll al inicio de la nueva sección
      setTimeout(() => scrollToSectionTop(targetSection), 300);
      return true;
    }
    
    // === MEJORA DE LAS FLECHAS DE NAVEGACIÓN ===
    
    // Flecha arriba (retroceder)
    if (navPrevArrow) {
      navPrevArrow.removeEventListener('click', navPrevArrow.onclick);
      navPrevArrow.onclick = null;
      
      navPrevArrow.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (this.classList.contains('disabled') || window.navigationInProgress) return;
        
        const currentSection = window.currentQuestion;
        if (currentSection > 1) {
          validateAndNavigate(currentSection, currentSection - 1);
        }
      });
    }
    
    // Flecha abajo (avanzar)
    if (navNextArrow) {
      navNextArrow.removeEventListener('click', navNextArrow.onclick);
      navNextArrow.onclick = null;
      
      navNextArrow.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (this.classList.contains('disabled') || window.navigationInProgress) return;
        
        const currentSection = window.currentQuestion;
        if (currentSection < 4) {
          validateAndNavigate(currentSection, currentSection + 1);
        } else if (currentSection === 4) {
          // En la última sección, simular clic en el botón de envío
          const submitButton = document.querySelector('.button-submit');
          if (submitButton) {
            const container = document.querySelector(`.question-container[data-question="${currentSection}"]`);
            if (container) {
              const navButton = container.querySelector('.nav-button');
              if (navButton) {
                navButton.setAttribute('data-clicked', 'true');
              }
              
              // Validar antes de enviar
              if (typeof window.validateQuestion === 'function') {
                const isValid = window.validateQuestion(currentSection);
                if (isValid) {
                  submitButton.click();
                } else {
                  scrollToFirstError(container);
                }
              }
            }
          }
        }
      });
    }
    
    // === MEJORA DE LA FUNCIONALIDAD DE VALIDACIÓN ===
    
    // Guardar la función original
    const originalValidateQuestion = window.validateQuestion;
    
    // Modificar la función original validateQuestion para evitar errores solapados y mejorar validación
    window.validateQuestion = function(num) {
      const container = document.querySelector(`[data-question="${num}"]`);
      if (!container) return true; // Si no hay contenedor, considerarlo válido
      
      // Recopilar todos los elementos a validar
      const inputs = container.querySelectorAll('.question-input');
      const radioGroups = container.querySelectorAll('.radio-options-container');
      const optionsGroups = container.querySelectorAll('.options-container');
      const checkboxGroups = container.querySelectorAll('.checkbox-options-container');
      
      let valid = true;
      
      // Validar campos de texto
      inputs.forEach(input => {
        const parentItem = input.closest('.question-item');
        if (!parentItem) return; // Saltar si no hay elemento padre
        
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
          
          // Solo validar campos requeridos - importante para evitar errores en campos no obligatorios
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
                window.answers = window.answers || {};
                window.answers[input.dataset.field] = input.value.trim();
              }
            }
          }
        }
      });
      
      // Validar grupos de opciones de radio
      radioGroups.forEach(group => {
        const parentItem = group.closest('.question-item');
        if (!parentItem) return; // Saltar si no hay elemento padre
        
        const validationMsg = parentItem.querySelector('.validation-message');
        const radioOptions = group.querySelectorAll('.radio-option');
        if (radioOptions.length === 0) return; // Saltar si no hay opciones
        
        const fieldName = radioOptions[0].dataset.field;
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
            window.answers = window.answers || {};
            window.answers[fieldName] = selected.dataset.value;
          }
        } else if (isVisible && selected) {
          // Guardar la respuesta si ya hay una selección, sin mostrar error
          window.answers = window.answers || {};
          window.answers[fieldName] = selected.dataset.value;
        }
      });
      
      // Validar grupos de opciones estándar
      optionsGroups.forEach(group => {
        const parentItem = group.closest('.question-item');
        if (!parentItem) return; // Saltar si no hay elemento padre
        
        const validationMsg = parentItem.querySelector('.validation-message');
        const optionItems = group.querySelectorAll('.option-item');
        if (optionItems.length === 0) return; // Saltar si no hay opciones
        
        const fieldName = optionItems[0].dataset.field;
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
            window.answers = window.answers || {};
            window.answers[fieldName] = selected.dataset.value;
          }
        } else if (isVisible && selected) {
          // Guardar la respuesta si ya hay una selección, sin mostrar error
          window.answers = window.answers || {};
          window.answers[fieldName] = selected.dataset.value;
        }
      });
      
      // Validar grupos de casillas de verificación
      checkboxGroups.forEach(group => {
        const parentItem = group.closest('.question-item');
        if (!parentItem) return; // Saltar si no hay elemento padre
        
        const validationMsg = parentItem.querySelector('.validation-message');
        const checkboxOptions = group.querySelectorAll('.checkbox-option');
        if (checkboxOptions.length === 0) return; // Saltar si no hay opciones
        
        const fieldName = checkboxOptions[0].dataset.field;
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
            window.answers = window.answers || {};
            window.answers[fieldName] = selectedValues;
          }
        } else if (isVisible && selected.length > 0) {
          // Guardar respuestas si ya hay selecciones, sin mostrar error
          const selectedValues = Array.from(selected).map(option => option.dataset.value);
          window.answers = window.answers || {};
          window.answers[fieldName] = selectedValues;
        }
      });
      
      // Limpiar mensajes solapados
      cleanupOverlappingErrors(container);
      
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
    };
    
    // === MEJORA DE NAVEGACIÓN ===
    
    // Guardar la función original
    const originalShowQuestion = window.showQuestion;
    
    // Modificar la función original showQuestion para hacer scroll al inicio de la sección
    window.showQuestion = function(num) {
      // Llamada a la función original
      originalShowQuestion(num);
      
      // Scroll al inicio de la sección después de la transición
      setTimeout(() => scrollToSectionTop(num), 300);
      
      // Restaurar estado de botones
      setTimeout(() => {
        const currentContainer = document.querySelector('.question-container.active');
        if (currentContainer) {
          const continueBtn = currentContainer.querySelector('.button-continue');
          const submitBtn = currentContainer.querySelector('.button-submit');
          
          if (continueBtn) {
            continueBtn.classList.remove('hidden');
            continueBtn.classList.add('visible');
          }
          
          if (submitBtn) {
            submitBtn.classList.remove('hidden');
            submitBtn.classList.add('visible');
          }
        }
      }, 500);
    };
    
    // === MEJORA DE BOTONES ===
    
    // Mejorar los botones de continuar
    document.querySelectorAll('.button-continue').forEach(button => {
      // Eliminar manejadores previos para evitar duplicados
      button.removeEventListener('click', button.onclick);
      button.onclick = null;
      
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const container = this.closest('.question-container');
        if (!container) return;
        
        const currentSection = parseInt(container.dataset.question);
        if (isNaN(currentSection)) return;
        
        validateAndNavigate(currentSection, currentSection + 1);
      });
    });
    
    // Mejorar los botones de atrás
    document.querySelectorAll('.button-back').forEach(button => {
      // Eliminar manejadores previos para evitar duplicados
      button.removeEventListener('click', button.onclick);
      button.onclick = null;
      
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const container = this.closest('.question-container');
        if (!container) return;
        
        const currentSection = parseInt(container.dataset.question);
        if (isNaN(currentSection)) return;
        
        validateAndNavigate(currentSection, currentSection - 1);
      });
    });
    
    // Mejorar el botón de envío
    const submitButton = document.querySelector('.button-submit');
    if (submitButton) {
      // Eliminar manejadores previos para evitar duplicados
      submitButton.removeEventListener('click', submitButton.onclick);
      submitButton.onclick = null;
      
      submitButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const container = this.closest('.question-container');
        if (!container) return;
        
        const currentSection = parseInt(container.dataset.question);
        if (isNaN(currentSection)) return;
        
        // Marcar el botón para activar validación completa
        this.setAttribute('data-clicked', 'true');
        
        // Validar con la función original
        const isValid = window.validateQuestion(currentSection);
        
        if (!isValid) {
          // Si hay errores, hacer scroll al primero
          scrollToFirstError(container);
          return;
        }
        
        // Si no hay errores, continuar con el envío
        if (typeof window.submitForm === 'function') {
          window.submitForm();
        } else if (typeof window.showCompletionScreen === 'function') {
          window.showCompletionScreen();
        }
      });
    }
    
    // === MEJORA DE TECLADO ===
    
    // Eliminar manejadores previos para evitar duplicados
    window.removeEventListener('keydown', window._mobileFixesKeyHandler);
    
    // Manejador para la navegación por teclado con flechas arriba/abajo
    window._mobileFixesKeyHandler = function(e) {
      if (window.navigationInProgress || window.currentQuestion === 0) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentSection = window.currentQuestion;
        if (currentSection < 4) {
          validateAndNavigate(currentSection, currentSection + 1);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentSection = window.currentQuestion;
        if (currentSection > 1) {
          validateAndNavigate(currentSection, currentSection - 1);
        }
      }
    };
    
    window.addEventListener('keydown', window._mobileFixesKeyHandler);
    
    console.log('[MobileFixes] Mejoras móviles inicializadas correctamente');
  }
  
  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Dar tiempo para que los otros scripts se carguen primero
      setTimeout(initMobileFixes, 500);
    });
  } else {
    // Si el DOM ya está listo, esperar un poco para que los otros scripts se inicialicen
    setTimeout(initMobileFixes, 500);
  }
})();