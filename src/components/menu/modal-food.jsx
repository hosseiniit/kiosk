import { Button, Carousel, Modal, message } from "antd";
import { useEffect, useState } from "react";
import { commaDigits, complexDigitToman, onErrorImage } from "../../tools/tools";
import "./modal-food.scss";
import { useTheme } from "../../context/ThemeContext";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useQuery } from "../../tools/api";
const ModalFoods = ({ open = false, isTopping = true, product, selection, subfoods, ptopping, callback }) => {
  const { toppings } = useQuery();

  // open modal state
  const [isOpen, setIsOpen] = useState(false);

  // state List SubFoods
  const [subFoodList, setSubFoodList] = useState([]);

  // active food
  const [activeFood, setActiveFood] = useState({});

  //state for topping list
  const [topping, setTopping] = useState([]);

  //state check Active Foods Counter
  const [isActiveCounter, setIsActiveCounter] = useState(false);

  //selection topping
  const [selectionTopping, setSelectionTopping] = useState([]);

  //get from another componnet topping and process
  const [thisSelected, setThisSelected] = useState([]);

  useEffect(() => {
    const initialComponent = async () => {
      setIsOpen(true);

      let updatedSubfoods = subfoods?.map((item) => {
        let foundSelection = selection.find((elem) => elem.productID === item.productID);

        if (foundSelection) {
          return { ...item, counter: 0 };
          // return { ...item, counter: foundSelection.counter };
        } else {
          return { ...item, counter: 0 };
        }
      });

      setSubFoodList(updatedSubfoods);
      setThisSelected(ptopping);
      setSelectionTopping(ptopping);
      // setThisSelected(ptopping);
      // setSelectionTopping(ptopping);
    };

    if (open) {
      initialComponent();
    }
  }, [open, subfoods, selection, ptopping]);

  useEffect(() => {
    if (isTopping) {
      handleShowTopping(product);
    }
  }, [isTopping]);

  const handleCancel = () => {
    setIsOpen(false);

    setIsActiveCounter(false);
    setActiveFood([]);
    setSelectionTopping([]);
    setTopping([]);
    const _subfood = subFoodList?.filter((item) => item.counter > 0);
    const _topping = selectionTopping?.filter((item) => item.counter > 0);
    if (product) {
      callback({
        product: { ...product, counter: 1, topping: _topping?.length > 0 ? [..._topping] : [] },
      });
    } else {
      callback({
        subfoods: _subfood?.length > 0 ? [..._subfood] : [],
        topping: _topping?.length > 0 ? [..._topping] : [],
      });
    }
  };

  // useEffect(() => {
  //   if (activeFood?.productID && activeFood?.productID !== 0) handleShowTopping(activeFood);
  // }, [activeFood]);

  const handleShowTopping = async (product) => {
    let response = await toppings(product?.productID);
    if (response?.length > 0) {
      let updateTopping = response.map((item) => {
        let foundItem = selectionTopping.find((elem) => elem.toppingId === item.toppingId && elem.productID === product?.productID);
        if (foundItem) {
          return { ...item, counter: foundItem.counter, productID: product?.productID };
        } else {
          return { ...item, counter: 0, productID: product?.productID };
        }
      });
      let temp = [];
      if (selectionTopping.length > 0) {
        temp = updateTopping.map((item) => {
          let foundItem = selectionTopping.find((elem) => elem.toppingId === item.toppingId && elem.productID === item.productID);
          if (foundItem) {
            return { ...item, counter: foundItem.counter };
          } else {
            return { ...item };
          }
        });
      } else {
        temp = updateTopping.filter((item) => item?.counter >= 0);
      }
      // temp = updateTopping.filter((item) => item?.counter >= 0);
      const tempTopping = selectionTopping.map((item) => {
        let foundItem = temp.find((elem) => elem.toppingId === item.toppingId && item.productID === elem.productID);
        if (foundItem) {
          return { ...item, counter: foundItem.counter };
        } else {
          return { ...item };
        }
      });
      setSelectionTopping(tempTopping);
      setTopping(updateTopping);
    } else {
      setTopping([]);
    }
  };

  const handleIncressAndDecress = async (product, isInCreass) => {
    let temp = { ...product };
    temp.counter = isInCreass ? ++temp.counter : --temp.counter < 0 ? 0 : temp.counter;
    setActiveFood(temp);

    const updatedList = subFoodList.map((obj) => {
      if (obj.productID === temp.productID) {
        return { ...obj, counter: temp.counter };
      }
      return obj;
    });
    setSubFoodList(updatedList);
  };

  const handleIncressAndDecressTopping = async (topping, isInCreass) => {
    let temp = [...selectionTopping];
    if (temp.filter((item) => item.toppingId === topping.toppingId && item.productID === topping.productID)?.length > 0) {
      let updateTemp = temp.map((item) => {
        if (item.toppingId === topping.toppingId && item.productID === topping.productID) {
          if (item.counter < item.maxCount || !isInCreass) {
            return { ...item, counter: isInCreass ? ++item.counter : --item.counter };
          }
        }
        return item;
      });
      if (updateTemp.find((item) => item.toppingId === topping.toppingId && item.productID === topping.productID)?.counter === 0) {
        updateTemp = updateTemp.filter((item) => item.toppingId !== topping.toppingId && item.productID === topping.productID);
      }
      setSelectionTopping(updateTemp);
    } else {
      let temp = [];
      if (selectionTopping?.length > 0) {
        temp.push(...selectionTopping);
      }
      temp.push({ ...topping, counter: 1 });

      setSelectionTopping(temp);
    }
  };

  const handleCheckClickFoods = async (item) => {
    if (item.counter === 0) {
      await handleIncressAndDecress(item, true);
    } else {
      setActiveFood(item);
    }
    setIsActiveCounter(true);
    handleShowTopping(item);
  };

  return (
    <>
      <Modal
        width="60rem"
        className="modal-type"
        title=""
        centered
        onCancel={handleCancel}
        open={isOpen}
        footer={<></>}
        closeIcon={<i className="icon-close"></i>}
      >
        <div className="type-of-food-container">
          <div className="type-of-food">
            {subFoodList?.length > 0 && (
              <>
                <h2>نوع غذا</h2>
                <div dir="rtl">
                  <Carousel className="carousel" infinite={false} slidesToShow={2} slidesToScroll={2} dots={false} rtl={true} arrows={true}>
                    {subFoodList.map((item, key) => (
                      <div key={key} className="holder-item">
                        <div
                          className={`item ${item.productID === activeFood?.productID ? "active" : ""}`}
                          onClick={async () => {
                            !item.isOutofStock && handleCheckClickFoods(item);
                          }}
                        >
                          <div className={`holder-img ${item.isOutofStock ? "outoforder" : ""}`}>
                            <img
                              src={item.imageUrl?.length > 0 ? item.imageUrl : process.env.PUBLIC_URL + "/assets/images/placeholder.jpg"}
                              onError={onErrorImage}
                              alt=""
                            />
                            {item.isOutofStock && (
                              <div className={"outoforderbag"}>
                                <h2>تمام شد</h2>
                              </div>
                            )}
                          </div>
                          <div className="holder-desc">
                            <div className="row-desc">
                              <div className="title">{item.productDS}</div>
                              <div className="price">
                                <span dir="ltr">{commaDigits(item.showPrice)}</span>
                                {/* <span className="old" dir="ltr">
                                  {commaDigits(item.oldPrice)}
                                </span> */}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Carousel>
                </div>
              </>
            )}
            {topping?.length > 0 && (
              <>
                <h2>افزودنی ها</h2>
                <Carousel className="carousel" infinite={false} slidesToShow={3} slidesToScroll={3} dots={false} rtl={true} arrows={true}>
                  {topping.map((item, key) => (
                    <div key={key}>
                      <div className="item-topping">
                        <div className="hold-topping">
                          <div className="holder-desc">
                            <div className="row-desc">
                              <div className="title">{item.toppingDs}</div>
                              <div className="price">
                                <span dir="ltr">{commaDigits(item.price)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="holder-action">
                            <div
                              className={`row-action ${
                                selectionTopping.filter((slc) => slc.toppingId === item.toppingId && slc.productID === item.productID)[0]?.counter > 0
                                  ? "active"
                                  : ""
                              }`}
                            >
                              <div className="holder-icon increase">
                                <span
                                  onClick={() => {
                                    handleIncressAndDecressTopping(item, true);
                                  }}
                                >
                                  <i className="icon-plus"></i>
                                </span>
                              </div>
                              <div className="holder-counter">
                                <span>
                                  {selectionTopping.filter((slc) => slc.toppingId === item.toppingId && slc.productID === item.productID)[0]?.counter}
                                </span>
                              </div>
                              <div className="holder-icon">
                                <span
                                  onClick={() => {
                                    handleIncressAndDecressTopping(item, false);
                                  }}
                                >
                                  <i className="icon-minus"></i>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {selectionTopping.filter((slc) => slc.toppingId === item.toppingId && slc.productID === item.productID)[0]?.counter >=
                          item.maxCount && (
                          <div className="notes-hold">
                            <span>
                              <InfoCircleOutlined />
                              حداکثر تعداد سفارش: {item.maxCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </Carousel>
              </>
            )}
          </div>

          <div className="holder-action-food">
            <div className="row-item">
              <div className="button-holder">
                <Button onClick={handleCancel} className="btn-normal">
                  تایید
                </Button>
              </div>
              {isActiveCounter && (
                <div className="holder-action">
                  <div className="row-action">
                    <div className="holder-icon">
                      <span
                        onClick={() => {
                          handleIncressAndDecress(activeFood, true);
                        }}
                      >
                        <i className="icon-plus"></i>
                      </span>
                    </div>
                    <div className="holder-counter">
                      <span>{activeFood?.counter >= 0 ? activeFood?.counter : 0}</span>
                    </div>
                    <div className="holder-icon">
                      <span
                        onClick={() => {
                          handleIncressAndDecress(activeFood, false);
                        }}
                      >
                        <i className="icon-minus"></i>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ModalFoods;
