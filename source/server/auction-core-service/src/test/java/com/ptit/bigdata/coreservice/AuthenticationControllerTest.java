package com.ptit.bigdata.coreservice;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ptit.bigdata.coreservice.core.auth.model.dto.CompleteRegistrationDTO;
import com.ptit.bigdata.coreservice.core.auth.model.dto.GoogleLoginDTO;
import com.ptit.bigdata.coreservice.core.auth.model.dto.LoginDTO;
import com.ptit.bigdata.coreservice.core.auth.model.dto.RegisterDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class AuthenticationControllerTest {

    @Autowired
    private WebApplicationContext context;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private MockMvc mockMvc;

    private static String savedTempToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    @Order(1)
    void testStandardRegisterAndLogin() throws Exception {
        // 1. Đăng ký thông thường
        RegisterDTO registerDTO = new RegisterDTO();
        registerDTO.setUserName("testuser1");
        registerDTO.setPassword("password123");
        registerDTO.setEmail("testuser1@ptit.edu.vn");
        registerDTO.setFullName("Nguyen Van A");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Register success"));

        // 2. Đăng nhập thông thường
        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setUserName("testuser1");
        loginDTO.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("200"))
                .andExpect(jsonPath("$.data").isNotEmpty());
    }

    @Test
    @Order(2)
    void testGoogleFirstTimeLogin() throws Exception {
        // Đăng nhập Google lần đầu với Mock token
        GoogleLoginDTO googleLoginDTO = new GoogleLoginDTO();
        googleLoginDTO.setIdToken("mock:googleuser@ptit.edu.vn:Google User Test");

        MvcResult result = mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(googleLoginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isNewUser").value(true))
                .andExpect(jsonPath("$.data.email").value("googleuser@ptit.edu.vn"))
                .andExpect(jsonPath("$.data.tempToken").isNotEmpty())
                .andReturn();

        JsonNode responseJson = objectMapper.readTree(result.getResponse().getContentAsString());
        savedTempToken = responseJson.path("data").path("tempToken").asText();
    }

    @Test
    @Order(3)
    void testGoogleCompleteRegistration() throws Exception {
        // Hoàn tất thông tin đăng ký cho tài khoản Google
        CompleteRegistrationDTO completeDTO = new CompleteRegistrationDTO();
        completeDTO.setTempToken(savedTempToken);
        completeDTO.setUserName("googleuser");
        completeDTO.setPassword("GooglePass123@");
        completeDTO.setFullName("Google User Test");
        completeDTO.setPhoneNumber("0912345678");
        completeDTO.setDob(LocalDate.of(2000, 1, 1));
        completeDTO.setAddress("Km10 Nguyen Trai, Ha Dong, Ha Noi");

        mockMvc.perform(post("/api/auth/google/complete-registration")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isNotEmpty());
    }

    @Test
    @Order(4)
    void testGoogleSubsequentLogin() throws Exception {
        // Đăng nhập Google ở các lần tiếp theo (phải trả về isNewUser = false và có JWT token)
        GoogleLoginDTO googleLoginDTO = new GoogleLoginDTO();
        googleLoginDTO.setIdToken("mock:googleuser@ptit.edu.vn:Google User Test");

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(googleLoginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isNewUser").value(false))
                .andExpect(jsonPath("$.data.token").isNotEmpty());
    }

    @Test
    @Order(5)
    void testLoginWithCreatedCredentialsFromGoogle() throws Exception {
        // Đăng nhập bằng username và password đã tạo ở bước hoàn tất đăng ký
        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setUserName("googleuser");
        loginDTO.setPassword("GooglePass123@");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isNotEmpty());
    }
}
