import React from "react";
import { Skeleton } from "antd";
import {
  PageWrapper,
  HeaderBar,
  HeaderLeft,
  HeaderRight,
  MainGrid,
  Panel,
  PanelHeader,
  LotsContainer,
  InteractionTabBar,
  PinnedNoticeBar,
  SkeletonCard,
  SkeletonPlateBanner,
  SkeletonBiddingStage,
  SkeletonFeedRow,
} from "./styled";

export const AuctionRoomSkeleton: React.FC = () => {
  return (
    <PageWrapper aria-busy="true" aria-label="Đang tải dữ liệu phòng đấu giá">
      {/* 1. TopNavbar Skeleton */}
      <div style={{ background: "rgba(255, 255, 255, 0.95)", borderBottom: "1px solid #dbe6ee" }}>
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "12px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Skeleton.Input active size="small" style={{ width: 180, height: 18, marginBottom: 4 }} />
            <br />
            <Skeleton.Input active size="small" style={{ width: 140, height: 12 }} />
          </div>
          <Skeleton.Button active size="small" style={{ width: 110, height: 32, borderRadius: 8 }} />
        </div>
      </div>

      {/* 2. Main 3-Column Grid Skeleton */}
      <MainGrid>
        {/* Left: Lots list panel */}
        <Panel id="lotsPanelSkeleton">
          <PanelHeader>
            <Skeleton.Input active size="small" style={{ width: 130, height: 20 }} />
          </PanelHeader>
          <LotsContainer>
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i}>
                <Skeleton.Button
                  active
                  style={{ width: 84, height: 32, borderRadius: 8, flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <Skeleton
                    active
                    title={false}
                    paragraph={{ rows: 2, width: ["85%", "55%"], style: { margin: 0 } }}
                  />
                </div>
              </SkeletonCard>
            ))}
          </LotsContainer>
        </Panel>

        {/* Center: Stage and Bidding panel */}
        <Panel id="mainStageSkeleton" style={{ padding: 18 }}>
          {/* Tag row */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <Skeleton.Button active size="small" style={{ width: 80, height: 24, borderRadius: 6 }} />
            <Skeleton.Button active size="small" style={{ width: 120, height: 24, borderRadius: 6 }} />
            <Skeleton.Button active size="small" style={{ width: 100, height: 24, borderRadius: 6 }} />
          </div>

          {/* Big License Plate Shimmer Stage */}
          <SkeletonPlateBanner>
            <Skeleton.Button
              active
              style={{
                width: 280,
                height: 64,
                borderRadius: 14,
              }}
            />
            <Skeleton.Input active size="small" style={{ width: 180, height: 18 }} />
          </SkeletonPlateBanner>

          {/* Detail Tabs bar */}
          <div style={{ display: "flex", gap: 8, margin: "14px 0" }}>
            <Skeleton.Button active size="small" style={{ width: 80, height: 32, borderRadius: 8 }} />
            <Skeleton.Button active size="small" style={{ width: 100, height: 32, borderRadius: 8 }} />
            <Skeleton.Button active size="small" style={{ width: 90, height: 32, borderRadius: 8 }} />
            <Skeleton.Button active size="small" style={{ width: 90, height: 32, borderRadius: 8 }} />
          </div>

          <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 10, marginBottom: 14 }}>
            <Skeleton active title={false} paragraph={{ rows: 2, width: ["95%", "75%"] }} />
          </div>

          {/* Bidding Control Stage */}
          <SkeletonBiddingStage>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <Skeleton.Input active size="small" style={{ width: 90, height: 16, marginBottom: 8 }} />
                <br />
                <Skeleton.Input active size="large" style={{ width: 220, height: 38, borderRadius: 8 }} />
              </div>
              <Skeleton.Button
                active
                style={{ width: 140, height: 60, borderRadius: 12 }}
              />
            </div>

            {/* Quick buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <Skeleton.Button active block style={{ height: 42, borderRadius: 10 }} />
              <Skeleton.Button active block style={{ height: 42, borderRadius: 10 }} />
              <Skeleton.Button active block style={{ height: 42, borderRadius: 10 }} />
            </div>

            {/* Main Action Button */}
            <Skeleton.Button active block style={{ height: 50, borderRadius: 12 }} />
          </SkeletonBiddingStage>
        </Panel>

        {/* Right: Interaction panel */}
        <Panel id="interactionSkeleton">
          <InteractionTabBar>
            <Skeleton.Button active size="small" style={{ width: 95, height: 32, borderRadius: 8 }} />
            <Skeleton.Button active size="small" style={{ width: 110, height: 32, borderRadius: 8 }} />
            <Skeleton.Button active size="small" style={{ width: 95, height: 32, borderRadius: 8 }} />
          </InteractionTabBar>

          <PinnedNoticeBar style={{ background: "#f1f5f9" }}>
            <Skeleton.Input active size="small" style={{ width: "90%", height: 18 }} />
          </PinnedNoticeBar>

          <div style={{ padding: "8px 0" }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonFeedRow key={i}>
                <Skeleton.Avatar active size="small" shape="circle" />
                <div style={{ flex: 1 }}>
                  <Skeleton
                    active
                    title={false}
                    paragraph={{
                      rows: 1,
                      width: [i % 2 === 0 ? "75%" : "50%"],
                      style: { margin: 0 },
                    }}
                  />
                </div>
              </SkeletonFeedRow>
            ))}
          </div>
        </Panel>
      </MainGrid>
    </PageWrapper>
  );
};

export default AuctionRoomSkeleton;
