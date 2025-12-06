// Состояние игры
const gameState = {
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
    selectedCurrency: null
};

// Новости
const news = [
    { text: "ЦБ повысил ключевую ставку", type: "positive" },
    { text: "Падение цен на нефть", type: "negative" },
    { text: "Новые санкции против России", type: "negative" },
    { text: "Китай увеличил экспорт", type: "positive" },
    { text: "ЕЦБ сохранил ставки", type: "neutral" },
    { text: "Рост ВВП США", type: "positive" },
    { text: "Инфляция в еврозоне снизилась", type: "positive" },
    { text: "Торговые переговоры провалились", type: "negative" },
    { text: "Криптовалюты резко выросли", type: "neutral" },
    { text: "Доллар укрепился на мировом рынке", type: "positive" },
    { text: "Евро ослаб из-за политических рисков", type: "negative" },
    { text: "Юань стабилизировался", type: "positive" },
    { text: "Золото подорожал на 5%", type: "positive" },
    { text: "ФРС готовится к смягчению политики", type: "negative" },
    { text: "Банки повысили прогнозы по рублю", type: "positive" },
    { text: "Нефть Brent превысила $90", type: "positive" },
    { text: "Акции российских компаний упали", type: "negative" },
    { text: "Китай снизил ставки по кредитам", type: "positive" },
    { text: "Турецкая лира обновила минимум", type: "neutral" },
    { text: "Япония вмешалась в курс йены", type: "neutral" }
];

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    initUI();
    startGameLoop();
});

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

// Сохранение игры
function saveGame() {
    localStorage.setItem('currencyTraderSave', JSON.stringify(gameState));
}

// Инициализация UI
function initUI() {
    // Начальное обновление
    updateUI();
    
    // Кнопки выбора суммы
    document.querySelectorAll('.amount-option').forEach(btn => {
        btn.addEventListener('click', function() {
            // Убрать активный класс у всех
            document.querySelectorAll('.amount-option').forEach(b => {
                b.classList.remove('active');
            });
            
            // Добавить активный класс текущей
            this.classList.add('active');
            
            // Установить сумму
            gameState.currentAmount = parseInt(this.dataset.amount);
            
            showNotification(`Сумма: ${gameState.currentAmount} ₽`, 'info');
        });
    });
    
    // Кнопки покупки/продажи
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const currency = this.dataset.currency;
            const action = this.dataset.action;
            
            trade(currency, action, gameState.currentAmount);
        });
    });
    
    // Кнопки модальных окон
    document.getElementById('ratingBtn').addEventListener('click', () => {
        updateRating();
        document.getElementById('ratingModal').classList.add('show');
    });
    
    document.getElementById('portfolioBtn').addEventListener('click', () => {
        updatePortfolio();
        document.getElementById('portfolioModal').classList.add('show');
    });
    
    // Закрытие модальных окон
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('show');
            });
        });
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('show');
            });
        }
    });
}

// Игровой цикл
function startGameLoop() {
    // Обновление курсов каждые 3 секунды
    setInterval(updateRates, 3000);
    
    // Новости каждые 10-20 секунд
    setInterval(showRandomNews, Math.random() * 10000 + 10000);
    
    // Автосохранение каждые 30 секунд
    setInterval(saveGame, 30000);
}

// Обновление курсов
function updateRates() {
    // Сохраняем предыдущие курсы
    gameState.previousRates = { ...gameState.rates };
    
    // Обновляем каждый курс
    const currencies = ['USD', 'EUR', 'CNY'];
    currencies.forEach(currency => {
        const change = (Math.random() * 0.1 - 0.05); // -5% до +5%
        gameState.rates[currency] *= (1 + change);
        
        // Ограничения
        if (currency === 'USD') gameState.rates[currency] = Math.max(10, Math.min(200, gameState.rates[currency]));
        if (currency === 'EUR') gameState.rates[currency] = Math.max(20, Math.min(300, gameState.rates[currency]));
        if (currency === 'CNY') gameState.rates[currency] = Math.max(5, Math.min(50, gameState.rates[currency]));
    });
    
    updateUI();
}

// Обновление UI
function updateUI() {
    // Баланс
    document.querySelector('.balance-amount').textContent = `${gameState.balance.toFixed(2)} ₽`;
    
    // Обновляем каждую валюту
    updateCurrencyDisplay('USD');
    updateCurrencyDisplay('EUR');
    updateCurrencyDisplay('CNY');
    
    // Портфель
    updatePortfolio();
}

