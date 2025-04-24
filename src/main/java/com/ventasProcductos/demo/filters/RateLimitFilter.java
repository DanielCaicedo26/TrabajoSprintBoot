package com.ventasProcductos.demo.filters;

import jakarta.servlet.Filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter implements Filter {

    private final Map<String, RequestInfo> requestMap = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS = 30;
    private static final long TIME_WINDOW_MS = 60_000; // 1 minuto

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        String ip = request.getRemoteAddr();
        long now = Instant.now().toEpochMilli();

        RequestInfo info = requestMap.getOrDefault(ip, new RequestInfo(0, now));

        if (now - info.timestamp > TIME_WINDOW_MS) {
            info = new RequestInfo(1, now); // reinicia contador
        } else {
            if (info.count >= MAX_REQUESTS) {
                ((HttpServletResponse) response).setStatus(429);
                response.getWriter().write("Demasiadas solicitudes. Intenta más tarde.");
                return;
            }
            info.count++;
        }

        requestMap.put(ip, info);
        chain.doFilter(request, response);
    }

    private static class RequestInfo {
        int count;
        long timestamp;

        RequestInfo(int count, long timestamp) {
            this.count = count;
            this.timestamp = timestamp;
        }
    }
}
