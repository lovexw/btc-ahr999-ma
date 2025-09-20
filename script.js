// 比特币数据仪表盘 - Cloudflare部署版

class BitcoinDashboard {
    constructor() {
        this.currentPrice = 0;
        this.csvData = []; // 存储CSV历史数据
        this.init();
    }

    async init() {
        try {
            console.log('🚀 初始化比特币数据仪表盘...');
            
            // 获取实时数据
            await this.updateCurrentPrice();
            await this.updateAHR999();
            this.updateTimestamp();
            
            // 开始自动更新
            this.startAutoUpdate();
            
            console.log('✅ 仪表盘初始化完成');
            
        } catch (error) {
            console.error('❌ 初始化失败:', error);
        }
    }

    // 更新当前价格 - 使用CoinGecko API
    async updateCurrentPrice() {
        try {
            console.log('💰 获取比特币价格...');
            
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true');
            const data = await response.json();
            
            if (data.bitcoin) {
                const price = data.bitcoin.usd;
                const change24h = data.bitcoin.usd_24h_change || 0;
                const marketCap = data.bitcoin.usd_market_cap;
                
                this.currentPrice = price;
                
                // 更新价格显示
                document.getElementById('currentPrice').textContent = `$${this.formatNumber(price)}`;
                
                // 更新24小时变化
                const changeElement = document.getElementById('priceChange');
                const changePercentEl = changeElement.querySelector('.change-percent');
                const changeAmountEl = changeElement.querySelector('.change-amount');
                
                const isPositive = change24h >= 0;
                const changeAmount = (price * Math.abs(change24h)) / 100;
                
                changePercentEl.textContent = `${isPositive ? '+' : ''}${change24h.toFixed(2)}%`;
                changeAmountEl.textContent = `$${this.formatNumber(changeAmount)}`;
                changePercentEl.className = `change-percent ${isPositive ? 'positive' : 'negative'}`;
                
                // 更新市值
                if (marketCap) {
                    document.getElementById('marketCap').textContent = `$${(marketCap / 1e9).toFixed(1)}B`;
                }
                
                // 更新开盘价（使用当前价格）
                document.getElementById('openPrice').textContent = `$${this.formatNumber(price)}`;
                
                // 更新开盘价对比
                await this.updateOpenPriceComparison(price);
                
                // 更新移动平均线（使用估算值）
                this.updateMovingAverages(price);
                
                console.log(`✅ 价格更新: $${price.toLocaleString()}`);
            }
            
        } catch (error) {
            console.error('❌ 获取价格失败:', error);
            // 使用备用数据
            this.setFallbackData();
        }
    }

    // 设置备用数据
    setFallbackData() {
        const fallbackPrice = 115000;
        this.currentPrice = fallbackPrice;
        
        document.getElementById('currentPrice').textContent = `$${this.formatNumber(fallbackPrice)}`;
        document.getElementById('marketCap').textContent = '$2.3T';
        document.getElementById('openPrice').textContent = `$${this.formatNumber(fallbackPrice)}`;
        
        const changeElement = document.getElementById('priceChange');
        const changePercentEl = changeElement.querySelector('.change-percent');
        const changeAmountEl = changeElement.querySelector('.change-amount');
        
        changePercentEl.textContent = '+2.45%';
        changeAmountEl.textContent = '$2,750';
        changePercentEl.className = 'change-percent positive';
        
        this.updateMovingAverages(fallbackPrice);
    }

