<?php
/*
Plugin Name: Formuflow - Formulario de Entrenamiento
Description: Formulario personalizado para planes de entrenamiento personalizado
Version: 1.1.2
Author: FitForm
*/

// Prevenir acceso directo al archivo
if (!defined('ABSPATH')) {
    exit;
}

// Versión del plugin para control de caché
define('FORMUFLOW_VERSION', '1.1.2');

// Configuración del backend API
define('FORMUFLOW_API_URL', 'https://backend-api-production-06be.up.railway.app/api/form/submit'); // URL de producción
// Para desarrollo local: define('FORMUFLOW_API_URL', 'http://localhost:8080/api/form/submit');

// URL del segundo cuestionario
define('FORMUFLOW_FEEDBACK_URL', 'https://fitform.coach/newform');

// Añadir estilos críticos para prevenir FOUC
function formuflow_add_critical_css() {
    echo '<style>
        /* Estilos básicos para evitar el FOUC */
        body { opacity: 0; }
        .loaded body { opacity: 1; transition: opacity 0.3s; }
        
        /* Estilo básico del logo */
        .intro-logo img { max-width: 100%; height: auto; }
        
        /* Estilos adicionales para mensajes y spinner */
        .form-message {
            transition: opacity 0.5s;
            opacity: 1;
        }
        .loading-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 0.8s linear infinite;
            margin-left: 10px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>';
    
    echo '<script>
        document.addEventListener("DOMContentLoaded", function() {
            document.documentElement.className += " loaded";
        });
    </script>';
}
add_action('wp_head', 'formuflow_add_critical_css', 1);

// Registrar los assets (CSS y JS)
function formuflow_enqueue_assets() {
    // Versión para invalidar cachés
    $version = FORMUFLOW_VERSION;
    
    // Registrar estilos
    wp_enqueue_style('formuflow-styles', plugin_dir_url(__FILE__) . 'formulario/css/styles.css', array(), $version);
    
    // Registrar scripts
    wp_enqueue_script('formuflow-intro', plugin_dir_url(__FILE__) . 'formulario/js/intro.js', array('jquery'), $version, true);
    wp_enqueue_script('formuflow-confetti', plugin_dir_url(__FILE__) . 'formulario/js/confetti.js', array('jquery'), $version, true);
    wp_enqueue_script('formuflow-main', plugin_dir_url(__FILE__) . 'formulario/js/main.js', array('jquery'), $version, true);
    wp_enqueue_script('formuflow-navigation', plugin_dir_url(__FILE__) . 'formulario/js/navigation.js', array('jquery'), $version, true);
    wp_enqueue_script('formuflow-validation', plugin_dir_url(__FILE__) . 'formulario/js/validation.js', array('jquery'), $version, true);
    wp_enqueue_script('formuflow-numeric-validation', plugin_dir_url(__FILE__) . 'formulario/js/numeric-validation-fix.js', array('jquery'), $version, true);
    wp_enqueue_script('formuflow-required-marks', plugin_dir_url(__FILE__) . 'formulario/js/required-marks-fix.js', array('jquery'), $version, true);
    wp_enqueue_script('formuflow-api', plugin_dir_url(__FILE__) . 'formulario/js/formapi.js', array('jquery'), $version, true);
    wp_enqueue_style('formuflow-validation-fixes', plugin_dir_url(__FILE__) . 'formulario/css/validation-fixes.css', array(), $version);
    wp_enqueue_script('formuflow-mobile-fixes', plugin_dir_url(__FILE__) . 'formulario/js/form-mobile-fixes.js', array('jquery', 'formuflow-validation', 'formuflow-navigation'), $version, true);
    // Pasar variables al frontend - CONFIGURACIÓN ACTUALIZADA
    wp_localize_script('formuflow-api', 'formuflowConfig', array(
        'apiUrl' => FORMUFLOW_API_URL,
        'feedbackUrl' => FORMUFLOW_FEEDBACK_URL,
        'nonce' => wp_create_nonce('formuflow_submit_nonce'),
        'ajaxurl' => admin_url('admin-ajax.php'),
        'version' => $version,
        // AÑADIDO: Dominio del sitio para CORS
        'siteDomain' => parse_url(get_site_url(), PHP_URL_HOST)
    ));
}

