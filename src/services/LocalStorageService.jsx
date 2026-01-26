import { reactLocalStorage } from "reactjs-localstorage";

export const storeUserToken = (token) => {
  reactLocalStorage.setObject("token", token);
};

export const returnUserToken = () => {
  return reactLocalStorage.getObject("token");
};

export const storeUserEmail = (email) => {
  reactLocalStorage.setObject("userMail", email);
};

export const returnUserEmail = () => {
  return reactLocalStorage.getObject("userMail");
};

export const storeLoggedInUser = (user) => {
  reactLocalStorage.setObject("user", user);
};

export const returnLoggedInUser = () => {
  return reactLocalStorage.getObject("user");
};

export const storeMenuItem = (menu) => {
  reactLocalStorage.setObject("active-menu", menu);
};

export const returnMenuItem = () => {
  return reactLocalStorage.getObject("active-menu");
};

export const storeStatusResponse = (response) => {
  reactLocalStorage.setObject("statusRes", response);
};

export const returnStatusResponse = () => {
  return reactLocalStorage.getObject("statusRes");
};

export const storeClientIpResponse = (response) => {
  reactLocalStorage.setObject("clientIp", response);
};

export const returnClientIp = () => {
  return reactLocalStorage.getObject("clientIp");
};
