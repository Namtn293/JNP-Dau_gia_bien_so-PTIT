import { Tooltip } from "antd";

interface TooltipLongTextProps {
  text: string;
  maxLength?: number;
}

export const TooltipLongText: React.FC<TooltipLongTextProps> = ({
  text,
  maxLength = 22,
}) => {
  const isLong = text.length > maxLength;

  const label = <span className="menu-label">{text}</span>;

  return isLong ? (
    <Tooltip title={text} placement="right">
      {label}
    </Tooltip>
  ) : (
    label
  );
};

export default TooltipLongText;
