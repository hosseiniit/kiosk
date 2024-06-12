import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { _adr } from "../../address";
import "./final.scss";
import { Button } from "antd";
import { _rootData } from "../../reducer/serviceReducer";
import { commaDigits, complexDigitToman, convertCurrencyToToman, convertToJalaliWithTime, formatTime } from "../../tools/tools";
import html2canvas from "html2canvas";

import { useQuery } from "../../tools/api";
import LoadingPrintFactor from "../loading/LoadingPrintFactor";

const Final = () => {
  const Kiosk = window["Kiosk"];
  const { configs, print } = useQuery();
  const [t] = useTranslation("global");
  const formData = useSelector((state) => state?.local?.root);
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [merchandID, setMerchandID] = useState("");
  const [isKiosk, setIsKiosk] = useState(true);
  const [isLoad, setIsLoad] = useState(false);
  const nav = useNavigate();

  const divRef = useRef(null);

  const handleNewOrder = async () => {
    dispatch(_rootData({ root: { ...formData, selection: [], topping: [] } }));
    nav(_adr.Root + _adr.Main);
  };

  useEffect(() => {
    const initialConfig = async () => {
      try {
        if (location?.state?.orderNo) {
          setIsLoading(true);

          //load config
          const resConfig = await configs();
          if (resConfig) {
            //set Merchand ID
            setMerchandID(resConfig?.c1?.merchantID);
          }
          //load config

          let total = 0;
          formData?.selection.forEach((item) => {
            total = total + item.showPrice * item.counter;
            if (item.topping?.length > 0) {
              let totalTopping = 0;
              item.topping.forEach((topping) => {
                totalTopping = totalTopping + topping.price * topping.counter;
              });
              total = total + totalTopping;
            }
          });
          setTotalPrice(total);

          if (location?.state?.accept) {
            if (Kiosk) {
              setIsHidden(true);
            } else {
              setIsHidden(true);
              setIsLoading(false);
            }
          } else {
            const resPrint = await print(location?.state?.orderNo);
            if (resPrint?.result) {
              if (Kiosk) {
                setIsHidden(true);
              } else {
                setIsHidden(true);
                setIsLoading(false);
              }
            }
            setIsLoading(false);
          }
        }
      } catch (error) {
        setIsLoading(false);
      }
    };
    initialConfig();
  }, []);

  useEffect(() => {
    const convertImage = async () => {
      try {
        if (Kiosk) {
          setIsKiosk(true);
          setTimeout(() => {
            const divElement = divRef.current;
            if (divElement) {
              setIsLoading(true);
              html2canvas(divElement).then((canvas) => {
                // تبدیل تصویر به فرمت Base64
                const imageDataUrl = canvas.toDataURL("image/png")?.replace(/^data:image\/(png|jpg);base64,/, "");
                Kiosk?.print(imageDataUrl);
                setIsHidden(false);
                setIsLoading(false);
              });
            }
          }, 1000);
        } else {
          setIsKiosk(false);
        }
      } catch (error) {
        console.error(error);
      }
    };
    if (isHidden) {
      convertImage();
    }
  }, [isHidden]);

  useEffect(() => {
    if (!isKiosk && isLoad && !isLoading) {
      window.print();
    }
  }, [isKiosk, isLoad]);

  return (
    <>
      <div className="final">
        <div className="container-menu">
          <div className="main-menu">
            <div className="main-header">
              <div className="row-header">
                <div className="logo-client">{merchandID?.length > 0 && <img src={`https://mysatrap.com/logo/${merchandID}`} alt="" />}</div>
                <div className="logo-satrap">
                  <div className="holder-icon">
                    <i className="icon-logo-satrap"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="holder-final">
              <div className="holder-box">
                <div className="holder-gap">
                  <div className="holder-icon success">
                    <i className="icon-tick"></i>
                    {/* <i className="icon-close"></i> */}
                  </div>
                </div>

                <div className="holder-title">
                  <h1>سفارش شما با موفقیت ثبت شد</h1>
                </div>
                <div className="holder-progress">
                  <h2>سفارش در حال آماده سازی است...</h2>
                </div>
                <div className="holder-list-final">
                  <ul>
                    {/* <li>
                      <div className="label">زمان تقریبی تحویل سفارش</div>
                      <div className="value">
                        <span dir="ltr">16:32</span>
                      </div>
                    </li> */}
                    <li>
                      <div className="label">تاریخ ثبت سفارش</div>
                      <div className="value">
                        <span dir="ltr">
                          {convertToJalaliWithTime(new Date().toISOString())} - {formatTime(new Date())}
                        </span>
                      </div>
                    </li>
                    <li>
                      <div className="label">شماره سفارش</div>
                      <div className="value">
                        <span dir="ltr">{location?.state?.orderinfo?.orderLocalId}</span>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="holder-show-price">
                  <div className="label">مبلغ پرداخت شده</div>
                  <div className="value">
                    <span>{commaDigits(location?.state?.payment?.totalAmount || 0)}</span> تومان
                  </div>
                </div>
              </div>
              <div className="holder-button">
                {!isKiosk && (
                  <Button
                    className="btn-normal"
                    style={{ background: "transparent", color: "var(--min-color)", borderColor: "var(--min-color)" }}
                    onClick={() => {
                      window.print();
                    }}
                  >
                    چاپ فاکتور
                  </Button>
                )}

                <Button className="btn-normal" onClick={handleNewOrder}>
                  ثبت سفارش جدید
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LoadingPrintFactor isOpen={isLoading} />
      <div ref={divRef} className="holder-print" style={{ display: isKiosk ? (isHidden ? "block" : "none") : "none" }}>
        {/* <div ref={divRef} className="holder-print"> */}
        <div className="header-print">
          <div className="row-header">
            <div className="box-logo">
              {/* <img src={process.env.PUBLIC_URL + "/assets/images/main/logo-print.png"} alt="" /> */}
              <img
                src={`https://mysatrap.com/logo/${merchandID}`}
                onLoad={() => {
                  setIsLoad(true);
                }}
                alt=""
              />
            </div>
            <div className="holder-title">
              <h5>رستوران</h5>
              <h3>{formData?.merchanditem?.merchantName}</h3>
            </div>
            <div className="box-factor">
              <h3>شماره فاکتور:</h3>
              <strong>{location?.state?.orderinfo?.orderLocalId}</strong>
            </div>
          </div>
        </div>
        <div className="profile-print">
          <div className="box-holder">
            <div className="item-profile">
              <div className="row-item">
                <div className="hold-icon">
                  <i className="icon-user"></i> <span>{formData?.type === 0 ? "سالن" : "بیرون بر"}</span>
                </div>
                <div className="hold-factorno">
                  {/* <i className="icon-bell"></i>
                  <span dir="ltr">{location?.state?.orderNo}</span> */}
                </div>
                <div className="hold-date">
                  <span dir="ltr">{convertToJalaliWithTime(new Date().toISOString())}</span>
                  <span dir="ltr">{formatTime(new Date())}</span>
                </div>
              </div>
            </div>
            <div className="item-profile">
              <div className="holder-show-profile">
                <i className="icon-phone-call"></i> <span>شماره تماس:</span>
                <span dir="ltr">{location?.state?.msisdn}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="price-print">
          <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
            <thead>
              <tr>
                <th>عنوان محصول</th>
                <th>فی (تومان)</th>
                <th>تعداد</th>
                <th>قیمت کل (تومان)</th>
              </tr>
            </thead>
            <tbody>
              {formData?.selection?.map((item, key) => (
                <>
                  <tr key={key}>
                    <td>{item.productDS}</td>
                    <td>
                      <span dir="ltr">{commaDigits(item.showPrice)}</span>
                    </td>
                    <td>{item.counter}</td>
                    <td>
                      <span dir="ltr">{commaDigits(item.showPrice * item.counter)}</span>
                    </td>
                  </tr>
                  {formData?.selection?.topping
                    ?.filter((t) => t.productID === item.productID && t.counter > 0)
                    ?.map((titem, tkey) => (
                      <tr key={tkey}>
                        <td>{item.toppingDs}</td>
                        <td>
                          <span dir="ltr">{commaDigits(item.showPrice)}</span>
                        </td>
                        <div className="topping">
                          <div className="item">
                            <span className="label">{titem?.price}</span>
                            <span className="value"> ({titem.counter})</span>
                          </div>
                        </div>
                      </tr>
                    ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {location?.state?.description?.length > 0 ? (
          <>
            <div className="holder-details-print">
              <i className="icon-lisit"></i>
              <span>توضیحات</span>
            </div>
            <div className="description">{location?.state?.description}</div>
          </>
        ) : (
          <>
            <br />
          </>
        )}

        <div className="holder-table-list-price">
          <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
            <tbody>
              <tr>
                <td>جمع کل غذا</td>
                <td>{commaDigits(totalPrice || 0)}</td>
              </tr>
              <tr>
                <td>مالیات</td>
                <td>{commaDigits(location?.state?.payment?.tax || 0)}</td>
              </tr>
              <tr>
                <td>جمع تخفیف</td>
                <td>{commaDigits(location?.state?.payment?.discountAmount || 0)}</td>
              </tr>

              <tr>
                <td>
                  <div className="holder-totalprice-title">
                    <i className="icon-credit-card"></i>
                    <span>قابل پرداخت</span>
                  </div>
                </td>
                <td>
                  <div className="holder-totalprice-price">
                    <span>{commaDigits(location?.state?.payment?.totalAmount || 0)}</span> تومان
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="footer-print">
          <div className="row-item">
            <div className="site">
              <i className="icon-global"></i>
              <span>WWW.MYSATRAP.COM</span>
            </div>
            <div className="tel">
              <i className="icon-phone"></i>
              <span dir="ltr">021-22889966</span>
            </div>
          </div>
          <div className="location">
            <i className="icon-location"></i>
            <span>تهران، جردن، خیابان مهناز، پلاک ۸</span>
          </div>
          <div className="show-logo-satrap">
            <img src={process.env.PUBLIC_URL + "/assets/images/main/satrap.png"} alt="" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Final;
