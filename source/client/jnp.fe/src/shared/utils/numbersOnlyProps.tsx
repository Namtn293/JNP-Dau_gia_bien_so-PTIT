// utils/inputNumberUtils.ts

export const numbersOnlyProps = (options?: { min?: number; max?: number }) => ({
  precision: 0,
  ...(options?.min !== undefined && { min: options.min }),
  ...(options?.max !== undefined && { max: options.max }),
  parser: (value?: string) => value?.replace(/[^0-9]/g, '') as any,
  formatter: (value?: number | string) => value ? `${value}`.replace(/[^0-9]/g, '') : '',
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  },
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (!/^\d+$/.test(text)) {
      e.preventDefault();
    }
  },
});