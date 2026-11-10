import styled from "styled-components";

export const ProfileCardWrapper = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;

  .card-header-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f1f5f9;
  }

  .avatar-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #328dae 0%, #1e5973 100%);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 700;
    flex-shrink: 0;
    box-shadow: 0 6px 16px rgba(37, 107, 140, 0.25);
  }

  .user-header-meta {
    flex: 1;
    min-width: 0;

    .display-name {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.3;
      margin: 0 0 4px 0;
    }

    .username-sub {
      font-size: 13px;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }

    .info-item {
      background: #f8fafc;
      padding: 12px 14px;
      border-radius: 10px;
      border: 1px solid #edf2f7;

      .info-label {
        font-size: 12px;
        color: #64748b;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .info-value {
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
        word-break: break-all;
      }
    }
  }
`;

export const WalletCardWrapper = styled.div`
  background: linear-gradient(135deg, #1b526d 0%, #256b8c 60%, #308aa5 100%);
  color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(37, 107, 140, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50px;
    right: -50px;
    width: 180px;
    height: 180px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  .wallet-top-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;

    .wallet-title {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #b9e2f5;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .topup-btn {
      background: #ffffff;
      color: #1b526d;
      border: none;
      font-weight: 700;
      border-radius: 8px;
      padding: 6px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      transition: all 0.2s;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);

      &:hover {
        background: #f0f7fb;
        transform: translateY(-1px);
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
      }
    }
  }

  .balance-display {
    margin-bottom: 22px;

    .balance-label {
      font-size: 13px;
      color: #b9e2f5;
      margin-bottom: 4px;
    }

    .balance-value {
      font-size: 32px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      line-height: 1.15;
    }
  }

  .sub-balances {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.18);

    .sub-item {
      .sub-label {
        font-size: 12px;
        color: #d1ecf9;
        margin-bottom: 2px;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .sub-value {
        font-size: 16px;
        font-weight: 700;
        color: #ffffff;
      }
    }
  }

  .demo-note {
    margin-top: 14px;
    font-size: 11.5px;
    color: #e0f2fe;
    opacity: 0.85;
    font-style: italic;
  }
`;

export const TransactionTableWrapper = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  margin-top: 24px;

  .table-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 18px;

    .title-group {
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: #0f172a;
      }
      span {
        font-size: 13px;
        color: #64748b;
      }
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
`;

export const TopupModalBody = styled.div`
  padding: 10px 0;

  .notice-banner {
    background: #e6f4fa;
    border: 1px solid #bce1f1;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 12.5px;
    color: #1a516c;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-label {
    font-size: 13.5px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 10px;
  }

  .presets-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 20px;

    @media (max-width: 480px) {
      grid-template-columns: repeat(2, 1fr);
    }

    .preset-btn {
      padding: 10px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: center;

      &:hover {
        border-color: #256b8c;
        color: #256b8c;
        background: #f0f7fb;
      }

      &.active {
        border-color: #256b8c;
        background: #eef6f9;
        color: #1b526d;
        font-weight: 700;
        box-shadow: 0 0 0 1px #256b8c;
      }
    }
  }
`;

