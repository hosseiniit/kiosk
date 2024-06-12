import moment from "jalali-moment";
import persianJs from "persianjs";

export const isEmpty = (value) => {
  try {
    return typeof value === "undefined" || value === null || value === "";
  } catch (error) {
    return true;
  }
};
export const isEmptyObject = (value) => {
  try {
    return Object.keys(value).length === 0;
  } catch (error) {
    return true;
  }
};
export const isEmptyArray = (value) => {
  try {
    return Array.isArray(value) && value.length === 0;
  } catch (error) {
    return true;
  }
};
export const convertCurrencyToRial = (value) => value * 10;
export const convertCurrencyToToman = (value) => value / 10;
export const commaDigits = (value) => {
  return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};
export const complexDigitToman = (value) => {
  const convertedValue = convertCurrencyToToman(parseInt(value));
  const formattedValue = commaDigits(Math.floor(convertedValue));
  return formattedValue;
};
export const complexDigitRial = (value) => {
  const convertedValue = convertCurrencyToRial(parseInt(value));
  const formattedValue = commaDigits(Math.floor(convertedValue));
  return formattedValue;
};
export const convertPersian = (value) => {
  try {
    return persianJs(value.toString()).toEnglishNumber();
  } catch (error) {
    return value;
  }
};
export const convertMemory = (value, fromUnit, toUnit) => {
  const units = {
    B: 0,
    KB: 1,
    MB: 2,
    GB: 3,
    TB: 4,
  };

  const base = 1024;
  const fromExponent = units[fromUnit.toUpperCase()];
  const toExponent = units[toUnit.toUpperCase()];

  if (fromExponent === undefined || toExponent === undefined) {
    throw new Error("Invalid memory unit");
  }

  const exponentDiff = fromExponent - toExponent;
  const convertedValue = value * Math.pow(base, exponentDiff);

  return convertedValue;

  //console.log(convertMemory(1024, 'KB', 'MB')); تبدیل 1024 کیلوبایت به مگابایت
  //console.log(convertMemory(1, 'GB', 'TB')); تبدیل 1 گیگابایت به ترابایت
};

