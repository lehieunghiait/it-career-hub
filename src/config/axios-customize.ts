import axiosClient from 'axios';
import { getToken } from '@clerk/react';

/**
 * Creates an initial 'axios' instance with custom settings.
 */

const instance = axiosClient.create({
  baseURL: import.meta.env.VITE_BACKEND_URL as string,
});

/**
 * Attach the Clerk session token. Clerk refreshes it automatically,
 * so there is no manual refresh-token flow anymore.
 */
instance.interceptors.request.use(async function (config) {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  if (!config.headers.Accept && config.headers['Content-Type']) {
    config.headers.Accept = 'application/json';
    config.headers['Content-Type'] = 'application/json; charset=utf-8';
  }
  return config;
});

/**
 * Handle all responses. It is possible to add handlers
 * for requests, but it is omitted here for brevity.
 */
instance.interceptors.response.use(
  res => res.data,
  async error => {
    return error?.response?.data ?? Promise.reject(error);
  }
);

export default instance;
