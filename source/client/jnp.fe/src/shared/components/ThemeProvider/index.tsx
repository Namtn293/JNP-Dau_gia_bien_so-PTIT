import { ConfigProvider } from 'antd';
import _get from 'lodash/get';
import { THEME_NAMES, THEMES } from '~/constants/themeColor';
import { useAppSelector } from '@packages/redux/hooks';
import { selectActiveSchema } from '@packages/redux/slices';

type TThemeProviderProps = {
  children: any,
  currentTheme?: string
};

const ThemeProvider = ({ children, currentTheme = THEME_NAMES.GREEN }: TThemeProviderProps) => {
  const activeSchema = useAppSelector(selectActiveSchema);

  const themeObject = _get(THEMES, activeSchema?.currentTheme || currentTheme);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: themeObject.PRIMARY(),
        },
        components: {
          Table: {
            headerBg: themeObject.PRIMARY(),
            headerBorderRadius: 0,
            headerColor: themeObject.COLOR_TITLE_HEADER,
            borderColor: themeObject.BORDER_COLOR,
            cellPaddingBlock: 5,
            cellPaddingInline: 5,
          },
          Form: {
            itemMarginBottom: 16,
          },
          Tabs: {
            colorText: themeObject.PRIMARY(),
            itemActiveColor: themeObject.PRIMARY(),
            inkBarColor: themeObject.PRIMARY(),
            itemColor: themeObject.PRIMARY(),
            itemSelectedColor: themeObject.PRIMARY(),
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default ThemeProvider;