export const days_Difference = (fromDate, toDate) => {
  const oneDay = 24 * 60 * 60 * 1000; // تعداد میلی‌ثانیه‌های یک روز

  // تبدیل تاریخ‌ها به شیء تاریخ جاوا اسکریپت
  const dateObject1 = new Date(fromDate);
  const dateObject2 = new Date(toDate);

  // محاسبه تعداد روزهای اختلاف
  const diffDays = Math.round(Math.abs((dateObject1 - dateObject2) / oneDay));

  return diffDays;
};
export const gregorian_to_jalali = (date) => {
  let gregorianDate = moment(date, "YYYY-MM-DD"); // تاریخ میلادی
  let jalaliDate = gregorianDate.format("jYYYY/jMM/jDD"); // تبدیل به تاریخ شمسی
  return jalaliDate;
};
export const currentYear = (year) => {
  return moment(year, "YYYY").format("jYYYY");
};
export const jalali_to_gregorian = (date, split = "-") => {
  let jalaliDate = moment(date, "jYYYY/jMM/jDD"); // تاریخ میلادی
  let gregorianDate = jalaliDate.format(`YYYY${split}MM${split}DD`); // تبدیل به تاریخ شمسی
  return gregorianDate;
};
export const convertToJalaliWithTime = (date, spliter = "/") => {
  let _tempDate = date.split("T")[0].split(spliter);
  return gregorian_to_jalali(_tempDate[0] + "/" + _tempDate[1] + "/" + _tempDate[2]);
};
export const convertToJalaliWithoutTime = (date, spliter = "/") => {
  try {
    let _tempDate = date.split("/");
    return gregorian_to_jalali(_tempDate[0] + "/" + _tempDate[1] + "/" + _tempDate[2]);
  } catch (error) {
    return "";
  }
};
export const convertToGregorian = (date, spliter = "/") => {
  let _tempDate = date.split("/");
  return jalali_to_gregorian(_tempDate[0] + "/" + _tempDate[1] + "/" + _tempDate[2], "/");
};
export const formatDate = (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};
export const getMinAndMaxDateBirthday = () => {
  let d = new Date();
  let year = d.getFullYear();
  let month = d.getMonth();
  let day = d.getDate();
  let c = new Date(year - 18, month, day);

  var MaxDate = {
    year: parseInt(formatDate(c)),
    month: 11 + 1,
    day: 30,
  };
  c = new Date(year - 100, month, day);
  var MinDate = {
    year: parseInt(formatDate(c)),
    month: month + 1,
    day: day,
  };
  return { MaxDate, MinDate };
};
export function formatMsisdn(msisdn) {
  if (!isEmpty(msisdn)) {
    msisdn = msisdn.toString();
    return msisdn.substr(0, 3) + " " + msisdn.substr(3, 3) + " " + msisdn.substr(6, 2) + " " + msisdn.substr(8, 2);
  } else {
    return "";
  }
}
export const formatString = (template, ...args) => {
  return template.replace(/\{(\d+)\}/g, (match, key) => {
    return args[key] !== undefined ? args[key] : match;
  });
};
export const base64ToFile = (base64String, fileName) => {
  // تبدیل رشته Base64 به ArrayBuffer
  const binaryString = window.atob(base64String);
  const byteArray = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }
  const arrayBuffer = byteArray.buffer;

  // ساخت یک Blob از ArrayBuffer
  const blob = new Blob([arrayBuffer], { type: "image/jpeg" }); // نوع تصویر را تغییر دهید بر اساس نوع تصویر مورد نظر

  // ساخت یک فایل با استفاده از Blob
  const file = new File([blob], fileName, { type: blob.type });

  return file;
};
export const blobUrlToFile = async (blobUrl, fileName) => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();

  // ساخت یک فایل با استفاده از Blob
  const file = new File([blob], fileName, { type: blob.type });

  return file;
};
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]); // برش پیشوند Base64
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
export const convertBlobToBase64 = async (blobUrl) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = "blob";
    xhr.onload = function () {
      const blob = xhr.response;

      const reader = new FileReader();
      reader.onloadend = function () {
        const base64Data = reader.result.split(",")[1]; // برش پیشوند Base64
        resolve(`data:image/jpeg;base64,${base64Data}`);
      };

      reader.readAsDataURL(blob);
    };

    xhr.onerror = function () {
      reject(new Error("خطا در دریافت Blob"));
    };

    xhr.open("GET", blobUrl);
    xhr.send();
  });
};
export const urltoFile = (url, filename = "newfile.jpg", mimeType = "image/jpeg") => {
  if (url.startsWith("data:")) {
    var arr = url.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[arr.length - 1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    var file = new File([u8arr], filename, { type: mime || mimeType });
    return Promise.resolve(file);
  }
  return fetch(url)
    .then((res) => res.arrayBuffer())
    .then((buf) => new File([buf], filename, { type: mimeType }));
};

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const deleteAllCookies = () => {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};

export const getFieldDocument = (documentType) => {
  try {
    switch (documentType) {
      case 0:
        return "CertNoCard";
      case 1:
        return "Passport";
      case 2:
        return "PreparednessCard";
      case 3:
        return "RefugeeCard";
      case 4:
        return "IdentityCard";
      default:
        return "";
    }
  } catch (error) {
    return "";
  }
};
export const formatTime = (time = new Date()) => {
  try {
    let hours = time.getHours();
    let minutes = time.getMinutes();
    let seconds = time.getSeconds();
    return hours + ":" + ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);
  } catch (error) {
    return "";
  }
};

const applyRegex = (value, regexPattern) => {
  const regex = new RegExp(regexPattern, "g");
  return value.replace(regex, "");
};
export const regexFormater = (value) => {
  try {
    if (isEmpty(value)) {
      throw new Error("");
    }
    const formatter = {
      value: value,
      applyRegex: (regexPattern) => {
        return (formatter.value = applyRegex(formatter.value, regexPattern));
      },
      removeSpace: () => {
        return formatter.applyRegex(/\s/g);
      },
    };
    return formatter;
  } catch (error) {
    return "";
  }
};
export const fileToBase64 = async (file) => {
  if (typeof file === "object") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } else {
    return null;
  }
};
export const findBase64ToObjectForRedux = async (obj) => {
  const newObj = Array.isArray(obj) ? [] : {}; // ساخت نسخه جدید از شیء به صورت خالی

  for (const key of Object.keys(obj)) {
    const value = obj[key];

    if (value instanceof File) {
      newObj[key] = await fileToBase64(value); // تبدیل فایل به Base64
    } else if (typeof value === "object" && value !== null) {
      newObj[key] = await findBase64ToObjectForRedux(value); // بازگشتی تماس می‌گیریم برای شی‌های داخلی
    } else {
      newObj[key] = value; // کپی عادی مقادیر
    }
  }

  return newObj; // برگرداندن شیء جدید
};

export const findObjectToBase64ForRedux = async (obj) => {
  const newObj = Array.isArray(obj) ? [] : {}; // ساخت نسخه جدید از شیء به صورت خالی

  for (const key of Object.keys(obj)) {
    const value = obj[key];

    if (typeof value === "string" && value.startsWith("data:")) {
      // این یک رشته Base64 است و ما آن را به File تبدیل می‌کنیم
      const fileName = `file_${key}`; // این فقط یک نام فایل نمونه است، شما باید نام فایل واقعی را تعیین کنید
      newObj[key] = base64ToFile(value, fileName);
    } else if (typeof value === "object" && value !== null) {
      newObj[key] = await findObjectToBase64ForRedux(value); // بازگشتی تماس می‌گیریم برای شی‌های داخلی
    } else {
      newObj[key] = value; // کپی عادی مقادیر
    }
  }

  return newObj; // برگرداندن شیء جدید
};

