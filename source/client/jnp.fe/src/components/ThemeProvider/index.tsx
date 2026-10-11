import { selectActiveSchema } from '@packages/redux/slices';
// Import the hook directly from ./hooks (not the @packages/redux barrel) so this
// component does not eagerly pull in store.ts, which closes a circular import
// (store -> FormSlice -> ... -> ThemeProvider -> store) and triggers a
// "Cannot access 'formReducer' before initialization" TDZ.
import { useAppSelector } from '@packages/redux/hooks';
import { ConfigProvider } from 'antd';
import _get from 'lodash/get';
import { THEME_NAMES, THEMES } from '~/constants/themeColor';

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
