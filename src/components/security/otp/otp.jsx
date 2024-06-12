import { Button, Form, Input } from "antd";
import "./otp.scss";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { formatString, isEmpty } from "../../../tools/tools";
import { RedoOutlined } from "@ant-design/icons";
import { _adr } from "../../../address";
import { useQuery } from "../../../tools/api";
import { successMessage } from "../../../tools/toastifyShowMessage";
const OTP = () => {
  const [t] = useTranslation("global");

  const { apiChangePassword, apiBeginLoginOTP } = useQuery();

  const [isProgress, setIsProgress] = useState(false);
  const [remainTime, setRemainTime] = useState(180);
  const location = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    if (!isEmpty(location.state)) {
    } else {
      nav(_adr.Root + _adr.Login.Login, { replace: true });
    }
  }, []);
  useEffect(() => {
    const timer = setInterval(function () {
      if (remainTime <= 0) {
        clearInterval(timer);
        // nav(_adr.Root + _adr.Login, { replace: true });
      } else {
        setRemainTime((prev) => prev - 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [remainTime]);
  const handleSubmit = async (values) => {
    try {
      setIsProgress(true);
      let payload = {
        code: values.code,
        key: location.state?.keycode?.split(/--/)[0],
        password: values.password,
      };
      let response = await apiChangePassword(payload);
      if (response && !response?.hasError) {
        successMessage("رمز عبور شما با موفقیت تغییر کرد و با رمز عبور قبلی وارد نشود");
        nav(_adr.Root + _adr.Login.Login, { replace: true });
      }
      setIsProgress(false);
    } catch (error) {
      console.error(error);
      setIsProgress(false);
    }
  };
  const resendOtp = async () => {
    setIsProgress(true);
    let payload = {
      UserName: location.state?.username,
      Captcha: { hash: location.state?.captcha?.hash, code: location.state?.captcha?.code },
    };
    let response = await apiBeginLoginOTP(payload);
    if (response && !response?.hasError) {
      setRemainTime(180);
    }
    setIsProgress(false);
  };
  return (
    <>
      <div className="holder-otp-login">
        <h3 dangerouslySetInnerHTML={{ __html: formatString(t("otp.textDesc"), `<span dir='ltr'>${location?.state?.username}</span>`) }}></h3>
        <div className="holder-form">
          <Form layout="vertical" onFinish={handleSubmit}>
            <div className="row-otp-code">
              <div className="holder-input">
                <Form.Item
                  className="input-normal"
                  name="code"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (isEmpty(value)) return Promise.reject(t("validation.required"));
                        let _regex = new RegExp(t("validation.regexDigit"));
                        if (!_regex.test(value)) {
                          return Promise.reject(t("validation.regex"));
                        } else {
                          return Promise.resolve();
                        }
                      },
                    },
                  ]}
                >
                  <Input dir="ltr" placeholder={t("otp.code")} maxLength={6} autoComplete="off" />
                </Form.Item>
              </div>
              <div className="holder-timer">
                <div className="hold-remain">
                  {remainTime !== 0 ? (
                    <>
                      <i className="icon-clock"></i>
                      <span>{remainTime}</span>
                    </>
                  ) : (
                    <RedoOutlined onClick={resendOtp} />
                  )}
                </div>
              </div>
            </div>
            <Form.Item className="input-normal" name="password" id="password" rules={[{ required: true, message: t("validation.required") }]}>
              <Input.Password dir="ltr" placeholder={t("login.password")} autoComplete="off" />
            </Form.Item>
            <Form.Item
              className="input-normal"
              name="confirmpassword"
              id="confirmpassword"
              rules={[
                {
                  required: true,
                  message: t("validation.required"),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t("validation.confirmPassword")));
                  },
                }),
              ]}
            >
              <Input.Password dir="ltr" placeholder={t("login.confirm_password")} autoComplete="off" />
            </Form.Item>
            <Form.Item>
              <Button className={`btn-normal`} htmlType="submit" type="default" disabled={isProgress}>
                {isProgress ? t("global.pending") : t("otp.button")}
              </Button>
            </Form.Item>
          </Form>
          <div className="holder-back-msisdn">
            <Link to={_adr.Root + _adr.Login.LoginWithOTP}>شماره موبایل خود را تغییر می‌دهید؟</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default OTP;
