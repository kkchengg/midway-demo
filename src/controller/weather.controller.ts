import { Controller, Get, Inject, Query } from '@midwayjs/core';
import { WeatherService } from '../service/weather.service';

@Controller('/')
export class WeatherController {
  @Inject()
  weatherService: WeatherService;

  @Get('/weather')
  async getWeatherInfo(
    @Query('city') city: string
  ): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const weatherInfo = await this.weatherService.getWeatherInfo(city);
      return { success: true, message: 'OK', data: weatherInfo };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Unknown error',
        data: null,
      };
    }
  }
}
