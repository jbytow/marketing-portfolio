package com.portfolio.service;

import com.portfolio.entity.User;
import com.portfolio.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(userService, "adminEmails", " Admin@Test.com , second@test.com");
    }

    @Nested
    @DisplayName("isAdmin")
    class IsAdmin {

        @Test
        @DisplayName("matches an allowlist entry regardless of surrounding spaces and case")
        void matchesTrimmedCaseInsensitiveEntry() {
            assertThat(userService.isAdmin("ADMIN@test.com")).isTrue();
            assertThat(userService.isAdmin("admin@test.com")).isTrue();
            assertThat(userService.isAdmin("second@test.com")).isTrue();
        }

        @Test
        @DisplayName("rejects an e-mail that is not on the allowlist")
        void rejectsUnknownEmail() {
            assertThat(userService.isAdmin("someone@test.com")).isFalse();
        }

        @Test
        @DisplayName("does not match on a prefix or suffix of an allowlisted e-mail")
        void rejectsPartialMatch() {
            assertThat(userService.isAdmin("admin@test.com.evil.example")).isFalse();
            assertThat(userService.isAdmin("xadmin@test.com")).isFalse();
        }
    }

    @Nested
    @DisplayName("processOAuthUser")
    class ProcessOAuthUser {

        @Test
        @DisplayName("creates an allowlisted new user as admin")
        void newAllowlistedUserIsAdmin() {
            given(userRepository.findByEmail("ADMIN@test.com")).willReturn(Optional.empty());
            given(userRepository.save(any(User.class))).willAnswer(invocation -> invocation.getArgument(0));

            User user = userService.processOAuthUser("ADMIN@test.com", "Admin", null, "google", "sub-1");

            assertThat(user.getIsAdmin()).isTrue();
        }

        @Test
        @DisplayName("creates an unknown new user as non-admin")
        void newUnknownUserIsNotAdmin() {
            given(userRepository.findByEmail("someone@test.com")).willReturn(Optional.empty());
            given(userRepository.save(any(User.class))).willAnswer(invocation -> invocation.getArgument(0));

            User user = userService.processOAuthUser("someone@test.com", "Someone", null, "google", "sub-2");

            assertThat(user.getIsAdmin()).isFalse();
        }

        @Test
        @DisplayName("demotes a former admin removed from the allowlist on the next login")
        void demotesFormerAdmin() {
            User formerAdmin = User.builder().email("former@test.com").name("Former").isAdmin(true).build();
            given(userRepository.findByEmail("former@test.com")).willReturn(Optional.of(formerAdmin));
            given(userRepository.save(any(User.class))).willAnswer(invocation -> invocation.getArgument(0));

            User user = userService.processOAuthUser("former@test.com", "Former", null, "google", "sub-3");

            assertThat(user.getIsAdmin()).isFalse();
        }
    }
}