export const validateInput = ({
  t = null,
  validate = true,
  type = [""],
  min = null,
  max = null,
  length = null,
  typeOfValue = "",
  priceAmount = 0,
}) => {
  return {
    validator: (rules, value, getFieldValue) => {
      if (validate) if (isEmpty(value)) return Promise.reject(t("validation.required"));
      if (min !== null) return Promise.reject(formatString(t("validation.minChar"), min));
      if (max !== null) return Promise.reject(formatString(t("validation.maxChar"), min));
      if (length !== null) {
        let _regex = new RegExp(formatString(t("validation.regexDigitLength"), length));
        if (!_regex.test(value)) {
          return Promise.reject(t("validation.regex"));
        }
      }
      if (!isEmpty(type)) {
        if (type === "email") {
          if (!isEmpty(value)) {
            let _regex = new RegExp(t("validation.regexEmail"));
            if (!_regex.test(value)) {
              return Promise.reject(t("validation.regex"));
            }
          }
        }
        if (type === "url") {
          let _regex = new RegExp(t("validation.regexUrl"));
          if (!_regex.test(value)) {
            return Promise.reject(t("validation.regex"));
          }
        }
        if (type === "number") {
          let _regex = new RegExp(t("validation.regexDigit"));
          if (!_regex.test(value)) {
            return Promise.reject(t("validation.number"));
          }
        }
        if (type === "password") {
          if (value.length <= 8) {
            return Promise.reject(t("validation.minPassword"));
          }
          let _regexChar = new RegExp(t("validation.regexChar"));
          let _regexDigit = new RegExp(t("validation.regexDigit"));
          if (!_regexChar.test(value) || !_regexDigit.test(value)) {
            return Promise.reject(t("validation.complexPassword"));
          }
        }
        if (type === "msisdnOrg") {
          let _regex = new RegExp(t("validation.regexMsisdnOrg"));
          let _val = regexFormater(value).removeSpace();
          if (!_regex.test(_val)) {
            return Promise.reject(t("validation.regex"));
          }
        }
        if (type === "msisdn") {
          let _regex = new RegExp(t("validation.regexMsisdn"));
          let _val = regexFormater(value).removeSpace();
          if (!_regex.test(_val)) {
            return Promise.reject(t("validation.regex"));
          }
        }
        if (type === "msisdnFix") {
          let _regexFix = new RegExp(t("validation.regexMsisdnFix"));
          let _val = regexFormater(value).removeSpace();
          if (!_regexFix.test(_val)) {
            return Promise.reject(t("validation.regex"));
          }
        }
        if (type === "persian") {
          let _regexFix = new RegExp(t("validation.regexPersian"));
          if (!_regexFix.test(value)) {
            return Promise.reject(t("validation.onlypersian"));
          }
        }
        if (type === "english") {
          let _regexFix = new RegExp(t("validation.regexChar"));
          if (!_regexFix.test(value)) {
            return Promise.reject(t("validation.onlyEnglish"));
          }
        }
        if (type === "charge") {
          let _regex = new RegExp(t("validation.regexDigitComma"));
          if (!_regex.test(value)) {
            return Promise.reject(t("validation.number"));
          }
          let amount = parseInt(regexFormater(value).removeComma());
          if (
            amount < parseInt(process.env.REACT_APP_MIN_CHARGE_BANK) ||
            amount % parseInt(process.env.REACT_APP_MIN_CHARGE_BANK) !== 0 ||
            amount > parseInt(process.env.REACT_APP_MAX_CHARGE_BANK)
          ) {
            return Promise.reject(t("validation.charge"));
          }
        }
        if (type === "chargeWallet") {
          let _regex = new RegExp(t("validation.regexDigitComma"));
          if (!_regex.test(value)) {
            return Promise.reject(t("validation.number"));
          }
          let amount = parseInt(regexFormater(value).removeComma());
          if (amount < parseInt(priceAmount) || amount % parseInt(process.env.REACT_APP_MIN_CHARGE_BANK) !== 0) {
            return Promise.reject(t("validation.chargeWallet"));
          }
        }
        if (type === "image") {
        }
      }
      return Promise.resolve();
    },
    type: typeOfValue,
  };
};

export const onErrorImage = (e) => {
  e.target.src = process.env.PUBLIC_URL + "/assets/images/placeholder.jpg";
};
