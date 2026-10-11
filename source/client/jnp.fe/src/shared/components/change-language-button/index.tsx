import useI18n from "@/shared/hooks/useI18n";
import { LOCAL_STORAGE_KEYS } from "@constants/storageKeys";
import { lcStorage } from "@utils/storage";
import { Select } from "antd";
import { WrappButton } from "./styled";

export const ChangeLanguageButton = () => {
  const { changeLang, lang } = useI18n();
  const handleLanguageChange = async (value: string) => {
    await changeLang(value as "vi" | "en" | "cn" | "jp" | "kr");
    lcStorage.set(LOCAL_STORAGE_KEYS.language, value);
  };
  return (
    <WrappButton>
      <Select
        value={lang}
        style={{ width: 62, height: 30 }}
        onChange={handleLanguageChange}
        options={[
          {
            value: "vi",
            label: (
              <img
                src="https://cdn.parcellab.com/img/flags/vn.png"
                alt="language-switching icon"
              />
            ),
          },
          {
            value: "en",
            label: (
              <img
                src="https://cdn.parcellab.com/img/flags/gb.png"
                alt="language-switching icon"
              />
            ),
          },
          {
            value: "cn",
            label: (
              <img
                src="https://cdn.parcellab.com/img/flags/cn.png"
                alt="language-switching icon"
              />
            ),
          },
          {
            value: "jp",
            label: (
              <img
                src="https://cdn.parcellab.com/img/flags/jp.png"
                alt="language-switching icon"
              />
            ),
          },
          {
            value: "kr",
            label: (
              <img
                src="https://cdn.parcellab.com/img/flags/kr.png"
                alt="language-switching icon"
              />
            ),
          },
        ]}
      />
    </WrappButton>
  );
};
export default ChangeLanguageButton;
