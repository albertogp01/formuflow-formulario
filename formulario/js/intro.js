// Elementos DOM para la animación de introducción
const introAnimation = document.querySelector('.intro-animation');
const introProgressBar = document.querySelector('.intro-progress-bar');

// Configuración de la secuencia de carga
const loadingSequence = [
    {width: '15%', delay: 200},
    {width: '35%', delay: 550},
    {width: '65%', delay: 900},
    {width: '85%', delay: 1200},
    {width: '95%', delay: 1500},
    {width: '100%', delay: 1800}
];

// Iniciar la animación de introducción cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    initIntroAnimation();
});

// Función para ejecutar la animación de introducción
function initIntroAnimation() {
    let currentIndex = 0;
    
    function executeNextStep() {
        if (currentIndex < loadingSequence.length) {
            const step = loadingSequence[currentIndex];
            setTimeout(() => {
                introProgressBar.style.width = step.width;
                currentIndex++;
                executeNextStep();
            }, step.delay - (currentIndex > 0 ? loadingSequence[currentIndex-1].delay : 0));
        } else {
            setTimeout(() => {
                introAnimation.style.opacity = '0';
                setTimeout(() => {
                    introAnimation.style.display = 'none';
                    showQuestion(1);
                }, 400);
            }, 400);
        }
    }
    
    executeNextStep();
}