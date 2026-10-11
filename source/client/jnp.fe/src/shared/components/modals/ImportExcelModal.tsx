import React, { useState, useEffect } from "react";
import { Button, Upload, Typography, Row, Space } from "antd";
import BaseModal from "./index";
import type { IBaseModalProps } from "./index";
import type { UploadProps } from "antd";

const { Text } = Typography;

export interface ImportExcelModalProps extends Omit<IBaseModalProps, "onOk" | "onCancel" | "title"> {
  onImport: (file: File) => void;
  onClose: () => void;
  sampleFileUrl?: string;
  onDownloadSample?: () => void;
  loading?: boolean;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  onImport,
  onClose,
  sampleFileUrl,
  onDownloadSample,
  loading,
  ...props
}) => {
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (props.open) {
      setFile(null);
    }
  }, [props.open]);

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      setFile(file as any);
      return false; // Prevent automatic upload
    },
    onRemove: () => {
      setFile(null);
    },
    fileList: file ? [file as any] : [],
    maxCount: 1,
    accept: ".xls,.xlsx",
    showUploadList: false
  };

  const handleImport = () => {
    if (file) {
      onImport(file);
    }
  };

  return (
    <BaseModal
      {...props}
      title="NHẬP DỮ LIỆU TỪ FILE EXCEL"
      onCancel={onClose}
      width={700}
      styles={{
        header: {
          paddingTop: '15px',
        },
        content: {
          borderRadius: '10px',
          overflow: 'hidden',
        },
        footer: {
          paddingBottom: '20px',
        }
      }}
      footer={[
        <Button
          key="import"
          disabled={!file}
          loading={loading}
          onClick={handleImport}
          type="primary"
          style={{
            backgroundColor: file ? "#7a1f36" : undefined,
            borderColor: file ? "#7a1f36" : undefined,
            color: file ? "#fff" : undefined,
            minWidth: '100px'
          }}
        >
          Import
        </Button>,
        <Button key="close" onClick={onClose} style={{ minWidth: '100px' }}>
          Đóng
        </Button>
      ]}
    >
      <div style={{ width: '100%', padding: "10px 10px" }}>
        <Row align="middle" style={{ marginBottom: 16 }}>
          <Text style={{ marginRight: 24, fontSize: '14px' }}>Mẫu file nhận tệp dữ liệu</Text>
          {onDownloadSample ? (
            <a onClick={onDownloadSample} style={{ color: '#7a1f36', textDecoration: 'underline' }}>Tải file mẫu</a>
          ) : sampleFileUrl ? (
            <a href={sampleFileUrl} download style={{ color: '#7a1f36', textDecoration: 'underline' }}>Tải file mẫu</a>
          ) : null}
        </Row>

        <div style={{ 
          border: '1px solid #d9d9d9', 
          padding: '12px 16px', 
          display: 'flex', 
          alignItems: 'center', 
          width: '100%',
          marginBottom: 24,
          borderRadius: 4
        }}>
          <Space size="middle">
            <Upload {...uploadProps}>
              <Button type="primary" style={{ background: '#7a1f36', borderColor: '#7a1f36', borderRadius: '4px' }}>Chọn tệp</Button>
            </Upload>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              {file ? file.name : 'Không có tệp nào được chọn'}
            </Text>
          </Space>
        </div>
      </div>
    </BaseModal>
  );
};
