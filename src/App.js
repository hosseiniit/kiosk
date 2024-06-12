import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from "react-router-dom";
import { Provider } from "react-redux";
import { persistor, store } from "./reducer/store";
import { PersistGate } from "redux-persist/integration/react";
import Login from "./components/security/login/login";

import LayoutLogin from "./components/security/layout";
import LoginWithOTP from "./components/security/login_with_otp/login_with_otp";
import { useTheme } from "./context/ThemeContext";
import { _adr } from "./address";
import Main from "./components/main/main";
import "./assets/css/app.scss";
import MainMenu from "./components/menu/menu";
import OTP from "./components/security/otp/otp";
import { AnimatePresence } from "framer-motion";
import MerchandList from "./components/merchand/merchand";
import Prefactor from "./components/prefactor/prefactor";
import Final from "./components/final/final";
import { getLocalStorage } from "./tools/service";
export const ScrollToTop = () => {
  // Extracts pathname property(key) from an object
  const { pathname } = useLocation();

  // Automatically scrolls to top whenever pathname changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
};
function App() {
  const { isRTL, background, textColor, bgButtonColor } = useTheme();
  useEffect(() => {
    const initialTheme = async () => {
      try {
        let colors = getLocalStorage("colors");
        if (colors) {
          colors = JSON.parse(colors);
          document.documentElement.style.setProperty("--min-color", colors?.mainColor);
          document.documentElement.style.setProperty("--background-color", colors?.backgrounColor);
          document.documentElement.style.setProperty("--complementary-color", colors?.complementaryColor);
        }
      } catch (error) {
        console.error(error);
      }
    };
    initialTheme();
  }, []);
  return (
    <div className="App" data-rtl={isRTL}>
      <Router>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AnimatePresence>
              <Routes>
                <Route
                  element={
                    <LayoutLogin>
                      <Outlet />
                    </LayoutLogin>
                  }
                >
                  <Route path="/" element={<Login />} />
                  <Route path={_adr.Login.Login} element={<Login />} />
                  <Route path={_adr.Login.LoginWithOTP} element={<LoginWithOTP />} />
                  <Route path={_adr.Login.OTP} element={<OTP />} />
                </Route>
                <Route path={_adr.Merchand} element={<MerchandList />} />
                <Route path={_adr.Main} element={<Main />} />
                <Route path={_adr.Menu} element={<MainMenu />} />
                <Route path={_adr.Prefactor} element={<Prefactor />} />
                <Route path={_adr.Final} element={<Final />} />
              </Routes>
            </AnimatePresence>
          </PersistGate>
        </Provider>
      </Router>
      <ToastContainer />
    </div>
  );
}

export default App;
