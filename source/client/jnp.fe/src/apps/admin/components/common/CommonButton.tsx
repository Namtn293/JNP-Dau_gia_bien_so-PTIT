import React from "react";
import { Button as AntdButton } from "antd";
import type { ButtonProps as AntdButtonProps } from "antd";

export interface CommonButtonProps extends Omit<AntdButtonProps, "size" | "variant"> {
    size?: "small" | "middle" | "large" | number | string;
    variant?: "primary" | "secondary" | "outline" | "text";
}

export const CommonButton = ({
    size = "large",
    variant = "primary",
    style,
    children,
    ...props
}: CommonButtonProps) => {
    // Determine dimensions and font size based on size
    let height = "44px";
    let padding = "10px 20px";
    let fontSize = "14px";
    let borderRadius = "10px";
    let gap = "10px";

    if (size === "small") {
        height = "32px";
        padding = "6px 12px";
        fontSize = "12px";
        borderRadius = "6px";
        gap = "6px";
    } else if (size === "middle") {
        height = "38px";
        padding = "8px 16px";
        fontSize = "13px";
        borderRadius = "8px";
        gap = "8px";
    } else if (size === "large") {
        height = "44px";
        padding = "10px 20px";
        fontSize = "14px";
        borderRadius = "10px";
        gap = "10px";
    } else if (size !== undefined) {
        // Custom size in pixels (number or custom string like '40px')
        const heightVal = typeof size === "number" ? size : parseInt(String(size), 10);
        height = typeof size === "number" ? `${size}px` : String(size);

        if (!isNaN(heightVal)) {
            if (heightVal < 36) {
                padding = "6px 12px";
                fontSize = "12px";
                borderRadius = "6px";
                gap = "6px";
            } else if (heightVal < 42) {
                padding = "8px 16px";
                fontSize = "13px";
                borderRadius = "8px";
                gap = "8px";
            } else {
                padding = "10px 20px";
                fontSize = "14px";
                borderRadius = "10px";
                gap = "10px";
            }
        }
    }

    // Determine colors based on variant
    let backgroundColor = "transparent";
    let borderColor = "#81001D";
    let color = "#81001D";

    if (variant === "primary") {
        backgroundColor = "#81001D";
        borderColor = "#81001D";
        color = "#ffffff";
    } else if (variant === "outline") {
        backgroundColor = "#ffffff";
        borderColor = "#DEC0BD";
        color = "#81001D";
    } else if (variant === "text") {
        backgroundColor = "transparent";
        borderColor = "transparent";
        color = "#81001D";
    }

    const baseStyle: React.CSSProperties = {
        height,
        padding,
        fontSize,
        borderRadius,
        gap,
        backgroundColor,
        borderColor,
        color,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "none",
        ...style,
    };

    return (
        <AntdButton
            style={baseStyle}
            {...props}
        >
            {children}
        </AntdButton>
    );
};

export default CommonButton;
