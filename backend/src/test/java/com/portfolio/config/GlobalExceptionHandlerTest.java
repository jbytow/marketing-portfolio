package com.portfolio.config;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.portfolio.controller.PostController;
import com.portfolio.security.JwtService;
import com.portfolio.service.PostService;
import com.portfolio.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = PostController.class,
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration.class
        }
)
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("GlobalExceptionHandler")
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PostService postService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserService userService;

    private final Logger handlerLogger = (Logger) LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private final ListAppender<ILoggingEvent> logEvents = new ListAppender<>();

    @BeforeEach
    void attachLogAppender() {
        logEvents.start();
        handlerLogger.addAppender(logEvents);
    }

    @AfterEach
    void detachLogAppender() {
        handlerLogger.detachAppender(logEvents);
    }

    @Test
    @DisplayName("GET on an unknown path returns 404 and logs one WARN line without a stack trace")
    void unknownPathReturns404WithoutStackTrace() throws Exception {
        mockMvc.perform(get("/api/.env").header("X-Forwarded-For", "203.0.113.7, 10.0.0.1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("not found"));

        List<ILoggingEvent> events = logEvents.list;
        assertThat(events).hasSize(1);
        ILoggingEvent event = events.get(0);
        assertThat(event.getLevel()).isEqualTo(Level.WARN);
        assertThat(event.getThrowableProxy()).isNull();
        assertThat(event.getFormattedMessage())
                .contains("GET")
                .contains("/api/.env")
                .contains("203.0.113.7")
                .doesNotContain("Unexpected error");
    }
}
