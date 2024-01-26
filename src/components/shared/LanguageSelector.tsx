import { Button } from "antd";
import React from "react";
import { useDispatch } from "react-redux";
import { setLanguage } from "@/store/reducers/UserPreferencesSlice";
import i18n from "../../i18n";
function LanguageSelector() {
  const dispatch = useDispatch();

  const changeLanguage = (lng: string) => {
    dispatch(setLanguage(lng));
    localStorage.setItem("lng", lng);
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <Button
        onClick={() => changeLanguage("en")}
        className="w-1/5  text-start  border-none hover:bg-gray-200"
      >
        en
      </Button>
      <Button
        onClick={() => changeLanguage("ru")}
        className="w-1/5  text-start  border-none hover:bg-gray-200"
      >
        ru
      </Button>
    </div>
  );
}

export default LanguageSelector;
