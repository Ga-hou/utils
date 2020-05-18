import JsCookies from "js-cookie";

const TokenKey = "admin-tokenKey";

export function getToken() {
  return localStorage.getItem(JsCookies.get(TokenKey));
}

export function setToken(token) {
  const now = "" + Date.now();
  JsCookies.set(TokenKey, now);
  localStorage.setItem(now, `Bearer ${token}`);
}

export function removeToken() {
  localStorage.removeItem(JsCookies.get(TokenKey));
  JsCookies.remove(TokenKey);
}
