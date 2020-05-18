import axios from "axios";

const service = axios.create({
  baseURL: process.env.BASE_URL,
  timeout: 60000
});

const pending = {};
const CancelToken = axios.CancelToken;

// remove duplicate requests
const removePending = (config, f) => {
  const url = config.url.replace(config.baseURL, "/");
  const flagUrl =
    url + "&" + config.method + "&" + JSON.stringify(config.params);
  if (flagUrl in pending) {
    if (f) {
      f();
    } else {
      delete pending[flagUrl];
    }
  } else {
    if (f) {
      pending[flagUrl] = f;
    }
  }
};
service.interceptors.request.use(
  config => {
    config.cancelToken = new CancelToken(c => {
      removePending(config, c);
    });
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
service.interceptors.response.use(
  response => {
    removePending(response.config);
    return response.data;
  },
  error => {
    removePending(error.config);
    if (!axios.isCancel(error)) {
      return Promise.reject(error.response);
    } else {
      return Promise.resolve({});
    }
  }
);

export const axios = service;
