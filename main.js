class CosmicVoyage {
    constructor() {
        // Основные переменные
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.starField = null;
        this.nebulae = [];
        this.galaxies = [];
        this.velocity = 0;
        this.speed = 0.1;
        this.maxSpeed = 2.0;
        this.distance = 0;
        this.isPaused = false;
        this.clock = new THREE.Clock();
        
        // Элементы DOM
        this.preloader = document.getElementById('preloader');
        this.loadingProgress = document.getElementById('loadingProgress');
        this.instructions = document.getElementById('instructions');
        this.velocityElement = document.getElementById('velocity');
        this.distanceElement = document.getElementById('distance');
        this.starCountElement = document.getElementById('starCount');
        this.pauseBtn = document.getElementById('pauseBtn');
        
        // Управление
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        
        this.init();
    }

    async init() {
        try {
            // 1. Инициализация Three.js
            this.initThreeJS();
            
            // 2. Загрузка текстур с прогрессом
            await this.loadTextures();
            
            // 3. Создание космической сцены
            this.createScene();
            
            // 4. Настройка управления
            this.setupControls();
            
            // 5. Запуск анимации
            this.animate();
            
            // 6. Скрытие прелоадера
            this.hidePreloader();
            
        } catch (error) {
            console.error('Error initializing Cosmic Voyage:', error);
            this.showError();
        }
    }

    initThreeJS() {
        // Сцена
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 100, 2000);
        
        // Камера
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            100000
        );
        this.camera.position.set(0, 0, 100);
        
        // Рендерер
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('spaceCanvas'),
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000);
        this.renderer.autoClear = false;
        
        // Настройки пост-обработки
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
    }

    async loadTextures() {
        const textures = [
            'star',
            'nebula',
            'galaxy'
        ];
        
        let loaded = 0;
        const total = textures.length;
        
        // Симуляция загрузки с реальным прогрессом
        const updateProgress = () => {
            loaded++;
            const progress = (loaded / total) * 100;
            this.loadingProgress.style.width = `${progress}%`;
        };
        
        // Загрузка текстур с fallback на процедурную генерацию
        const textureLoader = new THREE.TextureLoader();
        
        // Звёздное небо
        try {
            this.starTexture = await this.loadTextureWithFallback(
                textureLoader,
                'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2020',
                this.createStarTexture()
            );
            updateProgress();
        } catch (e) {
            this.starTexture = this.createStarTexture();
            updateProgress();
        }
        
        // Текстуры туманностей
        try {
            this.nebulaTexture = await this.loadTextureWithFallback(
                textureLoader,
                'https://images.unsplash.com/photo-1465101162946-4377e57745c3?q=80&w=2078',
                this.createNebulaTexture()
            );
            updateProgress();
        } catch (e) {
            this.nebulaTexture = this.createNebulaTexture();
            updateProgress();
        }
        
        // Галактики
        try {
            this.galaxyTexture = await this.loadTextureWithFallback(
                textureLoader,
                'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=2070',
                this.createGalaxyTexture()
            );
            updateProgress();
        } catch (e) {
            this.galaxyTexture = this.createGalaxyTexture();
            updateProgress();
        }
    }

    loadTextureWithFallback(loader, url, fallback) {
        return new Promise((resolve) => {
            loader.load(
                url,
                (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    resolve(texture);
                },
                undefined,
                () => {
                    // При ошибке используем fallback
                    resolve(fallback);
                }
            );
        });
    }

    createStarTexture() {
        // Создаём процедурную текстуру звёздного неба
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Чёрный фон
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 512, 512);
        
        // Рисуем звёзды
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const radius = Math.random() * 1.5 + 0.5;
            const brightness = Math.random() * 0.8 + 0.2;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            ctx.fill();
            
            // Добавляем свечение для некоторых звёзд
            if (Math.random() > 0.7) {
                ctx.beginPath();
                ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${brightness * 0.3})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createNebulaTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Градиент для туманности
        const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
        gradient.addColorStop(0, 'rgba(139, 185, 254, 0.8)');
        gradient.addColorStop(0.3, 'rgba(212, 185, 255, 0.4)');
        gradient.addColorStop(0.6, 'rgba(255, 176, 158, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 1024);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createGalaxyTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Спиральная галактика
        const centerX = 512;
        const centerY = 512;
        
        // Ядро галактики
        const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
        coreGradient.addColorStop(0, '#ffdd9e');
        coreGradient.addColorStop(1, 'rgba(255, 221, 158, 0)');
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
        ctx.fill();
        
        // Спиральные рукава
        ctx.strokeStyle = 'rgba(139, 185, 254, 0.6)';
        ctx.lineWidth = 20;
        
        for (let arm = 0; arm < 4; arm++) {
            ctx.beginPath();
            const angleOffset = (arm * Math.PI) / 2;
            
            for (let i = 0; i < 500; i++) {
                const t = i / 100;
                const radius = 100 + t * 300;
                const angle = angleOffset + t * 5 + Math.sin(t * 2) * 0.5;
                
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createScene() {
        // 1. Звёздное поле (тысячи частиц)
        this.createStarField(10000);
        
        // 2. Туманности
        this.createNebulae(15);
        
        // 3. Галактики
        this.createGalaxies(8);
        
        // 4. Далекие звёзды (сфера)
        this.createDistantStars();
        
        // 5. Спецэффекты
        this.createSpecialEffects();
    }

    createStarField(count) {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            size: 0.1,
            sizeAttenuation: true,
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        for (let i = 0; i < count; i++) {
            // Распределение звёзд в сфере
            const radius = Math.random() * 2000 + 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Цвета звёзд
            const starType = Math.random();
            let r, g, b;
            
            if (starType < 0.6) { // Голубые
                r = 0.5; g = 0.7; b = 1.0;
            } else if (starType < 0.85) { // Белые
                r = 1.0; g = 1.0; b = 1.0;
            } else if (starType < 0.95) { // Жёлтые
                r = 1.0; g = 0.9; b = 0.6;
            } else { // Красные
                r = 1.0; g = 0.6; b = 0.6;
            }
            
            colors[i * 3] = r;
            colors[i * 3 + 1] = g;
            colors[i * 3 + 2] = b;
            
            // Размеры звёзд
            sizes[i] = Math.random() * 1.5 + 0.5;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        this.starField = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.starField);
        
        // Обновляем счётчик звёзд
        this.starCountElement.textContent = count.toLocaleString();
    }

    createNebulae(count) {
        for (let i = 0; i < count; i++) {
            const geometry = new THREE.SphereGeometry(
                Math.random() * 200 + 50,
                32,
                32
            );
            
            const material = new THREE.MeshBasicMaterial({
                map: this.nebulaTexture,
                transparent: true,
                opacity: Math.random() * 0.3 + 0.1,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide
            });
            
            const nebula = new THREE.Mesh(geometry, material);
            
            // Позиция в сфере
            const radius = Math.random() * 1500 + 500;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            nebula.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            );
            
            // Случайное вращение
            nebula.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            
            // Анимационные параметры
            nebula.userData = {
                rotationSpeed: (Math.random() - 0.5) * 0.001,
                pulseSpeed: Math.random() * 0.005 + 0.001,
                pulsePhase: Math.random() * Math.PI * 2
            };
            
            this.scene.add(nebula);
            this.nebulae.push(nebula);
        }
    }

    createGalaxies(count) {
        for (let i = 0; i < count; i++) {
            const galaxySize = Math.random() * 300 + 100;
            
            // Создаём галактику как плоскость
            const geometry = new THREE.PlaneGeometry(galaxySize, galaxySize);
            const material = new THREE.MeshBasicMaterial({
                map: this.galaxyTexture,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });
            
            const galaxy = new THREE.Mesh(geometry, material);
            
            // Позиция в далёком космосе
            const radius = Math.random() * 5000 + 2000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            galaxy.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            );
            
            // Направляем галактику к центру сцены
            galaxy.lookAt(0, 0, 0);
            
            // Наклон для реализма
            galaxy.rotateZ(Math.random() * Math.PI * 2);
            
            this.scene.add(galaxy);
            this.galaxies.push(galaxy);
        }
    }

    createDistantStars() {
        // Сфера далёких звёзд (фон)
        const starSphereGeometry = new THREE.SphereGeometry(5000, 64, 64);
        const starSphereMaterial = new THREE.MeshBasicMaterial({
            map: this.starTexture,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.7
        });
        
        const starSphere = new THREE.Mesh(starSphereGeometry, starSphereMaterial);
        this.scene.add(starSphere);
    }

    createSpecialEffects() {
        // Линзовые блики (имитация)
        this.createLensFlare();
        
        // Частицы космической пыли
        this.createDustParticles(5000);
    }

    createLensFlare() {
        // Простой эффект линзовых бликов
        const flareTexture = this.createFlareTexture();
        
        const flare = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: flareTexture,
                color: 0x8bb9fe,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending
            })
        );
        
        flare.scale.set(200, 200, 1);
        flare.position.set(1000, 500, -500);
        this.scene.add(flare);
    }

    createFlareTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.3, 'rgba(139, 185, 254, 0.5)');
        gradient.addColorStop(1, 'rgba(139, 185, 254, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        return new THREE.CanvasTexture(canvas);
    }

    createDustParticles(count) {
        const dustGeometry = new THREE.BufferGeometry();
        const dustMaterial = new THREE.PointsMaterial({
            size: 0.05,
            sizeAttenuation: true,
            color: 0x8bb9fe,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
        });
        
        const positions = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 2000;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
        }
        
        dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const dust = new THREE.Points(dustGeometry, dustMaterial);
        this.scene.add(dust);
    }

    setupControls() {
        // Управление с клавиатуры
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Полноэкранный режим
            if (e.key === 'f' || e.key === 'F') {
                this.toggleFullscreen();
            }
            
            // Пауза
            if (e.key === ' ') {
                this.isPaused = !this.isPaused;
                this.pauseBtn.textContent = this.isPaused ? '▶ PLAY' : '⏸ PAUSE';
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Управление мышью
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
        
        // Колесо мыши для контроля скорости
        window.addEventListener('wheel', (e) => {
            this.speed = Math.max(0.01, Math.min(this.maxSpeed, this.speed + (e.deltaY > 0 ? -0.05 : 0.05)));
        });
        
        // Ресайз окна
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Кнопка паузы
        this.pauseBtn.addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            this.pauseBtn.textContent = this.isPaused ? '▶ PLAY' : '⏸ PAUSE';
        });
        
        // Скрытие инструкций через 10 секунд
        setTimeout(() => {
            this.instructions.classList.add('fade-out');
            setTimeout(() => {
                this.instructions.style.display = 'none';
            }, 1000);
        }, 10000);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update(delta) {
        if (this.isPaused) return;
        
        // Обновление скорости
        this.updateMovement(delta);
        
        // Обновление туманностей
        this.updateNebulae(delta);
        
        // Обновление галактик
        this.updateGalaxies(delta);
        
        // Обновление звёздного поля
        this.updateStarField();
        
        // Обновление HUD
        this.updateHUD();
        
        // Увеличение пройденного расстояния
        this.distance += this.velocity * delta;
    }

    updateMovement(delta) {
        // Управление с клавиатуры
        const moveSpeed = this.speed * 50 * delta;
        
        if (this.keys['w'] || this.keys['arrowup']) {
            this.camera.translateZ(-moveSpeed);
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.camera.translateZ(moveSpeed);
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.camera.translateX(-moveSpeed);
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.camera.translateX(moveSpeed);
        }
        
        // Контроль высоты (Q/E)
        if (this.keys['q']) {
            this.camera.translateY(moveSpeed);
        }
        if (this.keys['e']) {
            this.camera.translateY(-moveSpeed);
        }
        
        // Boost (Shift)
        if (this.keys['shift']) {
            this.speed = Math.min(this.maxSpeed, this.speed + delta * 0.5);
        }
        
        // Автоматическое движение вперёд
        this.camera.translateZ(-this.speed * delta * 10);
        
        // Расчёт скорости для HUD
        this.velocity = this.speed * 100;
    }

    updateNebulae(delta) {
        this.nebulae.forEach(nebula => {
            // Вращение
            nebula.rotation.x += nebula.userData.rotationSpeed;
            nebula.rotation.y += nebula.userData.rotationSpeed * 0.7;
            
            // Пульсация
            const pulse = Math.sin(nebula.userData.pulsePhase) * 0.1 + 0.9;
            nebula.scale.setScalar(pulse);
            nebula.userData.pulsePhase += nebula.userData.pulseSpeed;
            
            // Обновление материала
            nebula.material.opacity = (Math.sin(nebula.userData.pulsePhase) * 0.1 + 0.9) * 0.2;
        });
    }

    updateGalaxies(delta) {
        this.galaxies.forEach(galaxy => {
            // Медленное вращение
            galaxy.rotation.z += 0.0001;
        });
    }

    updateStarField() {
        // Простое вращение звёздного поля
        if (this.starField) {
            this.starField.rotation.y += 0.00005;
        }
    }

    updateHUD() {
        this.velocityElement.textContent = this.velocity.toFixed(1);
        this.distanceElement.textContent = Math.floor(this.distance).toLocaleString();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        // Обновление логики
        this.update(delta);
        
        // Рендеринг
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
        
        // Пост-обработка (если добавлена)
        if (this.composer) {
            this.composer.render();
        }
    }

    hidePreloader() {
        setTimeout(() => {
            this.preloader.classList.add('fade-out');
            setTimeout(() => {
                this.preloader.style.display = 'none';
            }, 1000);
        }, 500);
    }

    showError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            color: #ff6b6b;
            padding: 20px;
            border: 1px solid #ff6b6b;
            border-radius: 10px;
            z-index: 10000;
            font-family: monospace;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <div>🚀 COSMIC ENGINE FAILURE</div>
            <div style="margin-top: 10px; font-size: 12px; color: #aaa;">
                Try refreshing or check browser WebGL support
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Инициализация при загрузке
window.addEventListener('load', () => {
    // Проверка поддержки WebGL
    if (!window.WebGLRenderingContext) {
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                color: #8bb9fe;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: monospace;
                text-align: center;
                padding: 20px;
            ">
                <div>
                    <div style="font-size: 24px; margin-bottom: 20px;">⚠️ WEBGL NOT SUPPORTED</div>
                    <div style="opacity: 0.7;">
                        Your browser doesn't support WebGL.<br>
                        Please try Chrome, Firefox, or Edge.
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    new CosmicVoyage();
});
