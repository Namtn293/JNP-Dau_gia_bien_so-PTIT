import type { FormInstance } from "antd";

export function focusFirstError(form: FormInstance, errorInfo: any) {
  const first = errorInfo?.errorFields?.[0];
  if (!first) return;

  const namePath = first.name;

  form.scrollToField(namePath, { behavior: "smooth", block: "center" });

  setTimeout(() => {
    const inst: any = (form as any).getFieldInstance?.(namePath);
    inst?.focus?.();
  }, 50);
}
