// Состояние игры
let gameState = {
    balance: 1500,
    portfolio: {
        USD: 0,
        EUR: 0,
        CNY: 0
    },
    rates: {
        USD: 80.50,
        EUR: 90.25,
        CNY: 11.80
    },
    previousRates: {
        USD: 80.50,
        EUR: 90.25,
        CNY: 11.80
    },
    currentAmount: 500,
    news: []
};

// Новости
const newsList = [
    { text: "ЦБ повысил ключевую ставку", type: "positive", impact: { USD: 0.03, EUR: 0.02, CNY: 0.01 } },
    { text: "Падение цен на нефть", type: "negative", impact: { USD: -0.04, EUR: -0.02, CNY: -0.01 } },
    { text: "Новые санкции", type: "negative", impact: { USD: 0.05, EUR: 0.03, CNY: 0.02 } },
    { text: "Китай увеличил экспорт", type: "positive", impact: { USD: 0.01, EUR: 0.01, CNY: -0.03 } },
    { text: "ЕЦБ сохранил ставки", type: "neutral", impact: { USD: -0.02, EUR: 0.02, CNY: 0.01 } },
    { text: "Рост ВВП США", type: "positive", impact: { USD: -0.03, EUR: 0.01, CNY: 0.01 } },
    { text: "Инфляция снизилась", type: "positive", impact: { USD: 0.01, EUR: -0.02, CNY: 0.01 } },
    { text: "Торговые переговоры провалились", type: "negative", impact: { USD: 0.04, EUR: 0.03, CNY: 0.05 } },
    { text: "Криптовалюты выросли", type: "neutral", impact: { USD: 0.02, EUR: 0.01, CNY: 0.01 } },
    { text: "Доллар укрепился", type: "positive", impact: { USD: -0.04, EUR: 0.02, CNY: 0.02 } },
    { text: "Евро ослаб", type: "negative", impact: { USD: 0.01, EUR: 0.04, CNY: 0.01 } },
    { text: "Юань стабилизировался", type: "positive", impact: { USD: 0.01, EUR: 0.01, CNY: -0.02 } },
    { text: "Золото подорожал", type: "positive", impact: { USD: 0.02, EUR: 0.02, CNY: 0.02 } },
    { text: "ФРС готовится к смягчению", type: "negative", impact: { USD: 0.03, EUR: 0.01, CNY: 0.01 } },
    { text: "Банки повысили прогнозы по рублю", type: "positive", impact: { USD: -0.03, EUR: -0.02, CNY: -0.02 } },
    { text: "Нефть превысила $90", type: "positive", impact: { USD: -0.02, EUR: -0.01, CNY: -0.01 } },
    { text: "Акции упали", type: "negative", impact: { USD: 0.03, EUR: 0.02, CNY: 0.02 } },
    { text: "Китай снизил ставки", type: "positive", impact: { USD: 0.01, EUR: 0.01, CNY: -0.04 } },
    { text: "Турецкая лира обновила минимум", type: "neutral", impact: { USD: 0.02, EUR: 0.02, CNY: 0.01 } },
    { text: "Япония вмешалась в курс йены", type: "neutral", impact: { USD: 0.01, EUR: 0.01, CNY: 0.01 } }
];

// Инициализация игры
window.addEventListener('DOMContentLoaded', () => {
    console.log("Игра загружается...");
    initGame();
});

function initGame() {
    loadGame();
    setupEventListeners();
    updateDisplay();
    startRateFluctuation();
    startNewsCycle();
    
    console.log("Игра инициализирована");
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопки выбора суммы
    document.querySelectorAll('.amount-option').forEach(btn => {
        btn.addEventListener('click', function() {
            // Снимаем активный класс со всех
            document.querySelectorAll('.amount-option').forEach(b => {
                b.classList.remove('active');
            });
            
            // Добавляем активный класс текущей
            this.classList.add('active');
            
            // Обновляем сумму
            gameState.currentAmount = parseInt(this.dataset.amount);
            
            console.log(`Выбрана сумма: ${gameState.currentAmount}`);
            
            showNotification(`Выбрана сумма: ${gameState.currentAmount} ₽`, 'info');
        });
    });
    
    // Кнопки рейтинга и портфеля
    document.getElementById('ratingBtn').addEventListener('click', () => {
        updateRating();
        document.getElementById('ratingModal').classList.add('show');
    });
    
    document.getElementById('portfolioBtn').addEventListener('click', () => {
        updatePortfolio();
        document.getElementById('portfolioModal').classList.add('show');
    });
    
    // Кнопки закрытия модальных окон
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('show');
            });
        });
    });
}

