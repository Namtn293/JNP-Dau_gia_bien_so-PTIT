import React from "react";

export const createErrorMessageProxy = (rawMessages: Record<string, string>) => {
    return new Proxy(rawMessages as any, {
        get(target, prop) {
            if (typeof prop === "string") {
                if (prop.includes("|")) {
                    const parts = prop.split("|");

                    // Map từng mã lỗi thành message tưng ứng trong từ điển, nếu không có thì giữ nguyên chữ đó
                    const messages = parts.map(part => {
                        const code = part.trim();
                        return target[code] !== undefined ? target[code] : code;
                    });

                    // Ép kiểu ReactNode về string để lách luật Type do file useNotification bắt buộc string,
                    // nhưng logic Ant Design thì vẫn nhận và render mượt mà các component React <p>/<div> để có thể xuống dòng chuẩn hiển thị.
                    return React.createElement(
                        "div",
                        null,
                        messages.map((m: string, idx: number) => React.createElement("div", { key: idx, style: { marginBottom: "4px" } }, `- ${m}`)),
                        React.createElement("div", { style: { marginTop: '8px', fontWeight: 'bold' } }, "Vui lòng chuyển sang tab Toàn văn để kiểm tra và chỉnh sửa lại!")
                    ) as any as string;
                }
                return target[prop];
            }
            return Reflect.get(target, prop);
        }
    });
};
