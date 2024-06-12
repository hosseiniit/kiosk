import { Button, Form, Input, Modal } from "antd";
import "./prefactor.scss";
import TextArea from "antd/es/input/TextArea";
import FormItemLabel from "antd/es/form/FormItemLabel";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { commaDigits, complexDigitToman, convertPersian, delay, onErrorImage, validateInput } from "../../tools/tools";
import { _adr } from "../../address";
import { useQuery } from "../../tools/api";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { _rootData } from "../../reducer/serviceReducer";
import LoadingPayment from "../loading/LoadingPayment";
import LoadingPage from "../loading/LoadingPage";
import { errorMessage } from "../../tools/toastifyShowMessage";
import CatchUP from "./catchup";
const Prefactor = () => {
  const [t] = useTranslation("global");

  const formData = useSelector((state) => state?.local?.root);
  console.log(formData);
  const dispatch = useDispatch();

  const location = useLocation();

  const { neworder, cartinfo, pos, orderInfo, configs } = useQuery();

  const [foods, setFoods] = useState(formData?.selection || []);
  const [foodFinal, setFoodFinal] = useState(formData?.selectionFinal || []);
  // const [topping, setTopping] = useState(formData?.topping || []);
  const [typeOrder] = useState(formData?.type || 0);

  const [orderID, setOrderID] = useState("");

  const [pricing, setPricing] = useState({});
  const [frmDiscount] = Form.useForm();
  const [frmDesc] = Form.useForm();
  const [frmModal] = Form.useForm();

  const [modalOpen, setModalOpen] = useState(false);

  const [discount, setDiscount] = useState(0);
  const nav = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  const [isShowCatchUp, setIsShowCatchUp] = useState(false);
  const [messageRequest, setMessageRequest] = useState("");

  const [showDesc, setShowDesc] = useState(false);

  useEffect(() => {
    const initialConfig = async () => {
      const configRes = await configs();
      if (configRes) {
        setShowDesc(configRes?.c1?.KioskDescDisabled);
      }
    };
    initialConfig();
  }, []);

  useEffect(() => {
    dispatch(_rootData({ root: { ...formData, selection: foods, selectionFinal: foodFinal } }));
    if (foods?.length > 0) {
      let totalToppaing = foodFinal?.map((item) => {
        if (item?.topping?.length > 0) {
          return {
            Toppings: item?.topping?.map((t) => ({ ToppingId: t.toppingId, OrderCount: t.counter })),
            ProductId: item.productID,
            OrderCount: item.counter,
          };
        } else {
          return {
            Toppings: [],
            ProductId: item.productID,
            OrderCount: item.counter,
          };
        }
      });
      let payload = {
        ProductOrderDetails: totalToppaing,
        OrderSourceId: 8,
        IsOutbound: typeOrder === 1 ? true : false,
        kiosk: true,
        PaymentType: 1,
        OrderDescription: frmDesc?.getFieldValue("desc"),
        Voucher: frmDiscount?.getFieldValue("discount"),
      };
      calcu(payload);

      let temp = JSON.parse(JSON.stringify(foods.filter((item) => item.counter > 0)));
      temp = temp.reduce((acc, item) => {
        const existingProduct = acc.find((p) => p.productID === item.productID);
        if (existingProduct) {
          existingProduct.counter += item.counter;

          (item.topping || []).forEach((toppingItem) => {
            const existingTopping = existingProduct.topping.find((t) => t.toppingId === toppingItem.toppingId);
            if (existingTopping) {
              existingTopping.counter += toppingItem.counter;
            } else {
              existingProduct.topping.push({ ...toppingItem });
            }
          });
        } else {
          acc.push({ ...item });
        }
        return acc;
      }, []);
      setFoodFinal(temp);
    } else {
      nav(_adr.Root + _adr.Menu);
    }
  }, [foods]);

  const handleIncressAndDecress = async (product, isInCreass) => {
    let temp = [...foods];
    if (product?.topping) {
      let found = false;
      temp = temp
        .reverse()
        .filter((item) => {
          if (item.productID === product.productID && !found) {
            found = true;
            return false;
          }
          return true;
        })
        .reverse();
      setFoods(temp);
    } else {
      if (temp.filter((item) => item.productID === product.productID)?.length === 1) {
        let updateTemp = temp.map((item) => {
          if (item.productID === product.productID) {
            if (isInCreass) {
              let _item = item.counter;

              return { ...item, counter: ++_item };
            } else {
              let _item = item.counter;
              return { ...item, counter: --_item };
            }
          }
          return item;
        });

        // if (updateTemp.find((item) => item.productID === product.productID)?.counter === 0) {
        //   updateTemp = updateTemp.filter((item) => item.productID !== product.productID);
        //   let tempSubTopping = topping.map((item) => {
        //     if (item.productID === product.productID) {
        //       return { ...item, counter: 0 };
        //     } else {
        //       return { ...item };
        //     }
        //   });
        //   setTopping(tempSubTopping);
        // }
        updateTemp = updateTemp.filter((item) => item.counter > 0);
        if (updateTemp.length > 0) {
          setFoods(updateTemp);
        } else {
          setFoods([]);
          dispatch(_rootData({ root: { ...formData, selection: [], topping: [] } }));
          nav(_adr.Root + _adr.Menu);
        }
      } else if (temp.filter((item) => item.productID === product.productID)?.length > 1) {
        let found = false;
        temp = temp
          .reverse()
          .filter((item) => {
            if (item.productID === product.productID && !found) {
              found = true;
              return false;
            }
            return true;
          })
          .reverse();
        setFoods(temp);
      } else {
        setFoods((prev) => [...prev, { ...product, counter: 1 }]);
      }
    }
  };

  const handleSubmit = async (value) => {
    let totalToppaing = foods?.map((item) => {
      if (item?.topping?.length > 0) {
        return {
          Toppings: item?.topping?.map((t) => ({ ToppingId: t.toppingId, OrderCount: t.counter })),
          ProductId: item.productID,
          OrderCount: item.counter,
        };
      } else {
        return {
          Toppings: [],
          ProductId: item.productID,
          OrderCount: item.counter,
        };
      }
    });
    let payload = {
      ProductOrderDetails: totalToppaing,
      OrderSourceId: 8,
      IsOutbound: typeOrder === 1 ? true : false,
      kiosk: true,
      PaymentType: 1,
      OrderDescription: frmDesc.getFieldValue("desc"),
      Voucher: value?.discount || "",
    };
    if (value?.discount) {
      setDiscount(value?.discount);
      calcu(payload);
    } else {
      setModalOpen(true);
    }
  };

  const calcu = async (payload) => {
    setIsLoading(true);
    //for show calc
    let response = await cartinfo(payload);
    if (response) {
      setPricing(response);
    }
    setIsLoading(false);
  };

  const handlePayment = async (values) => {
    try {
      setModalOpen(false);
      setIsLoadingPayment(true);

      const totalToppings = foods.map((item) => {
        return {
          Toppings: item?.topping?.map((t) => ({ ToppingId: t.toppingId, OrderCount: t.counter })),
          ProductId: item.productID,
          OrderCount: item.counter,
        };
      });

      let getOrderID = orderID || 0;
      if (!orderID) {
        const payload = {
          customer: { Mobile1: "09" + values?.msisdn },
          ProductOrderDetails: totalToppings,
          OrderSourceId: 8,
          IsOutbound: typeOrder === 1,
          kiosk: true,
          PaymentType: 1,
          OrderDescription: frmDesc.getFieldValue("desc"),
          Voucher: discount || "",
        };
        getOrderID = await neworder(payload);
        setOrderID(getOrderID);
      }

      if (getOrderID) {
        if (formData?.c1?.kioskPrintAfterOK) {
          const resPos = await pos(getOrderID);
          if (!resPos?.hasError) {
            await delay(20000);
            const intervalId = setInterval(async () => {
              const resPending = await orderInfo(getOrderID);
              if (resPending?.posInfo?.status === 0 && resPending?.posInfo?.success) {
                clearInterval(intervalId);
                nav(_adr.Root + _adr.Final, {
                  state: {
                    orderinfo: resPending,
                    description: frmDesc.getFieldValue("desc"),
                    orderNo: getOrderID,
                    payment: pricing,
                    msisdn: values?.msisdn,
                  },
                });
                setIsLoadingPayment(false);
              } else if (![1, 0].includes(resPending?.posInfo?.status)) {
                setMessageRequest(resPending?.posInfo?.errorMessage);
                clearInterval(intervalId);
                setIsLoadingPayment(false);
                setIsShowCatchUp(true);
              }
            }, 10000);

            setTimeout(() => {
              if (!isShowCatchUp) {
                clearInterval(intervalId);
                setIsLoadingPayment(false);
                // errorMessage("");
                setMessageRequest("پرداخت با مشکل مواجه شد");
                setIsShowCatchUp(true);
              }
            }, 120000); // 2 minutes
          } else {
            setIsLoadingPayment(false);
          }
        } else {
          const resPending = await orderInfo(getOrderID);
          nav(_adr.Root + _adr.Final, {
            state: {
              orderinfo: resPending,
              description: frmDesc.getFieldValue("desc"),
              orderNo: getOrderID,
              payment: pricing,
              msisdn: values?.msisdn,
              accept: true,
            },
          });
        }
      } else {
        setIsLoadingPayment(false);
      }
    } catch (error) {
      setIsLoadingPayment(false);
    }
  };

  const deletePackageHandler = () => {
    dispatch(_rootData({ root: { ...formData, selection: [], topping: [] } }));
    nav(_adr.Root + _adr.Menu);
  };

  const callBackCatchUp = async (state) => {
    setIsShowCatchUp(false);
    if (state) {
      const value = {
        msisdn: frmModal.getFieldValue("msisdn"),
      };
      handlePayment(value);
    } else {
      dispatch(_rootData({ root: { ...formData, selection: [], topping: [] } }));
      nav(_adr.Root + _adr.Main);
    }
  };
  return (
    <>
      {isShowCatchUp ? (
        <CatchUP orderid={orderID} text={messageRequest} callback={callBackCatchUp} />
      ) : (
        <>
          <LoadingPayment isOpen={isLoadingPayment} />
          <div className="prefactor">
            <div className="header">
              <div className="row-header">
                <div className="holder-back">
                  <span onClick={() => nav(_adr.Root + _adr.Menu)}>
                    <i className="icon-arrow-right"></i>
                    سبد خرید
                  </span>
                </div>
                <div className="holder-delete" onClick={deletePackageHandler}>
                  <span>
                    حذف سبد
                    <i className="icon-trash"></i>
                  </span>
                </div>
              </div>
            </div>
            <div className="body-prefactor">
              <div className="holder-column">
                <div className="hold-menu">
                  <div className="show-foods">
                    {foodFinal?.map((item, key) => (
                      <div className="item" key={key}>
                        <div className="row-item">
                          <div className="hold-img">
                            <img
                              src={item.imageUrl?.length > 0 ? item.imageUrl : process.env.PUBLIC_URL + "/assets/images/placeholder.jpg"}
                              onError={onErrorImage}
                              alt=""
                            />
                          </div>
                          <div className="hold-desc">
                            <h3>
                              {item?.productDSCat && <>{`${item?.productDSCat}  `}</>}
                              {item?.productDS}
                            </h3>
                            <div className="topping">
                              {item?.topping?.map((titem, tkey) => (
                                <div className="topping" key={tkey}>
                                  <div className="item">
                                    <span className="label">{titem?.toppingDs}</span>
                                    <span className="value"> ({titem.counter})</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="pricing">
                              <span className="price">{commaDigits(item?.showPrice)} تومان</span>
                              {/* <div className="discount">
                            <div className="discount-percent">20%</div>
                            <span className="discount-price">14,800</span>
                          </div> */}
                            </div>
                          </div>
                          <div className="hold-action">
                            <div className="row-action">
                              <div className="hold-icon">
                                <i className="icon-plus" onClick={() => handleIncressAndDecress(item, true)}></i>
                              </div>
                              <div className="counter">{item.counter}</div>
                              <div className="hold-icon">
                                <i className="icon-minus" onClick={() => handleIncressAndDecress(item, false)}></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="hold-form">
                  <Form form={frmDesc} layout="vertical">
                    {/* <Form form={frmDesc} layout="vertical" style={{ display: `${!showDesc ? "none" : "block"}` }}> */}
                    <Form.Item name="desc" className="input-normal" label="توضیحات سفارش (اختیاری)">
                      <TextArea placeholder="توضیحات سفارش خود را وارد کنید..." cols={5} rows={3} />
                    </Form.Item>
                  </Form>
                  <div className="holder-discount-form" style={{ display: "none" }}>
                    <Form form={frmDiscount} onFinish={handleSubmit} layout="vertical">
                      <div className="row-form">
                        <div className="input-control">
                          <Form.Item
                            name="discount"
                            className="input-normal"
                            label="کد تخفیف دارید؟"
                            ules={[{ required: true, message: t("validation.required") }]}
                          >
                            <Input placeholder="کد تخفیف..." />
                          </Form.Item>
                        </div>
                        <div className="action-control">
                          <Form.Item className="input-normal" label={<></>}>
                            <Button htmlType="submit" className="btn-normal">
                              اعمال تخفیف
                            </Button>
                          </Form.Item>
                        </div>
                      </div>
                    </Form>
                  </div>
                  <div className="holder-factor">
                    <ul>
                      <li>
                        <div className="label">مالیات</div>
                        <div className="value">
                          <span dir="ltr">{commaDigits(pricing?.tax || 0)}</span> تومان
                        </div>
                      </li>
                      <li>
                        <div className="label">هزینه بسته بندی</div>
                        <div className="value">
                          <span dir="ltr">{commaDigits(pricing?.packagingCost || 0)}</span> تومان
                        </div>
                      </li>
                      {pricing?.discountAmount !== 0 && (
                        <li>
                          <div className="label">تخفیف محصولات</div>
                          <div className="value">
                            <span dir="ltr">{commaDigits(pricing?.discountAmount || 0)}</span> تومان
                          </div>
                        </li>
                      )}

                      <li>
                        <div className="label">مبلغ قابل پرداخت</div>
                        <div className="value">
                          <span dir="ltr">{commaDigits(pricing?.totalAmount || 0)}</span> تومان
                        </div>
                      </li>
                    </ul>
                    <div className="holder-button">
                      <Button onClick={handleSubmit} className="btn-normal">
                        نهایی سازی سفارش
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Modal
            width="50rem"
            className="modalName"
            title=""
            onCancel={() => {
              setModalOpen(false);
            }}
            centered
            open={modalOpen}
            footer={<></>}
          >
            <div className="modal-give-name">
              <div className="holder-form">
                <Form form={frmModal} layout="vertical" onFinish={handlePayment}>
                  <Form.Item
                    className="input-normal"
                    name="msisdn"
                    rules={[
                      validateInput({
                        t: t,
                        type: "msisdn",
                      }),
                    ]}
                    label="شماره موبایل"
                  >
                    <Input
                      dir="ltr"
                      suffix={<span>09</span>}
                      placeholder=".لطفا شماره موبایل خود را وارد کنید"
                      maxLength={9}
                      inputMode="numeric"
                      autoComplete="off"
                      onChange={(e) => {
                        e.target.value = convertPersian(e.target.value);
                      }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button className={`btn-normal`} htmlType="submit" type="default">
                      تایید
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </Modal>
          <LoadingPage isOpen={isLoading} />
        </>
      )}
    </>
  );
};

export default Prefactor;