// Обновление отображения валюты
function updateCurrencyDisplay(currency) {
    const rate = gameState.rates[currency];
    const previous = gameState.previousRates[currency];
    const change = ((rate - previous) / previous) * 100;
    
    // Цена
    const priceEl = document.getElementById(`${currency.toLowerCase()}Price`);
    const oldPrice = parseFloat(priceEl.textContent);
    priceEl.textContent = rate.toFixed(2);
    
    // Анимация изменения
    if (rate > oldPrice) {
        priceEl.classList.remove('price-down');
        priceEl.classList.add('price-up');
    } else if (rate < oldPrice) {
        priceEl.classList.remove('price-up');
        priceEl.classList.add('price-down');
    }
    
    // Убираем анимацию через 500ms
    setTimeout(() => {
        priceEl.classList.remove('price-up', 'price-down');
    }, 500);
    
    // Изменение в процентах
    const changeEl = document.getElementById(`${currency.toLowerCase()}Change`);
    const changeValue = changeEl.querySelector('.change-value');
    const changeIcon = changeEl.querySelector('.change-icon');
    
    changeValue.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    
    if (change > 0) {
        changeEl.className = 'currency-change up';
        changeIcon.className = 'fas fa-arrow-up change-icon';
    } else {
        changeEl.className = 'currency-change down';
        changeIcon.className = 'fas fa-arrow-down change-icon';
    }
}

// Торговля
function trade(currency, action, amount) {
    const rate = gameState.rates[currency];
    
    if (action === 'buy') {
        const cost = amount * rate;
        if (cost > gameState.balance) {
            showNotification('Недостаточно средств!', 'error');
            return;
        }
        
        gameState.balance -= cost;
        gameState.portfolio[currency] += amount;
        showNotification(`Куплено ${amount} ${currency} за ${cost.toFixed(2)} ₽`, 'success');
    } else {
        if (amount > gameState.portfolio[currency]) {
            showNotification('Недостаточно валюты!', 'error');
            return;
        }
        
        const income = amount * rate;
        gameState.balance += income;
        gameState.portfolio[currency] -= amount;
        showNotification(`Продано ${amount} ${currency} за ${income.toFixed(2)} ₽`, 'success');
    }
    
    updateUI();
    saveGame();
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
        warning: '#FF9500'
    };
    
    const icon = document.querySelector('.notification-content i');
    icon.style.color = colors[type] || colors.info;
    
    notification.classList.add('show');
    
    // Скрыть через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Случайная новость
function showRandomNews() {
    const newsItem = news[Math.floor(Math.random() * news.length)];
    showNotification(newsItem.text, newsItem.type);
    
    // Эффект новости на курсы
    applyNewsEffect(newsItem.type);
}

// Эффект новости
function applyNewsEffect(type) {
    const currencies = ['USD', 'EUR', 'CNY'];
    const effects = {
        positive: 0.02 + Math.random() * 0.03, // +2-5%
        negative: -0.03 - Math.random() * 0.02, // -3-5%
        neutral: Math.random() * 0.02 - 0.01 // -1% до +1%
    };
    
    const effect = effects[type] || 0;
    
    currencies.forEach(currency => {
        gameState.previousRates[currency] = gameState.rates[currency];
        gameState.rates[currency] *= (1 + effect);
    });
    
    updateUI();
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
    
    // Добавляем ботов
    for (let i = 1; i <= 9; i++) {
        ratings.push({
            name: `Трейдер ${i}`,
            value: 1500 + Math.random() * 8000,
            current: false
        });
    }
    
    // Сортируем по убыванию
    ratings.sort((a, b) => b.value - a.value);
    
    // Отображаем
    const ratingList = document.querySelector('.rating-list.compact');
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
    // Обновляем значения
    document.getElementById('portfolioUSD').textContent = 
        `${gameState.portfolio.USD.toFixed(2)} USD`;
    document.getElementById('portfolioEUR').textContent = 
        `${gameState.portfolio.EUR.toFixed(2)} EUR`;
    document.getElementById('portfolioCNY').textContent = 
        `${gameState.portfolio.CNY.toFixed(2)} CNY`;
    
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
    
    document.getElementById('portfolioTotal').textContent = `${total.toFixed(2)} ₽`;
}