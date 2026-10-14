import "antd/dist/reset.css";
import "moment/locale/vi";
// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

import { StyleProvider, px2remTransformer } from "@ant-design/cssinjs";
import antdDefaultConfig from "@configs/antDesign";
import queryClient from "@configs/reactQuery";
import { App as AntdApp, ConfigProvider as AntdConfigProvider } from "antd";
import { QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { store } from "@packages/redux/store";

import ErrorBoundary from "@/shared/components/error-boundary/ErrorBoundary.tsx";
import {
  OfflineNotification,
  OnlineNotification,
} from "@/shared/components/online-offline";
import "@configs/i18n"; // kích hoạt i18n trước khi render app
import { Detector } from "react-detect-offline";
import { ReactQueryDevtools } from "react-query/devtools";
import "./assets/scss/index.scss";
const PX_2_REM = px2remTransformer({ rootValue: 10 });
const SHOW_DETECTOR_INTERNET = false;

const CHUNK_ERROR_STORAGE_KEY = "chunkErrorPath";

const isDynamicImportError = (error: unknown): error is Error => {
  if (!(error instanceof Error)) return false;

  return (
    error.name === "ChunkLoadError" ||
    error.message.includes("Failed to fetch dynamically imported module") ||
    error.message.includes("Importing a module script failed") ||
    error.message.includes("dynamically imported module")
  );
};

const reloadForChunkError = () => {
  const currentPath = window.location.pathname + window.location.search;
  const lastChunkErrorPath = window.sessionStorage.getItem(
    CHUNK_ERROR_STORAGE_KEY,
  );

  if (lastChunkErrorPath === currentPath) return;

  window.sessionStorage.setItem(CHUNK_ERROR_STORAGE_KEY, currentPath);
  window.location.reload();
};

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  reloadForChunkError();
});

window.addEventListener("unhandledrejection", (event) => {
  if (!isDynamicImportError(event.reason)) return;

  event.preventDefault();
  reloadForChunkError();
});

window.sessionStorage.removeItem(CHUNK_ERROR_STORAGE_KEY);

createRoot(document.getElementById("root")!).render(
  <>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AntdConfigProvider {...antdDefaultConfig}>
          <AntdApp
            notification={{ placement: "topRight", stack: false, maxCount: 9 }}
          >
            <StyleProvider transformers={[PX_2_REM]}>
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </StyleProvider>
          </AntdApp>
        </AntdConfigProvider>
        <ReactQueryDevtools initialIsOpen={false} position="bottom-left" />
      </QueryClientProvider>
    </Provider>
    {SHOW_DETECTOR_INTERNET && (
      <Detector
        polling={false}
        render={({ online }) => {
          return online ? (
            <OnlineNotification online={online} />
          ) : (
            <OfflineNotification />
          );
        }}
      />
    )}
  </>,
);
