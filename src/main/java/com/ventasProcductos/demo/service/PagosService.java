package com.ventasProcductos.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ventasProcductos.demo.model.DetallesVenta;
import com.ventasProcductos.demo.model.Pagos;
import com.ventasProcductos.demo.repository.DetallesVentaRepository;
import com.ventasProcductos.demo.repository.PagosRepository;

@Service
public class PagosService {

    @Autowired
    private PagosRepository pagosRepository;
    
    @Autowired
    private DetallesVentaRepository detalleVentaRepository;

    // Obtener todos los pagos
    public List<Pagos> findAll() {
        return pagosRepository.findAll();
    }

    // Obtener un pago por ID
    public Optional<Pagos> findById(int id) {
        return pagosRepository.findById(id);
    }

    // Guardar o actualizar un pago
    public Pagos save(Pagos pago) {
        // Establecer la fecha actual si no se proporciona
        if (pago.getFechaPago() == null) {
            pago.setFechaPago(LocalDateTime.now());
        }
        
        // Si existe el detalle de venta, obtener y establecer el monto total
        if (pago.getDetalleVenta() != null && pago.getDetalleVenta().getId() > 0) {
            Optional<DetallesVenta> detalleOpt = detalleVentaRepository.findById(pago.getDetalleVenta().getId());
            if (detalleOpt.isPresent()) {
                DetallesVenta detalle = detalleOpt.get();
                
                // Establecer el monto total si no se proporcionó
                if (pago.getMontoTotal() <= 0) {
                    pago.setMontoTotal(detalle.getSubtotal());
                }
            }
        }
        
        return pagosRepository.save(pago);
    }

    // Eliminar un pago por ID
    public void deleteById(int id) {
        pagosRepository.deleteById(id);
    }
}