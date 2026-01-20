import { MidwayConfig } from '@midwayjs/core';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1768789056552_8307',
  koa: {
    port: 7001,
  },
  axios: {
    clients: {
      // default：內部呼叫用，不綁 baseURL
      default: {
        timeout: 10000,
      },
      // weatherApi：OpenWeather 專用
      weatherApi: {
        baseURL: 'http://api.openweathermap.org',
        timeout: 5000,
      },
      // 以後加：paymentApi: { baseURL: 'https://api.stripe.com' }
    },
  },

} as MidwayConfig;
