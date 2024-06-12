import { Button, Carousel } from "antd";
// import "./main.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { _adr } from "../../address";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { _rootData } from "../../reducer/serviceReducer";
import styles from "./main.module.scss";

const Main = () => {
  const [t] = useTranslation("global");
  const formData = useSelector((state) => state?.local?.root);
  const dispatch = useDispatch();

  const location = useLocation();
  const nav = useNavigate();

  const [logoMerchand, setLogoMerchand] = useState("");

  const [sliderCarosel, setSliderCarosel] = useState([]);

  // console.log(location?.state);

  useEffect(() => {
    dispatch(
      _rootData({
        root: {
          ...formData,
          selection: [],
          topping: [],
        },
      }),
    );
    if (formData?.c3) {
      let imageList = [];
      if (formData?.c3?.kioskBannerUrl1?.length > 0) imageList.push(formData?.c3?.kioskSelectBannerUrl1);
      if (formData?.c3?.kioskBannerUrl2?.length > 0) imageList.push(formData?.c3?.kioskSelectBannerUrl2);
      if (formData?.c3?.kioskBannerUrl3?.length > 0) imageList.push(formData?.c3?.kioskSelectBannerUrl3);
      setSliderCarosel(imageList);
    }
  }, []);

  const handleSubmit = async (type) => {
    dispatch(_rootData({ root: { ...formData, type: type } }));
    nav(_adr.Root + _adr.Menu);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.holder_slider}>
          <Carousel dots={{ className: styles.bullet }}>
            {sliderCarosel?.map((item, key) => (
              <div key={key} className={styles.holder_img}>
                <div className={styles.image} style={{ backgroundImage: `url(${item})` }}></div>
              </div>
            ))}
          </Carousel>
        </div>
        <div className={styles.holder_icon}>
          <div className={styles.holder_list}>
            <ul>
              {formData.c1?.kioskEnabledSalon && (
                <li onClick={() => handleSubmit(0)}>
                  <div className={styles.label}>سالن</div>
                  <div className={styles.icon}>
                    <i className="icon-dinein1"></i>
                  </div>
                </li>
              )}

              {formData.c1?.kioskEnabaledOut && (
                <li onClick={() => handleSubmit(1)}>
                  <div className={styles.label}>بیرون بر</div>
                  <div className={styles.icon}>
                    <i className="icon-takeaway"></i>
                  </div>
                </li>
              )}
            </ul>
          </div>
          <div className={styles.footer_logo}>
            <div className={styles.holder_img}>
              <img src={process.env.PUBLIC_URL + "/assets/images/main/satrap.png"} alt="" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Main;
