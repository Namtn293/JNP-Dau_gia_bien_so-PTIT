package com.auction.model;

public record AvailablePlateInfo(
        String plateNumber,
        String provinceName,
        String plateType,
        String vehicleType) {

    @Override
    public String toString() {
        if (provinceName != null && !provinceName.isBlank()) {
            return plateNumber + " — " + provinceName;
        }
        return plateNumber;
    }
}
