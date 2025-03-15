// Versión actualizada de confetti.js

class Confetti {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.particles = [];
        this.particleCount = 100; // Reducido de 150 a 100
        this.colors = ['#3182CE', '#4299E1', '#48BB78', '#F6E05E', '#ED8936', '#9F7AEA', '#ED64A6'];
        this.gravity = 1.0; // Aumentado de 0.7 a 1.0 para que caigan más rápido
        this.terminalVelocity = 8; // Aumentado de 5 a 8
        this.drag = 0.075;
        
        this.init();
    }
    
    init() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '1000';
        this.canvas.style.pointerEvents = 'none';
        document.body.appendChild(this.canvas);
        
        // Crear partículas
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
        
        this.animate();
        
        // Remover el canvas después de la animación
        // Reducido de 6000ms a 3000ms (3 segundos)
        setTimeout(() => {
            this.canvas.style.transition = 'opacity 0.5s ease';
            this.canvas.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(this.canvas);
            }, 500);
        }, 3000);
    }
    
    createParticle() {
        const x = Math.random() * this.width;
        const y = Math.random() * this.height - this.height;
        
        return {
            x,
            y,
            xVel: (Math.random() - 0.5) * 12, // Aumentado para más velocidad
            yVel: Math.random() * 15, // Aumentado para más velocidad
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            size: Math.random() * 8 + 5, // Ligeramente más pequeños
            shape: Math.random() > 0.5 ? 'circle' : 'rect',
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 3
        };
    }
    
    update() {
        this.particles.forEach(p => {
            // Aplicar gravedad y resistencia del aire
            p.yVel += this.gravity;
            p.yVel = Math.min(p.yVel, this.terminalVelocity);
            p.xVel *= (1 - this.drag);
            
            // Actualizar posición
            p.x += p.xVel;
            p.y += p.yVel;
            
            // Actualizar rotación
            p.rotation += p.rotationSpeed;
            
            // Reiniciar partículas que salen de la pantalla
            if (p.y > this.height) {
                const i = this.particles.indexOf(p);
                this.particles[i] = this.createParticle();
            }
        });
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation * Math.PI / 180);
            
            this.ctx.fillStyle = p.color;
            
            if (p.shape === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }
            
            this.ctx.restore();
        });
    }
    
    animate() {
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.animate());
    }
}
