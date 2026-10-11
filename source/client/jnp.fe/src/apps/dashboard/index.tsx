import React from "react";
import { Input, Select, Pagination } from "antd";
import {
  SearchOutlined,
  AppstoreOutlined,
  TableOutlined,
  ProjectOutlined,
} from "@ant-design/icons";

// Child components & styled from ./components
import {
  PageContainer,
  MainContent,
  PageHeader,
  ControlBar,
  TabButtonGroup,
  TabButton,
  ViewButtonGroup,
  ViewButton,
  FilterGrid,
  CardsGrid,
  PaginationWrapper,
} from "./components/styled";

import TopNavbar from "./components/TopNavbar";
import AuctionCardItem from "./components/AuctionCardItem";
import AuctionTableItem from "./components/AuctionTableItem";
import AuctionBoardItem from "./components/AuctionBoardItem";
import BidModal from "./components/BidModal";

// Hooks & utils
import { useAuctionData } from "./hooks/useAuctionData";
import { PROVINCES_LIST, PLATE_TYPES_LIST } from "./utils/constants";
import type { AuctionStatus } from "./services/type";

export const DashboardPage: React.FC = () => {
  const {
    data,
    pagedList,
    total,
    tab,
    setTab,
    viewMode,
    setViewMode,
    search,
    setSearch,
    province,
    setProvince,
    plateType,
    setPlateType,
    sortBy,
    setSortBy,
    selectedPlate,
    setSelectedPlate,
    page,
    setPage,
    pageSize,
    setPageSize,
    placeBid,
  } = useAuctionData();

  const tabOptions: { key: AuctionStatus; label: string }[] = [
    { key: "live", label: "Đang diễn ra" },
    { key: "soon", label: "Sắp diễn ra" },
    { key: "end", label: "Đã kết thúc" },
  ];

  return (
    <PageContainer>
      {/* Top Navbar */}
      <TopNavbar userName="Trần Đức An" />

      {/* Main Content */}
      <MainContent>
        <PageHeader>
          <div>
            <h1>Phiên Đấu Giá Biển Số Xe</h1>
            <p>Hệ thống đấu giá biển số trực tuyến hàng đầu Việt Nam</p>
          </div>
        </PageHeader>

        {/* Tab & View Mode Controllers */}
        <ControlBar>
          {viewMode !== "board" && (
            <TabButtonGroup>
              {tabOptions.map(({ key, label }) => (
                <TabButton
                  key={key}
                  $active={tab === key}
                  onClick={() => setTab(key)}
                >
                  {label} ({data.filter((x) => x.st === key).length})
                </TabButton>
              ))}
            </TabButtonGroup>
          )}

          <ViewButtonGroup>
            <ViewButton
              $active={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
            >
              <AppstoreOutlined /> Lưới thẻ
            </ViewButton>
            <ViewButton
              $active={viewMode === "table"}
              onClick={() => setViewMode("table")}
            >
              <TableOutlined /> Bảng
            </ViewButton>
            <ViewButton
              $active={viewMode === "board"}
              onClick={() => setViewMode("board")}
            >
              <ProjectOutlined /> Theo cột
            </ViewButton>
          </ViewButtonGroup>
        </ControlBar>

        {/* Filter Toolbar */}
        <FilterGrid>
          <Input
            prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
            placeholder="Tìm biển số, ví dụ 555 hoặc 30K..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 280 }}
          />

          <Select
            placeholder="Tất cả tỉnh/thành"
            value={province}
            onChange={setProvince}
            allowClear
            style={{ width: 170 }}
            options={PROVINCES_LIST.map((p) => ({ label: p, value: p }))}
          />

          <Select
            placeholder="Tất cả loại biển"
            value={plateType}
            onChange={setPlateType}
            allowClear
            style={{ width: 170 }}
            options={PLATE_TYPES_LIST.map((t) => ({ label: t, value: t }))}
          />

          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: 190, marginLeft: "auto" }}
            options={[
              { label: "Sắp kết thúc trước", value: "time" },
              { label: "Giá cao nhất", value: "hi" },
              { label: "Giá thấp nhất", value: "lo" },
              { label: "Nhiều lượt trả nhất", value: "bids" },
            ]}
          />
        </FilterGrid>

        {/* Dynamic View Display */}
        {viewMode === "grid" && (
          <CardsGrid>
            {pagedList.map((item) => (
              <AuctionCardItem
                key={item.p}
                item={item}
                onOpenBid={setSelectedPlate}
              />
            ))}
          </CardsGrid>
        )}

        {viewMode === "table" && (
          <AuctionTableItem
            items={pagedList}
            onOpenBid={setSelectedPlate}
          />
        )}

        {viewMode === "board" && (
          <AuctionBoardItem
            data={data}
            onOpenBid={setSelectedPlate}
          />
        )}

        {/* Pagination bar */}
        {viewMode !== "board" && total > 0 && (
          <PaginationWrapper>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={(p, ps) => {
                setPage(p);
                setPageSize(ps);
              }}
              showSizeChanger
              pageSizeOptions={["6", "12", "24", "48"]}
              showTotal={(all, range) =>
                `Hiển thị ${range[0]}-${range[1]} trên tổng số ${all} phiên`
              }
            />
          </PaginationWrapper>
        )}
      </MainContent>


      {/* Bid Confirmation Modal */}
      <BidModal
        selectedPlate={selectedPlate}
        onClose={() => setSelectedPlate(null)}
        onConfirmBid={() => selectedPlate && placeBid(selectedPlate)}
      />
    </PageContainer>
  );
};

export default DashboardPage;