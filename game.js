class CosmicTraderGame {
    constructor() {
        // Игровые переменные
        this.gameState = {
            balance: 10000,
            portfolio: {},
            selectedCurrency: null,
            gameTime: 0,
            totalTrades: 0,
            totalProfit: 0,
            bestTrade: 0,
            playTime: 0,
            playerRank: 999999
        };
        
        // Валюты игры
        this.currencies = {
            'SOLAR': {
                name: 'Solar Credit',
                symbol: 'SOL',
                icon: '☀️',
                price: 100,
                volatility: 0.05,
                color: '#FFD700',
                description: 'Interstellar energy currency'
            },
            'LUNAR': {
                name: 'Lunar Token',
                symbol: 'LUN',
                icon: '🌙',
                price: 50,
                volatility: 0.08,
                color: '#C0C0C0',
                description: 'Moon-based cryptocurrency'
            },
            'NOVA': {
                name: 'Nova Coin',
                symbol: 'NOVA',
                icon: '⭐',
                price: 200,
                volatility: 0.12,
                color: '#40C9FF',
                description: 'Stellar explosion-backed asset'
            },
            'VOID': {
                name: 'Void Ether',
                symbol: 'VOID',
                icon: '🕳️',
                price: 75,
                volatility: 0.15,
                color: '#8A2BE2',
                description: 'Dark matter energy token'
            },
            'QUANTUM': {
                name: 'Quantum Bit',
                symbol: 'QBT',
                icon: '🌀',
                price: 150,
                volatility: 0.2,
                color: '#00FF88',
                description: 'Quantum entanglement currency'
            },
            'GALAXY': {
                name: 'Galaxy Gold',
                symbol: 'GG',
                icon: '🌌',
                price: 500,
                volatility: 0.1,
                color: '#FF4444',
                description: 'Rare galactic precious metal'
            }
        };
        
        // История цен
        this.priceHistory = {};
        this.transactionHistory = [];
        this.newsFeed = [];
        this.leaderboard = [];
        
        // Игровые настройки
        this.timeSpeed = 1; // Скорость игры
        this.isPaused = false;
        this.gameInterval = null;
        this.newsInterval = null;
        this.priceUpdateInterval = null;
        
        // DOM элементы
        this.initializeDOM();
        
        // Загрузка игры
        this.loadGame();
        this.initializeGame();
    }
    
    initializeDOM() {
        // Основные элементы
        this.balanceElement = document.getElementById('balance');
        this.portfolioValueElement = document.getElementById('portfolioValue');
        this.gameTimeElement = document.getElementById('gameTime');
        this.currenciesListElement = document.getElementById('currenciesList');
        this.selectedCurrencyElement = document.getElementById('selectedCurrency');
        this.currentPriceElement = document.getElementById('currentPrice');
        this.priceChangeElement = document.getElementById('priceChange');
        this.volumeElement = document.getElementById('volume');
        this.marketCapElement = document.getElementById('marketCap');
        this.holdingsElement = document.getElementById('holdings');
        this.tradeAmountInput = document.getElementById('tradeAmount');
        this.amountSlider = document.getElementById('amountSlider');
        this.historyListElement = document.getElementById('historyList');
        this.playerRankElement = document.getElementById('playerRank');
        this.rankProgressElement = document.getElementById('rankProgress');
        this.nextRankElement = document.getElementById('nextRank');
        this.leaderboardElement = document.getElementById('leaderboard');
        this.newsFeedElement = document.getElementById('newsFeed');
        this.totalTradesElement = document.getElementById('totalTrades');
        this.totalProfitElement = document.getElementById('totalProfit');
        this.winRateElement = document.getElementById('winRate');
        this.bestTradeElement = document.getElementById('bestTrade');
        this.playTimeElement = document.getElementById('playTime');
        
        // Кнопки
        this.buyButton = document.getElementById('buyBtn');
        this.sellButton = document.getElementById('sellBtn');
        this.saveButton = document.getElementById('saveGame');
        this.loadButton = document.getElementById('loadGame');
        this.newGameButton = document.getElementById('newGame');
        
        // Модальные окна
        this.gameOverModal = document.getElementById('gameOverModal');
        this.saveModal = document.getElementById('saveModal');
        
        // Звуки
        this.clickSound = document.getElementById('clickSound');
        this.tradeSound = document.getElementById('tradeSound');
        this.successSound = document.getElementById('successSound');
        this.errorSound = document.getElementById('errorSound');
        
        // Инициализация событий
        this.setupEventListeners();
    }
    
    initializeGame() {
        // Инициализация портфеля
        Object.keys(this.currencies).forEach(currencyId => {
            this.gameState.portfolio[currencyId] = 0;
            this.priceHistory[currencyId] = [this.currencies[currencyId].price];
        });
        
        // Создание лидерборда
        this.generateLeaderboard();
        
        // Запуск игровых интервалов
        this.startGameIntervals();
        
        // Инициализация UI
        this.updateUI();
        this.renderCurrenciesList();
        this.generateNews();
        
        // Выбор первой валюты
        this.selectCurrency('SOLAR');
    }
    
    setupEventListeners() {
        // Кнопки покупки/продажи
        this.buyButton.addEventListener('click', () => this.trade('buy'));
        this.sellButton.addEventListener('click', () => this.trade('sell'));
        
        // Управление количеством
        this.tradeAmountInput.addEventListener('input', (e) => {
            this.amountSlider.value = e.target.value;
            this.playSound(this.clickSound);
        });
        
        this.amountSlider.addEventListener('input', (e) => {
            this.tradeAmountInput.value = e.target.value;
            this.playSound(this.clickSound);
        });
        
        // Быстрые действия
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.setTradeAmount(action);
                this.playSound(this.clickSound);
            });
        });
        
        // Кнопки увеличения/уменьшения
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.adjustTradeAmount(action);
                this.playSound(this.clickSound);
            });
        });
        
        // Сохранение/загрузка
        this.saveButton.addEventListener('click', () => this.showSaveModal());
        this.loadButton.addEventListener('click', () => this.loadGame());
        this.newGameButton.addEventListener('click', () => this.confirmNewGame());
        
        // Модальные окна
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.newGame();
            this.hideModal(this.gameOverModal);
        });
        
        document.getElementById('closeSaveBtn').addEventListener('click', () => {
            this.hideModal(this.saveModal);
        });
        
        // Слоты сохранения
        document.querySelectorAll('.save-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                const slotNumber = e.currentTarget.dataset.slot;
                this.saveGame(slotNumber);
                this.hideModal(this.saveModal);
            });
        });
        
        // Глобальные события
        window.addEventListener('beforeunload', (e) => {
            this.autoSave();
        });
        
        // Клавиатура
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'b':
                case 'B':
                    this.trade('buy');
                    break;
                case 's':
                case 'S':
                    this.trade('sell');
                    break;
                case ' ':
                    this.togglePause();
                    break;
                case 'Escape':
                    this.showSaveModal();
                    break;
            }
        });
    }
    
    startGameIntervals() {
        // Обновление времени игры
        this.gameInterval = setInterval(() => {
            if (!this.isPaused) {
                this.gameState.gameTime += this.timeSpeed;
                this.gameState.playTime += 1;
                this.updateGameTime();
                
                // Каждые 10 секунд обновляем цены
                if (this.gameState.gameTime % 10 === 0) {
                    this.updatePrices();
                }
                
                // Каждую минуту генерируем новости
                if (this.gameState.gameTime % 60 === 0) {
                    this.generateNews();
                }
                
                // Каждые 5 минут обновляем рейтинг
                if (this.gameState.gameTime % 300 === 0) {
                    this.updateRanking();
                }
            }
        }, 1000);
        
        // Обновление цен каждые 3 секунды
        this.priceUpdateInterval = setInterval(() => {
            if (!this.isPaused) {
                this.updatePrices();
            }
        }, 3000);
        
        // Новости каждые 30 секунд
        this.newsInterval = setInterval(() => {
            if (!this.isPaused) {
                this.generateNews();
            }
        }, 30000);
    }
    
    updatePrices() {
        Object.keys(this.currencies).forEach(currencyId => {
            const currency = this.currencies[currencyId];
            const change = (Math.random() * 2 - 1) * currency.volatility;
            const oldPrice = currency.price;
            
            // Применяем изменение цены
            currency.price = Math.max(1, currency.price * (1 + change));
            
            // Добавляем в историю
            this.priceHistory[currencyId].push(currency.price);
            
            // Ограничиваем длину истории
            if (this.priceHistory[currencyId].length > 100) {
                this.priceHistory[currencyId].shift();
            }
            
            // Обновляем UI если эта валюта выбрана
            if (this.gameState.selectedCurrency === currencyId) {
                this.updateCurrencyDetails(currencyId);
            }
        });
        
        this.updatePortfolioValue();
        this.renderCurrenciesList();
    }
    
    updateCurrencyDetails(currencyId) {
        const currency = this.currencies[currencyId];
        const currentPrice = currency.price;
        const priceChange = this.priceHistory[currencyId].length > 1 ? 
            ((currentPrice - this.priceHistory[currencyId][this.priceHistory[currencyId].length - 2]) / 
             this.priceHistory[currencyId][this.priceHistory[currencyId].length - 2]) * 100 : 0;
        
        // Обновление информации о валюте
        this.selectedCurrencyElement.innerHTML = `
            <span class="currency-icon">${currency.icon}</span>
            <span class="currency-name">${currency.name} (${currency.symbol})</span>
        `;
        
        this.currentPriceElement.textContent = `$${currentPrice.toFixed(2)}`;
        this.priceChangeElement.textContent = `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`;
        this.priceChangeElement.className = `price-change ${priceChange >= 0 ? 'positive' : 'negative'}`;
        
        this.volumeElement.textContent = Math.floor(Math.random() * 1000000).toLocaleString();
        this.marketCapElement.textContent = `$${(Math.random() * 1000000000).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}`;
        
        this.holdingsElement.textContent = `${this.gameState.portfolio[currencyId]} ${currency.symbol}`;
    }
    
    trade(type) {
        if (!this.gameState.selectedCurrency) return;
        
        const currencyId = this.gameState.selectedCurrency;
        const currency = this.currencies[currencyId];
        const amount = parseInt(this.tradeAmountInput.value);
        const totalCost = amount * currency.price;
        
        if (type === 'buy') {
            if (totalCost > this.gameState.balance) {
                this.showNotification('Insufficient funds!', 'error');
                this.playSound(this.errorSound);
                return;
            }
            
            this.gameState.balance -= totalCost;
            this.gameState.portfolio[currencyId] += amount;
            this.gameState.totalTrades++;
            
            this.addTransaction('BUY', currency.symbol, amount, currency.price, totalCost);
            this.playSound(this.tradeSound);
            this.showNotification(`Bought ${amount} ${currency.symbol} for $${totalCost.toFixed(2)}`, 'success');
            
        } else if (type === 'sell') {
            if (amount > this.gameState.portfolio[currencyId]) {
                this.showNotification('Not enough coins to sell!', 'error');
                this.playSound(this.errorSound);
                return;
            }
            
            this.gameState.balance += totalCost;
            this.gameState.portfolio[currencyId] -= amount;
            this.gameState.totalTrades++;
            
            // Расчет прибыли
            const profit = totalCost;
            this.gameState.totalProfit += profit;
            
            if (profit > this.gameState.bestTrade) {
                this.gameState.bestTrade = profit;
            }
            
            this.addTransaction('SELL', currency.symbol, amount, currency.price, totalCost);
            this.playSound(this.tradeSound);
            this.showNotification(`Sold ${amount} ${currency.symbol} for $${totalCost.toFixed(2)}`, 'success');
        }
        
        this.updateUI();
        this.updateRanking();
    }
    
    addTransaction(type, symbol, amount, price, total) {
        const transaction = {
            id: Date.now(),
            type: type,
            symbol: symbol,
            amount: amount,
            price: price.toFixed(2),
            total: total.toFixed(2),
            time: this.formatGameTime(this.gameState.gameTime)
        };
        
        this.transactionHistory.unshift(transaction);
        
        // Ограничиваем историю 10 записями
        if (this.transactionHistory.length > 10) {
            this.transactionHistory.pop();
        }
        
        this.renderTransactionHistory();
    }
    
    renderTransactionHistory() {
        this.historyListElement.innerHTML = '';
        
        this.transactionHistory.forEach(transaction => {
            const item = document.createElement('div');
            item.className = `history-item ${transaction.type.toLowerCase()}`;
            
            item.innerHTML = `
                <div>
                    <strong>${transaction.type}</strong> ${transaction.amount} ${transaction.symbol}
                </div>
                <div>
                    @ $${transaction.price} = $${transaction.total}
                </div>
                <div class="transaction-time">
                    ${transaction.time}
                </div>
            `;
            
            this.historyListElement.appendChild(item);
        });
    }
    
    selectCurrency(currencyId) {
        this.gameState.selectedCurrency = currencyId;
        
        // Обновляем классы выбранной валюты
        document.querySelectorAll('.currency-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        const selectedItem = document.querySelector(`[data-currency="${currencyId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        this.updateCurrencyDetails(currencyId);
    }
    
    setTradeAmount(action) {
        let amount = 0;
        
        switch(action) {
            case '25':
                amount = Math.floor(this.gameState.balance * 0.25 / this.currencies[this.gameState.selectedCurrency].price);
                break;
            case '50':
                amount = Math.floor(this.gameState.balance * 0.5 / this.currencies[this.gameState.selectedCurrency].price);
                break;
            case '100':
                amount = Math.floor(this.gameState.balance / this.currencies[this.gameState.selectedCurrency].price);
                break;
            case 'max':
                amount = Math.floor(this.gameState.balance / this.currencies[this.gameState.selectedCurrency].price);
                break;
        }
        
        if (amount < 1) amount = 1;
        if (amount > 10000) amount = 10000;
        
        this.tradeAmountInput.value = amount;
        this.amountSlider.value = amount;
    }
    
    adjustTradeAmount(action) {
        let amount = parseInt(this.tradeAmountInput.value);
        
        if (action === 'increase') {
            amount += 10;
        } else if (action === 'decrease') {
            amount -= 10;
        }
        
        if (amount < 1) amount = 1;
        if (amount > 10000) amount = 10000;
        
        this.tradeAmountInput.value = amount;
        this.amountSlider.value = amount;
    }
    
    renderCurrenciesList() {
        this.currenciesListElement.innerHTML = '';
        
        Object.keys(this.currencies).forEach(currencyId => {
            const currency = this.currencies[currencyId];
            const amount = this.gameState.portfolio[currencyId];
            const value = amount * currency.price;
            
            const item = document.createElement('div');
            item.className = 'currency-item';
            item.dataset.currency = currencyId;
            
            item.innerHTML = `
                <div class="currency-icon">${currency.icon}</div>
                <div class="currency-info">
                    <div class="currency-name">${currency.name}</div>
                    <div class="currency-symbol">${currency.symbol}</div>
                </div>
                <div class="currency-amount">
                    <div class="currency-balance">${amount.toFixed(4)}</div>
                    <div class="currency-value">$${value.toFixed(2)}</div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.selectCurrency(currencyId);
                this.playSound(this.clickSound);
            });
            
            this.currenciesListElement.appendChild(item);
        });
    }
    
    generateNews() {
        const newsTemplates = [
            {
                template: "Galactic Senate announces new regulations for {currency} trading",
                impact: 0.1
            },
            {
                template: "Major breakthrough in {currency} mining technology",
                impact: 0.15
            },
            {
                template: "Security breach detected in {currency} network",
                impact: -0.2
            },
            {
                template: "{currency} adopted by new planetary system",
                impact: 0.25
            },
            {
                template: "Market manipulation suspected in {currency} trading",
                impact: -0.3
            },
            {
                template: "Interstellar economy shows growth, boosting {currency}",
                impact: 0.12
            },
            {
                template: "Technical issues reported on {currency} exchange",
                impact: -0.18
            },
            {
                template: "Celebrity endorsement increases {currency} popularity",
                impact: 0.22
            }
        ];
        
        const template = newsTemplates[Math.floor(Math.random() * newsTemplates.length)];
        const currencyId = Object.keys(this.currencies)[Math.floor(Math.random() * Object.keys(this.currencies).length)];
        const currency = this.currencies[currencyId];
        
        const news = {
            id: Date.now(),
            time: this.formatGameTime(this.gameState.gameTime),
            content: template.template.replace('{currency}', currency.name),
            impact: template.impact,
            currency: currencyId
        };
        
        // Применяем влияние новости к цене
        this.currencies[currencyId].price = Math.max(1, 
            this.currencies[currencyId].price * (1 + news.impact)
        );
        
        this.newsFeed.unshift(news);
        
        // Ограничиваем новости 5 записями
        if (this.newsFeed.length > 5) {
            this.newsFeed.pop();
        }
        
        this.renderNews();
    }
    
    renderNews() {
        this.newsFeedElement.innerHTML = '';
        
        this.newsFeed.forEach(news => {
            const item = document.createElement('div');
            item.className = 'news-item';
            
            item.innerHTML = `
                <div class="news-time">${news.time}</div>
                <div class="news-content">${news.content}</div>
                <div class="news-impact ${news.impact >= 0 ? 'positive' : 'negative'}">
                    ${news.impact >= 0 ? '▲' : '▼'} ${Math.abs(news.impact * 100).toFixed(1)}%
                </div>
            `;
            
            this.newsFeedElement.appendChild(item);
        });
    }
    
    generateLeaderboard() {
        this.leaderboard = [];
        
        // Генерируем случайных игроков
        const names = [
            'NebulaTrader', 'CosmicWolf', 'Starlord88', 'QuantumQueen',
            'GalacticGuru', 'OrionTrader', 'AndromedaPro', 'PulsarKing',
            'BlackHoleWhale', 'SupernovaMaster', 'CometRider', 'AstroNinja',
            'SpaceTycoon', 'VoidWalker', 'SolarFlare'
        ];
        
        for (let i = 0; i < 10; i++) {
            const balance = 5000 + Math.random() * 50000;
            this.leaderboard.push({
                rank: i + 1,
                name: names[Math.floor(Math.random() * names.length)],
                balance: balance
            });
        }
        
        // Сортируем по балансу
        this.leaderboard.sort((a, b) => b.balance - a.balance);
        
        // Обновляем ранги
        this.leaderboard.forEach((player, index) => {
            player.rank = index + 1;
        });
        
        // Добавляем игрока
        const playerRank = this.calculatePlayerRank();
        this.gameState.playerRank = playerRank;
        
        this.renderLeaderboard();
    }
    
    calculatePlayerRank() {
        const totalValue = this.gameState.balance + this.calculatePortfolioValue();
        let rank = 1;
        
        for (const player of this.leaderboard) {
            if (totalValue < player.balance) {
                rank++;
            }
        }
        
        return rank;
    }
    
    updateRanking() {
        const oldRank = this.gameState.playerRank;
        const newRank = this.calculatePlayerRank();
        
        this.gameState.playerRank = newRank;
        this.playerRankElement.textContent = `#${newRank.toLocaleString()}`;
        
        // Прогресс до следующего ранга
        const nextRank = Math.max(1, newRank - 1);
        const progress = (1 - (nextRank / 1000000)) * 100;
        
        this.rankProgressElement.style.width = `${progress}%`;
        this.nextRankElement.textContent = (nextRank - 1).toLocaleString();
        
        // Если улучшили ранг
        if (newRank < oldRank) {
            this.showNotification(`Rank improved! #${oldRank} → #${newRank}`, 'success');
            this.playSound(this.successSound);
        }
    }
    
    renderLeaderboard() {
        this.leaderboardElement.innerHTML = '';
        
        this.leaderboard.slice(0, 5).forEach(player => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            item.innerHTML = `
                <div class="leaderboard-rank">#${player.rank}</div>
                <div class="leaderboard-name">${player.name}</div>
                <div class="leaderboard-balance">$${player.balance.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                })}</div>
            `;
            
            this.leaderboardElement.appendChild(item);
        });
    }
    
    updateUI() {
        // Обновление баланса
        this.balanceElement.textContent = `$${this.gameState.balance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        
        // Обновление статистики
        this.totalTradesElement.textContent = this.gameState.totalTrades;
        this.totalProfitElement.textContent = `$${this.gameState.totalProfit.toFixed(2)}`;
        
        const winRate = this.gameState.totalTrades > 0 ? 
            Math.min(100, (this.gameState.totalProfit / (this.gameState.balance + this.calculatePortfolioValue())) * 100) : 0;
        this.winRateElement.textContent = `${winRate.toFixed(1)}%`;
        
        this.bestTradeElement.textContent = `$${this.gameState.bestTrade.toFixed(2)}`;
        
        // Обновление времени игры
        this.playTimeElement.textContent = this.formatPlayTime(this.gameState.playTime);
    }
    
    updateGameTime() {
        const days = Math.floor(this.gameState.gameTime / 86400);
        const hours = Math.floor((this.gameState.gameTime % 86400) / 3600);
        const minutes = Math.floor((this.gameState.gameTime % 3600) / 60);
        const seconds = Math.floor(this.gameState.gameTime % 60);
        
        this.gameTimeElement.textContent = 
            `DAY ${days + 1} | ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updatePortfolioValue() {
        const totalValue = this.calculatePortfolioValue();
        this.portfolioValueElement.textContent = `$${totalValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }
    
    calculatePortfolioValue() {
        let total = 0;
        Object.keys(this.gameState.portfolio).forEach(currencyId => {
            total += this.gameState.portfolio[currencyId] * this.currencies[currencyId].price;
        });
        return total;
    }
    
    formatGameTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    formatPlayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    showSaveModal() {
        // Обновляем информацию о слотах сохранения
        for (let i = 1; i <= 3; i++) {
            const saveData = localStorage.getItem(`cosmic_trader_save_${i}`);
            const slotElement = document.querySelector(`.save-slot[data-slot="${i}"] .slot-info`);
            
            if (saveData) {
                const data = JSON.parse(saveData);
                slotElement.innerHTML = `
                    Balance: $${data.balance.toLocaleString()}<br>
                    Trades: ${data.totalTrades}<br>
                    ${new Date(data.timestamp).toLocaleDateString()}
                `;
            } else {
                slotElement.textContent = 'Empty';
            }
        }
        
        this.showModal(this.saveModal);
    }
    
    saveGame(slotNumber) {
        const saveData = {
            ...this.gameState,
            currencies: this.currencies,
            priceHistory: this.priceHistory,
            transactionHistory: this.transactionHistory,
            newsFeed: this.newsFeed,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(`cosmic_trader_save_${slotNumber}`, JSON.stringify(saveData));
        this.showNotification(`Game saved to slot ${slotNumber}!`, 'success');
        this.playSound(this.successSound);
    }
    
    loadGame() {
        // Загрузка из первого доступного слота
        for (let i = 1; i <= 3; i++) {
            const saveData = localStorage.getItem(`cosmic_trader_save_${i}`);
            if (saveData) {
                const data = JSON.parse(saveData);
                
                this.gameState = data;
                this.currencies = data.currencies || this.currencies;
                this.priceHistory = data.priceHistory || this.priceHistory;
                this.transactionHistory = data.transactionHistory || [];
                this.newsFeed = data.newsFeed || [];
                
                this.updateUI();
                this.renderCurrenciesList();
                this.renderTransactionHistory();
                this.renderNews();
                this.updateRanking();
                
                if (this.gameState.selectedCurrency) {
                    this.selectCurrency(this.gameState.selectedCurrency);
                }
                
                this.showNotification(`Game loaded from slot ${i}!`, 'success');
                this.playSound(this.successSound);
                return;
            }
        }
        
        this.showNotification('No saved games found!', 'error');
    }
    
    autoSave() {
        // Автосохранение в слот 1
        this.saveGame(1);
    }
    
    newGame() {
        if (!confirm('Start new game? Current progress will be lost.')) return;
        
        // Сброс состояния игры
        this.gameState = {
            balance: 10000,
            portfolio: {},
            selectedCurrency: 'SOLAR',
            gameTime: 0,
            totalTrades: 0,
            totalProfit: 0,
            bestTrade: 0,
            playTime: 0,
            playerRank: 999999
        };
        
        // Сброс валют
        Object.keys(this.currencies).forEach(currencyId => {
            this.currencies[currencyId].price = {
                'SOLAR': 100,
                'LUNAR': 50,
                'NOVA': 200,
                'VOID': 75,
                'QUANTUM': 150,
                'GALAXY': 500
            }[currencyId];
            
            this.priceHistory[currencyId] = [this.currencies[currencyId].price];
            this.gameState.portfolio[currencyId] = 0;
        });
        
        this.transactionHistory = [];
        this.newsFeed = [];
        
        // Перезапуск игры
        this.initializeGame();
        this.showNotification('New game started!', 'success');
    }
    
    confirmNewGame() {
        if (confirm('Are you sure you want to start a new game? All unsaved progress will be lost.')) {
            this.newGame();
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (this.isPaused) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> PLAY';
            this.showNotification('Game Paused', 'info');
        } else {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> PAUSE';
            this.showNotification('Game Resumed', 'info');
        }
    }
    
    showNotification(message, type = 'info') {
        // Создаём уведомление
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'rgba(0, 255, 136, 0.9)' : 
                         type === 'error' ? 'rgba(255, 68, 68, 0.9)' : 
                         'rgba(64, 156, 255, 0.9)'};
            color: ${type === 'success' || type === 'error' ? '#000' : '#fff'};
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    playSound(soundElement) {
        if (soundElement) {
            soundElement.currentTime = 0;
            soundElement.play().catch(e => console.log('Audio play failed:', e));
        }
    }
    
    showModal(modal) {
        modal.style.display = 'flex';
    }
    
    hideModal(modal) {
        modal.style.display = 'none';
    }
    
    gameOver() {
        // Показываем итоги игры
        document.getElementById('finalBalance').textContent = 
            `$${(this.gameState.balance + this.calculatePortfolioValue()).toLocaleString()}`;
        document.getElementById('finalProfit').textContent = 
            `$${this.gameState.totalProfit.toLocaleString()}`;
        document.getElementById('finalRank').textContent = 
            `#${this.gameState.playerRank.toLocaleString()}`;
        
        this.showModal(this.gameOverModal);
    }
}

// Запуск игры при загрузке страницы
window.addEventListener('load', () => {
    const game = new CosmicTraderGame();
    
    // Добавляем стили для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
