import { Configuration, App, IMidwayContainer } from '@midwayjs/core';
import * as dotenv from 'dotenv';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as axios from '@midwayjs/axios';
import { join } from 'path';
// import { DefaultErrorFilter } from './filter/default.filter';
// import { NotFoundFilter } from './filter/notfound.filter';
import { ReportMiddleware } from './middleware/report.middleware';

dotenv.config();

@Configuration({
  imports: [
    koa,
    validate,
    axios,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  async onReady(container: IMidwayContainer) {
    // add middleware
    this.app.useMiddleware([ReportMiddleware]);
    // add filter
    // this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
    // add axios interceptor
    await this.setupAxiosInterceptors(container);
  }

  private async setupAxiosInterceptors(container: IMidwayContainer) {
    const httpServiceFactory = await container.getAsync(
      axios.HttpServiceFactory
    );

    // 對所有 client（default、weatherApi 等）設定相同攔截器
    const clientNames = ['default', 'weatherApi'];
    for (const clientName of clientNames) {
      try {
        const httpService = httpServiceFactory.get(clientName);
        this.setupSingleClientInterceptors(httpService, clientName);
      } catch (err) {
        console.warn(`Client ${clientName} not configured, skip interceptors`);
      }
    }
  }

  private setupSingleClientInterceptors(httpService: any, clientName: string) {
    // Request 攔截器：統一 log request
    httpService.interceptors.request.use(
      (config: any) => {
        console.log(
          `[${clientName.toUpperCase()}] ${config.method?.toUpperCase()} ${
            config.url
          }`,
          { params: config.params }
        );
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response 攔截器：統一 log + 錯誤格式化
    httpService.interceptors.response.use(
      (response: any) => {
        console.log(
          `✅ [${clientName}] ${response.config.url} OK (${response.status})`
        );
        return response;
      },
      (error: any) => {
        const errInfo = {
          url: error.config?.url,
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          data: error.response?.data,
        };
        console.error(`❌ [${clientName}] API Error:`, errInfo);

        // 統一錯誤物件（service catch 時用）
        const unifiedError = new Error(
          `API Error [${errInfo.status || 'NETWORK'}]: ${errInfo.message}`
        );
        (unifiedError as any).details = errInfo;
        return Promise.reject(unifiedError);
      }
    );
  }
}
