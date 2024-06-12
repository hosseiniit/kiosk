import withReactContent from "sweetalert2-react-content";
import { _adr } from "../address.js";
import Swal from "sweetalert2";
const MySwal = withReactContent(Swal);

const swalMessage = (text, callback) => {
  MySwal.fire({
    icon: "error",
    title: process.env.REACT_APP_ERR_TITLE,
    text: text,
    confirmButtonText: process.env.REACT_APP_ERR_CONFIRM_TITLE,
    confirmButtonColor: process.env.REACT_APP_ERR_BOTTOM_COLOR,
    showLoaderOnConfirm: true,
    allowEscapeKey: false,
    allowOutsideClick: false,
    preConfirm: () => {
      return new Promise((resolve) => {
        resolve();
      });
    },
  }).then(() => {
    callback();
  });
};
export const HandleBankError = (urlBack = _adr.Root + _adr.Packages) => {
  swalMessage(process.env.REACT_APP_ERR_BANK, () => {
    urlBack && (window.location.href = "/");
  });
};
export const HandleServicesError = (urlBack = _adr.Root + _adr.Home) => {
  swalMessage(process.env.REACT_APP_ERR_SERVICES, () => {
    urlBack && (window.location.href = "/");
  });
};

export const HandleTokenError = (urlBack = _adr.Root + _adr.Packages) => {
  swalMessage(process.env.REACT_APP_ERR_EXPIRE_TOKEN, () => {
    urlBack && (window.location.href = "/");
  });
};
