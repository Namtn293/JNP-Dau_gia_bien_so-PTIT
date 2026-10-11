import { notification as antdNotification, App } from "antd";
import React from "react";
import IconToastSuccess from "@assets/icons/IconToastSuccess";
import IconToastError from "@assets/icons/IconToastError";

// Static reference to hold contextual notification instance
let notificationInstance: any = null;

// Component to register the static instance from Antd App context
export const NotificationStaticHolder: React.FC = () => {
    const { notification } = App.useApp();
    notificationInstance = notification;
    return null;
};

// Styled container for circular icon
const IconWrapper = ({ bgColor, children }: { bgColor: string; children: React.ReactNode }) => (
    <div style={{
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        backgroundColor: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
    }}>
        {children}
    </div>
);

const getNotificationApi = () => {
    return notificationInstance || antdNotification;
};

export const CommonNotification = {
    success: (message: string, description?: string) => {
        getNotificationApi().success({
            message: <span style={{ fontWeight: 700, color: "#137333", fontSize: "15px" }}>{message}</span>,
            description: description ? <span style={{ color: "#137333", fontSize: "14px", fontWeight: 500 }}>{description}</span> : null,
            icon: (
                <IconWrapper bgColor="#0fa253">
                    <IconToastSuccess />
                </IconWrapper>
            ),
            style: {
                borderRadius: "8px",
                background: "#f2faf6",
                border: "1px solid #d1e7dd",
                boxShadow: "0 4px 12px rgba(15, 162, 83, 0.05)",
                padding: "16px 20px",
                alignItems: "center"
            },
            placement: "topRight",
            duration: 3,
        });
    },
    error: (message: string, description?: string) => {
        getNotificationApi().error({
            message: <span style={{ fontWeight: 700, color: "#a81c1c", fontSize: "15px" }}>{message}</span>,
            description: description ? <span style={{ color: "#a81c1c", fontSize: "14px", fontWeight: 500 }}>{description}</span> : null,
            icon: (
                <IconWrapper bgColor="#d93025">
                    <IconToastError />
                </IconWrapper>
            ),
            style: {
                borderRadius: "8px",
                background: "#fff5f5",
                border: "1px solid #f8d7da",
                boxShadow: "0 4px 12px rgba(217, 48, 37, 0.05)",
                padding: "16px 20px",
                alignItems: "center"
            },
            placement: "topRight",
            duration: 4,
        });
    },
    info: (message: string, description?: string) => {
        getNotificationApi().info({
            message: <span style={{ fontWeight: 700, color: "#1c3d5a", fontSize: "15px" }}>{message}</span>,
            description: description ? <span style={{ color: "#1c3d5a", fontSize: "14px" }}>{description}</span> : null,
            style: {
                borderRadius: "8px",
                background: "#f0f4f8",
                border: "1px solid #d9e2ec",
                padding: "16px 20px",
                alignItems: "center"
            },
            placement: "topRight",
            duration: 3,
        });
    },
    warning: (message: string, description?: string) => {
        getNotificationApi().warning({
            message: <span style={{ fontWeight: 700, color: "#7b4b00", fontSize: "15px" }}>{message}</span>,
            description: description ? <span style={{ color: "#7b4b00", fontSize: "14px" }}>{description}</span> : null,
            style: {
                borderRadius: "8px",
                background: "#fffbeb",
                border: "1px solid #fef3c7",
                padding: "16px 20px",
                alignItems: "center"
            },
            placement: "topRight",
            duration: 3,
        });
    },
};

export default CommonNotification;
