import axios from "axios";
import { clearApp, getLocalStorage, setAuthorization } from "./service";
import { HandleServicesError } from "./swalModal";
import { errorMessage } from "./toastifyShowMessage";
import { _ckey } from "../address";

const QueryAPI = async (url = "", parameters = {}, type = "post", withCredentials = false) => {
  let response = null;
  setAuthorization(getLocalStorage(_ckey.token));
  try {
    const apiUrl = process.env.REACT_APP_API_KEY + url;
    if (type === "post") {
      if (withCredentials) {
        response = await axios.post(apiUrl, parameters, { timeout: 35000, withCredentials: true });
      } else {
        response = await axios.post(apiUrl, parameters, { timeout: 35000 });
      }
    } else {
      if (withCredentials) {
        response = await axios.get(apiUrl, { timeout: 35000, withCredentials: true });
      } else {
        response = await axios.get(apiUrl, { timeout: 35000 });
      }
    }
    if (response?.data?.hasError) {
      errorMessage(response?.data?.message);
    }
  } catch (error) {
    if (error?.response?.status === 401) {
      console.error("An error occurred", error.code);
      clearApp();
      HandleServicesError();
    } else {
      // errorMessage(error?.code + "\r\n " + error?.message);
      errorMessage(error?.response?.data?.message || "عملیات با مشکل مواجه شد" + error?.response?.status);
    }
  }
  return response ? response?.data : null;
};

export const useQuery = () => {
  const getCaptcha = async () => {
    let response = null;
    response = await QueryAPI("/captcha/GetCaptcha", "");
    return response ? response : null;
  };

  const apiLogin = async (parameters) => {
    let response = null;
    response = await QueryAPI("/Home/ApiLogin?restype=v2&image=sync&kiosk=true", parameters, "post", false);
    return !response ? null : !response.hasError ? response.result : null;
  };
  const apiBeginLoginOTP = async (parameters) => {
    let response = null;
    response = await QueryAPI("/home/ApiBeginLoginOTP?restype=v2&image=sync", parameters, "post", false);
    return response ? response : null;
  };
  const getTokenApi = async (parameters) => {
    let response = null;
    response = await QueryAPI("/home/GetTokenApi?restype=v2", parameters);
    return response ? response.result : null;
  };
  const configs = async () => {
    let response = null;
    response = await QueryAPI("/qrcode/api/configs?restype=v2", "", "get");
    return response ? response.result : null;
  };
  const foodCats = async (parameters) => {
    let response = null;
    response = await QueryAPI("/qrcode/api/foodCats?image=true&restype=v2", parameters);
    return response ? response.result : null;
  };
  const apiChangePassword = async (parameters) => {
    let response = null;
    response = await QueryAPI("/home/ApiChangePassword?restype=v2", parameters);
    return response ? response : null;
  };
  const foodsbyCat = async (parameters) => {
    let response = null;
    response = await QueryAPI(`/qrcode/api/foodsbyCat/${parameters}&restype=v2`, "", "GET");
    return response ? response.result : null;
  };
  const toppings = async (parameters) => {
    let response = null;
    response = await QueryAPI(`/qrcode/api/toppings/${parameters}?restype=v2`, "", "GET");
    return response ? response.result : null;
  };
  const search = async (parameters, type) => {
    let response = null;
    response = await QueryAPI(`/qrcode/api/search?image=1&type=${type}&restype=v2`, parameters);
    return response ? response.result : null;
  };
  const neworder = async (parameters, type) => {
    let response = null;
    response = await QueryAPI(`/qrcode/api/neworder?restype=v2`, parameters);
    return response ? response?.result : null;
  };
  const cartinfo = async (parameters, type) => {
    let response = null;
    response = await QueryAPI(`/qrcode/api/cartinfo?restype=v2`, parameters);
    return response ? response.result : null;
  };
  const pos = async (parameters) => {
    let response = null;
    response = await QueryAPI(`/qrcode/api/pos/3/${parameters}`, "", "GET");
    return response ? response : null;
  };
  const orderInfo = async (parameters) => {
    let response = null;
    response = await QueryAPI(`/qrcode/api/OrderInfo/${parameters}`, "", "GET");
    return response ? response : null;
  };
  const print = async (parameters) => {
    let response = null;
    response = await QueryAPI(`/qrcode/api/print/${parameters}`, "", "GET");
    return response ? response : null;
  };
  const colors = async () => {
    let response = null;
    response = await QueryAPI(`/qrcode/api/kiosk/colors`, "", "GET");
    return response ? response : null;
  };
  const orderNotSettled = async (parameters) => {
    let response = null;
    response = await QueryAPI(`/api/s1/ordercancle?orderid=${parameters}`, "", "GET");
    return response ? response : null;
  };
  return {
    getCaptcha,
    apiBeginLoginOTP,
    getTokenApi,
    foodCats,
    foodsbyCat,
    apiLogin,
    configs,
    apiChangePassword,
    toppings,
    search,
    neworder,
    cartinfo,
    pos,
    orderInfo,
    print,
    colors,
    orderNotSettled,
  };
};

