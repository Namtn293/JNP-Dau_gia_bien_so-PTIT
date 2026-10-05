import React from "react";
import ModalForm, { type IFormItem } from "@apps/admin/components/ModalForm";
import type { AuctionItem } from "../services/type";
import { formatMoney } from "../utils/format";
import { PlateBox, PlateDisplay } from "./styled";

interface BidModalProps {
  selectedPlate: AuctionItem | null;
  onClose: () => void;
  onConfirmBid: () => void;
}

export const BidModal: React.FC<BidModalProps> = ({
  selectedPlate,
  onClose,
  onConfirmBid,
}) => {
  const formItems: IFormItem[] = [];

  return (
    <ModalForm
      open={!!selectedPlate}
      title="Xác nhận đặt giá"
      onCancel={onClose}
      onOk={onConfirmBid}
      okText="Xác nhận trả giá"
      cancelText="Hủy bỏ"
      width={480}
      formItems={formItems}
      requiredMark={false}
      centered
      okButtonProps={{
        style: {
          background: "var(--primary, #256b8c)",
          borderColor: "var(--primary, #256b8c)",
          fontWeight: 600,
        },
      }}
    >
      {selectedPlate && (
        <div style={{ padding: "4px 0" }}>
          <p style={{ color: "var(--text-secondary, #586979)", fontSize: 13.5, marginBottom: 16, textAlign: "center" }}>
            Bạn đang tham gia trả giá cho biển số trực tuyến
          </p>

          <PlateBox style={{ margin: "0 0 18px" }}>
            <PlateDisplay>{selectedPlate.p}</PlateDisplay>
            <div style={{ marginTop: 8, fontSize: 13, color: "var(--text-secondary, #586979)", fontWeight: 500 }}>
              {selectedPlate.prov} &bull; {selectedPlate.type}
            </div>
          </PlateBox>

          <div
            style={{
              background: "var(--bg-secondary, #f8fafc)",
              border: "1px solid var(--border-primary, #dbe6ee)",
              borderRadius: 12,
              padding: "16px 18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ color: "var(--text-secondary, #64748b)", fontSize: 13.5 }}>Giá hiện tại:</span>
              <span style={{ fontWeight: 700, color: "var(--text-primary, #1e293b)", fontSize: 14 }}>
                {formatMoney(selectedPlate.price)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ color: "var(--text-secondary, #64748b)", fontSize: 13.5 }}>Bước giá:</span>
              <span style={{ fontWeight: 700, color: "var(--primary, #256b8c)", fontSize: 14 }}>
                +{formatMoney(selectedPlate.step)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 12,
                borderTop: "1px dashed var(--border-primary, #cbd5e1)",
              }}
            >
              <span style={{ fontWeight: 700, color: "var(--text-primary, #0f172a)", fontSize: 14 }}>
                Giá trả tiếp theo:
              </span>
              <span style={{ fontWeight: 800, fontSize: 16.5, color: "var(--primary, #256b8c)" }}>
                {formatMoney(selectedPlate.price + selectedPlate.step)}
              </span>
            </div>
          </div>
        </div>
      )}
    </ModalForm>
  );
};

export default BidModal;
