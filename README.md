# MidwayJS Weather API Demo

## QuickStart

<!-- add docs here for user -->
<!-- user docs start -->
# MidwayJS 天氣 API 專案（Production Ready）

**後端開發者學習記錄**：Rails/PHP/Java → Node.js/MidwayJS/TypeScript

## 🚀 專案功能

- `GET /weather?city=kowloon`：查詢指定城市即時天氣（溫度）
- OpenWeatherMap API 整合（Geocoding + Current Weather）
- 完整的錯誤處理與 API 回應格式

## 🛠️ Tech Stack

```
Framework: @midwayjs/core + @midwayjs/koa v3.x
HTTP Client: @midwayjs/axios（多 client + 全局攔截器）
Validation: @midwayjs/validate
Dev Tools: @midwayjs/info（local 環境）
Env: dotenv
TypeScript: ✅ 全域 TS
```

## 📁 專案結構

```
.
├── src/
│   ├── configuration.ts              # 主入口（koa/validate）
│   ├── configuration/                # 子配置
│   │   ├── axios.configuration.ts    # HTTP client 攔截器
│   │   └── config/
│   │       └── config.default.ts     # 多 axios client 配置
│   ├── controller/
│   │   └── weather.controller.ts
│   ├── service/
│   │   └── weather.service.ts
│   └── middleware/
│       └── report.middleware.ts
├── .env                      # API KEY
└── package.json
```

## 🎯 學習過程與重點

### Phase 1: 從零開始的痛點
```
❌ fetch + async/await 陷阱
  → data[0]?.lat undefined → TypeError（已解決）

❌ .env 未載入
  → process.env.OPENWEATHERMAP_API_KEY = undefined

✅ 解決：dotenv.config() + 防禦式程式設計
```

### Phase 2: Rails/Java 思維 → MidwayJS 轉換
```
Rails 習慣 → Node.js/Midway 對應
├── service object     → @Provide() class
├── rescue_from        → try/catch + 統一錯誤格式
├── Faraday client     → @midwayjs/axios + 攔截器
├── config/credentials → .env + config.default.ts
└── ApplicationRecord  → TypeORM / Prisma（未來）
```

### Phase 3: HTTP Client 選擇（重要決定）
```
輕量 → 生產級 的演進路徑：
1. Node 原生 fetch（❌ 錯誤處理麻煩）
2. makeHttpRequest（✅ 內建，適合 demo）  
3. @midwayjs/axios（🎯 最終選擇）
   ├── 多 client（weatherApi, paymentApi...）
   ├── 全局攔截器（統一 log + 錯誤格式）
   └── TS 完整支援
```

## 🔧 核心程式碼實現

### 1. 多 Client Axios 配置
```ts
// src/configuration/config/config.default.ts
axios: {
  clients: {
    default: { timeout: 10000 },      
    weatherApi: {                     
      baseURL: process.env.OPENWEATHERMAP_API_URL,  # ✅ 環境變數
      timeout: 5000,
      params: { appid: process.env.OPENWEATHERMAP_API_KEY! },  # ✅ 全局自動加
    },
  },
}
```

### 2. Service 注入（正確寫法）
```ts
@Provide()
export class WeatherService {
  @Inject() httpServiceFactory!: HttpServiceFactory;
  private httpService!: any;

  @Init()
  async init() {
    this.httpService = await this.httpServiceFactory.get('weatherApi');
  }
}
```

## 🧪 執行步驟

```bash
# 1. 安裝依賴
npm install

# 2. 設定 API Key
cp .env.example .env  # 填 OPENWEATHERMAP_API_KEY

# 3. 啟動開發伺服器
npm run dev

# 4. 測試 API
curl "http://localhost:7001/weather?city=kowloon"
```

**預期 Console Log**：
```
[WEATHERAPI] GET /geo/1.0/direct { params: { q: 'kowloon', ... } }
✅ [WEATHERAPI] /geo/1.0/direct OK (200)
```

**預期回應**：
```json
{
  "success": true,
  "message": "OK",
  "data": { "city": "kowloon", "weather": "26.5" }
}
```

## 🧪 API 文件

```bash
# ✅ 成功
curl "http://localhost:7001/weather?city=Kowloon"
→ { "success": true, "data": { "city": "Kowloon", "weather": "26.5" } }

# ✅ 錯誤處理
curl "http://localhost:7001/weather?city=不存在"
→ { "success": false, "message": "No location found for city: 不存在" }
```

## 📊 Console 日誌（生產級）

```
[WEATHERAPI] GET /geo/1.0/direct?appid=xxx&q=Kowloon&limit=1
✅ [WEATHERAPI] /geo/1.0/direct OK (200)
[WEATHERAPI] GET /data/2.5/weather?appid=xxx&lat=22.3&lon=114.1&units=metric
✅ [WEATHERAPI] /data/2.5/weather OK (200)
```

## 💡 學習重點總結

| Rails/Java 概念 | MidwayJS/Node.js 實現 | 關鍵心得 |
|-----------------|---------------------|----------|
| Service Layer | `@Provide()` class | DI 容器自動管理 |
| HTTP Client | `@midwayjs/axios` | 攔截器 > 原生 fetch |
| Config Mgmt | `config.default.ts` | 多環境 + 多 client |
| Error Handling | 全局攔截器 + `try/catch` | 統一格式最重要 |
| Env Vars | `dotenv.config()` | src/configuration.ts（固定） |

## 🚀 下一步擴展

```
[ ] Payment API client（新增 config.clients.paymentApi）
[ ] TypeORM + MySQL（快取天氣資料）
[ ] Rate limiting（避免 API 超限）
[ ] Docker 部署
[ ] Frontend（React/Vue + 香港天氣預報）
```

## 📚 參考資源

- [MidwayJS 官方文件](https://midwayjs.org)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)

***

**學習心得**：從 Rails → MidwayJS，最大的挑戰是「async error handling」和「DI 語法」，但架構思維完全相通。關鍵是找到對應的「概念映射」，就能以 Rails 思維寫出乾淨的 Node.js 程式碼！

<!-- user docs end -->

see [midway docs][midway] for more detail.

### Development

```bash