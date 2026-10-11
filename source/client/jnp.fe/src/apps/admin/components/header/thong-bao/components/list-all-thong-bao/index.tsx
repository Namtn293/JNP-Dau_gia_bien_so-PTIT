import {
  BellOutlined,
  CalendarOutlined,
  CheckOutlined,
  DeleteOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, DatePicker, Input, Pagination, Select, Skeleton, Tooltip } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

import ConfirmDialog from "@/apps/admin/components/ConfirmDialog";
import { PageContainer } from "@/apps/admin/components/PageContainer";

import { useThongBaoPage, type NotificationDateRange } from "./hooks/filter";
import {
  ContentWrapper,
  DateLabel,
  EmptyState,
  EmptyStateText,
  EmptyStateTitle,
  FilterActionRow,
  FilterCard,
  FilterGroup,
  FilterLabel,
  FilterSidebar,
  FilterTitle,
  LoadingState,
  MainSection,
  NotificationBody,
  NotificationCard,
  NotificationCardActions,
  NotificationCardHeader,
  NotificationCardTopRow,
  NotificationListBody,
  NotificationPanel,
  NotificationPanelActions,
  NotificationPanelHeader,
  NotificationPanelTitle,
  NotificationPanelTitleGroup,
  NotificationTitle,
  PageDescription,
  PageEyebrow,
  PageGrid,
  PageHeaderCard,
  PageHeaderStats,
  PageHeaderText,
  PageTitle,
  PaginationBar,
  PaginationInfo,
  DatePickerHighlightStyle,
  ReadFilterBar,
  ReadFilterBtn,
  ReadFilterGroup,
  ResultsSummary,
  StatCard,
  ToolbarActions,
  UnreadBadge,
} from "./styled";

