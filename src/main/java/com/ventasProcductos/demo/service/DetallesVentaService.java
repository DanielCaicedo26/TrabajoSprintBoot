package com.ventasProcductos.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ventasProcductos.demo.model.DetallesVenta;
import com.ventasProcductos.demo.model.Producto;
import com.ventasProcductos.demo.model.Venta;
import com.ventasProcductos.demo.repository.DetallesVentaRepository;
import com.ventasProcductos.demo.repository.ProductoRepository;
import com.ventasProcductos.demo.repository.VentaRepository;

@Service
public class DetallesVentaService {

    @Autowired
    private DetallesVentaRepository detallesVentaRepository;
    
    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private VentaRepository ventaRepository;

    // Obtener todos los detalles de venta
    public List<DetallesVenta> findAll() {
        return detallesVentaRepository.findAll();
    }

    // Obtener un detalle de venta por ID
    public Optional<DetallesVenta> findById(int id) {
        return detallesVentaRepository.findById(id);
    }

    // Guardar o actualizar un detalle de venta
    public DetallesVenta save(DetallesVenta detallesVenta) {
        return detallesVentaRepository.save(detallesVenta);
    }

    // Eliminar un detalle de venta por ID
    public void deleteById(int id) {
        detallesVentaRepository.deleteById(id);
    }
    
    // Agregar producto a una venta
    public DetallesVenta agregarProductoAVenta(int idVenta, int idProducto, int cantidad) {
        // Verificar que la venta existe
        Optional<Venta> ventaOpt = ventaRepository.findById(idVenta);
        if (!ventaOpt.isPresent()) {
            throw new RuntimeException("La venta con ID " + idVenta + " no existe");
        }
        
        // Verificar que el producto existe
        Optional<Producto> productoOpt = productoRepository.findById(idProducto);
        if (!productoOpt.isPresent()) {
            throw new RuntimeException("El producto con ID " + idProducto + " no existe");
        }
        
        Producto producto = productoOpt.get();
        
        // Verificar que hay suficiente stock
        if (producto.getCantidad() < cantidad) {
            throw new RuntimeException("No hay suficiente stock. Stock disponible: " + producto.getCantidad());
        }
        
        // Calcular subtotal
        double subtotal = producto.getPrecio() * cantidad;
        
        // Crear detalle de venta
        DetallesVenta detalleVenta = new DetallesVenta();
        detalleVenta.setVenta(ventaOpt.get());
        detalleVenta.setProducto(producto);
        detalleVenta.setCantidad(cantidad);
        detalleVenta.setSubtotal(subtotal);
        
        // Actualizar stock del producto
        producto.setCantidad(producto.getCantidad() - cantidad);
        productoRepository.save(producto);
        
        return detallesVentaRepository.save(detalleVenta);
    }
    
    // Obtener el total de una venta
    public double calcularTotalVenta(int idVenta) {
        List<DetallesVenta> detalles = detallesVentaRepository.findByVentaId(idVenta);
        return detalles.stream()
                .mapToDouble(DetallesVenta::getSubtotal)
                .sum();
    }
    
    // Obtener detalles de venta por ID de venta
    public List<DetallesVenta> findByVentaId(int idVenta) {
        return detallesVentaRepository.findByVentaId(idVenta);
    }
}