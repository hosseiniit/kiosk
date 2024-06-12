import axios from "axios";
import { deleteAllCookies, isEmpty, isEmptyObject } from "./tools";
import Cookies from "js-cookie";
import { _ckey } from "../address";
import { useSelector } from "react-redux";

export const app_Cookie = (key, value, issecure = false) => {
  try {
    if (!isEmpty(value)) {
      if (!issecure) {
        localStorage.setItem(key, value);
        // Cookies.set(key, value, {
        //   domain: process.env.REACT_APP_DOMAIN,
        //   secure: false,
        // });
      } else {
        // Cookies.set(key, value, { domain: process.env.REACT_APP_DOMAIN });
        localStorage.setItem(key, value);
      }
    } else {
      // return Cookies.get(key);
      return localStorage.getItem(key);
    }
  } catch (error) {
    return "";
  }
};

export const app_Cookie_Remove = async (key) => {
  try {
    Cookies.remove(key);
  } catch (error) {
    return "";
  }
};

export const setAuthorization = async (token) => {
  return new Promise((resolve) => {
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    resolve();
  });
};

export const setToken = async (values) => {
  return new Promise((resolve) => {
    app_Cookie(_ckey.expireUTCTime, values.expireUTCTime);
    setLocalStorage(_ckey.token, values.token);

    // axios.defaults.headers.common["token"] = setToken.token;
    resolve();
  });
};
export const setSessionStorage = (name, values) => {
  try {
    return sessionStorage.setItem(name, values);
  } catch (error) {
    return "";
  }
};
export const getSessionStorage = (name) => {
  try {
    return sessionStorage.getItem(name);
  } catch (error) {
    return "";
  }
};
export const setLocalStorage = (name, values) => {
  try {
    return localStorage.setItem(name, values);
  } catch (error) {
    return "";
  }
};
export const getLocalStorage = (name) => {
  try {
    return localStorage.getItem(name);
  } catch (error) {
    return "";
  }
};
export const checkToken = () => {
  return new Promise((resolve) => {
    try {
      let _token = getLocalStorage(_ckey.token);
      let _expireUTCTime = app_Cookie(_ckey.expireUTCTime);
      if (isEmpty(_token) || isEmpty(_expireUTCTime)) {
        resolve(false);
        return;
      }
      // const { global } = useSelector((state) => state);
      // if (!global?.resUser) {
      //   resolve(false);
      //   return;
      // }
      let persist = !isEmpty(localStorage.getItem("persist:root")) ? JSON.parse(localStorage.getItem("persist:root")) : {};

      if (!persist?._currentUser) {
        resolve(false);
        return;
      }

      setToken({ token: _token, expireUTCTime: _expireUTCTime });
      if (!isEmpty(_token) && !isEmpty(_expireUTCTime)) {
        var year = parseInt(_expireUTCTime.split("T")[0].split("-")[0]),
          month = parseInt(_expireUTCTime.split("T")[0].split("-")[1]),
          day = parseInt(_expireUTCTime.split("T")[0].split("-")[2]),
          hours = parseInt(_expireUTCTime.split("T")[1].split(".")[0].split(":")[0]),
          minutes = parseInt(_expireUTCTime.split("T")[1].split(".")[0].split(":")[1]),
          second = parseInt(_expireUTCTime.split("T")[1].split(".")[0].split(":")[2]);
        var utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, second));
        var distance = utcDate - new Date();
        if (distance <= 120) {
          resolve(false);
        } else {
          resolve(true);
        }
      } else {
        resolve(false);
      }
    } catch (error) {
      console.log(error);
      resolve(false);
    }
  });
};
export const clearApp = () => {
  sessionStorage.clear();
  localStorage.clear();
  deleteAllCookies();
};