// Shortcode para mostrar el formulario
function formuflow_shortcode($atts = array()) {
    // Parsear atributos
    $atts = shortcode_atts(array(
        'page' => 'form', // 'form' o 'feedback'
    ), $atts);
    
    // Cargar los assets solo cuando se use el shortcode
    formuflow_enqueue_assets();
    
    // Iniciar buffer de salida para capturar HTML
    ob_start();
    
    // Determinar qué formulario mostrar
    if ($atts['page'] == 'feedback') {
        // Incluir el archivo HTML del formulario de feedback
        include(plugin_dir_path(__FILE__) . 'formulario/cuestionario.html');
    } else {
        // Incluir el archivo HTML del formulario principal
        include(plugin_dir_path(__FILE__) . 'formulario/index.html');
    }
    
    // Obtener el contenido y reemplazar las rutas relativas
    $html = ob_get_clean();
    $plugin_url = plugin_dir_url(__FILE__);
    
    // Reemplazar rutas de imagen y otros recursos
    $html = str_replace('src="img/', 'src="' . $plugin_url . 'formulario/img/', $html);
    $html = str_replace('href="css/', 'href="' . $plugin_url . 'formulario/css/', $html);
    $html = str_replace('src="js/', 'src="' . $plugin_url . 'formulario/js/', $html);
    
    // Reemplazar URL del segundo cuestionario
    $html = str_replace('http://fitform.coach/cuestionario', FORMUFLOW_FEEDBACK_URL, $html);

    // Añadir script de depuración mejorado
    $html .= '<script>
        console.log("Formulario cargado. Versión: ' . FORMUFLOW_VERSION . '");
        console.log("API URL:", "' . FORMUFLOW_API_URL . '");
        
        // Esta función se activará cuando se envíe el formulario
        function enviarDatosDirectamente(datos) {
            if (typeof datos !== "object") {
                console.error("Error: datos no es un objeto", datos);
                return;
            }
            
            console.log("Enviando datos directamente:", datos);
            
            // Añadir información de depuración a los datos
            datos.debug_info = {
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                referrer: document.referrer
            };
            
            // Verificar primero si el backend está disponible
            fetch("' . FORMUFLOW_API_URL . '".replace("/api/form/submit", "/health"), {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Cache-Control": "no-cache"
                }
            })
            .then(response => {
                console.log("Estado del backend:", response.status);
                return response.text();
            })
            .then(text => {
                console.log("Respuesta de verificación:", text);
                
                // Ahora enviar los datos reales
                return fetch("' . FORMUFLOW_API_URL . '", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    body: JSON.stringify(datos)
                });
            })
            .then(response => {
                console.log("Estado de respuesta:", response.status);
                console.log("Headers:", 
                    Array.from(response.headers.entries())
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ")
                );
                return response.text();
            })
            .then(text => {
                console.log("Respuesta completa:", text);
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.warn("No se pudo parsear como JSON:", e);
                    return { success: true, message: text };
                }
            })
            .then(data => {
                console.log("Respuesta del servidor procesada:", data);
                
                // Mostrar un mensaje al usuario si hay un error
                if (data && !data.success) {
                    const mensaje = document.createElement("div");
                    mensaje.style.padding = "15px";
                    mensaje.style.margin = "15px 0";
                    mensaje.style.backgroundColor = "#ffebee";
                    mensaje.style.color = "#c62828";
                    mensaje.style.border = "1px solid #ef9a9a";
                    mensaje.style.borderRadius = "4px";
                    mensaje.style.textAlign = "center";
                    mensaje.style.fontWeight = "500";
                    mensaje.textContent = "Error: " + (data.message || "Error desconocido") + ". Por favor, intenta de nuevo.";
                    
                    const container = document.querySelector(".completion-screen");
                    if (container) {
                        container.prepend(mensaje);
                    }
                }
            })
            .catch(error => {
                console.error("Error al enviar datos:", error);
                
                // Intentar enviar a través de AJAX de WordPress como fallback
                console.log("Intentando envío alternativo mediante AJAX de WordPress");
                
                // Formato específico de WP AJAX
                const formData = new FormData();
                formData.append("action", "formuflow_callback");
                formData.append("nonce", "' . wp_create_nonce('formuflow_submit_nonce') . '");
                formData.append("data", JSON.stringify(datos));
                
                fetch("' . admin_url('admin-ajax.php') . '", {
                    method: "POST",
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    console.log("Respuesta de AJAX WP:", data);
                })
                .catch(error => {
                    console.error("Error en envío AJAX:", error);
                });
            });
        }
        
        // Observar cuándo se muestra la pantalla de finalización
        document.addEventListener("DOMContentLoaded", function() {
            // Monitorear cambios en el DOM para detectar cuando aparece la pantalla de finalización
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === "attributes" || mutation.type === "childList") {
                        const completionScreen = document.querySelector(".completion-screen");
                        if (completionScreen && getComputedStyle(completionScreen).display !== "none") {
                            // La pantalla de finalización está visible
                            const formData = window.formData;
                            if (formData) {
                                console.log("Pantalla de finalización detectada, enviando datos", formData);
                                enviarDatosDirectamente(formData);
                            }
                        }
                    }
                });
            });
            
            observer.observe(document.body, { 
                childList: true, 
                subtree: true,
                attributes: true,
                attributeFilter: ["style", "class"]
            });
        });
    </script>';
    
    // Devolver el HTML con las rutas corregidas
    return $html;
}