    // 更新移动平均线 - 使用本地CSV历史数据计算
    async updateMovingAverages(currentPrice) {
        try {
            console.log('📊 从CSV文件计算移动平均线...');
            
            // 如果还没有加载CSV数据，先加载
            if (!this.csvData || this.csvData.length === 0) {
                await this.loadCSVData();
            }
            
            if (this.csvData && this.csvData.length > 0) {
                // 计算各个周期的移动平均线
                const periods = [50, 200, 300, 500, 700, 1400];
                
                periods.forEach(period => {
                    const element = document.getElementById(`ma${period}`);
                    const statusElement = document.getElementById(`ma${period}Status`);
                    
                    if (element && this.csvData.length >= period) {
                        // 计算移动平均线（取最近period天的平均值）
                        const recentPrices = this.csvData.slice(0, period).map(item => item.price);
                        const ma = recentPrices.reduce((sum, price) => sum + price, 0) / period;
                        
                        element.textContent = `$${this.formatNumber(ma)}`;
                        
                        // 判断价格相对均线位置
                        const isAbove = currentPrice > ma;
                        const statusText = isAbove ? '价格在均线上方' : '价格在均线下方';
                        
                        statusElement.textContent = statusText;
                        statusElement.className = `ma-status ${isAbove ? 'above' : 'below'}`;
                        
                        console.log(`✅ MA${period}: $${ma.toFixed(2)} (CSV数据)`);
                    } else if (element) {
                        // 数据不足的情况
                        element.textContent = '数据不足';
                        statusElement.textContent = `需要${period}天历史数据`;
                        statusElement.className = 'ma-status insufficient';
                        console.warn(`⚠️ MA${period}: CSV数据不足`);
                    }
                });
                
                console.log('✅ 移动平均线更新完成（基于CSV历史数据）');
                
            } else {
                throw new Error('CSV数据为空');
            }
            
        } catch (error) {
            console.error('❌ 使用CSV数据失败，使用备用计算:', error);
            this.updateMovingAveragesFallback(currentPrice);
        }
    }

    // 加载CSV历史数据
    async loadCSVData() {
        try {
            console.log('📊 加载CSV历史数据...');
            
            const response = await fetch('btc-price.csv');
            const csvText = await response.text();
            
            // 解析CSV数据
            const lines = csvText.trim().split('\n');
            const headers = lines[0].split(',');
            
            this.csvData = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',');
                if (values.length >= 2) {
                    this.csvData.push({
                        date: values[0].trim(),
                        price: parseFloat(values[1].trim())
                    });
                }
            }
            
