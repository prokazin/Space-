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

// ТОРГОВЛЯ - ИСПРАВЛЕННАЯ ФУНКЦИЯ
function tradeCurrency(currency, action) {
    console.log(`Торговля: ${action} ${currency} на сумму ${gameState.currentAmount}`);
    
    const rate = gameState.rates[currency];
    const amount = gameState.currentAmount;
    
    if (action === 'buy') {
        const cost = amount * rate;
        console.log(`Стоимость покупки: ${cost} ₽ (${amount} * ${rate})`);
        console.log(`Текущий баланс: ${gameState.balance} ₽`);
        
        if (cost > gameState.balance) {
            showNotification('Недостаточно средств!', 'error');
            return;
        }
        
        gameState.balance -= cost;
        gameState.portfolio[currency] += amount;
        showNotification(`Куплено ${amount} ${currency} за ${cost.toFixed(2)} ₽`, 'success');
        
        console.log(`Новый баланс: ${gameState.balance} ₽`);
        console.log(`Новое количество ${currency}: ${gameState.portfolio[currency]}`);
        
    } else if (action === 'sell') {
        console.log(`Продажа ${currency}: доступно ${gameState.portfolio[currency]}, продаем ${amount}`);
        
        if (amount > gameState.portfolio[currency]) {
            showNotification('Недостаточно валюты!', 'error');
            return;
        }
        
        const income = amount * rate;
        console.log(`Доход от продажи: ${income} ₽ (${amount} * ${rate})`);
        
        gameState.balance += income;
        gameState.portfolio[currency] -= amount;
        showNotification(`Продано ${amount} ${currency} за ${income.toFixed(2)} ₽`, 'success');
        
        console.log(`Новый баланс: ${gameState.balance} ₽`);
        console.log(`Новое количество ${currency}: ${gameState.portfolio[currency]}`);
    }
    
    updateDisplay();
    saveGame();
}

// Флуктуация курсов - ИСПРАВЛЕННАЯ
function startRateFluctuation() {
    setInterval(() => {
        // СОХРАНЯЕМ ТЕКУЩИЕ КУРСЫ КАК ПРЕДЫДУЩИЕ ПЕРЕД ИЗМЕНЕНИЕМ
        gameState.previousRates = {
            USD: gameState.rates.USD,
            EUR: gameState.rates.EUR,
            CNY: gameState.rates.CNY
        };
        
        console.log("Обновление курсов:");
        console.log("Предыдущие курсы:", gameState.previousRates);
        
        // Обновляем каждый курс с сильными изменениями
        const usdChange = (Math.random() * 0.1 - 0.05); // -5% до +5%
        const eurChange = (Math.random() * 0.1 - 0.05);
        const cnyChange = (Math.random() * 0.08 - 0.04);
        
        gameState.rates.USD *= (1 + usdChange);
        gameState.rates.EUR *= (1 + eurChange);
        gameState.rates.CNY *= (1 + cnyChange);
        
        // Ограничения
        gameState.rates.USD = Math.max(10, Math.min(200, gameState.rates.USD));
        gameState.rates.EUR = Math.max(20, Math.min(300, gameState.rates.EUR));
        gameState.rates.CNY = Math.max(5, Math.min(50, gameState.rates.CNY));
        
        console.log("Изменения:", {
            USD: `${(usdChange * 100).toFixed(2)}%`,
            EUR: `${(eurChange * 100).toFixed(2)}%`,
            CNY: `${(cnyChange * 100).toFixed(2)}%`
        });
        
        console.log("Новые курсы:", gameState.rates);
        
        updateDisplay();
    }, 3000);
}

// Обновление отображения валюты - ИСПРАВЛЕННОЕ
function updateCurrencyDisplay(currency) {
    const rate = gameState.rates[currency];
    const previous = gameState.previousRates[currency];
    const change = ((rate - previous) / previous) * 100;
    
    console.log(`Обновление ${currency}:`);
    console.log(`Текущая цена: ${rate}`);
    console.log(`Предыдущая цена: ${previous}`);
    console.log(`Изменение: ${change.toFixed(2)}%`);
    
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

// Обновление портфеля - ИСПРАВЛЕННОЕ
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
        (gameState.portfolio.USD * gameState.rates.USD) +
        (gameState.portfolio.EUR * gameState.rates.EUR) +
        (gameState.portfolio.CNY * gameState.rates.CNY);
    
    document.getElementById('portfolioTotal').textContent = total.toFixed(2);
}

// Цикл новостей - ИСПРАВЛЕННЫЙ
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
