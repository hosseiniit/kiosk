import { Button, Checkbox, Form, Input, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { _adr } from "../../../address";
import { useEffect, useState } from "react";
import { useQuery } from "../../../tools/api";
import { setAuthorization, setLocalStorage, setToken } from "../../../tools/service";

import "./login.scss";
import { useDispatch, useSelector } from "react-redux";
import { _rootData, clearFormData } from "../../../reducer/serviceReducer";
import LoadingPage from "../../loading/LoadingPage";

const Login = () => {
  const [t] = useTranslation("global");
  const { bgButtonColor } = useTheme();
  const { apiLogin, getCaptcha, getTokenApi, configs, colors } = useQuery();

  const formData = useSelector((state) => state?._rootData);
  const dispatch = useDispatch();

  const nav = useNavigate();

  const [isProgress, setIsProgress] = useState(false);
  const [captchaImage, setCaptchaImage] = useState("");
  const [isCaptcha, setIsCaptcha] = useState(false);
  const [hashCode, setHashCode] = useState("");

  useEffect(() => {
    const callCaptcha = async () => {
      localStorage.clear("colors");
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
    dispatch(clearFormData(["root"]));
    setIsProgress(true);
    let payload = {
      UserName: values?.username,
      Password: values?.password,
      Captcha: {
        hash: hashCode,
        code: values?.code,
      },
    };
    let response = await apiLogin(payload);
    if (response) {
      if (response?.merchants?.length > 1) {
        // dispatch(_rootData({ root: { merchand: response?.merchants, users: { UserName: values?.username, Password: values?.password } } }));

        dispatch(_rootData({ root: { users: { UserName: values?.username, Password: values?.password } } }));
        nav(_adr.Root + _adr.Merchand, {
          state: {
            merchand: response?.merchants,
          },
        });
      } else {
        payload = {
          UserName: values?.username,
          Password: values?.password,
          MerchantId: response?.merchants?.length > 0 ? response?.merchants[0]?.merchantId : 0,
        };
        let resToken = await getTokenApi(payload);
        if (resToken) {
          await setToken({
            token: resToken.token,
            expireUTCTime: resToken.expireDate,
          });
          await setAuthorization(resToken.token);
          let configRes = await configs();
          if (configRes) {
            // dispatch(_rootData({ root: { merchand: response?.merchants[0], ...configRes } }));
            const resColor = await colors();
            if (!resColor.hasError) {
              document.documentElement.style.setProperty("--min-color", resColor?.result?.mainColor);
              document.documentElement.style.setProperty("--background-color", resColor?.result?.backgrounColor);
              document.documentElement.style.setProperty("--complementary-color", resColor?.result?.complementaryColor);
              setLocalStorage("colors", JSON.stringify(resColor?.result));
              dispatch(_rootData({ root: { ...configRes } }));
              nav(_adr.Root + _adr.Main, {
                state: {
                  merchand: response?.merchants[0],
                },
              });
            }
          }
        } else {
          setIsCaptcha(false);
        }
      }
    } else {
      setIsCaptcha(false);
    }
    setIsProgress(false);
  };
  return (
    <div className="login-container">
      <div className="holder-form">
        <h3>{t("login.title_Page")}</h3>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="username" rules={[{ required: true, message: t("validation.required") }]}>
            <Input dir="ltr" placeholder={t("login.username")} autoComplete="off" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: t("validation.required") }]}>
            <Input.Password dir="ltr" placeholder={t("login.password")} autoComplete="off" />
          </Form.Item>
          <div className="row-form-item">
            <div className="item-control">
              <Form.Item name="code" rules={[{ required: true, message: t("validation.required") }]}>
                <Input maxLength={5} dir="ltr" autoComplete="off" placeholder="کد امنیتی را وارد نمایید" />
              </Form.Item>
            </div>
            {isCaptcha ? (
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
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="checkRemember">{t("login.rememberMe")}</Checkbox>
            </Form.Item>
          </Form.Item>
          <Form.Item>
            <Button className={`btn-normal`} htmlType="submit" type="default">
              {isProgress ? t("global.pending") : t("login.accept")}
            </Button>
          </Form.Item>
          <div className="holder-bellow-link">
            <Link className="login-form-forgot" to={_adr.Login.LoginWithOTP} style={{ color: "var(--min-color)" }}>
              {t("login.forget_password")}
            </Link>
          </div>
        </Form>
        <LoadingPage isOpen={isProgress} />
      </div>
    </div>
  );
};

export default Login;
