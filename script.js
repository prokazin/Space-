class CosmicFlight {
    constructor() {
        this.canvas = document.getElementById('spaceCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.nebulas = [];
        this.animationId = null;
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.targetX = 0;
        this.targetY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.inactivityTimer = null;
        this.depth = 0;
        
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.createStars(2000);
        this.createNebulas(3);
        this.setupEventListeners();
        this.startInactivityTimer();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth * window.devicePixelRatio;
        this.canvas.height = window.innerHeight * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    createStars(count) {
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                z: Math.random() * 2000, // Глубина от 0 до 2000
                size: Math.random() * 3 + 0.5,
                baseSpeed: Math.random() * 0.3 + 0.1,
                color: this.getStarColor(),
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }

    createNebulas(count) {
        const colors = [
            {r: 139, g: 185, b: 254}, // Голубая
            {r: 212, g: 185, b: 255}, // Фиолетовая
            {r: 255, g: 176, b: 158}, // Красная
            {r: 255, g: 221, b: 158}  // Золотая
        ];
        
        for (let i = 0; i < count; i++) {
            this.nebulas.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                z: Math.random() * 1500 + 500,
                radius: Math.random() * 200 + 100,
                color: colors[Math.floor(Math.random() * colors.length)],
                density: Math.random() * 0.3 + 0.1,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.005 + 0.002
            });
        }
    }

    getStarColor() {
        const temperature = Math.random();
        if (temperature < 0.6) return '#8bb9fe'; // Голубые
        if (temperature < 0.85) return '#ffffff'; // Белые
        if (temperature < 0.95) return '#ffdd9e'; // Жёлтые
        return '#ffb09e'; // Красные
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        // Плавное отслеживание мыши с инерцией
        window.addEventListener('mousemove', (e) => {
            this.resetInactivityTimer();
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // Touch события
        window.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.resetInactivityTimer();
            const touch = e.touches[0];
            this.mouseX = touch.clientX;
            this.mouseY = touch.clientY;
            this.targetX = (touch.clientX / window.innerWidth - 0.5) * 2;
            this.targetY = (touch.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: false });

        window.addEventListener('touchstart', (e) => {
            this.resetInactivityTimer();
            const touch = e.touches[0];
            this.targetX = (touch.clientX / window.innerWidth - 0.5) * 2;
            this.targetY = (touch.clientY / window.innerHeight - 0.5) * 2;
        });

        // Колесо мыши для контроля скорости
        window.addEventListener('wheel', (e) => {
            this.resetInactivityTimer();
            // Плавное изменение скорости при скролле
            this.velocityX += (e.deltaY > 0 ? -0.01 : 0.01);
            this.velocityY += (e.deltaY > 0 ? -0.01 : 0.01);
        }, { passive: true });
    }

    startInactivityTimer() {
        this.resetInactivityTimer = () => {
            clearTimeout(this.inactivityTimer);
            document.body.classList.remove('inactive');
            
            this.inactivityTimer = setTimeout(() => {
                document.body.classList.add('inactive');
            }, 3000); // 3 секунды неактивности
        };
        
        this.resetInactivityTimer();
    }

    animate() {
        // Плавная интерполяция скорости
        this.velocityX += (this.targetX * 0.01 - this.velocityX) * 0.05;
        this.velocityY += (this.targetY * 0.01 - this.velocityY) * 0.05;
        
        // Увеличение глубины со временем
        this.depth += 0.01;

        // Очистка с эффектом шлейфа
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Отрисовка туманностей
        this.nebulas.forEach(nebula => {
            nebula.pulse += nebula.pulseSpeed;
            
            const depthFactor = nebula.z / 2000;
            const moveX = this.velocityX * 50 * depthFactor;
            const moveY = this.velocityY * 50 * depthFactor;
            
            nebula.x += moveX;
            nebula.y += moveY;
            
            // Обновляем позицию туманности
            if (nebula.x < -nebula.radius * 2) nebula.x = this.canvas.width + nebula.radius;
            if (nebula.x > this.canvas.width + nebula.radius * 2) nebula.x = -nebula.radius;
            if (nebula.y < -nebula.radius * 2) nebula.y = this.canvas.height + nebula.radius;
            if (nebula.y > this.canvas.height + nebula.radius * 2) nebula.y = -nebula.radius;
            
            const pulseFactor = Math.sin(nebula.pulse) * 0.2 + 0.8;
            const currentRadius = nebula.radius * pulseFactor;
            
            // Создаём градиент для туманности
            const gradient = this.ctx.createRadialGradient(
                nebula.x, nebula.y, 0,
                nebula.x, nebula.y, currentRadius
            );
            
            const alpha = nebula.density * (1 - depthFactor * 0.5);
            gradient.addColorStop(0, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, ${alpha})`);
            gradient.addColorStop(1, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, 0)`);
            
            this.ctx.beginPath();
            this.ctx.fillStyle = gradient;
            this.ctx.arc(nebula.x, nebula.y, currentRadius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Отрисовка звёзд
        this.stars.forEach(star => {
            // Эффект мерцания
            star.twinkle += star.twinkleSpeed;
            const twinkleFactor = Math.sin(star.twinkle) * 0.3 + 0.7;
            
            const depthFactor = star.z / 2000;
            const speed = star.baseSpeed * (1 - depthFactor * 0.8);
            
            // Движение с параллакс-эффектом
            star.x += this.velocityX * 100 * speed;
            star.y += this.velocityY * 100 * speed;
            
            // Естественный дрейф к центру
            star.x += (centerX - star.x) * 0.0001 * speed;
            star.y += (centerY - star.y) * 0.0001 * speed;
            
            // Обновляем позицию звезды
            if (star.x < -10) star.x = this.canvas.width + 10;
            if (star.x > this.canvas.width + 10) star.x = -10;
            if (star.y < -10) star.y = this.canvas.height + 10;
            if (star.y > this.canvas.height + 10) star.y = -10;
            
            // Размер и яркость зависят от глубины
            const size = star.size * (1 - depthFactor * 0.5) * twinkleFactor;
            const alpha = (0.8 + depthFactor * 0.2) * twinkleFactor;
            
            // Рисуем звезду
            this.ctx.beginPath();
            this.ctx.fillStyle = star.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            this.ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Эффект свечения для ярких звёзд
            if (star.size > 2) {
                this.ctx.beginPath();
                this.ctx.fillStyle = star.color.replace(')', `, ${alpha * 0.3})`).replace('rgb', 'rgba');
                this.ctx.arc(star.x, star.y, size * 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        // Очень редкие редкие космические события (раз в несколько минут)
        if (Math.random() < 0.0001) {
            this.createCosmicEvent();
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    createCosmicEvent() {
        // Случайная вспышка или метеор
        const type = Math.random();
        
        if (type < 0.5) {
            // Вспышка сверхновой
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            
            const flash = () => {
                const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 100);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                this.ctx.beginPath();
                this.ctx.fillStyle = gradient;
                this.ctx.arc(x, y, 100, 0, Math.PI * 2);
                this.ctx.fill();
            };
            
            // Анимация вспышки
            let radius = 0;
            const animateFlash = () => {
                if (radius > 100) return;
                
                const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 - radius/125})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                this.ctx.beginPath();
                this.ctx.fillStyle = gradient;
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                this.ctx.fill();
                
                radius += 2;
                requestAnimationFrame(animateFlash);
            };
            
            animateFlash();
        }
    }
}

// Инициализация
window.addEventListener('load', () => {
    new CosmicFlight();
});
