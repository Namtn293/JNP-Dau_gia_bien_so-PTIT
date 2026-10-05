import styled from "styled-components";

export const StyledTextAreaWrapper = styled.div`
  position: relative;

  .ant-input-affix-wrapper:has(textarea),
  .ant-input-textarea-show-count,
  .ant-input-show-count {
    height: auto !important;
    margin-bottom: 24px !important;
    overflow: visible !important;
  }

  & + .ant-form-item-explain,
  & ~ .ant-form-item-explain-connected .ant-form-item-explain-error {
    margin-top: -24px !important;
    padding-right: 90px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
    z-index: 1;
  }
`;