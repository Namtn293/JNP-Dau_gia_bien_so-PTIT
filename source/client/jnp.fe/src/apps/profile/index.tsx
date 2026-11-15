import React from "react";
import { Link } from "@tanstack/react-router";
import { HomeOutlined, RightOutlined } from "@ant-design/icons";

import { TopNavbar } from "@/apps/dashboard/components/TopNavbar";
import { ProfileInfoCard } from "./components/ProfileInfoCard";
import { WalletCard } from "./components/WalletCard";
import { TopupModal } from "./components/TopupModal";
import { TransactionHistoryTable } from "./components/TransactionHistoryTable";
import { useData } from "./hooks/useData";
import { useAction } from "./hooks/useAction";
import { ProfilePageContainer, ProfileMainContent } from "./style";

export const ProfilePage: React.FC = () => {
  const {
    userProfile,
    wallet,
    isWalletLoading,
    refetchWallet,
    transactions,
    totalTx,
    page,
    setPage,
    size,
    setSize,
    txType,
    setTxType,
    isTxLoading,
    isTxFetching,
    refetchTx,
  } = useData();

  const {
    isTopupModalOpen,
    openTopupModal,
    closeTopupModal,
    amount,
    setAmount,
    handleSelectPreset,
    handleTopup,
    isTopupLoading,
  } = useAction();

  const handleRefreshAll = () => {
    refetchWallet();
    refetchTx();
  };

  return (
    <ProfilePageContainer>
      <TopNavbar userName={userProfile?.displayName} />

      <ProfileMainContent>
        <div className="breadcrumb-nav">
          <Link to="/danh-sach-dau-gia">
            <HomeOutlined style={{ marginRight: 4 }} />
            Trang chủ đấu giá
          </Link>
          <RightOutlined style={{ fontSize: 10, color: "#94a3b8" }} />
          <span>Hồ sơ cá nhân &amp; Ví tiền</span>
        </div>

        <div className="top-cards-grid">
          <ProfileInfoCard user={userProfile} />

          <WalletCard
            wallet={wallet}
            onOpenTopup={openTopupModal}
            isLoading={isWalletLoading}
          />
        </div>

        <TransactionHistoryTable
          transactions={transactions}
          total={totalTx}
          page={page}
          size={size}
          onPageChange={(newPage, newSize) => {
            setPage(newPage);
            setSize(newSize);
          }}
          txType={txType}
          onTypeChange={(val) => {
            setTxType(val || undefined);
            setPage(0);
          }}
          isLoading={isTxLoading}
          isFetching={isTxFetching}
          onRefresh={handleRefreshAll}
        />

        <TopupModal
          open={isTopupModalOpen}
          onClose={closeTopupModal}
          amount={amount}
          onAmountChange={setAmount}
          onSelectPreset={handleSelectPreset}
          onSubmit={handleTopup}
          loading={isTopupLoading}
        />
      </ProfileMainContent>
    </ProfilePageContainer>
  );
};

export default ProfilePage;