// Registrar el shortcode
add_shortcode('formuflow_formulario', 'formuflow_shortcode');

// Registrar el shortcode para el formulario de feedback
add_shortcode('formuflow_feedback', function() {
    return formuflow_shortcode(array('page' => 'feedback'));
});

// Añadir página de opciones en el admin
function formuflow_admin_menu() {
    add_options_page(
        'Configuración de Formuflow',
        'Formuflow',
        'manage_options',
        'formuflow-settings',
        'formuflow_settings_page'
    );
}
add_action('admin_menu', 'formuflow_admin_menu');

// Función para renderizar la página de opciones
function formuflow_settings_page() {
    // Verificar permisos
    if (!current_user_can('manage_options')) {
        return;
    }
    
    // Guardar cambios si se envió el formulario
    if (isset($_POST['formuflow_settings_nonce']) && wp_verify_nonce($_POST['formuflow_settings_nonce'], 'formuflow_save_settings')) {
        // Procesar y guardar opciones
        if (isset($_POST['formuflow_api_url'])) {
            update_option('formuflow_api_url', sanitize_url($_POST['formuflow_api_url']));
        }
        
        if (isset($_POST['formuflow_feedback_url'])) {
            update_option('formuflow_feedback_url', sanitize_url($_POST['formuflow_feedback_url']));
        }
        
        echo '<div class="notice notice-success"><p>Configuración guardada.</p></div>';
    }
    
    // Obtener valores actuales
    $api_url = get_option('formuflow_api_url', FORMUFLOW_API_URL);
    $feedback_url = get_option('formuflow_feedback_url', FORMUFLOW_FEEDBACK_URL);
    
    // Mostrar el formulario de configuración
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        
        <form method="post">
            <?php wp_nonce_field('formuflow_save_settings', 'formuflow_settings_nonce'); ?>
            
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="formuflow_api_url">URL de la API</label></th>
                    <td>
                        <input type="url" name="formuflow_api_url" id="formuflow_api_url" value="<?php echo esc_url($api_url); ?>" class="regular-text">
                        <p class="description">URL del backend API para el procesamiento del formulario.</p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row"><label for="formuflow_feedback_url">URL del Cuestionario de Feedback</label></th>
                    <td>
                        <input type="url" name="formuflow_feedback_url" id="formuflow_feedback_url" value="<?php echo esc_url($feedback_url); ?>" class="regular-text">
                        <p class="description">URL del segundo cuestionario de feedback.</p>
                    </td>
                </tr>
            </table>
            
            <p class="submit">
                <input type="submit" name="submit" id="submit" class="button button-primary" value="Guardar Cambios">
            </p>
        </form>
        
        <hr>
        
        <h2>Uso del Shortcode</h2>
        <p>Para mostrar el formulario en cualquier página o entrada, utiliza este shortcode:</p>
        <code>[formuflow_formulario]</code>
        
        <p>Para mostrar el formulario de feedback, utiliza:</p>
        <code>[formuflow_feedback]</code>
        
        <hr>
        
        <h2>Prueba de Conexión</h2>
        <p>Prueba la conexión con el backend:</p>
        <button id="test-api-connection" class="button">Probar Conexión</button>
        <div id="test-result" style="margin-top: 10px; padding: 10px; display: none;"></div>
        
        <script>
        jQuery(document).ready(function($) {
            $('#test-api-connection').click(function() {
                const apiUrl = $('#formuflow_api_url').val();
                const resultElement = $('#test-result');
                
                resultElement.html('Probando conexión...').css({
                    'display': 'block',
                    'background-color': '#f8f9fa',
                    'border': '1px solid #ddd'
                });
                
                // Usar /health si está disponible
                const testUrl = apiUrl.replace('/api/form/submit', '/health');
                
                $.ajax({
                    url: testUrl,
                    type: 'GET',
                    timeout: 5000,
                    success: function(data) {
                        resultElement.html('✅ Conexión exitosa con el backend.').css({
                            'background-color': '#d4edda',
                            'border': '1px solid #c3e6cb',
                            'color': '#155724'
                        });
                    },
                    error: function(xhr, status, error) {
                        resultElement.html('❌ Error de conexión: ' + error).css({
                            'background-color': '#f8d7da',
                            'border': '1px solid #f5c6cb',
                            'color': '#721c24'
                        });
                    }
                });
                
                return false;
            });
        });
        </script>
    </div>
    <?php
}

