import { Configuration, IMidwayContainer } from '@midwayjs/core';
import * as axiosMod from '@midwayjs/axios';

@Configuration({
  imports: [axiosMod],
})
export class AxiosConfiguration {
  async onReady(container: IMidwayContainer) {
    const httpServiceFactory = await container.getAsync(
      axiosMod.HttpServiceFactory
    );

    const clientNames = ['default', 'weatherApi'];
    for (const clientName of clientNames) {
      try {
        const httpService = httpServiceFactory.get(clientName);
        this.setupInterceptors(httpService, clientName);
      } catch (err) {
        console.warn(`[AxiosConfig] Client ${clientName} not ready, skip`);
      }
    }
  }

  private setupInterceptors(httpService: any, clientName: string) {
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
