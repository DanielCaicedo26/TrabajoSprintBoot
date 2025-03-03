package com.ventasProcductos.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ventasProcductos.demo.model.Detalles_Venta;
import com.ventasProcductos.demo.repository.DetallesVentaRepository;

@Service
public class DetallesVentaService {

    @Autowired
    private DetallesVentaRepository detallesVentaRepository;

    // Obtener todos los detalles de venta
    public List<Detalles_Venta> findAll() {
        return detallesVentaRepository.findAll();
    }

    // Obtener un detalle de venta por ID
    public Optional<Detalles_Venta> findById(int id) {
        return detallesVentaRepository.findById(id);
    }

    // Guardar o actualizar un detalle de venta
    public Detalles_Venta save(Detalles_Venta detallesVenta) {
        return detallesVentaRepository.save(detallesVenta);
    }

    // Eliminar un detalle de venta por ID
    public void deleteById(int id) {
        detallesVentaRepository.deleteById(id);
    }
}