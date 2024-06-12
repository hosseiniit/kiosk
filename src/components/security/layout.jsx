import { Button, Checkbox, Form, Input } from "antd";
import "./layout.scss";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LayoutLogin = ({ children }) => {
  const [t] = useTranslation("global");
  return (
    <>
      <div className="login-layout">
        <div className="header">
          <div className="brand-onwer">
            <i className="icon-logo-satrap"></i>
          </div>
        </div>

        <div className="container">
          <div className="holder-box">
            <div className="box">
              <div className="logo-item">
                <i className="icon-satrap"></i>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LayoutLogin;
