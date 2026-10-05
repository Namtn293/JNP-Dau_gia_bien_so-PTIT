import type { HTMLAttributes, ReactNode } from 'react';

// https://www.figma.com/file/mlw35eoRTAtZVm880DGRmJ/Vidoc?type=design&node-id=1-783&mode=design&t=zjoVWifddIzOgwrB-0

export interface ITextProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
  fontWeight?: string | number;
}

const Text = ({ children, style, color, fontWeight, ...props }: ITextProps) => {
  return (
    <p style={{ fontSize: '1.6rem', color, fontWeight, ...style }} {...props}>
      {children}
    </p>
  );
};

Text.Heading1 = ({ children, style, color, fontWeight, ...props }: ITextProps) => {
  return (
    <p
      style={{
        fontSize: '3.7rem',
        fontWeight: fontWeight || 500,
        color,
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  );
};

Text.Heading2 = ({ children, style, color, fontWeight, ...props }: ITextProps) => {
  return (
    <p
      style={{
        fontSize: '2.9rem',
        fontWeight: fontWeight || 500,
        color,
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  );
};

Text.Heading3 = ({ children, style, color, fontWeight, ...props }: ITextProps) => {
  return (
    <p
      style={{
        fontSize: '2.3rem',
        fontWeight: fontWeight || 500,
        color,
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  );
};

Text.Heading4 = ({ children, style, color, fontWeight, ...props }: ITextProps) => {
  return (
    <p
      style={{
        fontSize: '1.8rem',
        fontWeight: fontWeight || 500,
        color,
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  );
};

Text.Subtitle = ({ children, style, color, fontWeight, ...props }: ITextProps) => {
  return (
    <p
      style={{
        fontSize: '1.6rem',
        fontWeight: fontWeight || 500,
        color,
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  );
};

Text.Body2 = ({ children, style, color, fontWeight, ...props }: ITextProps) => {
  return (
    <p style={{ fontSize: '1.4rem', color, fontWeight, ...style }} {...props}>
      {children}
    </p>
  );
};

Text.Info = ({ children, style, color, fontWeight, ...props }: ITextProps) => {
  return (
    <p style={{ fontSize: '1.2rem', color, fontWeight, ...style }} {...props}>
      {children}
    </p>
  );
};

Text.Caption2 = ({ children, style, color, fontWeight, ...props }: ITextProps) => {
  return (
    <p style={{ fontSize: '1.2rem', color, fontWeight, ...style }} {...props}>
      {children}
    </p>
  );
};

export default Text;
