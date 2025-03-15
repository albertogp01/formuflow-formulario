/**
 * form-api.js - Versión corregida
 * Script para manejar la interacción entre el formulario y el backend API.
 */

(function() {
  // Configuración de la API (se obtiene del script localizado por WordPress)
  let apiUrl = window.formuflowConfig?.apiUrl || 'https://backend-api-production-06be.up.railway.app/api/form/submit';
  let isSubmitting = false;
  let formData = {};
  
  // Exponer formData para uso externo
  window.formData = formData;
  
  console.log('[Formuflow] Script inicializado');
  console.log('[Formuflow] URL de API configurada:', apiUrl);

  // Función para mostrar mensajes al usuario
  function showMessage(message, isError = false) {
    console.log(`[Formuflow] ${isError ? 'ERROR' : 'INFO'}: ${message}`);
    
    // Eliminar mensajes anteriores
    const existingMessages = document.querySelectorAll('.form-message');
    existingMessages.forEach(el => el.remove());

    // Crear nuevo elemento de mensaje
    const messageElement = document.createElement('div');
    messageElement.className = `form-message ${isError ? 'form-error' : 'form-success'}`;
    messageElement.innerHTML = message;
    
    // Estilos inline
    messageElement.style.padding = '15px';
    messageElement.style.margin = '15px 0';
    messageElement.style.borderRadius = '4px';
    messageElement.style.textAlign = 'center';
    messageElement.style.fontWeight = '500';
    
    if (isError) {
      messageElement.style.backgroundColor = '#ffebee';
      messageElement.style.color = '#c62828';
      messageElement.style.border = '1px solid #ef9a9a';
    } else {
      messageElement.style.backgroundColor = '#e8f5e9';
      messageElement.style.color = '#2e7d32';
      messageElement.style.border = '1px solid #a5d6a7';
    }
    
    // Insertar antes del botón de envío
    const container = document.querySelector('.navigation-buttons') || document.body;
    container.parentNode.insertBefore(messageElement, container);
    
    // Auto-eliminar después de 8 segundos para errores, 5 para éxitos
    setTimeout(() => {
      messageElement.style.opacity = '0';
      messageElement.style.transition = 'opacity 0.5s';
      setTimeout(() => messageElement.remove(), 500);
    }, isError ? 8000 : 5000);
  }
  
  // Función para mostrar el estado de carga
  function setLoadingState(isLoading) {
    const submitButton = document.querySelector('.button-submit');
    
    if (!submitButton) {
      console.log('[Formuflow] ERROR: No se encontró el botón de envío');
      return;
    }
    
    if (isLoading) {
      console.log('[Formuflow] Estableciendo estado de carga');
      // Guardar el texto original
      submitButton.dataset.originalText = submitButton.innerHTML;
      
      // Cambiar a estado de carga
      submitButton.innerHTML = `
        <span>Procesando...</span>
        <div class="loading-spinner" style="
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 0.8s linear infinite;
          margin-left: 10px;
        "></div>
      `;
      submitButton.disabled = true;
      submitButton.style.cursor = 'wait';
      
      // Añadir estilos de animación si no existen
      if (!document.getElementById('form-api-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'form-api-styles';
        styleElement.textContent = `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(styleElement);
      }
    } else {
      console.log('[Formuflow] Restableciendo estado del botón');
      // Restaurar estado original
      if (submitButton.dataset.originalText) {
        submitButton.innerHTML = submitButton.dataset.originalText;
      }
      submitButton.disabled = false;
      submitButton.style.cursor = 'pointer';
    }
  }
  
  // Función para recopilar todos los datos del formulario
  function collectFormData() {
    // Reiniciar formData como un objeto vacío
    formData = {};
    
    console.log('[Formuflow] Recopilando datos del formulario...');
    
    // Recopilar datos de radio buttons y opciones seleccionadas
    document.querySelectorAll('.radio-option.selected, .option-item.selected').forEach(element => {
      if (element.getAttribute('data-field')) {
        const fieldName = element.getAttribute('data-field');
        const value = element.getAttribute('data-value');
        
        if (fieldName && value) {
          formData[fieldName] = value;
          console.log(`[Formuflow] Campo seleccionado: ${fieldName} = ${value}`);
        }
      }
    });
    
    // Recopilar datos de inputs y textareas
    document.querySelectorAll('input.question-input, textarea.question-input').forEach(element => {
      if (element.getAttribute('data-field')) {
        const fieldName = element.getAttribute('data-field');
        const value = element.value.trim();
        
        if (fieldName && value !== '') {
          formData[fieldName] = value;
          console.log(`[Formuflow] Campo de texto: ${fieldName} = ${value}`);
        }
      }
    });
    
    // Actualizar el objeto global formData
    window.formData = formData;
    
    console.log('[Formuflow] Datos recopilados:', formData);
    return formData;
  }
  
  // Función principal para enviar el formulario
  async function submitForm() {
    console.log('[Formuflow] Iniciando envío del formulario');
    
    // Evitar envíos múltiples
    if (isSubmitting) {
      console.log('[Formuflow] Ya se está procesando un envío, abortando');
      return;
    }
    
    try {
      isSubmitting = true;
      
      // Recopilar datos del formulario
      const formDataToSend = collectFormData();
      
      // Verificar datos mínimos
      if (!formDataToSend.email || !formDataToSend.nombre) {
        showMessage("Por favor completa al menos tu nombre y email", true);
        isSubmitting = false;
        return;
      }
      
      // Mostrar estado de carga
      setLoadingState(true);
      
      // Debug log
      console.log('[Formuflow] Enviando POST a:', apiUrl);
      console.log('[Formuflow] Datos:', JSON.stringify(formDataToSend));
      
      // IMPORTANTE: Aquí es donde hacemos la solicitud POST correctamente
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formDataToSend)
      });
      
      console.log('[Formuflow] Respuesta recibida. Estado:', response.status);
      
      // Procesar respuesta como texto primero para depuración
      const responseText = await response.text();
      console.log('[Formuflow] Texto de respuesta:', responseText);
      
      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.log('[Formuflow] No es JSON válido, usando respuesta como texto');
        data = { success: response.ok, message: responseText };
      }
      
      if (response.ok || data.success) {
        console.log('[Formuflow] Envío exitoso, mostrando pantalla de finalización');
        
        // Mostrar pantalla de finalización
        const questionContainer = document.querySelector('.question-container');
        if (questionContainer) {
          questionContainer.style.display = 'none';
        }
        
        const completionScreen = document.querySelector('.completion-screen');
        if (completionScreen) {
          completionScreen.style.display = 'flex';
          
          // Personalizar mensaje
          const titleElement = completionScreen.querySelector('.completion-title');
          if (titleElement && formDataToSend.nombre) {
            titleElement.textContent = `¡Gracias ${formDataToSend.nombre} por completar el formulario!`;
          }
        }
        
        // Activar confeti
        if (typeof Confetti === 'function') {
          try {
            new Confetti();
          } catch (e) {
            console.warn('[Formuflow] Error al iniciar confeti:', e);
          }
        }
      } else {
        console.error('[Formuflow] Error en respuesta:', data.message || 'Error desconocido');
        showMessage(`Error: ${data.message || 'Error desconocido'}. Por favor, intenta de nuevo.`, true);
        setLoadingState(false);
      }
    } catch (error) {
      console.error('[Formuflow] Error global:', error);
      showMessage(`Error: ${error.message}. Por favor, intenta de nuevo más tarde.`, true);
      setLoadingState(false);
    } finally {
      isSubmitting = false;
    }
  }
  
  // Función de inicio
  function init() {
    console.log('[Formuflow] Inicializando módulo de API...');
    
    // Comprobar si estamos en la página del formulario
    const form = document.querySelector('.question-container');
    if (!form) {
      console.log('[Formuflow] No se encontró el contenedor del formulario, abortando inicialización');
      return;
    }
    
    // Verificar si la URL de la API está disponible
    if (window.formuflowConfig && window.formuflowConfig.apiUrl) {
      apiUrl = window.formuflowConfig.apiUrl;
      console.log('[Formuflow] URL de API configurada desde WordPress:', apiUrl);
    } else {
      console.warn('[Formuflow] No se encontró configuración de API en window.formuflowConfig');
    }
    
    // Añadir manejador al botón de envío
    const submitButton = document.querySelector('.button-submit');
    if (submitButton) {
      console.log('[Formuflow] Configurando listener para botón de envío');
      
      // Limpiar cualquier handler existente
      const newButton = submitButton.cloneNode(true);
      submitButton.parentNode.replaceChild(newButton, submitButton);
      
      // Añadir nuevo handler
      newButton.addEventListener('click', function(e) {
        console.log('[Formuflow] Botón de envío clickeado');
        e.preventDefault();
        e.stopPropagation();
        submitForm();
      });
    } else {
      console.warn('[Formuflow] No se encontró el botón de envío');
    }
    
    console.log('[Formuflow] Formulario API inicializado correctamente');
  }
  
  // Inicializar cuando el DOM esté cargado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();