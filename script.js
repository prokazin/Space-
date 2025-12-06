// Основные переменные игры
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
    news: [],
    gameStarted: new Date(),
    soundEnabled: true
};

// Новости с влиянием на курсы
const newsData = [
    { text: "ЦБ повысил ключевую ставку", impact: { USD: 0.03, EUR: 0.02, CNY: 0.01 }, type: "positive" },
    { text: "Падение цен на нефть", impact: { USD: -0.04, EUR: -0.02, CNY: -0.01 }, type: "negative" },
    { text: "Новые санкции против России", impact: { USD: 0.05, EUR: 0.03, CNY: 0.02 }, type: "negative" },
    { text: "Китай увеличил экспорт", impact: { USD: 0.01, EUR: 0.01, CNY: -0.03 }, type: "positive" },
    { text: "ЕЦБ сохранил ставки", impact: { USD: -0.02, EUR: 0.02, CNY: 0.01 }, type: "neutral" },
    { text: "Рост ВВП США", impact: { USD: -0.03, EUR: 0.01, CNY: 0.01 }, type: "positive" },
    { text: "Инфляция в еврозоне снизилась", impact: { USD: 0.01, EUR: -0.02, CNY: 0.01 }, type: "positive" },
    { text: "Торговые переговоры провалились", impact: { USD: 0.04, EUR: 0.03, CNY: 0.05 }, type: "negative" },
    { text: "Криптовалюты резко выросли", impact: { USD: 0.02, EUR: 0.01, CNY: 0.01 }, type: "neutral" },
    { text: "Доллар укрепился на мировом рынке", impact: { USD: -0.04, EUR: 0.02, CNY: 0.02 }, type: "positive" },
    { text: "Евро ослаб из-за политических рисков", impact: { USD: 0.01, EUR: 0.04, CNY: 0.01 }, type: "negative" },
    { text: "Юань стабилизировался", impact: { USD: 0.01, EUR: 0.01, CNY: -0.02 }, type: "positive" },
    { text: "Золото подорожал на 5%", impact: { USD: 0.02, EUR: 0.02, CNY: 0.02 }, type: "positive" },
    { text: "ФРС готовится к смягчению политики", impact: { USD: 0.03, EUR: 0.01, CNY: 0.01 }, type: "negative" },
    { text: "Банки повысили прогнозы по рублю", impact: { USD: -0.03, EUR: -0.02, CNY: -0.02 }, type: "positive" },
    { text: "Нефть Brent превысила $90", impact: { USD: -0.02, EUR: -0.01, CNY: -0.01 }, type: "positive" },
    { text: "Акции российских компаний упали", impact: { USD: 0.03, EUR: 0.02, CNY: 0.02 }, type: "negative" },
    { text: "Китай снизил ставки по кредитам", impact: { USD: 0.01, EUR: 0.01, CNY: -0.04 }, type: "positive" },
    { text: "Турецкая лира обновила минимум", impact: { USD: 0.02, EUR: 0.02, CNY: 0.01 }, type: "neutral" },
    { text: "Япония вмешалась в курс йены", impact: { USD: 0.01, EUR: 0.01, CNY: 0.01 }, type: "neutral" }
];

// Инициализация игры
function initGame() {
    loadGame();
    updateDisplay();
    startRateFluctuation();
    showRandomNews();
    updateRanking();
    
    // Обновление рейтинга каждые 30 секунд
    setInterval(updateRanking, 30000);
    
    // Генерация новостей каждые 10-30 секунд
    setInterval(showRandomNews, Math.random() * 20000 + 10000);
}

// Флуктуация курсов
function startRateFluctuation() {
    setInterval(() => {
        gameState.previousRates = { ...gameState.rates };
        
        // Случайные изменения курсов
        gameState.rates.USD *= (1 + (Math.random() * 0.1 - 0.05));
        gameState.rates.EUR *= (1 + (Math.random() * 0.1 - 0.05));
        gameState.rates.CNY *= (1 + (Math.random() * 0.08 - 0.04));
        
        // Ограничение курсов
        gameState.rates.USD = Math.max(10, Math.min(200, gameState.rates.USD));
        gameState.rates.EUR = Math.max(20, Math.min(300, gameState.rates.EUR));
        gameState.rates.CNY = Math.max(5, Math.min(50, gameState.rates.CNY));
        
        updateDisplay();
    }, 3000);
}

