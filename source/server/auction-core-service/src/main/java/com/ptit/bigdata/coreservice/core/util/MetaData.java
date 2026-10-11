package com.ptit.bigdata.coreservice.core.util;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"total", "totalPage", "page", "pageSize"})
public class MetaData {
    private Long total;
    private Integer totalPage;
    private Integer page;
    private Integer pageSize;

    public static MetaData of(long total, int totalPage, int page, int pageSize) {
        return MetaData.builder()
                .total(total)
                .totalPage(totalPage)
                .page(page)
                .pageSize(pageSize)
                .build();
    }

    public static MetaData from(Page<?> page) {
        if (page == null) {
            return null;
        }
        return MetaData.builder()
                .total(page.getTotalElements())
                .totalPage(page.getTotalPages())
                .page(page.getNumber() + 1)
                .pageSize(page.getSize())
                .build();
    }
}
