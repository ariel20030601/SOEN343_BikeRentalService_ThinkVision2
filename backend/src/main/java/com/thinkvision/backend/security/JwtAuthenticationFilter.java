package com.thinkvision.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtils jwtUtils, CustomUserDetailsService userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    private static final List<String> SKIP_PATH_PREFIXES = List.of(
            "/users/register",
            "/users/login",
            "/api/operator/",
            "/api/dashboard/",
            "/api/bikes/reserve",
            "/api/bikes/checkout",
            "/api/stations",
            "/api/bikes/return"
    );

    private boolean shouldSkip(HttpServletRequest request) {
        String path = request.getServletPath();
        for (String p : SKIP_PATH_PREFIXES) {
            if (path.startsWith(p)) return true;
        }
        return false;
    }


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (shouldSkip(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // existing JWT extraction/validation and SecurityContext population
        } catch (Exception ex) {
            // don't throw: send 401/403 or just continue depending on desired behavior
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Invalid or missing token");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