// ТОРГОВЛЯ - ФИКСИРОВАННАЯ ФУНКЦИЯ
function tradeCurrency(currency, action) {
    console.log(`Торговля: ${action} ${currency} на сумму ${gameState.currentAmount}`);
    
    const rate = gameState.rates[currency];
    const amount = gameState.currentAmount;
    
    if (action === 'buy') {
        const cost = amount * rate;
        if (cost > gameState.balance) {
            showNotification('Недостаточно средств!', 'error');
            return;
        }
        
        gameState.balance -= cost;
        gameState.portfolio[currency] += amount;
        showNotification(`Куплено ${amount} ${currency} за ${cost.toFixed(2)} ₽`, 'success');
    } else if (action === 'sell') {
        if (amount > gameState.portfolio[currency]) {
            showNotification('Недостаточно валюты!', 'error');
            return;
        }
        
        const income = amount * rate;
        gameState.balance += income;
        gameState.portfolio[currency] -= amount;
        showNotification(`Продано ${amount} ${currency} за ${income.toFixed(2)} ₽`, 'success');
    }
    
    updateDisplay();
    saveGame();
}

// Обновление отображения
function updateDisplay() {
    // Баланс
    document.getElementById('balanceAmount').textContent = `${gameState.balance.toFixed(2)} ₽`;
    
    // Курсы валют
    updateCurrencyDisplay('USD');
    updateCurrencyDisplay('EUR');
    updateCurrencyDisplay('CNY');
    
    // Обновляем портфель
    updatePortfolio();
}

// Обновление отображения валюты
function updateCurrencyDisplay(currency) {
    const rate = gameState.rates[currency];
    const previous = gameState.previousRates[currency];
    const change = ((rate - previous) / previous) * 100;
    
    // Обновляем цену
    const priceElement = document.getElementById(`${currency.toLowerCase()}Price`);
    priceElement.textContent = rate.toFixed(2);
    
    // Добавляем анимацию изменения
    if (rate > previous) {
        priceElement.classList.remove('price-down');
        priceElement.classList.add('price-up');
    } else if (rate < previous) {
        priceElement.classList.remove('price-up');
        priceElement.classList.add('price-down');
    }
    
    // Убираем анимацию через 500ms
    setTimeout(() => {
        priceElement.classList.remove('price-up', 'price-down');
    }, 500);
    
    // Обновляем процент изменения
    const changeElement = document.getElementById(`${currency.toLowerCase()}Change`);
    const changeValue = changeElement.querySelector('.change-value');
    const changeIcon = changeElement.querySelector('.change-icon');
    
    changeValue.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    
    if (change > 0) {
        changeElement.className = 'currency-change up';
        changeIcon.className = 'fas fa-arrow-up change-icon';
    } else {
        changeElement.className = 'currency-change down';
        changeIcon.className = 'fas fa-arrow-down change-icon';
    }
}

// Флуктуация курсов
function startRateFluctuation() {
    setInterval(() => {
        // Сохраняем предыдущие курсы
        gameState.previousRates = { ...gameState.rates };
        
        // Обновляем каждый курс
        gameState.rates.USD *= 1 + (Math.random() * 0.1 - 0.05);
        gameState.rates.EUR *= 1 + (Math.random() * 0.1 - 0.05);
        gameState.rates.CNY *= 1 + (Math.random() * 0.08 - 0.04);
        
        // Ограничения
        gameState.rates.USD = Math.max(10, Math.min(200, gameState.rates.USD));
        gameState.rates.EUR = Math.max(20, Math.min(300, gameState.rates.EUR));
        gameState.rates.CNY = Math.max(5, Math.min(50, gameState.rates.CNY));
        
        updateDisplay();
    }, 3000);
}

