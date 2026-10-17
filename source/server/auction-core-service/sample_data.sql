-- =============================================================================
-- SAMPLE DATA FOR AUCTION SYSTEM
-- Các bảng: PROVINCE, NUMBER_PLATE, AUCTION_SESSION
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. BẢNG PROVINCE: Dữ liệu thật các tỉnh/thành phố tại Việt Nam
-- -----------------------------------------------------------------------------
INSERT INTO province (code, name) VALUES
('29', 'Hà Nội'),
('51', 'TP. Hồ Chí Minh'),
('43', 'Đà Nẵng'),
('15', 'Hải Phòng'),
('65', 'Cần Thơ'),
('99', 'Bắc Ninh'),
('14', 'Quảng Ninh'),
('60', 'Đồng Nai'),
('61', 'Bình Dương'),
('36', 'Thanh Hóa'),
('37', 'Nghệ An'),
('75', 'Thừa Thiên Huế'),
('17', 'Thái Bình'),
('18', 'Nam Định'),
('88', 'Vĩnh Phúc'),
('34', 'Hải Dương'),
('72', 'Bà Rịa - Vũng Tàu'),
('79', 'Khánh Hòa'),
('47', 'Đắk Lắk'),
('49', 'Lâm Đồng')
ON CONFLICT (code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. BẢNG NUMBER_PLATE: Biển số xe thực tế theo từng tỉnh
-- Các loại biển: NGU_QUY, TU_QUY, LOC_PHAT, THAN_TAI, SANH_TIEN, OTHER
-- -----------------------------------------------------------------------------
INSERT INTO number_plate (plate_number, province_id, plate_type, vehicle_type, created_at)
VALUES
-- Hà Nội (Code 29)
('30K-999.99', (SELECT id FROM province WHERE code = '29' LIMIT 1), 'NGU_QUY', 'Ô tô con', NOW()),
('30K-888.88', (SELECT id FROM province WHERE code = '29' LIMIT 1), 'NGU_QUY', 'Ô tô con', NOW()),
('30K-567.89', (SELECT id FROM province WHERE code = '29' LIMIT 1), 'SANH_TIEN', 'Ô tô con', NOW()),
('30K-686.86', (SELECT id FROM province WHERE code = '29' LIMIT 1), 'LOC_PHAT', 'Ô tô con', NOW()),
('30L-797.79', (SELECT id FROM province WHERE code = '29' LIMIT 1), 'THAN_TAI', 'Ô tô con', NOW()),
('30K-666.66', (SELECT id FROM province WHERE code = '29' LIMIT 1), 'NGU_QUY', 'Ô tô con', NOW()),

-- TP. Hồ Chí Minh (Code 51)
('51K-999.99', (SELECT id FROM province WHERE code = '51' LIMIT 1), 'NGU_QUY', 'Ô tô con', NOW()),
('51K-888.88', (SELECT id FROM province WHERE code = '51' LIMIT 1), 'NGU_QUY', 'Ô tô con', NOW()),
('51L-123.45', (SELECT id FROM province WHERE code = '51' LIMIT 1), 'SANH_TIEN', 'Ô tô con', NOW()),
('51K-688.68', (SELECT id FROM province WHERE code = '51' LIMIT 1), 'LOC_PHAT', 'Ô tô con', NOW()),
('51K-777.77', (SELECT id FROM province WHERE code = '51' LIMIT 1), 'NGU_QUY', 'Ô tô con', NOW()),

-- Đà Nẵng (Code 43)
('43A-999.99', (SELECT id FROM province WHERE code = '43' LIMIT 1), 'NGU_QUY', 'Ô tô con', NOW()),
('43A-688.88', (SELECT id FROM province WHERE code = '43' LIMIT 1), 'TU_QUY', 'Ô tô con', NOW()),
('43A-567.89', (SELECT id FROM province WHERE code = '43' LIMIT 1), 'SANH_TIEN', 'Ô tô con', NOW()),

-- Bắc Ninh (Code 99)
('99A-999.99', (SELECT id FROM province WHERE code = '99' LIMIT 1), 'NGU_QUY', 'Ô tô con', NOW()),
('99A-686.86', (SELECT id FROM province WHERE code = '99' LIMIT 1), 'LOC_PHAT', 'Ô tô con', NOW()),

-- Quảng Ninh (Code 14)
('14A-888.88', (SELECT id FROM province WHERE code = '14' LIMIT 1), 'NGU_QUY', 'Ô tô con', NOW()),
('14A-797.79', (SELECT id FROM province WHERE code = '14' LIMIT 1), 'THAN_TAI', 'Ô tô con', NOW()),

-- Hải Phòng (Code 15)
('15K-999.99', (SELECT id FROM province WHERE code = '15' LIMIT 1), 'NGU_QUY', 'Ô tô con', NOW()),
('15K-686.86', (SELECT id FROM province WHERE code = '15' LIMIT 1), 'LOC_PHAT', 'Ô tô con', NOW()),

-- Đồng Nai & Bình Dương (Code 60, 61)
('60K-888.88', (SELECT id FROM province WHERE code = '60' LIMIT 1), 'NGU_QUY', 'Ô tô con', NOW()),
('61K-999.99', (SELECT id FROM province WHERE code = '61' LIMIT 1), 'NGU_QUY', 'Ô tô con', NOW())
ON CONFLICT (plate_number) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. BẢNG AUCTION_SESSION: Các phiên đấu giá mẫu (có cột end_price)
-- Trạng thái: LIVE (Đang diễn ra), SOON (Sắp diễn ra), END (Đã kết thúc)
-- -----------------------------------------------------------------------------
INSERT INTO auction_session (
    session_code,
    title,
    number_plate_id,
    start_price,
    current_price,
    end_price,
    step_price,
    deposit_amount,
    start_time,
    end_time,
    status,
    bid_count,
    participant_count,
    created_at,
    updated_at
)
VALUES
-- 1. Đang diễn ra (LIVE) - Biển ngũ quý Hà Nội 30K-999.99
(
    'SES-HN-30K99999',
    'Đấu giá biển số xe ô tô 30K-999.99 (Hà Nội)',
    (SELECT id FROM number_plate WHERE plate_number = '30K-999.99' LIMIT 1),
    40000000,
    750000000,
    0,
    5000000,
    40000000,
    NOW() - INTERVAL '30 MINUTE',
    NOW() + INTERVAL '30 MINUTE',
    'LIVE',
    142,
    38,
    NOW() - INTERVAL '3 DAY',
    NOW()
),

-- 2. Đang diễn ra (LIVE) - Biển ngũ quý TP.HCM 51K-888.88
(
    'SES-HCM-51K88888',
    'Đấu giá biển số xe ô tô 51K-888.88 (TP. Hồ Chí Minh)',
    (SELECT id FROM number_plate WHERE plate_number = '51K-888.88' LIMIT 1),
    40000000,
    520000000,
    0,
    5000000,
    40000000,
    NOW() - INTERVAL '15 MINUTE',
    NOW() + INTERVAL '45 MINUTE',
    'LIVE',
    96,
    27,
    NOW() - INTERVAL '3 DAY',
    NOW()
),

-- 3. Đang diễn ra (LIVE) - Biển ngũ quý Đà Nẵng 43A-999.99
(
    'SES-DN-43A99999',
    'Đấu giá biển số xe ô tô 43A-999.99 (Đà Nẵng)',
    (SELECT id FROM number_plate WHERE plate_number = '43A-999.99' LIMIT 1),
    40000000,
    310000000,
    0,
    5000000,
    40000000,
    NOW() - INTERVAL '10 MINUTE',
    NOW() + INTERVAL '50 MINUTE',
    'LIVE',
    54,
    19,
    NOW() - INTERVAL '2 DAY',
    NOW()
),

-- 4. Sắp diễn ra (SOON) - Biển ngũ quý 8 Hà Nội 30K-888.88
(
    'SES-HN-30K88888',
    'Đấu giá biển số xe ô tô 30K-888.88 (Hà Nội)',
    (SELECT id FROM number_plate WHERE plate_number = '30K-888.88' LIMIT 1),
    40000000,
    40000000,
    0,
    5000000,
    40000000,
    NOW() + INTERVAL '2 HOUR',
    NOW() + INTERVAL '3 HOUR',
    'SOON',
    0,
    45,
    NOW() - INTERVAL '1 DAY',
    NOW()
),

-- 5. Sắp diễn ra (SOON) - Biển sảnh tiến Hà Nội 30K-567.89
(
    'SES-HN-30K56789',
    'Đấu giá biển số xe ô tô 30K-567.89 (Hà Nội)',
    (SELECT id FROM number_plate WHERE plate_number = '30K-567.89' LIMIT 1),
    40000000,
    40000000,
    0,
    5000000,
    40000000,
    NOW() + INTERVAL '5 HOUR',
    NOW() + INTERVAL '6 HOUR',
    'SOON',
    0,
    23,
    NOW() - INTERVAL '1 DAY',
    NOW()
),

-- 6. Sắp diễn ra (SOON) - Biển ngũ quý TP.HCM 51K-999.99
(
    'SES-HCM-51K99999',
    'Đấu giá biển số xe ô tô 51K-999.99 (TP. Hồ Chí Minh)',
    (SELECT id FROM number_plate WHERE plate_number = '51K-999.99' LIMIT 1),
    40000000,
    40000000,
    0,
    5000000,
    40000000,
    NOW() + INTERVAL '1 DAY',
    NOW() + INTERVAL '1 DAY' + INTERVAL '1 HOUR',
    'SOON',
    0,
    56,
    NOW() - INTERVAL '1 DAY',
    NOW()
),

-- 7. Sắp diễn ra (SOON) - Biển ngũ quý Bắc Ninh 99A-999.99
(
    'SES-BN-99A99999',
    'Đấu giá biển số xe ô tô 99A-999.99 (Bắc Ninh)',
    (SELECT id FROM number_plate WHERE plate_number = '99A-999.99' LIMIT 1),
    40000000,
    40000000,
    0,
    5000000,
    40000000,
    NOW() + INTERVAL '2 DAY',
    NOW() + INTERVAL '2 DAY' + INTERVAL '1 HOUR',
    'SOON',
    0,
    18,
    NOW() - INTERVAL '1 DAY',
    NOW()
),

-- 8. Sắp diễn ra (SOON) - Biển ngũ quý Quảng Ninh 14A-888.88
(
    'SES-QN-14A88888',
    'Đấu giá biển số xe ô tô 14A-888.88 (Quảng Ninh)',
    (SELECT id FROM number_plate WHERE plate_number = '14A-888.88' LIMIT 1),
    40000000,
    40000000,
    0,
    5000000,
    40000000,
    NOW() + INTERVAL '3 DAY',
    NOW() + INTERVAL '3 DAY' + INTERVAL '1 HOUR',
    'SOON',
    0,
    12,
    NOW() - INTERVAL '1 DAY',
    NOW()
),

-- 9. Đã kết thúc (END) - Biển lộc phát Hà Nội 30K-686.86 (end_price = 185.000.000)
(
    'SES-HN-30K68686',
    'Đấu giá biển số xe ô tô 30K-686.86 (Hà Nội)',
    (SELECT id FROM number_plate WHERE plate_number = '30K-686.86' LIMIT 1),
    40000000,
    185000000,
    185000000,
    5000000,
    40000000,
    NOW() - INTERVAL '2 DAY',
    NOW() - INTERVAL '2 DAY' + INTERVAL '1 HOUR',
    'END',
    35,
    15,
    NOW() - INTERVAL '5 DAY',
    NOW() - INTERVAL '2 DAY'
),

-- 10. Đã kết thúc (END) - Biển ngũ quý Hải Phòng 15K-999.99 (end_price = 420.000.000)
(
    'SES-HP-15K99999',
    'Đấu giá biển số xe ô tô 15K-999.99 (Hải Phòng)',
    (SELECT id FROM number_plate WHERE plate_number = '15K-999.99' LIMIT 1),
    40000000,
    420000000,
    420000000,
    5000000,
    40000000,
    NOW() - INTERVAL '1 DAY',
    NOW() - INTERVAL '1 DAY' + INTERVAL '1 HOUR',
    'END',
    78,
    22,
    NOW() - INTERVAL '4 DAY',
    NOW() - INTERVAL '1 DAY'
)
ON CONFLICT (session_code) DO NOTHING;
