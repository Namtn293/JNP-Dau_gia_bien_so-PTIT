import {
  CloseOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Popover } from "antd";
import React, { useRef, useState } from "react";

interface FilterPopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  content: React.ReactNode;
  disableSearch?: boolean;
  onSearch?: () => void;
  onReset?: () => void;
  placement?:
  | "top"
  | "left"
  | "right"
  | "bottom"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight";
  trigger?: "hover" | "focus" | "click";
  align?: object;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const getFocusableElements = (container: HTMLElement | Document) =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.offsetParent !== null,
  );

export const FilterPopover: React.FC<FilterPopoverProps> = ({
  children,
  open,
  onOpenChange,
  content,
  disableSearch,
  onSearch,
  onReset,
  placement = "bottomRight",
  trigger = "click",
  align,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const isControlled = open !== undefined;
  const popoverOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const handleClose = () => {
    handleOpenChange(false);
  };

  const handleSearch = () => {
    onSearch?.();
    handleClose();
  };

  const handleReset = () => {
    onReset?.();
  };

  const focusFirstContentElement = () => {
    const firstElement = contentRef.current
      ? getFocusableElements(contentRef.current)[0]
      : null;
    firstElement?.focus();
  };

  const getAdjacentFocusableElement = (direction: "next" | "previous") => {
    const trigger = triggerRef.current;
    if (!trigger) return null;

    const focusableElements = getFocusableElements(document).filter(
      (element) => !contentRef.current?.contains(element),
    );
    const triggerFocusable = getFocusableElements(trigger)[0] ?? trigger;
    const triggerIndex = focusableElements.indexOf(triggerFocusable);

    if (triggerIndex === -1) return null;
    return direction === "next"
      ? focusableElements[triggerIndex + 1] ?? null
      : focusableElements[triggerIndex - 1] ?? null;
  };

  const handleContentKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;

    const focusableElements = contentRef.current
      ? getFocusableElements(contentRef.current)
      : [];
    if (!focusableElements.length) return;

    const activeElement = document.activeElement as HTMLElement | null;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && activeElement === firstElement) {
      const previousElement = getAdjacentFocusableElement("previous");
      if (previousElement) {
        event.preventDefault();
        previousElement.focus();
      }
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      const nextElement = getAdjacentFocusableElement("next");
      event.preventDefault();
      handleClose();
      window.requestAnimationFrame(() => {
        nextElement?.focus();
      });
    }
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (!popoverOpen || event.key !== "Tab" || event.shiftKey) return;

    event.preventDefault();
    focusFirstContentElement();
  };

  const popoverContent = (
    <div ref={contentRef} onKeyDown={handleContentKeyDown}>
      {/* Content */}
      <div style={{ padding: 14 }}>{content}</div>

      {/* Footer Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          padding: 12,
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <Button icon={<ReloadOutlined />} onClick={handleReset}>
          Nhập lại
        </Button>
        <Button icon={<CloseOutlined />} onClick={handleClose}>
          Đóng
        </Button>
        <Button
          type="primary"
          style={{
            backgroundColor: "var(--primary)",
          }}
          disabled={disableSearch}
          icon={<SearchOutlined />}
          onClick={handleSearch}
        >
          Tìm
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      trigger={trigger}
      open={popoverOpen}
      onOpenChange={handleOpenChange}
      placement={placement}
      align={align}
    >
      <span ref={triggerRef} onKeyDown={handleTriggerKeyDown}>
        {children}
      </span>
    </Popover>
  );
};
