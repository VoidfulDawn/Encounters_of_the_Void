package com.voidfuldawn.encountersofthevoid.template;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class TemplatesControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    void contextLoads() {}

    @Test
    @WithMockUser
    void getAll_returns200_halJson() throws Exception {
        mockMvc.perform(get("/api/templates/"))
               .andExpect(status().isOk())
               .andExpect(content().contentTypeCompatibleWith("application/hal+json"));
    }
}
