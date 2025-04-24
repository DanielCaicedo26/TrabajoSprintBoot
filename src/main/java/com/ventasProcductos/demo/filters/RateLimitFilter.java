package com.ventasProcductos.demo.filters;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter implements Filter {

    private final Map<String, RequestInfo> requestMap = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS = 30; // Peticiones por minuto
    private static final int MAX_WRITE_REQUESTS = 10; // Máximo de operaciones de escritura por minuto
    private static final long TIME_WINDOW_MS = 60_000; // 1 minuto

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String ip = request.getRemoteAddr();
        String method = httpRequest.getMethod();
        long now = Instant.now().toEpochMilli();

        RequestInfo info = requestMap.getOrDefault(ip, new RequestInfo(0, 0, now));

        // Reiniciar contadores si ha pasado el tiempo de ventana
        if (now - info.timestamp > TIME_WINDOW_MS) {
            info = new RequestInfo(0, 0, now);
        }

        boolean isWriteOperation = "POST".equals(method) || "PUT".equals(method) || "DELETE".equals(method);
        
        // Incrementar contador general
        info.totalCount++;
        
        // Incrementar contador de escritura si aplica
        if (isWriteOperation) {
            info.writeCount++;
        }

        // Verificar límites
        if (info.totalCount > MAX_REQUESTS) {
            httpResponse.setStatus(429); // Too Many Requests
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"error\": \"Demasiadas solicitudes. Intenta más tarde.\"}");
            return;
        }
        
        if (isWriteOperation && info.writeCount > MAX_WRITE_REQUESTS) {
            httpResponse.setStatus(429);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"error\": \"Demasiadas operaciones de escritura. Intenta más tarde.\"}");
            return;
        }

        // Actualizar el mapa de peticiones
        requestMap.put(ip, info);
        
        chain.doFilter(request, response);
    }

    private static class RequestInfo {
        int totalCount;
        int writeCount;
        long timestamp;

        RequestInfo(int totalCount, int writeCount, long timestamp) {
            this.totalCount = totalCount;
            this.writeCount = writeCount;
            this.timestamp = timestamp;
        }
    }
}