// Показать случайную новость
function showRandomNews() {
    const newsIndex = Math.floor(Math.random() * newsData.length);
    const newsItem = newsData[newsIndex];
    const timestamp = new Date().toLocaleTimeString();
    
    // Применить влияние новости к курсам
    Object.keys(newsItem.impact).forEach(currency => {
        gameState.rates[currency] *= (1 + newsItem.impact[currency]);
    });
    
    // Добавить новость в историю
    const newsEntry = {
        text: newsItem.text,
        type: newsItem.type,
        time: timestamp,
        impact: newsItem.impact
    };
    
    gameState.news.unshift(newsEntry);
    if (gameState.news.length > 20) {
        gameState.news.pop();
    }
    
    // Показать уведомление
    showNotification(newsItem.text, newsItem.type);
    
    // Обновить отображение
    updateNewsDisplay();
    updateDisplay();
}

// Показать уведомление
function showNotification(text, type) {
    const notification = document.getElementById('notification');
    const content = document.getElementById('notificationContent');
    
    notification.className = `notification ${type}`;
    content.textContent = text;
    notification.classList.remove('hidden');
    
    // Воспроизвести звук
    if (gameState.soundEnabled) {
        playNotificationSound();
    }
    
    // Скрыть уведомление через 5 секунд
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

// Воспроизвести звук уведомления
function playNotificationSound() {
    try {
        const audio = new Audio('assets/notification.mp3');
        audio.volume = 0.3;
        audio.play();
    } catch (e) {
        console.log("Звук не может быть воспроизведен");
    }
}

// Обновить отображение
function updateDisplay() {
    // Обновить баланс
    document.getElementById('balance').textContent = `${gameState.balance.toFixed(2)}₽`;
    
    // Обновить курсы
    updateCurrencyDisplay('USD');
    updateCurrencyDisplay('EUR');
    updateCurrencyDisplay('CNY');
    
    // Обновить портфель
    document.getElementById('usdAmount').textContent = gameState.portfolio.USD.toFixed(2);
    document.getElementById('eurAmount').textContent = gameState.portfolio.EUR.toFixed(2);
    document.getElementById('cnyAmount').textContent = gameState.portfolio.CNY.toFixed(2);
    
    // Обновить общую стоимость
    updateTotalValue();
}

// Обновить отображение валюты
function updateCurrencyDisplay(currency) {
    const rateElement = document.getElementById(`${currency.toLowerCase()}Rate`);
    const changeElement = document.getElementById(`${currency.toLowerCase()}Change`);
    const cardElement = document.getElementById(`${currency.toLowerCase()}Card`);
    
    const currentRate = gameState.rates[currency];
    const previousRate = gameState.previousRates[currency];
    const change = ((currentRate - previousRate) / previousRate) * 100;
    
    rateElement.textContent = currentRate.toFixed(2);
    changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    
    // Обновить цвет в зависимости от изменения
    if (change > 0) {
        changeElement.className = 'rate-change positive';
        cardElement.style.animation = 'pulseGreen 1s';
    } else if (change < 0) {
        changeElement.className = 'rate-change negative';
        cardElement.style.animation = 'pulseRed 1s';
    } else {
        changeElement.className = 'rate-change';
    }
}

// Обновить общую стоимость
function updateTotalValue() {
    const total = gameState.balance + 
        gameState.portfolio.USD * gameState.rates.USD +
        gameState.portfolio.EUR * gameState.rates.EUR +
        gameState.portfolio.CNY * gameState.rates.CNY;
    
    document.getElementById('totalValue').textContent = `${total.toFixed(2)}₽`;
}

// Обновить отображение новостей
function updateNewsDisplay() {
    const newsList = document.getElementById('newsList');
    newsList.innerHTML = '';
    
    gameState.news.forEach(news => {
        const newsElement = document.createElement('div');
        newsElement.className = `news-item ${news.type}`;
        newsElement.innerHTML = `
            <div class="news-time">${news.time}</div>
            <div class="news-text">${news.text}</div>
        `;
        newsList.appendChild(newsElement);
    });
}

// Установить сумму сделки
function setAmount(amount) {
    document.getElementById('amount').value = Math.min(amount, gameState.balance);
}

// Выполнить сделку
function executeTrade(action) {
    const currency = document.getElementById('currencySelect').value;
    const amount = parseFloat(document.getElementById('amount').value);
    
    if (isNaN(amount) || amount <= 0) {
        showNotification("Введите корректную сумму!", "negative");
        return;
    }
    
    tradeCurrency(currency, action, amount);
}

// Торговля валютой
function tradeCurrency(currency, action, amount = null) {
    if (!amount) {
        amount = parseFloat(prompt(`Введите сумму в ${currency}:`, "100"));
        if (isNaN(amount) || amount <= 0) return;
    }
    
    const rate = gameState.rates[currency];
    
    if (action === 'buy') {
        const cost = amount * rate;
        if (cost > gameState.balance) {
            showNotification("Недостаточно средств!", "negative");
            return;
        }
        
        gameState.balance -= cost;
        gameState.portfolio[currency] += amount;
        showNotification(`Куплено ${amount.toFixed(2)} ${currency} за ${cost.toFixed(2)}₽`, "positive");
    } else {
        if (amount > gameState.portfolio[currency]) {
            showNotification("Недостаточно валюты для продажи!", "negative");
            return;
        }
        
        const income = amount * rate;
        gameState.balance += income;
        gameState.portfolio[currency] -= amount;
        showNotification(`Продано ${amount.toFixed(2)} ${currency} за ${income.toFixed(2)}₽`, "positive");
    }
    
    updateDisplay();
    saveGame();
}

// Сохранить игру
function saveGame() {
    const saveData = {
        ...gameState,
        gameStarted: gameState.gameStarted.toISOString()
    };
    
    localStorage.setItem('currencyTraderSave', JSON.stringify(saveData));
    showNotification("Игра сохранена!", "positive");
    
    // Обновить рейтинг
    updateRanking();
}

// Загрузить игру
function loadGame() {
    const saved = localStorage.getItem('currencyTraderSave');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            loaded.gameStarted = new Date(loaded.gameStarted);
            gameState = loaded;
            showNotification("Игра загружена!", "positive");
        } catch (e) {
            console.log("Ошибка загрузки сохранения");
        }
    }
}

