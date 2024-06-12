import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "../../tools/api";
import { useEffect, useState } from "react";
import { Badge, Button, Carousel, Collapse, Form, Input, message } from "antd";
import "./menu.scss";
import { DoubleRightOutlined } from "@ant-design/icons";
import InfiniteScroll from "react-infinite-scroll-component";
import { commaDigits, isEmpty, onErrorImage } from "../../tools/tools";
import ModalFoods from "./modal-food";
import { _adr } from "../../address";
import { useDispatch, useSelector } from "react-redux";
import { _rootData } from "../../reducer/serviceReducer";
import LoadingPage from "../loading/LoadingPage";
import styles from "./menu.module.scss";

const MainMenu = () => {
  //#region backend

  //resourese ===========================
  const [t] = useTranslation("global");
  //resourese ===========================

  const formData = useSelector((state) => state?.local?.root);
  const dispatch = useDispatch();

  //hook ===========================

  //navigation for router
  const nav = useNavigate();
  //get state value from Location
  const location = useLocation();

  //show message
  const [messageApi, contextHolder] = message.useMessage();

  //services
  const { configs, foodCats, foodsbyCat, toppings, search } = useQuery();

  //hook ===========================

  //ُState =========================

  //banner slider
  const [imgSlider, setImgSlider] = useState([]);
  //loading
  const [isLoading, setIsLoading] = useState(false);
  //show merchandID
  const [merchandID, setMerchandID] = useState(0);
  //categories of foods
  const [categories, setCategories] = useState([]);
  //active categories
  const [activeCategories, setActiveCategories] = useState(0);

  //show Foods ==================================================
  //set foods
  // const [OrgFoods, setOrgFoods] = useState([]);
  const [foods, setFoods] = useState([]);
  //set foods temp
  const [foodsTemp, setFoodsTemp] = useState([]);
  //current page food
  const [page, setPage] = useState(0);
  //state product with topping
  const [productWithTopping, setProductWithTopping] = useState({});
  //state product is Topping
  const [isTopping, setIsTopping] = useState(false);
  //sub foods
  const [subFoods, setSubFoods] = useState([]);
  // topping foods
  const [subTopping, setSubTopping] = useState(formData?.topping || []);
  //selection foods
  const [selection, setSelection] = useState(formData?.selection || []);

  //check Total selection
  const [selectionFinal, setSelectionFinal] = useState([]);

  //total price
  const [totalPrice, setTotalPrice] = useState(0);
  //show Foods ==================================================

  //open Modal state
  const [isOpen, setIsOpen] = useState(false);

  const [beforeSearch, setBeforeSearch] = useState([]);

  const [configApp, setConfigApp] = useState({});

  //ُState =========================

  //use Effect ====================

  useEffect(() => {
    const CallInitialServices = async () => {
      try {
        setIsLoading(true);
        //load config
        let resConfig = await configs();
        if (resConfig) {
          let imageList = [];
          if (resConfig?.c3?.kioskBannerUrl1?.length > 0) imageList.push(resConfig?.c3?.kioskBannerUrl1);
          if (resConfig?.c3?.kioskBannerUrl2?.length > 0) imageList.push(resConfig?.c3?.kioskBannerUrl2);
          if (resConfig?.c3?.kioskBannerUrl3?.length > 0) imageList.push(resConfig?.c3?.kioskBannerUrl3);
          if (resConfig?.c3?.kioskBannerUrl4?.length > 0) imageList.push(resConfig?.c3?.kioskBannerUrl4);
          if (resConfig?.c3?.kioskBannerUrl5?.length > 0) imageList.push(resConfig?.c3?.kioskBannerUrl5);

          //set Image for Banner
          setImgSlider(imageList);

          //set Merchand ID
          setMerchandID(resConfig?.c1?.merchantID);

          setConfigApp(resConfig);
        }
        //load config

        //load Food Categories
        let resCat = await foodCats();
        if (resCat) {
          setCategories(resCat);
          if (resCat.length > 0) {
            setActiveCategories(resCat[0].id);
            setPage(0);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };

    CallInitialServices();
  }, []);

  //use Effect ====================

  //call services Foods============
  useEffect(() => {
    if (activeCategories > 0) {
      servFoods();
    }
  }, [activeCategories, page]);
  const servFoods = async () => {
    try {
      setIsLoading(true);

      let query = activeCategories + "?type=" + formData.type + "&skip=" + page;
      let response = await foodsbyCat(query);
      if (response) {
        let resMap = [];
        if (selection?.length > 0) {
          resMap = response.map((item) => {
            let findItem = selection.find((select) => select.productID === item.productID);
            if (findItem?.productID) {
              return { ...item, category: activeCategories, counter: findItem.counter };
            } else {
              return { ...item, category: activeCategories };
            }
          });
        } else {
          resMap = response.map((item) => ({ ...item, category: activeCategories }));
        }
        setFoods(resMap);
        // setOrgFoods(response);
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };
  //call services Foods============

  //selection foods================
  const handleIncressAndDecress = async (product, isInCreass) => {
    //check has subFood,decrease if product has 1 row clear all subfood from selection
    if (product?.subFoodTypes?.length > 0 && handleShowCounter(product) === 1 && !isInCreass) {
      clearSubFood(product);
      return;
    }
    var isZero = false;
    //if has subfood open modal food by subfood
    if (product?.subFoodTypes?.length > 0) {
      const resMap = product.subFoodTypes.map((item) => ({ ...item, productDSCat: product?.productDS, category: activeCategories }));
      setSubFoods(resMap);
      setProductWithTopping(null);
      setIsOpen(true);
    } else {
      //check only topping without subfood open modal food
      let response = await toppings(product?.productID);
      if (response?.length > 0) {
        if (isInCreass) {
          setProductWithTopping(product);
          setIsTopping(true);
          setSubFoods(null);
          setIsOpen(true);
        } else {
          let temp = [...selection];
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
          setSelection(temp);
        }
      } else {
        let temp = [...selection];
        if (temp.filter((item) => item.productID === product.productID)?.length === 1) {
          let updateTemp = temp.map((item) => {
            if (item.productID === product.productID) {
              return { ...item, counter: isInCreass ? item.counter + 1 : item.counter - 1 };
              // if (temp.filter((f) => f.productID === product.productID).length > 1 && !isInCreass) {

              // } else {
              //   return { ...item, counter: isInCreass ? item.counter + 1 : item.counter - 1 };
              // }
            }
            return item;
          });
          // if (updateTemp.find((item) => item.productID === product.productID)?.counter === 0) {
          //   updateTemp = updateTemp.filter((item) => item.productID !== product.productID);
          //   let tempSubTopping = subTopping.map((item) => {
          //     if (item.productID === product.productID) {
          //       return { ...item, counter: 0 };
          //     } else {
          //       return { ...item };
          //     }
          //   });
          //   setSubTopping(tempSubTopping);
          //   isZero = true;
          // }
          updateTemp = updateTemp.filter((item) => item.counter > 0);
          setSelection(updateTemp);
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
          setSelection(temp);
        } else {
          setSelection((prev) => [...prev, { ...product, counter: 1 }]);
        }
      }

      // if (!isZero) {
      //   let response = await toppings(product?.productID);
      //   if (response?.length > 0) {
      //     setProductWithTopping(product);
      //     setIsTopping(true);
      //     setSubFoods(product.subFoodTypes);
      //     setIsOpen(true);
      //   }
      // }
    }
  };
  //selection foods================

  //call back modal
  const handleBackModal = (values) => {
    setIsTopping(false);

    if (values?.product) {
      const temp = [...selection];
      temp.push(values?.product);
      setSelection(temp);
      // const find = selection?.find((item) => item.productID === values?.product.productID);
      // if (find) {
      //   const updateSelection = selection?.map((item) => {
      //     if (item.productID === find.productID) {
      //       let topping = values?.product?.topping.map((tItem) => {
      //         let tFind = item?.topping?.find((ifind) => ifind.toppingId === tItem.toppingId);
      //         if (tFind) {
      //           return { ...tFind, counter: tItem.counter + tFind.counter };
      //         } else {
      //           return { ...tItem };
      //         }
      //       });
      //       return { ...find, topping: topping };
      //     } else {
      //       return { ...item };
      //     }
      //   });
      //   setSelection(updateSelection);
      // }
    } else {
      const product = values?.subfoods?.map((item) => {
        const subfood = values?.topping.filter((f) => f.productID === item.productID);
        if (subfood?.length > 0) {
          return { ...item, topping: subfood };
        } else {
          return { ...item };
        }
      });
      const temp = [...selection];
      temp.push(...product);
      setSelection(temp);
    }

    // const tempTopping = values?.topping.filter((item) => item.counter >= 0);

    // const newSubTopping = subTopping.map((item) => {
    //   const foundItem = tempTopping.find((elem) => elem.toppingId === item.toppingId && elem.productID === item.productID);
    //   if (foundItem) {
    //     return { ...item, counter: item.counter + foundItem.counter };
    //     // return { ...item, counter: 0 };
    //   } else {
    //     return { ...item };
    //   }
    // });

    // setSubTopping([
    //   ...newSubTopping,
    //   ...tempTopping.filter((item) => !newSubTopping.some((elem) => elem.toppingId === item.toppingId && elem.productID === item.productID)),
    // ]);

    // let tempCounter = values?.subfoods.filter((item) => item.counter >= 0);

    // // tempCounter.forEach((elem) => {
    // //   const foundItem = selection.find((item) => item.productID === elem.productID);

    // //   if (foundItem) {
    // //     const temp = elem.counter;
    // //     foundItem.counter = temp;
    // //   } else {
    // //     setSelection((prev) => [...prev, { ...elem }]);
    // //   }
    // // });

    // let updatedSelection = [...selection]; // ایجاد یک کپی از selection برای به روزرسانی

    // tempCounter.forEach((elem) => {
    //   const foundItemIndex = updatedSelection.findIndex((item) => item.productID === elem.productID);

    //   if (foundItemIndex !== -1) {
    //     updatedSelection[foundItemIndex] = { ...updatedSelection[foundItemIndex], counter: updatedSelection[foundItemIndex].counter + elem.counter }; // به روزرسانی counter اگر موجود باشد
    //   } else {
    //     updatedSelection.push({ ...elem }); // اضافه کردن آیتم به selection اگر موجود نباشد
    //   }
    // });
    // updatedSelection = updatedSelection.filter((item) => item.counter > 0);
    // setSelection(updatedSelection); // به روزرسانی selection

    setIsOpen(false);
  };

  //show Counter select foods
  const handleShowCounter = (product) => {
    let counter = 0;
    if (product?.subFoodTypes?.length > 0) {
      product?.subFoodTypes.forEach((elem) => {
        let found = selection?.find((item) => item.productID === elem.productID);
        if (found) {
          counter = counter + found.counter;
        }
      });
      return counter;
    }
    let found = selection?.find((item) => item.productID === product.productID);
    if (found) {
      return found.counter;
    }
    return counter;
  };

  //check total selection

  const clearSubFood = (product) => {
    let changeFood = [],
      changeTopping = [];
    if (product?.subFoodTypes?.length > 0) {
      changeFood = selection.map((item) => {
        let index = product.subFoodTypes.findIndex((subIndex) => subIndex.productID === item.productID);
        if (index !== -1) {
          return { ...item, counter: 0 };
        } else {
          return { ...item };
        }
        // if (item.productID === product.productID) {
        //   return { ...item, counter: 0 };
        // } else {
        //   return { ...item };
        // }
      });
      changeTopping = subTopping.map((item) => {
        if (item.productID === product.productID) {
          return { ...item, counter: 0 };
        } else {
          return { ...item };
        }
      });
      changeFood = changeFood.filter((item) => item.counter > 0);
      setSelection(changeFood);
      setSubTopping(changeTopping);
    }
  };
  useEffect(() => {
    const handleCheckFinal = () => {
      if (selection.length > 0) {
        // temp = temp.map((item) => {
        //   let foundTopping = subTopping.filter((elem) => elem.productID === item.productID && elem.counter > 0);
        //   if (foundTopping?.length > 0) {
        //     return { ...item, topping: foundTopping };
        //   } else {
        //     return { ...item };
        //   }
        // });
        let temp = JSON.parse(JSON.stringify(selection.filter((item) => item.counter > 0)));
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
        setSelectionFinal(temp);
        let total = 0;
        temp.forEach((item) => {
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
      } else {
        setSelectionFinal([]);
        setTotalPrice(0);
      }
    };
    handleCheckFinal();
  }, [selection, isOpen]);

  const handleSubmit = () => {
    dispatch(
      _rootData({
        root: {
          ...formData,
          selection: selection,
          // topping: _topping,
          selectionFinal: selectionFinal,
          merchandID: merchandID,
        },
      }),
    );
    nav(_adr.Root + _adr.Prefactor);
  };

  const searchHandler = async (e) => {
    if (e.target.value?.length >= 4) {
      setIsLoading(true);
      let payload = {
        Keyword: e.target.value,
        IDs: [],
      };
      let response = await search(payload, formData.type);
      if (response) {
        setBeforeSearch(foods);
        setFoods(response);
        if (response && response?.length > 0) {
          setActiveCategories(response[0].categoryID);
        }
      }
      setIsLoading(false);
      // foods
    } else if (isEmpty(e.target.value)) {
      if (beforeSearch.length > 0) {
        setFoods(beforeSearch);
      }
    }
  };

  const handleCountCategories = (category) => {
    if (selection.length > 0) {
      const item = selection.filter((item) => item.category == category && item.counter > 0);
      if (item.length > 0) {
        return <div className={styles.prefix}>{item.length}</div>;
      } else {
        return "";
      }
    } else {
      return "";
    }
  };

  const handleGetMinPriceSubFood = (subFoodList) => {
    try {
      if (subFoodList?.length > 0) {
        const minPrice = subFoodList.reduce((min, product) => (product.showPrice < min ? product.showPrice : min), subFoodList[0].showPrice);
        return commaDigits(minPrice);
      } else {
        return 0;
      }
    } catch (error) {
      console.error(error);
      return 0;
    }
  };

  const handleShowCounterSubFood = (product) => {
    if (product?.subFoodTypes?.length > 0) {
      let counter = selection.map((item) => {
        let find = product.subFoodTypes.findIndex((subItem) => subItem.productID === item.productID);
        if (find !== -1) {
          return { ...item };
        }
      });
      return counter?.length;
    } else {
      return 0;
    }
  };
  //#endregion backend
  return (
    <>
      {contextHolder}
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.menu_holder}>
            <div className={styles.menu_wrapper}>
              <div className={styles.logo_guest} onClick={() => nav(_adr.Root + _adr.Main)}>
                {!!merchandID && <img src={`https://mysatrap.com/logo/${merchandID}`} alt="" />}
              </div>
              <div className={styles.logo_app}>
                <i className="icon-logo-satrap"></i>
              </div>
            </div>
          </div>
          {imgSlider.length > 0 && (
            <div className={styles.holder_slider}>
              <div className={styles.slider_wrapper}>
                <Carousel dots={{ className: styles.bullet }}>
                  {imgSlider.map((item, key) => (
                    <div key={key} className="holder-img">
                      <div className={styles.images} style={{ backgroundImage: `url(${item})` }}></div>
                    </div>
                  ))}
                </Carousel>
              </div>
            </div>
          )}
          <div className={styles.search_area}>
            <div className={styles.holder_input}>
              <Form.Item className="input-normal">
                <Input onChange={searchHandler} prefix={<i className="icon-magnifier"></i>} placeholder={t("menu.search")} />
              </Form.Item>
            </div>
          </div>
          <div className={styles.food_area}>
            <div className={styles.row_foods}>
              <div className={styles.category_area}>
                <div className={styles.list}>
                  {categories.map((item, key) => (
                    <div className={styles.parent_category}>
                      {handleCountCategories(item.id)}
                      <div
                        key={key}
                        data-id={item.id}
                        className={`${styles.item} ${item.id === parseInt(activeCategories) ? `${styles.active}` : ""}`}
                        onClick={(e) => {
                          setActiveCategories(e.currentTarget.dataset.id);
                          // handleLoadFoods(e.currentTarget.dataset.id);
                          // setPage(0);
                        }}
                      >
                        <div className={styles.item_category}>
                          <figure>
                            {item.imageUrl ? (
                              // <img src={"data:image/png;base64," + item.image} alt="" />
                              <img src={item.imageUrl} onError={onErrorImage} alt="" />
                            ) : (
                              <span>
                                <i className="icon-fork"></i>
                              </span>
                            )}
                            <figcaption>{item.title}</figcaption>
                          </figure>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.food_area}>
                <div className={styles.food_list}>
                  {foods.map((item, key) => (
                    <div key={key} className={styles.item}>
                      <div className={styles.holder_img}>
                        <img
                          className={`${item.isOutofStock ? `${styles.outoforder}` : ""}`}
                          src={item?.imageUrl.length > 0 ? item?.imageUrl : process.env.PUBLIC_URL + "/assets/images/placeholder.jpg"}
                          alt=""
                          onError={onErrorImage}
                        />
                        {item.isOutofStock && (
                          <div className={styles.holder_outoforder}>
                            <h2>تمام شد</h2>
                          </div>
                        )}
                      </div>
                      <div className={styles.holder_des}>
                        <div className={styles.action} disable>
                          <div className={`${styles.holder_icon} ${handleShowCounter(item) > 0 ? `${styles.active}` : ""}`}>
                            <i
                              className="icon-plus"
                              disable={true}
                              onClick={(e) => {
                                !item.isOutofStock && handleIncressAndDecress(item, true);
                              }}
                            ></i>
                            {/* <span>{selection.filter((slc) => slc.productID === item.productID)[0]?.counter}</span> */}
                            <span>{handleShowCounter(item)}</span>
                            <i
                              className={`icon-minus ${handleShowCounterSubFood(item) > 1 ? styles.disabled : ""}`}
                              onClick={() => {
                                !(handleShowCounterSubFood(item) > 1) && !item.isOutofStock && handleIncressAndDecress(item, false);
                              }}
                            ></i>
                          </div>
                        </div>
                        <div className={styles.desc_text}>
                          <div className={styles.holder_center_box}>
                            <h3>{item.productDS}</h3>
                            {!configApp?.c1?.KioskDescDisabled && <p>{item.productDesc}</p>}
                            <div className={styles.holder_price}>
                              <div className={styles.price_only}>
                                {/* <span>{commaDigits(item.showPrice)}</span> تومان */}
                                {item?.subFoodTypes?.length > 0 ? (
                                  <>
                                    شروع قیمت از <span>{handleGetMinPriceSubFood(item?.subFoodTypes)}</span>
                                  </>
                                ) : (
                                  <>
                                    <span>{commaDigits(item.showPrice)}</span> تومان
                                  </>
                                )}
                              </div>
                              {/* <div className={styles.price_item}>
                                    <span>{commaDigits(item.showPrice)}</span> تومان
                                  </div> */}
                              {item.showPrice - item.oldPrice !== 0 && (
                                <div className={styles.discount_item}>
                                  {/* <div className={styles.discount_percent}>20%</div> */}
                                  <div className={styles.discount_price}>{commaDigits(item.oldPrice)}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.pickup}>
          <div className={styles.hold_pickup}>
            {selectionFinal?.length > 0 && (
              <div className={styles.main_footer}>
                <Collapse
                  expandIconPosition="start"
                  collapsible="icon"
                  className="collapse-footer"
                  // expandIcon={({ isActive }) => (isActive ? <i className="icon-collapse-up"></i> : <i className="icon-collapse-down"></i>)}
                  expandIcon={({ isActive }) => <DoubleRightOutlined rotate={isActive ? 90 : -90} />}
                  size="large"
                  items={[
                    {
                      key: "1",
                      label: "",
                      children: (
                        <>
                          <div className="holder-pre-order-list">
                            {selectionFinal.map((item, key) => (
                              <div key={key} className="item">
                                <div className="row-item">
                                  <div className="holder-img">
                                    <img
                                      src={item.imageUrl?.length > 0 ? item.imageUrl : process.env.PUBLIC_URL + "/assets/images/placeholder.jpg"}
                                      alt=""
                                      width="100%"
                                      onError={onErrorImage}
                                    />
                                  </div>
                                  <div className="holder-title">
                                    <h3>
                                      {item?.productDSCat && <>{`${item?.productDSCat}  `}</>}
                                      {item.productDS}
                                    </h3>
                                    <div className="topping">
                                      {item?.topping?.map((tItem, tkey) => (
                                        <div key={tkey} className="topping-item">
                                          <span className="label">{tItem?.toppingDs}</span>
                                          <span className="value"> ({tItem.counter})</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="holder-price">
                                    <div className="row-price">
                                      {item.showPrice - item.oldPrice !== 0 && (
                                        <div className="before-discount">
                                          <span dir="ltr">{commaDigits(item.oldPrice)}</span> تومان
                                        </div>
                                      )}
                                      {/* <div className="after-discount">
                                      <span dir="ltr">3.000.000</span> تومان
                                    </div> */}

                                      <div className="price">
                                        <span dir="ltr">{commaDigits(item.showPrice)}</span> تومان
                                      </div>
                                    </div>
                                  </div>
                                  <div className="holder-action">
                                    <div className="row-action">
                                      <div className="holder-icon">
                                        <span
                                          onClick={() => {
                                            handleIncressAndDecress(item, true);
                                          }}
                                        >
                                          <i className="icon-plus"></i>
                                        </span>
                                      </div>
                                      <div className="holder-counter">
                                        <span>{item.counter}</span>
                                      </div>
                                      <div className="holder-icon">
                                        <span
                                          onClick={() => {
                                            handleIncressAndDecress(item, false);
                                          }}
                                        >
                                          <i className="icon-minus"></i>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ),
                    },
                  ]}
                ></Collapse>
                <div className={styles.holder_footer_menu}>
                  <div className={styles.row_footer}>
                    <div className={styles.holder_price}>
                      <div className={styles.label}>{t("menu.total_payments")}</div>
                      <div className={styles.value}>{commaDigits(totalPrice)}</div> {t("global.unit_currency")}
                    </div>
                    <div className={styles.holder_action}>
                      <Button
                        className={`btn-normal ${styles.btn_normal}`}
                        icon={
                          <Badge size="large" className={styles.mybadge} count={selectionFinal.length}>
                            <i className="icon-basket"></i>
                          </Badge>
                        }
                        onClick={handleSubmit}
                      >
                        {t("global.basket")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ModalFoods
        open={isOpen}
        isTopping={isTopping}
        product={productWithTopping}
        subfoods={subFoods}
        ptopping={subTopping}
        selection={selection}
        callback={handleBackModal}
      />
      <LoadingPage isOpen={isLoading} />
    </>
  );
};

export default MainMenu;
