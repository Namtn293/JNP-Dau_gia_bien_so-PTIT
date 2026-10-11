export const lcStorage = {
  get: <T = any>(key: string): T | undefined => {
    return localStorage.getItem(key) !== 'undefined'
      ? JSON.parse(localStorage.getItem(key) as string)
      : undefined;
  },
  set: (key: string, value: any): void => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove: (item: string, key: string) => {
    const store = JSON.parse(localStorage.getItem(item) as string);
    delete store[key];
    localStorage.setItem(item, JSON.stringify(store));
  },
  delete: (key: string) => {
    localStorage.removeItem(key);
  },
};

export const ssStorage = {
  get: <T = any>(key: string): T | undefined => {
    return JSON.parse(sessionStorage.getItem(key) as string);
  },
  set: (key: string, value: any) => {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  remove: (item: string, key: string) => {
    const store = JSON.parse(sessionStorage.getItem(item) as string);
    delete store[key];
    sessionStorage.setItem(item, JSON.stringify(store));
  },
  delete: (key: string) => {
    sessionStorage.removeItem(key);
  },
};
