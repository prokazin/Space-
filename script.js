class CurrencyFlow {
    constructor() {
        // Игровое состояние
        this.state = {
            balance: 100000, // в рублях
            currencies: {},
            selectedCurrency: null,
            portfolio: {},
            totalTrades: 0
        };

        // DOM элементы
        this.totalBalanceElement = document.getElementById('totalBalance');
        this.currenciesListElement = document.getElementById('currenciesList');
        this.selectedCurrencyInfo = document.getElementById('selectedCurrencyInfo');
        this.currentPriceElement = document.getElementById('currentPrice');
        this.priceChangeElement = document.getElementById('priceChange');
        this.tradeAmountInput = document.getElementById('tradeAmount');
        this.portfolioAmountElement = document.getElementById('portfolioAmount');
        this.notificationElement = document.getElementById('notification');
        this.buyButton = document.getElementById('buyBtn');
        this.sellButton = document.getElementById('sellBtn');

        // Инициализация валют
        this.initCurrencies();
        this.initEventListeners();
        this.startPriceUpdates();
        this.updateUI();
    }

    initCurrencies() {
        this.state.currencies = {
            'USD': {
                id: 'USD',
                name: 'Доллар США',
                symbol: 'USD',
                icon: '💵',
                basePrice: 90, // начальный курс к рублю
                volatility: 0.08, // волатильность
                trend: 0, // тренд
                color: '#00ff9d',
                history: []
            },
            'EUR': {
                id: 'EUR',
                name: 'Евро',
                symbol: 'EUR',
                icon: '💶',
                basePrice: 100,
                volatility: 0.07,
                trend: 0,
                color: '#4d94ff',
                history: []
            },
            'CNY': {
                id: 'CNY',
                name: 'Китайский юань',
                symbol: 'CNY',
                icon: '💴',
                basePrice: 12,
                volatility: 0.05,
                trend: 0,
                color: '#ffcc00',
                history: []
            },
            'JPY': {
                id: 'JPY',
                name: 'Японская йена',
                symbol: 'JPY',
                icon: '🏯',
                basePrice: 0.6,
                volatility: 0.1,
                trend: 0,
                color: '#ff6666',
                history: []
            },
            'GBP': {
                id: 'GBP',
                name: 'Фунт стерлингов',
                symbol: 'GBP',
                icon: '👑',
                basePrice: 115,
                volatility: 0.09,
                trend: 0,
                color: '#9966ff',
                history: []
            },
            'CHF': {
                id: 'CHF',
                name: 'Швейцарский франк',
                symbol: 'CHF',
                icon: '⛰️',
                basePrice: 105,
                volatility: 0.06,
                trend: 0,
                color: '#66ffcc',
                history: []
            }
        };

        // Инициализация портфеля
        Object.keys(this.state.currencies).forEach(currencyId => {
            this.state.portfolio[currencyId] = 0;
            const currency = this.state.currencies[currencyId];
            currency.history = [currency.basePrice];
        });

        // Выбор первой валюты
        this.selectCurrency('USD');
        this.renderCurrencies();
    }

    initEventListeners() {
        // Кнопки покупки/продажи
        this.buyButton.addEventListener('click', () => this.trade('buy'));
        this.sellButton.addEventListener('click', () => this.trade('sell'));

        // Кнопки изменения суммы
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const isPlus = e.target.classList.contains('plus');
                this.adjustAmount(isPlus ? 1000 : -1000);
            });
        });

        // Быстрые проценты
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const percent = parseInt(e.target.dataset.percent);
                this.setAmountByPercent(percent);
            });
        });

        // Ручной ввод суммы
        this.tradeAmountInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value) || 1000;
            if (value < 100) value = 100;
            if (value > 100000) value = 100000;
            e.target.value = value;
        });

        // Touch events для лучшей мобильной реакции
        document.addEventListener('touchstart', () => {}, { passive: true });
    }

    startPriceUpdates() {
        // Быстрое обновление цен каждые 2 секунды
        setInterval(() => this.updateAllPrices(), 2000);
        
        // Случайные рыночные события каждые 10-30 секунд
        setInterval(() => this.marketEvent(), Math.random() * 20000 + 10000);
    }

    updateAllPrices() {
        Object.keys(this.state.currencies).forEach(currencyId => {
            const currency = this.state.currencies[currencyId];
            
            // Генерируем изменение цены
            let change = (Math.random() - 0.5) * 2 * currency.volatility;
            
            // Добавляем тренд
            change += currency.trend;
            
            // Резкие изменения с небольшой вероятностью
            if (Math.random() < 0.05) {
                change *= 3; // резкий скачок
            }
            
            // Применяем изменение
            const newPrice = Math.max(0.1, currency.basePrice * (1 + change));
            currency.basePrice = newPrice;
            
            // Обновляем историю
            currency.history.push(newPrice);
            if (currency.history.length > 50) currency.history.shift();
            
            // Обновляем тренд (случайное блуждание)
            currency.trend += (Math.random() - 0.5) * 0.02;
            currency.trend = Math.max(-0.1, Math.min(0.1, currency.trend));
        });

        // Обновляем UI
        this.renderCurrencies();
        if (this.state.selectedCurrency) {
            this.updateSelectedCurrency();
        }
    }

    marketEvent() {
        // Случайное рыночное событие
        const eventTypes = [
            { name: 'Резкий рост', multiplier: 1.5, duration: 5000 },
            { name: 'Обвал', multiplier: 0.6, duration: 5000 },
            { name: 'Волатильность', multiplier: 2, duration: 10000 }
        ];
        
        const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const affectedCurrency = Object.keys(this.state.currencies)[
            Math.floor(Math.random() * Object.keys(this.state.currencies).length)
        ];
        
        const currency = this.state.currencies[affectedCurrency];
        const oldVolatility = currency.volatility;
        
        // Применяем событие
        currency.volatility *= event.multiplier;
        
        this.showNotification(`${event.name}: ${currency.name}`, 3000);
        
        // Возвращаем нормальную волатильность через время
        setTimeout(() => {
            currency.volatility = oldVolatility;
            this.showNotification(`${currency.name}: стабилизация`, 2000);
        }, event.duration);
    }

    selectCurrency(currencyId) {
        this.state.selectedCurrency = currencyId;
        
        // Обновляем UI
        document.querySelectorAll('.currency-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedItem = document.querySelector(`[data-currency="${currencyId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        this.updateSelectedCurrency();
    }

    updateSelectedCurrency() {
        const currency = this.state.currencies[this.state.selectedCurrency];
        if (!currency) return;

        const price = currency.basePrice;
        const change = currency.history.length > 1 ? 
            ((price - currency.history[currency.history.length - 2]) / 
             currency.history[currency.history.length - 2]) * 100 : 0;

        // Обновляем информацию о выбранной валюте
        this.selectedCurrencyInfo.innerHTML = `
            <div class="selected-icon">${currency.icon}</div>
            <div class="selected-name">${currency.name}</div>
        `;

        this.currentPriceElement.textContent = `${price.toFixed(2)} ₽`;
        this.priceChangeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
        this.priceChangeElement.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
        
        // Обновляем портфель
        this.portfolioAmountElement.textContent = 
            `${this.state.portfolio[this.state.selectedCurrency].toFixed(4)} ${currency.symbol}`;
    }

    renderCurrencies() {
        this.currenciesListElement.innerHTML = '';
        
        Object.keys(this.state.currencies).forEach(currencyId => {
            const currency = this.state.currencies[currencyId];
            const price = currency.basePrice;
            const change = currency.history.length > 1 ? 
                ((price - currency.history[currency.history.length - 2]) / 
                 currency.history[currency.history.length - 2]) * 100 : 0;
            
            const item = document.createElement('div');
            item.className = `currency-item ${this.state.selectedCurrency === currencyId ? 'active' : ''}`;
            item.dataset.currency = currencyId;
            
            item.innerHTML = `
                <div class="currency-icon">${currency.icon}</div>
                <div class="currency-info">
                    <div class="currency-name">${currency.name}</div>
                    <div class="currency-symbol">${currency.symbol}</div>
                </div>
                <div class="currency-price">
                    <div class="currency-price-value">${price.toFixed(2)} ₽</div>
                    <div class="currency-price-change ${change >= 0 ? 'positive' : 'negative'}">
                        ${change >= 0 ? '↗' : '↘'} ${Math.abs(change).toFixed(2)}%
                    </div>
                </div>
                <div class="currency-amount">
                    ${this.state.portfolio[currencyId].toFixed(4)} ${currency.symbol}
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.selectCurrency(currencyId);
                this.playClickSound();
            });
            
            this.currenciesListElement.appendChild(item);
        });
    }

    trade(action) {
        if (!this.state.selectedCurrency) {
            this.showNotification('Выберите валюту', 2000);
            return;
        }
        
        const currencyId = this.state.selectedCurrency;
        const currency = this.state.currencies[currencyId];
        const amount = parseInt(this.tradeAmountInput.value) || 1000;
        const price = currency.basePrice;
        
        if (action === 'buy') {
            const currencyAmount = amount / price;
            const cost = amount;
            
            if (cost > this.state.balance) {
                this.showNotification('Недостаточно средств', 2000);
                this.playErrorSound();
                return;
            }
            
            this.state.balance -= cost;
            this.state.portfolio[currencyId] += currencyAmount;
            this.state.totalTrades++;
            
            this.showNotification(
                `Куплено ${currencyAmount.toFixed(4)} ${currency.symbol} за ${cost.toFixed(2)} ₽`,
                2000
            );
            
        } else if (action === 'sell') {
            const currencyAmount = amount / price;
            const ownedAmount = this.state.portfolio[currencyId];
            
            if (currencyAmount > ownedAmount) {
                this.showNotification('Недостаточно валюты', 2000);
                this.playErrorSound();
                return;
            }
            
            const revenue = amount;
            this.state.balance += revenue;
            this.state.portfolio[currencyId] -= currencyAmount;
            this.state.totalTrades++;
            
            this.showNotification(
                `Продано ${currencyAmount.toFixed(4)} ${currency.symbol} за ${revenue.toFixed(2)} ₽`,
                2000
            );
        }
        
        this.updateUI();
        this.playTradeSound();
    }

    adjustAmount(delta) {
        let value = parseInt(this.tradeAmountInput.value) || 1000;
        value += delta;
        
        if (value < 100) value = 100;
        if (value > 100000) value = 100000;
        
        this.tradeAmountInput.value = value;
        this.playClickSound();
    }

    setAmountByPercent(percent) {
        const maxAmount = this.state.balance;
        let amount = Math.floor(maxAmount * (percent / 100));
        
        if (amount < 100) amount = 100;
        if (amount > 100000) amount = 100000;
        
        this.tradeAmountInput.value = amount;
        this.playClickSound();
    }

    updateUI() {
        // Обновляем общий баланс
        this.totalBalanceElement.textContent = `${this.state.balance.toLocaleString('ru-RU')} ₽`;
        
        // Обновляем информацию о выбранной валюте
        if (this.state.selectedCurrency) {
            this.updateSelectedCurrency();
        }
    }

    showNotification(message, duration = 3000) {
        this.notificationElement.textContent = message;
        this.notificationElement.classList.add('show');
        
        setTimeout(() => {
            this.notificationElement.classList.remove('show');
        }, duration);
    }

    playClickSound() {
        // Простой звук клика
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    playTradeSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    playErrorSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
    }
}

// Запуск игры при загрузке
window.addEventListener('DOMContentLoaded', () => {
    // Добавляем поддержку AudioContext на iOS
    if (window.AudioContext || window.webkitAudioContext) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
            const resumeAudio = () => {
                audioContext.resume();
                document.removeEventListener('touchstart', resumeAudio);
                document.removeEventListener('click', resumeAudio);
            };
            document.addEventListener('touchstart', resumeAudio);
            document.addEventListener('click', resumeAudio);
        }
    }
    
    // Запускаем игру
    new CurrencyFlow();
});
