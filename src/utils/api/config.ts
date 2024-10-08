import { Subject } from 'rxjs';

export interface Config {
  apiUrls: string[];
  currentApiUrl: string;
}

const config: Config = {
  apiUrls: [
    'http://192.168.74.14',
    'http://82.209.232.250:4000'
  ],
  currentApiUrl: 'http://82.209.232.250:4000'
};

export const apiChangeSubject = new Subject<string>();

export const getApiUrl = () => {
  const savedApiUrl = localStorage.getItem('apiUrl');
  if (savedApiUrl && config.apiUrls.includes(savedApiUrl)) {
    config.currentApiUrl = savedApiUrl;
  }
  return config.currentApiUrl;
};

export const setApiUrl = (url: string) => {
  if (config.apiUrls.includes(url)) {
    config.currentApiUrl = url;
    localStorage.setItem('apiUrl', url);
    apiChangeSubject.next(url);
  }
};

export default config;