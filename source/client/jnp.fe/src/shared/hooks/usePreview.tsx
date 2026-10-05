import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Alert, Spin, Typography } from "antd";
import DOMPurify from "dompurify";
import { useCallback, useState } from "react";
import * as XLSX from "xlsx";
import BaseModal from "~/shared/components/modals";
import "~/shared/styles/usePreview.scss";

const DOC_EXTS = ["doc", "docx"];
const PDF_EXTS = ["pdf"];
const SHEET_EXTS = ["xls", "xlsx"];
const IMAGE_EXTS = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"];
const SUPPORTED_EXTS = [...DOC_EXTS, ...PDF_EXTS, ...SHEET_EXTS, ...IMAGE_EXTS];

function getExtension(url: string): string | null {
  const cleanPath = url.split("?")[0].split("#")[0];
  const lastDot = cleanPath.lastIndexOf(".");
  if (lastDot === -1) return null;
  const ext = cleanPath.slice(lastDot + 1);
  if (!ext || ext.includes("/") || ext.includes("\\")) return null;
  return ext.toLowerCase();
}

function getFullUrl(url: string): string {
  if (url.includes("http")) return url;
  return `${import.meta.env.VITE_RESOURCE_URL}${url}`;
}

function getFileName(url: string): string {
  const parts = url.split("?")[0].split("/");
  return parts[parts.length - 1];
}

type PreviewState = {
  open: boolean;
  url: string;
  fileName: string;
  ext: string;
  sheetHtml: string | null;
  loading: boolean;
  error: string | null;
};

const initialState: PreviewState = {
  open: false,
  url: "",
  fileName: "",
  ext: "",
  sheetHtml: null,
  loading: false,
  error: null,
};

export const usePreview = () => {
  const [state, setState] = useState<PreviewState>(initialState);

  const openPreview = useCallback(async (url: string) => {
    const fullUrl = getFullUrl(url);
    const ext = getExtension(fullUrl);
    const fileName = getFileName(fullUrl);

    if (!ext || !SUPPORTED_EXTS.includes(ext)) {
      console.warn(`usePreview: định dạng ".${ext}" không được hỗ trợ`);
      return;
    }

    // Mở modal, nếu là file sheet thì bắt đầu loading
    setState({
      open: true,
      url: fullUrl,
      fileName,
      ext,
      sheetHtml: null,
      loading: SHEET_EXTS.includes(ext),
      error: null,
    });

    if (SHEET_EXTS.includes(ext)) {
      try {
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        // Chuyển tất cả sheets thành HTML và nối lại
        const html = workbook.SheetNames.map((name) => {
          const sheet = workbook.Sheets[name];
          const sheetHtml = XLSX.utils.sheet_to_html(sheet, {
            id: `sheet-${name}`,
          });
          return `<h4 style="padding:8px 4px;background:#f5f5f5;margin:0 0 4px 0;">${name}</h4>${sheetHtml}`;
        }).join('<hr style="margin:16px 0"/>');

        setState((prev) => ({ ...prev, sheetHtml: html, loading: false }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            "Không thể tải file. Vui lòng kiểm tra đường dẫn hoặc kết nối mạng.",
        }));
      }
    }
  }, []);

  const closePreview = useCallback(() => {
    setState(initialState);
  }, []);

  const PreviewModal = () => (
    <div className="preview-modal">
      <BaseModal
        open={state.open}
        onCancel={closePreview}
        footer={null}
        title={
          <Typography.Text
            ellipsis
            style={{
              maxWidth: "60vw",
              display: "inline-block",
              color: "#fff ",
              margin: "6px 16px",
            }}
          >
            {state.fileName}
          </Typography.Text>
        }
        width="85vw"
        height="95vh"
        style={{ top: 16 }}
        styles={{
          content: {
            height: "calc(100vh - 32px)",
            padding: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
          body: { padding: 0, minHeight: 200, height: "100%" },
        }}
        destroyOnHidden
        className="preview-modal"
      >
        {/* Trạng thái loading (chỉ dành cho xls/xlsx khi fetch) */}
        {state.loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 300,
            }}
          >
            <Spin size="large" tip="Đang tải file..." />
          </div>
        )}

        {/* Trạng thái lỗi */}
        {state.error && (
          <div style={{ padding: 24 }}>
            <Alert type="error" message={state.error} showIcon />
          </div>
        )}

        {/* Viewer cho doc / docx */}
        {!state.loading && !state.error && DOC_EXTS.includes(state.ext) && (
          <DocViewer
            documents={[{ uri: state.url, fileName: state.fileName }]}
            pluginRenderers={DocViewerRenderers}
            style={{ height: "95vh", borderRadius: 0 }}
            config={{
              header: { disableHeader: true, retainURLParams: true },
            }}
          />
        )}

        {/* Viewer cho pdf — dùng iframe để render chuẩn như file gốc */}
        {!state.loading && !state.error && PDF_EXTS.includes(state.ext) && (
          // <iframe
          //   src={state.url}
          //   style={{ width: '100%', height: '95vh', border: 'none', display: 'block' }}
          //   title={state.fileName}
          // />
          // <iframe
          <iframe
            src={`https://docs.google.com/gview?url=${state.url}&embedded=true`}
            width="100%"
            height="100%"
          />
        )}

        {/* Viewer cho xls / xlsx */}
        {!state.loading &&
          !state.error &&
          SHEET_EXTS.includes(state.ext) &&
          state.sheetHtml && (
            <div
              style={{
                overflow: "auto",
                maxHeight: "95vh",
                padding: "0 12px 12px",
              }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(state.sheetHtml),
              }}
            />
          )}

        {/* Viewer cho image */}
        {!state.loading && !state.error && IMAGE_EXTS.includes(state.ext) && (
          <div className="preview-modal__image-wrapper">
            <img
              src={state.url}
              alt={state.fileName}
              className="preview-modal__image"
            />
          </div>
        )}
      </BaseModal>
    </div>
  );

  return { openPreview, closePreview, PreviewModal };
};

export default usePreview;