// Цикл новостей
function startNewsCycle() {
    setInterval(() => {
        const newsIndex = Math.floor(Math.random() * newsList.length);
        const newsItem = newsList[newsIndex];
        
        showNotification(newsItem.text, newsItem.type);
        
        // Применяем влияние новости
        Object.keys(newsItem.impact).forEach(currency => {
            if (gameState.rates[currency]) {
                gameState.previousRates[currency] = gameState.rates[currency];
                gameState.rates[currency] *= (1 + newsItem.impact[currency]);
            }
        });
        
        updateDisplay();
    }, 15000);
}

// Показать уведомление
function showNotification(text, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = text;
    
    // Цвета для разных типов
    const colors = {
        success: '#34C759',
        error: '#FF3B30',
        info: '#007AFF',
        warning: '#FF9500',
        positive: '#34C759',
        negative: '#FF3B30',
        neutral: '#007AFF'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    notification.classList.add('show');
    
    // Скрыть через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Обновление рейтинга
function updateRating() {
    const totalValue = gameState.balance + 
        gameState.portfolio.USD * gameState.rates.USD +
        gameState.portfolio.EUR * gameState.rates.EUR +
        gameState.portfolio.CNY * gameState.rates.CNY;
    
    // Создаем рейтинг
    const ratings = [
        { name: "Вы", value: totalValue, current: true }
    ];
    
    // Добавляем демо-игроков
    for (let i = 1; i <= 9; i++) {
        ratings.push({
            name: `Игрок ${i}`,
            value: 1500 + Math.random() * 10000,
            current: false
        });
    }
    
    // Сортируем по убыванию
    ratings.sort((a, b) => b.value - a.value);
    
    // Отображаем
    const ratingList = document.getElementById('ratingList');
    ratingList.innerHTML = '';
    
    ratings.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = `rating-item ${player.current ? 'current' : ''}`;
        item.innerHTML = `
            <div class="rating-rank">${index + 1}</div>
            <div class="rating-name">${player.name}</div>
            <div class="rating-value">${player.value.toFixed(2)} ₽</div>
        `;
        ratingList.appendChild(item);
    });
}

// Обновление портфеля
function updatePortfolio() {
    // Обновляем значения в модальном окне
    document.getElementById('portfolioUSD').textContent = gameState.portfolio.USD.toFixed(2);
    document.getElementById('portfolioEUR').textContent = gameState.portfolio.EUR.toFixed(2);
    document.getElementById('portfolioCNY').textContent = gameState.portfolio.CNY.toFixed(2);
    
    // Обновляем стоимости
    document.getElementById('portfolioUSDValue').textContent = 
        `${(gameState.portfolio.USD * gameState.rates.USD).toFixed(2)} ₽`;
    document.getElementById('portfolioEURValue').textContent = 
        `${(gameState.portfolio.EUR * gameState.rates.EUR).toFixed(2)} ₽`;
    document.getElementById('portfolioCNYValue').textContent = 
        `${(gameState.portfolio.CNY * gameState.rates.CNY).toFixed(2)} ₽`;
    
    // Общая стоимость
    const total = gameState.balance + 
        gameState.portfolio.USD * gameState.rates.USD +
        gameState.portfolio.EUR * gameState.rates.EUR +
        gameState.portfolio.CNY * gameState.rates.CNY;
    
    document.getElementById('portfolioTotal').textContent = total.toFixed(2);
}

// Сохранение игры
function saveGame() {
    localStorage.setItem('currencyTraderSave', JSON.stringify(gameState));
}

// Загрузка игры
function loadGame() {
    const saved = localStorage.getItem('currencyTraderSave');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            Object.assign(gameState, data);
        } catch (e) {
            console.log('Ошибка загрузки сохранения');
        }
    }
}

// Закрытие модального окна
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}
