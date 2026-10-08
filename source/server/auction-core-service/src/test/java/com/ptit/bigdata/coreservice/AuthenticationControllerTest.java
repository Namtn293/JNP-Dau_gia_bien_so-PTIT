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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class AuthenticationControllerTest {

    @Autowired
    private WebApplicationContext context;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private MockMvc mockMvc;

    private static String savedTempToken;
    private static String savedAccessToken;

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
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(nullValue()))
                .andExpect(jsonPath("$.metaData").value(nullValue()));

        // 2. Đăng nhập thông thường
        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setUserName("testuser1");
        loginDTO.setPassword("password123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(nullValue()))
                .andExpect(jsonPath("$.metaData").value(nullValue()))
                .andExpect(jsonPath("$.data").isNotEmpty())
                .andReturn();

        JsonNode responseJson = objectMapper.readTree(result.getResponse().getContentAsString());
        savedAccessToken = responseJson.path("data").asText();
    }

    @Test
    @Order(2)
    void testRegisterDuplicateUsername_ShouldReturnError() throws Exception {
        // Đăng ký lại với username đã tồn tại -> Phải trả về lỗi
        RegisterDTO duplicateDTO = new RegisterDTO();
        duplicateDTO.setUserName("testuser1");
        duplicateDTO.setPassword("password456");
        duplicateDTO.setEmail("another_email@ptit.edu.vn");
        duplicateDTO.setFullName("Nguyen Van B");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(409))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("User already exist"))
                .andExpect(jsonPath("$.data").value(nullValue()))
                .andExpect(jsonPath("$.metaData").value(nullValue()));
    }

    @Test
    @Order(3)
    void testLoginWrongPassword_ShouldReturnError() throws Exception {
        // Đăng nhập với mật khẩu sai -> Phải trả về lỗi 401 kèm message
        LoginDTO wrongPassDTO = new LoginDTO();
        wrongPassDTO.setUserName("testuser1");
        wrongPassDTO.setPassword("wrong_password");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongPassDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Password not correct"))
                .andExpect(jsonPath("$.data").value(nullValue()))
                .andExpect(jsonPath("$.metaData").value(nullValue()));
    }

    @Test
    @Order(4)
    void testGoogleFirstTimeLogin() throws Exception {
        // Đăng nhập Google lần đầu với Mock token
        GoogleLoginDTO googleLoginDTO = new GoogleLoginDTO();
        googleLoginDTO.setIdToken("mock:googleuser@ptit.edu.vn:Google User Test");

        MvcResult result = mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(googleLoginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(nullValue()))
                .andExpect(jsonPath("$.data.isNewUser").value(true))
                .andExpect(jsonPath("$.data.email").value("googleuser@ptit.edu.vn"))
                .andExpect(jsonPath("$.data.tempToken").isNotEmpty())
                .andReturn();

        JsonNode responseJson = objectMapper.readTree(result.getResponse().getContentAsString());
        savedTempToken = responseJson.path("data").path("tempToken").asText();
    }

    @Test
    @Order(5)
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
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(nullValue()))
                .andExpect(jsonPath("$.data").isNotEmpty());
    }

    @Test
    @Order(6)
    void testGoogleSubsequentLogin() throws Exception {
        // Đăng nhập Google ở các lần tiếp theo (phải trả về isNewUser = false và có JWT token)
        GoogleLoginDTO googleLoginDTO = new GoogleLoginDTO();
        googleLoginDTO.setIdToken("mock:googleuser@ptit.edu.vn:Google User Test");

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(googleLoginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(nullValue()))
                .andExpect(jsonPath("$.data.isNewUser").value(false))
                .andExpect(jsonPath("$.data.token").isNotEmpty());
    }

    @Test
    @Order(7)
    void testLoginWithCreatedCredentialsFromGoogle() throws Exception {
        // Đăng nhập bằng username và password đã tạo ở bước hoàn tất đăng ký
        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setUserName("googleuser");
        loginDTO.setPassword("GooglePass123@");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(nullValue()))
                .andExpect(jsonPath("$.data").isNotEmpty());
    }

    @Test
    @Order(8)
    void testLogout() throws Exception {
        // Đăng xuất với token hợp lệ
        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + savedAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(nullValue()));
    }

    @Test
    @Order(9)
    void testGoogleRedirectEndpoint() throws Exception {
        // Kiểm tra redirect sang URL xác thực của Google
        mockMvc.perform(get("/api/auth/google/redirect")
                        .param("state", "test_state_value"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", startsWith("https://accounts.google.com/o/oauth2/v2/auth")));
    }

    @Test
    @Order(10)
    void testGoogleCallbackWithError() throws Exception {
        // Kiểm tra callback khi người dùng hủy hoặc Google trả lỗi
        mockMvc.perform(get("/api/auth/google/callback")
                        .param("error", "access_denied"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", startsWith("http://localhost:5173/auth/google/callback?error=")));
    }

    @Test
    @Order(11)
    void testGoogleCompleteRegistrationAutoGenerateCredentials() throws Exception {
        // Đăng nhập lần đầu với tài khoản Google mới
        GoogleLoginDTO googleLoginDTO = new GoogleLoginDTO();
        googleLoginDTO.setIdToken("mock:autogen_user@ptit.edu.vn:Auto Gen User");

        MvcResult result = mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(googleLoginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isNewUser").value(true))
                .andReturn();

        JsonNode responseJson = objectMapper.readTree(result.getResponse().getContentAsString());
        String tempToken = responseJson.path("data").path("tempToken").asText();

        // Hoàn tất đăng ký mà KHÔNG truyền userName và password (để hệ thống tự sinh)
        CompleteRegistrationDTO completeDTO = new CompleteRegistrationDTO();
        completeDTO.setTempToken(tempToken);
        completeDTO.setFullName("Auto Gen User");
        completeDTO.setPhoneNumber("0988776655");
        completeDTO.setDob(LocalDate.of(1999, 12, 31));
        completeDTO.setAddress("PTIT Km10");

        mockMvc.perform(post("/api/auth/google/complete-registration")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isNotEmpty());
    }
}
