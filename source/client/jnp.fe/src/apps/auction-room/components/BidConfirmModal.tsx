import React from "react";
import { ModalOverlay, ModalContent } from "./styled";
import { formatMoney } from "../util/format";

interface BidConfirmModalProps {
  open: boolean;
  bidAmount: number;
  plateNumber: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const BidConfirmModal: React.FC<BidConfirmModalProps> = ({
  open,
  bidAmount,
  plateNumber,
  onCancel,
  onConfirm,
}) => {
  return (
    <ModalOverlay $open={open}>
      <ModalContent>
        <h3>Xác nhận đặt giá</h3>
        <p>
          Bạn có chắc chắn muốn trả mức giá{" "}
          <b style={{ color: "#256b8c", fontSize: 16 }}>
            {formatMoney(bidAmount)}
          </b>{" "}
          cho biển số <b>{plateNumber}</b>?
          <br />
          <small style={{ color: "#64748b", marginTop: 4, display: "block" }}>
            Lệnh đặt giá có giá trị pháp lý ràng buộc và không thể rút lại.
          </small>
        </p>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Hủy
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            Xác nhận đặt giá
          </button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
};

export default BidConfirmModal;
