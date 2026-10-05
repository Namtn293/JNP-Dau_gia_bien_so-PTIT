export type THEME_COLOR = typeof GREEN_COLOR_THEME;

export const GREEN_COLOR_THEME = {
  PRIMARY: () =>  '#7a1f36',
  COLOR_TITLE_HEADER: 'white',
  COLOR_ICON: 'white',
  BORDER_COLOR: 'rgb(153, 153, 153)',
};

export const STEEL_BLUE_COLOR_THEME = {
  PRIMARY: () => '#428BCA',
  COLOR_TITLE_HEADER: 'white',
  COLOR_ICON: 'white',
  BORDER_COLOR: 'rgb(153, 153, 153)',
};

export const THEME_NAMES = {
  GREEN: 'GREEN',
  STEEL_BLUE: 'STEEL_BLUE',
};

export const THEMES = {
  [THEME_NAMES.GREEN]: GREEN_COLOR_THEME,
  [THEME_NAMES.STEEL_BLUE]: STEEL_BLUE_COLOR_THEME,
};
