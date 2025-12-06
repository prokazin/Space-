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
    currentAmount: 100,
    stats: {
        trades: 0,
        profit: 0
    }
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
    updateDisplay();
    startRateUpdates();
    startNewsUpdates();
    setupEventListeners();
});

// Загрузка игры
function loadGame() {
    const saved = localStorage.getItem('currencyTraderSave');
    if (saved) {
        try {
            gameState = JSON.parse(saved);
        } catch (e) {
            console.log('Ошибка загрузки');
        }
    }
}

// Сохранение игры
function saveGame() {
    localStorage.setItem('currencyTraderSave', JSON.stringify(gameState));
}

// Обновление отображения
function updateDisplay() {
    // Обновление цен
    updateCurrencyDisplay('USD');
    updateCurrencyDisplay('EUR');
    updateCurrencyDisplay('CNY');
    
    // Обновление баланса
    document.getElementById('balance').textContent = gameState.balance.toFixed(2);
    
    // Обновление портфеля
    updatePortfolioDisplay();
    
    // Сохранение
    saveGame();
}

// Обновление отображения валюты
function updateCurrencyDisplay(currency) {
    const rate = gameState.rates[currency];
    const previous = gameState.previousRates[currency];
    const change = ((rate - previous) / previous) * 100;
    
    document.getElementById(`${currency.toLowerCase()}Price`).textContent = `${rate.toFixed(2)} ₽`;
    
    const changeElement = document.getElementById(`${currency.toLowerCase()}Change`);
    changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    changeElement.className = `currency-change ${change >= 0 ? 'positive' : 'negative'}`;
}

// Обновление портфеля
function updatePortfolioDisplay() {
    const currencies = ['USD', 'EUR', 'CNY'];
    
    currencies.forEach(currency => {
        const amount = gameState.portfolio[currency];
        const rate = gameState.rates[currency];
        const value = amount * rate;
        
        document.getElementById(`portfolio${currency}`).textContent = amount.toFixed(2);
        document.getElementById(`portfolio${currency}Value`).textContent = `${value.toFixed(2)} ₽`;
    });
    
    const total = gameState.balance + 
        gameState.portfolio.USD * gameState.rates.USD +
        gameState.portfolio.EUR * gameState.rates.EUR +
        gameState.portfolio.CNY * gameState.rates.CNY;
    
    document.getElementById('portfolioTotal').textContent = total.toFixed(2);
}

// Обновление курсов
function startRateUpdates() {
    setInterval(() => {
        gameState.previousRates = { ...gameState.rates };
        
        // Случайные изменения
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

// Новостные уведомления
function startNewsUpdates() {
    setInterval(() => {
        const newsItem = news[Math.floor(Math.random() * news.length)];
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        notificationText.textContent = newsItem.text;
        notification.className = `notification ${newsItem.type}`;
        notification.classList.remove('hidden');
        
        // Применение эффекта новости
        applyNewsEffect(newsItem.type);
        
        // Скрыть уведомление через 5 секунд
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000);
    }, 15000);
}

// Эффект новости
function applyNewsEffect(type) {
    const currencies = ['USD', 'EUR', 'CNY'];
    
    currencies.forEach(currency => {
        let effect = 0;
        
        switch(type) {
            case 'positive':
                effect = 0.01 + Math.random() * 0.03;
                break;
            case 'negative':
                effect = -0.02 - Math.random() * 0.03;
                break;
            case 'neutral':
                effect = Math.random() * 0.02 - 0.01;
                break;
        }
        
        gameState.previousRates[currency] = gameState.rates[currency];
        gameState.rates[currency] *= (1 + effect);
    });
    
    updateDisplay();
}

// Торговля
function trade(currency, action, amount) {
    const rate = gameState.rates[currency];
    
    if (action === 'buy') {
        const cost = amount * rate;
        if (cost > gameState.balance) {
            showMessage('Недостаточно средств!', 'error');
            return;
        }
        
        gameState.balance -= cost;
        gameState.portfolio[currency] += amount;
        gameState.stats.trades++;
        showMessage(`Куплено ${amount} ${currency} за ${cost.toFixed(2)}₽`, 'success');
    } else {
        if (amount > gameState.portfolio[currency]) {
            showMessage('Недостаточно валюты!', 'error');
            return;
        }
        
        const income = amount * rate;
        gameState.balance += income;
        gameState.portfolio[currency] -= amount;
        gameState.stats.trades++;
        gameState.stats.profit += (income - (amount * gameState.previousRates[currency]));
        showMessage(`Продано ${amount} ${currency} за ${income.toFixed(2)}₽`, 'success');
    }
    
    updateDisplay();
}

// Сообщение
function showMessage(text, type) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = text;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Обновление рейтинга
function updateRating() {
    const totalValue = gameState.balance + 
        gameState.portfolio.USD * gameState.rates.USD +
        gameState.portfolio.EUR * gameState.rates.EUR +
        gameState.portfolio.CNY * gameState.rates.CNY;
    
    let ratings = [];
    
    // Текущий игрок
    ratings.push({
        player: "Вы",
        value: totalValue,
        isCurrent: true
    });
    
    // Боты
    for (let i = 1; i <= 9; i++) {
        ratings.push({
            player: `Игрок ${i}`,
            value: 1500 + Math.random() * 10000,
            isCurrent: false
        });
    }
    
    // Сортировка
    ratings.sort((a, b) => b.value - a.value);
    
    // Отображение
    const ratingList = document.getElementById('ratingList');
    ratingList.innerHTML = '';
    
    ratings.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `rating-item ${item.isCurrent ? 'current' : ''}`;
        div.innerHTML = `
            <div class="rank">${index + 1}</div>
            <div class="player">${item.player}</div>
            <div class="value">${item.value.toFixed(2)}₽</div>
        `;
        ratingList.appendChild(div);
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопки суммы
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            gameState.currentAmount = parseInt(e.target.dataset.amount);
            showMessage(`Сумма: ${gameState.currentAmount}₽`, 'neutral');
        });
    });
    
    // Кнопки покупки/продажи
    document.querySelectorAll('.trade-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const currency = e.target.dataset.currency;
            const action = e.target.dataset.action;
            trade(currency, action, gameState.currentAmount);
        });
    });
    
    // Кнопки в шапке
    document.getElementById('ratingBtn').addEventListener('click', () => {
        updateRating();
        document.getElementById('ratingModal').classList.remove('hidden');
    });
    
    document.getElementById('portfolioBtn').addEventListener('click', () => {
        updatePortfolioDisplay();
        document.getElementById('portfolioModal').classList.remove('hidden');
    });
    
    // Закрытие модальных окон
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.add('hidden');
            });
        });
    });
    
    // Закрытие по клику на фон
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
}