// Registrar ajustes
function formuflow_register_settings() {
    register_setting('formuflow_settings', 'formuflow_api_url');
    register_setting('formuflow_settings', 'formuflow_feedback_url');
}
add_action('admin_init', 'formuflow_register_settings');

// Sustituir constantes por opciones si están definidas
function formuflow_init() {
    $api_url = get_option('formuflow_api_url');
    if ($api_url) {
        define('FORMUFLOW_API_URL_DYNAMIC', $api_url);
    }
    
    $feedback_url = get_option('formuflow_feedback_url');
    if ($feedback_url) {
        define('FORMUFLOW_FEEDBACK_URL_DYNAMIC', $feedback_url);
    }
}
add_action('init', 'formuflow_init');

// Permitir recibir devoluciones de llamada desde el formulario
function formuflow_callback_handler() {
    // Verificar nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'formuflow_submit_nonce')) {
        wp_send_json_error('Error de seguridad');
    }
    
    // Procesar datos
    $data = json_decode(stripslashes($_POST['data']), true);
    
    // Aquí puedes hacer cualquier procesamiento adicional con los datos
    
    // Responder con éxito
    wp_send_json_success(array(
        'message' => 'Datos recibidos correctamente'
    ));
}
add_action('wp_ajax_formuflow_callback', 'formuflow_callback_handler');
add_action('wp_ajax_nopriv_formuflow_callback', 'formuflow_callback_handler');

// Filtro para modificar la URL de la API dinámicamente
function formuflow_api_url_filter($api_url) {
    if (defined('FORMUFLOW_API_URL_DYNAMIC')) {
        return FORMUFLOW_API_URL_DYNAMIC;
    }
    return $api_url;
}
add_filter('formuflow_api_url', 'formuflow_api_url_filter');

// Filtro para modificar la URL del feedback dinámicamente
function formuflow_feedback_url_filter($feedback_url) {
    if (defined('FORMUFLOW_FEEDBACK_URL_DYNAMIC')) {
        return FORMUFLOW_FEEDBACK_URL_DYNAMIC;
    }
    return $feedback_url;
}
add_filter('formuflow_feedback_url', 'formuflow_feedback_url_filter');