export default function ThongBaoPage() {
  const currentDate = dayjs();
  const currentQuarter = Math.ceil((currentDate.month() + 1) / 3);
  const currentYear = currentDate.year();
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<number[]>([]);

  const {
    activeFilterLabel,
    clearFilters,
    currentPage,
    displayedList,
    filterDateRange,
    filterKeyword,
    filterNghiepVu,
    filterQuarter,
    filterYear,
    handleClickCard,
    handleDateRangeChange,
    handleDeleteNotifications,
    handleKeywordChange,
    handleMarkAllRead,
    handleNghiepVuChange,
    handlePageChange,
    handlePageSizeChange,
    handleQuarterChange,
    handleReadFilterChange,
    handleYearChange,
    hasActiveFilters,
    isDeletingNotification,
    isFetching,
    isMarkingAll,
    nghiepVuOptions,
    pageSize,
    pageSizeOptions,
    readFilter,
    totalItems,
    unreadTotal,
    visibleEnd,
    visibleStart,
  } = useThongBaoPage();

  const currentPageIds = useMemo(() => displayedList.map((item) => item.id), [displayedList]);
  const selectedCount = selectedNotificationIds.length;
  const allCurrentPageSelected =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedNotificationIds.includes(id));

  useEffect(() => {
    setSelectedNotificationIds((prev) => prev.filter((id) => currentPageIds.includes(id)));
  }, [currentPageIds]);

  const handleOpenDeleteConfirm = (ids: number[]) => {
    setPendingDeleteIds(ids);
  };

  const handleCloseDeleteConfirm = () => {
    setPendingDeleteIds([]);
  };

  const hasActiveTextSelection = () => {
    if (typeof window === "undefined") {
      return false;
    }

    const selection = window.getSelection();
    return Boolean(selection && !selection.isCollapsed && selection.toString().trim());
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteIds.length === 0) {
      return;
    }

    await handleDeleteNotifications(pendingDeleteIds);
    setSelectedNotificationIds((prev) => prev.filter((id) => !pendingDeleteIds.includes(id)));
    handleCloseDeleteConfirm();
  };

  const handleToggleNotificationSelection = (notificationId: number, checked: boolean) => {
    setSelectedNotificationIds((prev) => {
      if (checked) {
        return prev.includes(notificationId) ? prev : [...prev, notificationId];
      }

      return prev.filter((id) => id !== notificationId);
    });
  };

  const handleToggleSelectAllCurrentPage = (checked: boolean) => {
    setSelectedNotificationIds((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, ...currentPageIds]));
      }

      return prev.filter((id) => !currentPageIds.includes(id));
    });
  };

  return (
    <>
      <DatePickerHighlightStyle />
      <PageContainer
      breadcrumbItems={[
        { title: "Trang chủ", path: "/admin" },
        { title: "Ủy quyền - Tài khoản" },
        { title: "Tất cả thông báo" },
      ]}
    >
      <ContentWrapper>
        <PageHeaderCard>
          <PageHeaderText>
            <PageEyebrow>
              <BellOutlined />
              Trung tâm thông báo
            </PageEyebrow>
            <PageTitle>Quản lý thông báo</PageTitle>
            <PageDescription>
              Theo dõi toàn bộ cập nhật nghiệp vụ, cảnh báo xử lý và kết quả hồ sơ trong một giao diện
              thống nhất, rõ ràng và phù hợp với hệ thống quản trị.
            </PageDescription>
          </PageHeaderText>

          <PageHeaderStats>
            <StatCard>
              <span className="label">Thông báo hiển thị</span>
              <span className="value">{totalItems}</span>
            </StatCard>
            <StatCard $accent>
              <span className="label">Chưa đọc</span>
              <span className="value">{unreadTotal}</span>
            </StatCard>
          </PageHeaderStats>
        </PageHeaderCard>

        <PageGrid>
          <FilterSidebar>
            <FilterCard>
              <FilterTitle>Bộ lọc</FilterTitle>
              {/* <Theo dõi toàn bộ cập nhật nghiệp vụ, cảnh báo xử lý và kết quả hồ sơ trong một giao diện thống nhất, rõ ràng và phù hợp với hệ thống quản trị.FilterDescription>
                Khoanh vùng thông báo theo mốc thời gian để tra cứu nhanh và tập trung đúng nghiệp vụ.
              </Theo> */}

              <FilterGroup>
                <FilterLabel>Từ khóa</FilterLabel>
                <Input
                  allowClear
                  value={filterKeyword}
                  onChange={(event) => handleKeywordChange(event.target.value)}
                  placeholder="Nhập tiêu đề hoặc nội dung"
                />
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Nghiệp vụ</FilterLabel>
                <Select
                  allowClear
                  value={filterNghiepVu}
                  onChange={handleNghiepVuChange}
                  options={nghiepVuOptions}
                  placeholder="Chọn nghiệp vụ"
                />
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Khoảng ngày</FilterLabel>
                <DatePicker.RangePicker
                  format="DD/MM/YYYY"
                  value={filterDateRange}
                  onChange={(value) => handleDateRangeChange(value as NotificationDateRange)}
                  style={{ width: "100%" }}
                  placeholder={["Từ ngày", "Đến ngày"]}
                />
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Theo quý</FilterLabel>
                <DatePicker
                  cellRender={(current, info) => {
                    if (info.type !== "quarter") {
                      return info.originNode;
                    }

                    const currentValue = dayjs.isDayjs(current) ? current : dayjs(current);

                    if (!currentValue.isValid()) {
                      return info.originNode;
                    }

                    const quarter = Math.ceil((currentValue.month() + 1) / 3);
                    const isCurrentQuarter = currentValue.year() === currentYear && quarter === currentQuarter;

                    if (!isCurrentQuarter) {
                      return info.originNode;
                    }

                    return <div className="ant-picker-cell-inner current-quarter-cell">{`Q${quarter}`}</div>;
                  }}
                  picker="quarter"
                  popupClassName="thong-bao-quarter-picker-popup"
                  format="[Quý] Q - YYYY"
                  value={filterQuarter}
                  onChange={handleQuarterChange}
                  style={{ width: "100%" }}
                  placeholder="Chọn quý"
                />
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Theo năm</FilterLabel>
                <DatePicker
                  cellRender={(current, info) => {
                    if (info.type !== "year") {
                      return info.originNode;
                    }

                    const currentValue = dayjs.isDayjs(current) ? current : dayjs(current);

                    if (!currentValue.isValid() || currentValue.year() !== currentYear) {
                      return info.originNode;
                    }

                    return <div className="ant-picker-cell-inner current-year-cell">{currentValue.year()}</div>;
                  }}
                  picker="year"
                  popupClassName="thong-bao-year-picker-popup"
                  value={filterYear}
                  onChange={handleYearChange}
                  style={{ width: "100%" }}
                  placeholder="Chọn năm"
                />
              </FilterGroup>

              {/* <FilterStatus>
                <div className="label">
                  <FilterOutlined />
                  Trạng thái bộ lọc
                </div>
                <div className="value">{activeFilterLabel}</div>
              </FilterStatus> */}

              {hasActiveFilters && (
                <FilterActionRow>
                  <Button block onClick={clearFilters}>
                    Xóa bộ lọc
                  </Button>
                </FilterActionRow>
              )}
            </FilterCard>
          </FilterSidebar>

          <MainSection>
            <ReadFilterBar>
              <div className="bar-left">
                <ReadFilterGroup>
                  <ReadFilterBtn $active={readFilter === "all"} onClick={() => handleReadFilterChange("all")}>
                    Tất cả
                  </ReadFilterBtn>
                  <ReadFilterBtn
                    $active={readFilter === "unread"}
                    onClick={() => handleReadFilterChange("unread")}
                  >
                    Chưa đọc {unreadTotal > 0 ? `(${unreadTotal})` : ""}
                  </ReadFilterBtn>
                </ReadFilterGroup>

                <ResultsSummary>
                  Hiển thị <strong>{totalItems}</strong> thông báo.
                  {hasActiveFilters ? ` Bộ lọc hiện tại: ${activeFilterLabel}.` : " Toàn bộ thời gian."}
                </ResultsSummary>
              </div>

              <ToolbarActions>
                <Tooltip title="Đánh dấu toàn bộ thông báo là đã đọc" placement="left">
                  <Button
                    icon={<CheckOutlined />}
                    onClick={handleMarkAllRead}
                    loading={isMarkingAll}
                    disabled={unreadTotal === 0}
                  >
                    Đánh dấu tất cả đã đọc
                  </Button>
                </Tooltip>
              </ToolbarActions>
            </ReadFilterBar>

            <NotificationPanel>
              <NotificationPanelHeader>
                <NotificationPanelTitleGroup>
                  <NotificationPanelTitle>
                    {readFilter === "unread" ? "Danh sách chưa đọc" : "Danh sách thông báo"}
                  </NotificationPanelTitle>
                  {/* <NotificationPanelSubtitle>{activeFilterLabel}</NotificationPanelSubtitle> */}
                </NotificationPanelTitleGroup>

                <NotificationPanelActions>
                  <Checkbox
                    checked={allCurrentPageSelected}
                    indeterminate={selectedCount > 0 && !allCurrentPageSelected}
                    onChange={(event) => handleToggleSelectAllCurrentPage(event.target.checked)}
                    disabled={displayedList.length === 0}
                  >
                    Chọn tất cả trang này
                  </Checkbox>

                  {selectedCount > 0 && <span className="selection-count">Đã chọn {selectedCount}</span>}

                  <Button
                    className="bulk-delete-btn"
                    icon={<DeleteOutlined />}
                    disabled={selectedCount === 0}
                    loading={isDeletingNotification}
                    onClick={() => handleOpenDeleteConfirm(selectedNotificationIds)}
                  >
                    Xóa đã chọn
                  </Button>
                </NotificationPanelActions>
              </NotificationPanelHeader>

              <NotificationListBody>
                {isFetching ? (
                  <LoadingState>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <NotificationCard key={index}>
                        <Skeleton active title={{ width: "44%" }} paragraph={{ rows: 2 }} />
                      </NotificationCard>
                    ))}
                  </LoadingState>
                ) : displayedList.length === 0 ? (
                  <EmptyState>
                    <div className="empty-icon">
                      <InboxOutlined />
                    </div>
                    <EmptyStateTitle>Không có thông báo phù hợp</EmptyStateTitle>
                    <EmptyStateText>
                      Hệ thống chưa ghi nhận thông báo nào với điều kiện lọc hiện tại. Hãy điều chỉnh bộ
                      lọc hoặc quay lại toàn bộ thời gian để xem thêm dữ liệu.
                    </EmptyStateText>
                  </EmptyState>
                ) : (
                  displayedList.map((item) => (
                    <NotificationCard
                      key={item.id}
                      $selected={selectedNotificationIds.includes(item.id)}
                      $unread={!item.daXem}
                      onClick={() => {
                        if (hasActiveTextSelection()) {
                          return;
                        }
                        void handleClickCard(item);
                      }}
                    >
                      <NotificationCardTopRow>
                        <Checkbox
                          checked={selectedNotificationIds.includes(item.id)}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => handleToggleNotificationSelection(item.id, event.target.checked)}
                          aria-label={`Chọn thông báo ${item.tieuDe}`}
                        />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <NotificationCardHeader>
                            <NotificationTitle>{item.tieuDe}</NotificationTitle>
                            <NotificationCardActions onClick={(event) => event.stopPropagation()}>
                              {!item.daXem && <UnreadBadge>Mới</UnreadBadge>}
                              <Tooltip title="Xóa thông báo">
                                <Button
                                  danger
                                  type="text"
                                  icon={<DeleteOutlined />}
                                  aria-label={`Xóa thông báo ${item.tieuDe}`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleOpenDeleteConfirm([item.id]);
                                  }}
                                />
                              </Tooltip>
                            </NotificationCardActions>
                          </NotificationCardHeader>

                          <NotificationBody>{item.noiDung}</NotificationBody>

                          <DateLabel>
                            <CalendarOutlined />
                            {dayjs(item.ngayTao).add(7, "hour").format("DD/MM/YYYY HH:mm")}
                          </DateLabel>
                        </div>
                      </NotificationCardTopRow>
                    </NotificationCard>
                  ))
                )}
              </NotificationListBody>

              {totalItems > 0 && (
                <PaginationBar>
                  <PaginationInfo>
                    <Select
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      options={pageSizeOptions}
                      style={{ width: 128 }}
                    />
                    <span>
                      Hiển thị <strong>{visibleStart}</strong>-<strong>{visibleEnd}</strong> trong{" "}
                      <strong>{totalItems}</strong> thông báo
                    </span>
                  </PaginationInfo>

                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalItems}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                  />
                </PaginationBar>
              )}
            </NotificationPanel>
          </MainSection>
        </PageGrid>

        <ConfirmDialog
          open={pendingDeleteIds.length > 0}
          loading={isDeletingNotification}
          title="Xác nhận xóa thông báo"
          message={
            pendingDeleteIds.length > 1
              ? `Bạn có chắc muốn xóa ${pendingDeleteIds.length} thông báo đã chọn không?`
              : "Bạn có chắc muốn xóa thông báo này không?"
          }
          okText="Đồng ý"
          cancelText="Hủy"
          onOk={() => {
            void handleConfirmDelete();
          }}
          onCancel={handleCloseDeleteConfirm}
        />
      </ContentWrapper>
      </PageContainer>
    </>
  );
}
