import styled from "styled-components";

export const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  width: 100%;
  /* max-width: 500px; */
  margin: 10px auto;
  font-family: 'Inter', -apple-system, sans-serif;
  border: 1px solid #e0e0e0;
`;

export const HeaderBanner = styled.div`
 background: linear-gradient(
  135deg,
  var(--primary) 0%,
  color-mix(in srgb, var(--primary) 50%, white) 100%
);
  height: 90px;
  border-radius: 12px 12px 0 0;
`;

export const HeaderContent = styled.div`
  padding: 0 30px;
  display: flex;
  margin-top: -70px; /* Đẩy Avatar lên cao hơn chút nữa */
  margin-bottom: 20px;
  position: relative;
  align-items: center; /* Căn giữa tên theo Avatar */
`;

export const Avatar = styled.div<{ src?: string }>`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid #ffffff; 
  background-color: #e0e0e0;
  background-image: ${props => props.src ? `url(${props.src})` : 'none'};
  background-size: cover;
  background-position: center;
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  z-index: 2;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 700;
  color: #555;
  background-clip: padding-box;
`;

export const NameSection = styled.div`
  margin-top: -45px;
  margin-left: 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
`;

export const FullName = styled.h2`
 margin: 0;
  font-size: 16px;
  color: #ffff; // Màu đen đậm rõ nét
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 45px;
`;

export const Position = styled.span`
  font-size: 15px;
  color: #ffff; // Màu xám nhẹ cho chức vụ
  font-weight: 500;
  margin-top: 4px;
`;

export const StatusBadge = styled.span<{ isActive: boolean }>`
  background-color: ${props => props.isActive ? '#d4edda' : '#f8d7da'};
  color: ${props => props.isActive ? '#155724' : '#721c24'};
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 10px;
`;

export const SectionTitle = styled.h3`
  font-size: 16px;
  color: #000000;
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 10px;
  margin: 20px 30px 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const InfoGrid = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 2}, 1fr);
  gap: 20px;
  padding: 0 30px 30px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.span`
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
  font-weight: 600;
  text-transform: uppercase;
`;

export const Value = styled.span`
  font-size: 15px;
  color: #333;
  font-weight: 500;
`;

export const TagContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const RoleTag = styled.span`
  background: #e3f2fd;
  color: #0d47a1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
`;