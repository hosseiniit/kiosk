import { useTranslation } from "react-i18next";
import "./merchand.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input } from "antd";
import { useEffect, useState } from "react";
import { useQuery } from "../../tools/api";
import { getLocalStorage, setAuthorization, setLocalStorage, setToken } from "../../tools/service";
import { _adr } from "../../address";
import { useDispatch, useSelector } from "react-redux";
import { _rootData } from "../../reducer/serviceReducer";
import LoadingPage from "../loading/LoadingPage";

const MerchandList = () => {
  const [t] = useTranslation("global");
  const { getTokenApi, configs, colors } = useQuery();
  const location = useLocation();
  const nav = useNavigate();

  const formData = useSelector((state) => state?.local?.root);
  const dispatch = useDispatch();

  const [merchandList, setMerchandList] = useState([]);
  const [orgMerchandList, setorgMerchandList] = useState([]);

  const [isProgress, setIsProgress] = useState(true);

  useEffect(() => {
    const initialServ = async () => {
      localStorage.clear("colors");
      if (location?.state?.merchand) {
        // setMerchandList(formData?.merchand);
        setMerchandList(location?.state?.merchand);
        // setorgMerchandList(formData?.merchand);
        setorgMerchandList(location?.state?.merchand);
        setLocalStorage("merchand", JSON.stringify(location?.state?.merchand));
      } else {
        setMerchandList(JSON.parse(getLocalStorage("merchand")));
        setorgMerchandList(JSON.parse(getLocalStorage("merchand")));
      }

      setIsProgress(false);
    };
    initialServ();
  }, []);

  const handleMerchand = async (merchand) => {
    setIsProgress(true);
    let payload = {
      UserName: formData?.users.UserName,
      Password: formData?.users.Password,
      MerchantId: merchand?.merchantId,
    };
    let response = await getTokenApi(payload);
    if (response) {
      await setToken({
        token: response.token,
        expireUTCTime: response.expireDate,
      });
      await setAuthorization(response.token);

      let configRes = await configs();
      if (configRes) {
        const resColor = await colors();
        if (!resColor.hasError) {
          document.documentElement.style.setProperty("--min-color", resColor?.result?.mainColor);
          document.documentElement.style.setProperty("--background-color", resColor?.result?.backgrounColor);
          document.documentElement.style.setProperty("--complementary-color", resColor?.result?.complementaryColor);
          setLocalStorage("colors", JSON.stringify(resColor?.result));

          dispatch(_rootData({ root: { ...formData, merchanditem: merchand, ...configRes } }));
          nav(_adr.Root + _adr.Main);
        }
      }
    }
    setIsProgress(false);
  };

  const searchHandler = async (e) => {
    let search = e.target.value;
    let result = orgMerchandList.filter((item) => {
      return Object.keys(item).some((k) => {
        return String(item[k]).toLowerCase().includes(search.toLowerCase());
      });
    });
    setMerchandList(result);
  };
  return (
    <>
      <div className="container-merchand">
        <div className="main-header">
          <div className="row-header">
            {/* <div className="logo-client">
              <img src={process.env.PUBLIC_URL + "/assets/images/main/client01.png"} alt="" />
            </div> */}
            <div className="logo-satrap">
              <div className="holder-icon" style={{ textAlign: "center" }}>
                <i className="icon-logo-satrap"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="main-body">
          <div className="holder-search-form">
            <Form.Item className="input-normal">
              <Input prefix={<i className="icon-magnifier"></i>} placeholder={t("merchand.search")} onChange={searchHandler} />
            </Form.Item>
          </div>
          <div className="holder-show-list-merchand">
            <div className="show-list">
              {merchandList?.map((item, key) => (
                <div key={key} className="item" onClick={() => handleMerchand(item)}>
                  <div className="hold-img">
                    <img src={"data:image/png;base64," + item.merchantImage} alt="" />
                  </div>
                  <div className="hold-desc">
                    <h2>{item.merchantName}</h2>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <LoadingPage isOpen={isProgress} />
    </>
  );
};

export default MerchandList;
