import { Button } from 'antd';
import React from 'react';
import { useDispatch } from 'react-redux';
import { setLanguage } from '@/store/reducers/UserPreferencesSlice';
import i18n from '../../i18n';
import { useTranslation } from 'react-i18next';
function LanguageSelector() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const changeLanguage = (lng: string) => {
    dispatch(setLanguage(lng));
    localStorage.setItem('lng', lng || 'ru');
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      {/* <Button
        onClick={() => changeLanguage('en')}
        className="w-1/5  text-start  border-none hover:bg-gray-200"
      >
        {t('EN')}
      </Button> */}
      <Button
        onClick={() => changeLanguage('ru')}
        className="w-1/5  text-start  border-none hover:bg-gray-200"
      >
        {t('RU')}
      </Button>
    </div>
  );
}

export default LanguageSelector;
