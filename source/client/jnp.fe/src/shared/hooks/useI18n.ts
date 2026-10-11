import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { lcStorage } from '@utils/storage';
import { LOCAL_STORAGE_KEYS } from '@constants/storageKeys';

type UseI18nOptions = {
  ns?: string;
  prefix?: string;
};

export function useI18n(options?: UseI18nOptions) {
  const { ns, prefix } = options || {};
  const { t, i18n } = useTranslation(ns);
  const lang = lcStorage.get(LOCAL_STORAGE_KEYS.language);

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang])

  const translate = (
    key: string,
    params?: Record<string, any>
  ) => {
    const finalKey = prefix ? `${prefix}.${key}` : key;
    return t(finalKey, params);
  };

  return {
    t: translate,
    i18n,
    lang: i18n.language,
    changeLang: i18n.changeLanguage,
  };
}

export default useI18n;