const getItem = key =>
  localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : {};

const setItem = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

const deleteAllItem = key => localStorage.removeItem(key);

// 비동기처리 테스트
const api = {
  get: url => {
    const key = url.slice(1);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(getItem(key));
      }, 100);
    });
  },
  set: (url, params) => {
    const key = url.slice(1);
    return new Promise(resolve => {
      setTimeout(() => {
        setItem(key, params);
        resolve(true);
      }, 100);
    });
  },
  delete: url => {
    const [key, param] = url.slice(1).split("/");

    return new Promise(resolve => {
      setTimeout(() => {
        if (!param) deleteAllItem(key);
        resolve(true);
      }, 100);
    });
  }
};

export default api;
