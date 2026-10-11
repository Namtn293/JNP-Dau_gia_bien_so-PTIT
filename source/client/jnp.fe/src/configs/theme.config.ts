import { FIELD_NAME } from '@packages/constants/fields';

export const THEME_CONFIG = {
  [FIELD_NAME.TEXT_VIEW]: {
    style: {
      color: '',
      fontWeight: 'bold',
      typeTransform: 'uppercase',
      borderColor: '#D9D9D9',
      borderWidth: 1,
      isPaddingBottom: 0,
      paddingBlock: 1,
      colorAdditionalContent: 'red',
    },
  },
  [FIELD_NAME.FORM_STEP]: {
    label: {
      labelStep1: 'Thông tin chung',
      labelStep2: 'Thông tin chi tiết',
      labelStep3: 'Xác nhận đăng ký',
    },
    style: {
      stepBtnColor: '#7a1f36',
      height: 18,
      stepProgressBarColor: '#7a1f36',
      colorAfter: '#DFBA49',
    },
  },
};
