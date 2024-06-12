import { toast } from "react-toastify";
import "./toastify.scss";
const defaultNotifyOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
  rtl: true,
  bodyClassName: "custom-toast", // تنظیم کلاس برای body پیام
  progressClassName: "custom-toast-progress", // تنظیم کلاس برای نوار پیشرفت
};

export const showToast = (message, defaultNotifyOptions) => {
  toast(message, defaultNotifyOptions);
};

export const notify = (type, message, customOptions) => {
  const mergedOptions = { ...defaultNotifyOptions, ...customOptions };
  showToast(message, { ...mergedOptions, type });
};

export const errorMessage = (message, customOptions) => {
  notify("error", message, customOptions);
};

export const successMessage = (message, customOptions) => {
  notify("success", message, customOptions);
};

export const warningMessage = (message, customOptions) => {
  notify("warning", message, customOptions);
};

export const infoMessage = (message, customOptions) => {
  notify("info", message, customOptions);
};
