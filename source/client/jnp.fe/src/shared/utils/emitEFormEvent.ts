export const emitEFormEvent:any = (eventName: string, data?: any) => {
  window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
};
