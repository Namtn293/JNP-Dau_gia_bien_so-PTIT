package com.ptit.bigdata.coreservice;

import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.NumberPlate;
import com.ptit.bigdata.coreservice.entity.Province;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.enumration.PlateTypeEnum;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.NumberPlateRepository;
import com.ptit.bigdata.coreservice.repository.ProvinceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class AuctionSessionControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ProvinceRepository provinceRepository;

    @Autowired
    private NumberPlateRepository numberPlateRepository;

    @Autowired
    private AuctionSessionRepository auctionSessionRepository;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        auctionSessionRepository.deleteAll();
        numberPlateRepository.deleteAll();
        provinceRepository.deleteAll();
    }

    @Test
    @WithMockUser
    void testGetAuctionSessions() throws Exception {
        Province province = provinceRepository.save(Province.builder()
                .code("30")
                .name("Hà Nội")
                .build());

        NumberPlate numberPlate = numberPlateRepository.save(NumberPlate.builder()
                .plateNumber("30K-999.99")
                .provinceId(province.getId())
                .plateType(PlateTypeEnum.NGU_QUY)
                .vehicleType("Ô tô con")
                .build());

        auctionSessionRepository.save(AuctionSession.builder()
                .sessionCode("SS-30K-99999")
                .title("Đấu giá biển số đẹp Hà Nội 30K-999.99")
                .numberPlateId(numberPlate.getId())
                .startPrice(40_000_000L)
                .currentPrice(40_000_000L)
                .stepPrice(5_000_000L)
                .depositAmount(40_000_000L)
                .startTime(LocalDateTime.now().plusDays(1))
                .endTime(LocalDateTime.now().plusDays(1).plusHours(1))
                .status(AuctionStatusEnum.SOON)
                .participantCount(10L)
                .build());

        // Test with /api/v1/auction/get
        mockMvc.perform(get("/api/v1/auction/get")
                        .param("page", "0")
                        .param("size", "10")
                        .param("status", "SOON"))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].plateNumber", is("30K-999.99")))
                .andExpect(jsonPath("$.data.content[0].provinceName", is("Hà Nội")))
                .andExpect(jsonPath("$.data.content[0].plateType", is("Ngũ quý")))
                .andExpect(jsonPath("$.data.content[0].price", is(40000000)))
                .andExpect(jsonPath("$.data.content[0].stepPrice", is(5000000)))
                .andExpect(jsonPath("$.data.content[0].participantCount", is(10)))
                .andExpect(jsonPath("$.data.content[0].endPrice", is(0)));

        // Test with /v1/auction/get
        mockMvc.perform(get("/v1/auction/get")
                        .param("page", "0")
                        .param("size", "10")
                        .param("status", "SOON"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)));
    }
}
