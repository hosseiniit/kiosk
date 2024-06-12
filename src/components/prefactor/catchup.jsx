import { useEffect, useState } from "react";
import { useQuery } from "../../tools/api";
import { Button } from "antd";
const CatchUP = ({ text = "", orderid = 0, callback }) => {
  const { configs, orderNotSettled } = useQuery();

  //show merchandID
  const [merchandID, setMerchandID] = useState(0);

  useEffect(() => {
    const intial = async () => {
      let resConfig = await configs();
      if (resConfig) {
        setMerchandID(resConfig?.c1?.merchantID);
      }
    };
    intial();
  }, []);

  const cancelRequest = async () => {
    const response = await orderNotSettled(orderid);
    if (!response?.hasError && response?.result) {
      callback(false);
    }
  };
  const retrayRequest = async () => {
    callback(true);
  };
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
                  <div className="holder-icon faile">
                    <i className="icon-close"></i>
                  </div>
                </div>

                <p style={{ textAlign: "center" }}>{text}</p>
              </div>
              <div className="holder-button">
                <Button onClick={retrayRequest} className="btn-normal">
                  پرداخت مجدد
                </Button>
                <Button
                  onClick={cancelRequest}
                  className="btn-normal"
                  style={{ background: "var(--complementary-color)", color: "var(--min-color)", borderColor: "var(--min-color)" }}
                >
                  انصراف و ثبت سفارش جدید
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CatchUP;
