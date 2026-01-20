import { Provide, Inject, Init } from '@midwayjs/core';
import { HttpServiceFactory } from '@midwayjs/axios';

@Provide()
export class WeatherService {
  @Inject()
  httpServiceFactory!: HttpServiceFactory;
  private httpService!: any;

  @Init()
  async init() {
    this.httpService = await this.httpServiceFactory.get('weatherApi');
  }

  async getWeatherInfo(
    city: string
  ): Promise<{ city: string; weather: string }> {
    const { lat, lon } = await this.getLatitudeLongitude(city);

    const res = await this.httpService.get('/data/2.5/weather', {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHERMAP_API_KEY!,
        units: 'metric',
      },
    });

    return { city, weather: res.data.main.temp };
  }

  async getLatitudeLongitude(
    city: string
  ): Promise<{ lat: number; lon: number }> {
    const res = await this.httpService.get('/geo/1.0/direct', {
      params: {
        q: city,
        limit: 1,
        appid: process.env.OPENWEATHERMAP_API_KEY!,
      },
    });

    const data = res.data as any[];

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`No location found for city: ${city}`);
    }

    const { lat, lon } = data[0];
    if (lat === undefined || lon === undefined) {
      throw new Error(`Invalid geocoding data for city: ${city}`);
    }

    return { lat, lon };
  }
}
