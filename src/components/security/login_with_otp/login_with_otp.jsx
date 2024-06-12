import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";
import { Button, Col, Form, Input, Row } from "antd";
import "./login_with_otp.scss";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "../../../tools/api";
import ReactInputMask from "react-input-mask";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { _adr } from "../../../address";
import { regexFormater } from "../../../tools/tools";
const LoginWithOTP = () => {
  const [t] = useTranslation("global");
  const { button, colorButton } = useTheme();
  const [isProgress, setIsProgress] = useState(false);
  const [captchaImage, setCaptchaImage] = useState("");
  const { getCaptcha, apiBeginLoginOTP } = useQuery();
  const [hashCode, setHashCode] = useState("");
  const [isCaptcha, setIsCaptcha] = useState(false);

  const nav = useNavigate();
  const refmask = useRef();

  useEffect(() => {
    const callCaptcha = async () => {
      if (!isCaptcha) {
        let response = await getCaptcha();
        if (response) {
          setCaptchaImage("data:image/png;base64," + response?.item1);
          setHashCode(response?.item2);
          setIsCaptcha(true);
        }
      }
    };
    callCaptcha();
  }, [isCaptcha]);

  const handleSubmit = async (values) => {
    setIsProgress(true);
    let payload = {
      UserName: regexFormater(values.username).removeSpace(),
      Captcha: { hash: hashCode, code: values.code },
    };
    let response = await apiBeginLoginOTP(payload);
    if (response && !response?.hasError) {
      nav(_adr.Root + _adr.Login.OTP, {
        state: {
          keycode: response?.result?.key,
          username: regexFormater(values.username).removeSpace(),
          captcha: payload.Captcha,
        },
      });
    }
    setIsProgress(false);
  };
  return (
    <>
      <div className="login-with-otp">
        <div className="holder-form">
          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              className="input-normal"
              name="username"
              rules={[
                { required: true, message: t("validation.required") },
                {
                  validator: (_, value) => {
                    if (/_/.test(value)) {
                      return Promise.reject(t("validation.regex"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              hasFeedback
            >
              <div>
                <ReactInputMask
                  className="inputmask"
                  mask="0\999 99 99 999"
                  dir="ltr"
                  placeholder={t("login_with_otp.userPhoneNumber")}
                  autoComplete="off"
                  ref={refmask}
                />
              </div>
            </Form.Item>
            <div className="row-form-item">
              <div className="item-control">
                <Form.Item className="input-normal" name="code" rules={[{ required: true, message: t("validation.required") }]}>
                  <Input maxLength={6} dir="ltr" autoComplete="off" placeholder="کد امنیتی را وارد نمایید" allowClear />
                </Form.Item>
              </div>

              {captchaImage.length > 0 ? (
                <div className="holder-captcha">
                  <img id="captchaimg" src={captchaImage} className="img-fluid" alt="" />
                </div>
              ) : (
                <div className="holder-spin">
                  <Spin size="large" style={{ width: "6.5rem", height: "6.5rem" }} />
                </div>
              )}

              <div className="holder-reload">
                <Button className="reload-captcha" type="link" onClick={() => setIsCaptcha(false)}>
                  <i className="icon-reload"></i>
                </Button>
              </div>
            </div>

            <Form.Item>
              <Button className={`btn-normal`} htmlType="submit" type="default" disabled={isProgress}>
                {isProgress ? t("global.pending") : t("login_with_otp.button")}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
};

export default LoginWithOTP;