// Сбросить игру
function resetGame() {
    if (confirm("Вы уверены? Все данные будут потеряны!")) {
        gameState = {
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
            news: [],
            gameStarted: new Date(),
            soundEnabled: gameState.soundEnabled
        };
        
        localStorage.removeItem('currencyTraderSave');
        updateDisplay();
        updateNewsDisplay();
        showNotification("Игра сброшена!", "neutral");
    }
}

// Обновить рейтинг
function updateRanking() {
    const totalValue = gameState.balance + 
        gameState.portfolio.USD * gameState.rates.USD +
        gameState.portfolio.EUR * gameState.rates.EUR +
        gameState.portfolio.CNY * gameState.rates.CNY;
    
    // Получить все сохранения
    let rankings = [];
    
    // Добавить текущего игрока
    rankings.push({
        player: "Вы",
        value: totalValue,
        isCurrent: true
    });
    
    // Добавить демо-игроков
    for (let i = 1; i <= 9; i++) {
        rankings.push({
            player: `Игрок ${i}`,
            value: 1500 + Math.random() * 10000,
            isCurrent: false
        });
    }
    
    // Сортировка по убыванию
    rankings.sort((a, b) => b.value - a.value);
    
    // Обновить отображение рейтинга
    const ratingList = document.getElementById('ratingList');
    ratingList.innerHTML = '';
    
    rankings.forEach((player, index) => {
        const rankElement = document.createElement('div');
        rankElement.className = `rating-item ${player.isCurrent ? 'current' : ''}`;
        rankElement.innerHTML = `
            <span>${index + 1}. ${player.player}</span>
            <span>${player.value.toFixed(2)}₽</span>
        `;
        ratingList.appendChild(rankElement);
        
        // Обновить текущий ранг игрока
        if (player.isCurrent) {
            const rankBadge = document.getElementById('rank');
            rankBadge.textContent = `${index + 1} из ${rankings.length}`;
        }
    });
}

// Переключение звука
document.getElementById('soundToggle').addEventListener('click', function() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const icon = this.querySelector('i');
    if (gameState.soundEnabled) {
        icon.className = 'fas fa-volume-up';
        showNotification("Звук включен", "positive");
    } else {
        icon.className = 'fas fa-volume-mute';
        showNotification("Звук выключен", "neutral");
    }
});

// Закрыть модальное окно
function closeModal() {
    document.getElementById('ratingModal').classList.add('hidden');
}

// Открыть модальное окно рейтинга
document.querySelector('.rating').addEventListener('click', function() {
    updateRanking();
    document.getElementById('ratingModal').classList.remove('hidden');
});

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', initGame);

// Добавить CSS анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes pulseGreen {
        0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
        100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
    }
    
    @keyframes pulseRed {
        0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
        100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
    }
`;
document.head.appendChild(style);