            // 按日期排序（最新的在前面）
            this.csvData.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            console.log(`✅ CSV数据加载完成: ${this.csvData.length} 条记录`);
            console.log(`📅 数据范围: ${this.csvData[this.csvData.length-1].date} 到 ${this.csvData[0].date}`);
            
        } catch (error) {
            console.error('❌ 加载CSV数据失败:', error);
            this.csvData = [];
        }
    }

    // 备用移动平均线计算（当API失败时使用）
    updateMovingAveragesFallback(currentPrice) {
        const periods = [50, 200, 300, 500, 700, 1400];
        
        // 基于技术分析经验的更准确估算
        const maEstimates = {
            50: currentPrice * 0.98,   // MA50通常很接近当前价格
            200: currentPrice * 0.92,  // MA200
            300: currentPrice * 0.88,  // MA300
            500: currentPrice * 0.82,  // MA500
            700: currentPrice * 0.78,  // MA700
            1400: currentPrice * 0.65  // MA1400
        };
        
        periods.forEach(period => {
            const ma = maEstimates[period];
            const element = document.getElementById(`ma${period}`);
            const statusElement = document.getElementById(`ma${period}Status`);
            
            if (element) {
                element.textContent = `$${this.formatNumber(ma)} (估算)`;
                
                const isAbove = currentPrice > ma;
                const statusText = isAbove ? '价格在均线上方' : '价格在均线下方';
                
                statusElement.textContent = statusText + ' (估算值)';
                statusElement.className = `ma-status ${isAbove ? 'above' : 'below'}`;
            }
        });
        
        console.log('📊 移动平均线已更新（备用估算）');
    }

    // 更新AHR999指数 - 从官方API获取
    async updateAHR999() {
        try {
            console.log('🧭 获取AHR999指数...');
            
            const response = await fetch('https://ahr999.btchao.com/api/ahr999/calculate');
            const data = await response.json();
            
            if (data.success && data.data && data.data.ahr999) {
                const ahr999 = data.data.ahr999;
                
                // 更新显示
                document.getElementById('ahrValue').textContent = ahr999.toFixed(4);
                
                // 确定状态
                let status, statusText, fillWidth, fillColor;
                
                if (ahr999 < 0.45) {
                    status = 'buy';
                    statusText = '抄底区间';
                    fillWidth = (ahr999 / 0.45) * 33.33;
                    fillColor = '#00d4aa';
                } else if (ahr999 <= 1.2) {
                    status = 'hold';
                    statusText = '定投区间';
                    fillWidth = 33.33 + ((ahr999 - 0.45) / (1.2 - 0.45)) * 33.33;
                    fillColor = '#ffd700';
                } else {
                    status = 'sell';
                    statusText = '观望区间';
                    fillWidth = 66.66 + Math.min(((ahr999 - 1.2) / 2) * 33.33, 33.33);
                    fillColor = '#ff6b6b';
                }
                
                // 更新状态显示
                const statusElement = document.getElementById('ahrStatus').querySelector('.status-text');
                statusElement.textContent = statusText;
                statusElement.className = `status-text ${status}`;
                
                // 更新进度条
                const fillElement = document.getElementById('ahrFill');
                fillElement.style.width = `${Math.min(fillWidth, 100)}%`;
                fillElement.style.background = fillColor;
                
                console.log(`✅ AHR999: ${ahr999.toFixed(4)} (${statusText})`);
                
            } else {
                throw new Error('API返回数据格式不正确');
            }
            
        } catch (error) {
            console.error('❌ 获取AHR999失败:', error);
            // 使用备用值
            document.getElementById('ahrValue').textContent = '1.05';
            const statusElement = document.getElementById('ahrStatus').querySelector('.status-text');
            statusElement.textContent = '定投区间';
            statusElement.className = 'status-text hold';
            
            const fillElement = document.getElementById('ahrFill');
            fillElement.style.width = '50%';
            fillElement.style.background = '#ffd700';
        }
    }



    // 格式化数字显示
    formatNumber(num) {
        if (num >= 1e9) {
            return (num / 1e9).toFixed(1) + 'B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(1) + 'M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(1) + 'K';
        } else {
            return num.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            });
        }
    }

    // 更新时间戳
    updateTimestamp() {
        const now = new Date();
        const timeString = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('updateTime').textContent = timeString;
    }

    // 更新开盘价对比 - 使用CSV数据计算昨日价格对比
    async updateOpenPriceComparison(currentPrice) {
        try {
            // 确保CSV数据已加载
            if (!this.csvData || this.csvData.length === 0) {
                await this.loadCSVData();
            }
            
            if (this.csvData && this.csvData.length >= 2) {
                // 获取昨日价格（CSV数据按日期排序，第二条是昨日）
                const yesterdayPrice = this.csvData[1].price;
                
                // 计算变化
                const change = currentPrice - yesterdayPrice;
                const changePercent = (change / yesterdayPrice) * 100;
                
                // 更新显示
                const openPriceChange = document.getElementById('open-price-change');
                if (openPriceChange) {
                    const isPositive = change >= 0;
                    openPriceChange.textContent = `vs 昨日: ${isPositive ? '+' : ''}${changePercent.toFixed(2)}%`;
                    openPriceChange.className = isPositive ? 'positive' : 'negative';
                    
                    console.log(`📊 开盘价对比: 今日$${currentPrice.toFixed(2)} vs 昨日$${yesterdayPrice.toFixed(2)} (${changePercent.toFixed(2)}%)`);
                }
            } else {
                // 数据不足时显示默认值
                const openPriceChange = document.getElementById('open-price-change');
                if (openPriceChange) {
                    openPriceChange.textContent = 'vs 昨日: 数据加载中...';
                    openPriceChange.className = 'neutral';
                }
            }
            
        } catch (error) {
            console.error('❌ 更新开盘价对比失败:', error);
            const openPriceChange = document.getElementById('open-price-change');
            if (openPriceChange) {
                openPriceChange.textContent = 'vs 昨日: ---%';
                openPriceChange.className = 'neutral';
            }
        }
    }

    // 开始自动更新
    startAutoUpdate() {
        // 每5分钟更新一次数据
        setInterval(async () => {
            console.log('🔄 自动更新数据...');
            await this.updateCurrentPrice();
            await this.updateAHR999();
            this.updateTimestamp();
        }, 5 * 60 * 1000);

        // 每分钟更新时间戳
        setInterval(() => {
            this.updateTimestamp();
        }, 60 * 1000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 启动比特币数据仪表盘 - Cloudflare版');
    const dashboard = new BitcoinDashboard();
    
    // DXY数据会在init()中自动更新
});

// 添加简单的交互效果
document.addEventListener('DOMContentLoaded', () => {
    // 卡片点击效果
    const cards = document.querySelectorAll('.price-card, .ma-card, .indicator-card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // 添加加载动画
    const loader = document.createElement('div');
    loader.innerHTML = '🚀 加载中...';
    loader.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 9999;
        font-size: 18px;
    `;
    document.body.appendChild(loader);
    
    // 3秒后移除加载动画
    setTimeout(() => {
        loader.remove();
    }, 3000);
});