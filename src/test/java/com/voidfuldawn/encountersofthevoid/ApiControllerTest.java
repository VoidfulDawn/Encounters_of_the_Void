package com.voidfuldawn.encountersofthevoid;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class ApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void statusEndpointReturns200WithWorkingMessage() throws Exception {
        mockMvc.perform(get("/api/v1/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Everything is working."));
    }

    @Test
    void homeEndpointReturnsHalJsonWithSelfLink() throws Exception {
        mockMvc.perform(get("/api/v1/home"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/hal+json"))
                .andExpect(jsonPath("$._links.self.href").isNotEmpty())
                .andExpect(jsonPath("$._links.status.href").isNotEmpty());
    }

    @Test
    void homeEndpointReturnsStatusField() throws Exception {
        mockMvc.perform(get("/api/v1/home"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Everything is working."));
    }
}
