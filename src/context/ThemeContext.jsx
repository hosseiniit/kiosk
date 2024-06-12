import { ConfigProvider } from "antd";
import { createContext, useContext, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

const ThemeContext = createContext();
export const ThemeContextProvider = ({ children }) => {
  const [configTheme, setConfigTheme] = useState({
    bgColor: "#F9FAFB",
    textColor: "#13727D",
    bgButtonColor: "#13727D",
    textButtonColor: "#fff",
    isRTL: true,
    language: "fa",
    background: "#F9FAFB",
  });
  useEffect(() => {
    i18n.changeLanguage(configTheme.language);
  }, []);
  return (
    <ThemeContext.Provider value={configTheme}>
      <I18nextProvider i18n={i18n}>
        <ConfigProvider
          theme={{
            token: {
              fontFamily: configTheme.language === "fa" ? "IRANSansX" : "Roboto",
            },
            components: {},
          }}
          direction={configTheme.isRTL ? "rtl" : "ltr"}
          form={{ className: "input-normal" }}
        >
          {children}
        </ConfigProvider>
      </I18nextProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
export function useTheme() {
  return useContext(ThemeContext);
}
