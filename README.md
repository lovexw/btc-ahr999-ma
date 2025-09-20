# 比特币数据仪表盘 - AHR999 & 移动平均线

一个简洁的比特币投资数据仪表盘，专注于核心技术指标分析。

## 🚀 功能特性

- **实时比特币价格** - 从CoinGecko API获取最新价格和24小时变化
- **开盘价对比** - 基于历史CSV数据计算与昨日的真实对比
- **AHR999囤币指标** - 官方API获取，显示抄底/定投/观望区间
- **移动平均线分析** - 基于历史数据精确计算MA50/200/300/500/700/1400
- **自动数据更新** - GitHub Actions每日自动更新价格数据

## 📊 技术指标说明

### AHR999囤币指标
- **< 0.45**: 抄底区间 (绿色) - 适合大量买入
- **0.45 - 1.2**: 定投区间 (黄色) - 适合定期投资
- **> 1.2**: 观望区间 (红色) - 建议谨慎或减仓

### 移动平均线
- **MA50**: 短期趋势指标
- **MA200**: 中期趋势指标  
- **MA300/500/700**: 长期趋势指标
- **MA1400**: 超长期趋势指标

## 🛠 技术架构

### 前端技术
- 纯HTML/CSS/JavaScript
- 响应式设计，支持移动端
- 实时API数据获取
- 本地CSV数据处理

### 数据源
- **比特币价格**: CoinGecko API (实时)
- **AHR999指数**: https://ahr999.btchao.com/api/ahr999/calculate
- **历史数据**: 本地CSV文件 (4500+条记录，2013-2025)
- **移动平均线**: 基于CSV历史数据精确计算

### 自动化部署
- **GitHub Actions**: 每日自动更新价格数据
- **Cloudflare Pages**: 自动部署和全球CDN加速
- **零维护成本**: 完全自动化运行

## 🚀 部署指南

### 1. Fork 仓库
```bash
# Fork 这个仓库到你的GitHub账户
https://github.com/lovexw/btc-ahr999-ma
```

### 2. Cloudflare Pages 部署
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 部分
3. 点击 **"Create a project"** → **"Connect to Git"**
4. 选择你fork的仓库 `btc-ahr999-ma`
5. 构建设置:
   - **Framework preset**: None
   - **Build command**: 留空
   - **Build output directory**: `/`
6. 点击 **"Save and Deploy"**

### 3. 自动数据更新
GitHub Actions 已配置完成，将会：
- **每天北京时间0:00**自动执行
- 获取最新比特币价格
- 更新 `btc-price.csv` 文件
- 自动提交到仓库
- 触发Cloudflare Pages重新部署

**完全无需手动维护！**

### 4. 自定义域名 (可选)
在Cloudflare Pages项目设置中可以添加自定义域名。

## 📁 文件结构

```
├── index.html              # 主页面
├── styles.css              # 样式文件
├── script.js               # JavaScript逻辑
├── btc-price.csv           # 历史价格数据 (自动更新)
├── .github/
│   └── workflows/
│       └── update-btc-data.yml  # 自动更新工作流
└── README.md               # 说明文档
```

## 🔧 本地开发

```bash
# 克隆仓库
git clone https://github.com/your-username/btc-ahr999-ma.git
cd btc-ahr999-ma

# 启动本地服务器
python3 -m http.server 8000
# 或者
npx serve .

# 访问 http://localhost:8000
```

## 📈 数据更新机制

### 自动更新流程
1. **GitHub Actions** 每日北京时间0:00触发
2. 从CoinGecko API获取最新比特币价格
3. 更新CSV文件中的当日价格数据
4. 提交更改到GitHub仓库
5. **Cloudflare Pages** 自动检测更改并重新部署
6. 网站显示最新数据

### 手动触发更新
在GitHub仓库的 **Actions** 页面可以手动触发数据更新。

## 🔒 隐私与安全

- **纯前端应用**: 无后端服务器，无数据库
- **公开API**: 所有数据来源于公开API
- **无个人信息**: 不收集任何用户数据
- **开源透明**: 代码完全开源，可审查

## 📊 性能特点

- **快速加载**: 静态文件 + CDN加速
- **低延迟**: 全球Cloudflare节点
- **高可用**: 99.9%+ 可用性
- **零成本**: 完全免费运行

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

### 开发建议
- 保持代码简洁
- 确保移动端兼容性
- 添加适当的错误处理
- 遵循现有代码风格

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## ⚡ 快速开始

1. **Fork** 这个仓库
2. **部署**到Cloudflare Pages  
3. **享受**自动化的比特币数据分析！

---

**🎯 专注核心，简洁高效的比特币投资数据分析工具**