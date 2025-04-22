package com.ventasProcductos.demo.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ventasProcductos.demo.model.DetallesVenta;
import com.ventasProcductos.demo.model.Producto;
import com.ventasProcductos.demo.service.DetallesVentaService;
import com.ventasProcductos.demo.service.ProductoService;

@RestController
@RequestMapping("/api/detalles_venta")
public class DetallesVentaController {

    @Autowired
    private DetallesVentaService detallesVentaService;
    
    @Autowired
    private ProductoService productoService;

    @GetMapping
    public List<DetallesVenta> getAllDetallesVenta() {
        return detallesVentaService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetallesVenta> getDetallesVentaById(@PathVariable int id) {
        Optional<DetallesVenta> detallesVenta = detallesVentaService.findById(id);
        return detallesVenta.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public DetallesVenta createDetallesVenta(@RequestBody DetallesVenta detallesVenta) {
        return detallesVentaService.save(detallesVenta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetallesVenta> updateDetallesVenta(@PathVariable int id, @RequestBody DetallesVenta detallesVenta) {
        if (!detallesVentaService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        detallesVenta.setId(id);
        return ResponseEntity.ok(detallesVentaService.save(detallesVenta));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDetallesVenta(@PathVariable int id) {
        if (!detallesVentaService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        detallesVentaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/productos-disponibles")
    public List<Producto> getProductosDisponibles() {
        return productoService.findAll().stream()
                .filter(p -> p.getCantidad() > 0)
                .collect(Collectors.toList());
    }
}