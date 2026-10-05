import React from 'react';

interface RequiredLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  required?: boolean;
}

export const RequiredLabel: React.FC<RequiredLabelProps> = ({
  children,
  required = true,
  style,
  ...rest
}) => (
  <span style={style} {...rest}>
    {children}
    {required && <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>*</span>}
  </span>
);

export default RequiredLabel;