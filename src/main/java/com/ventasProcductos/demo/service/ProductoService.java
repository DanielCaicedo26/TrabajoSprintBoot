package com.ventasProcductos.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ventasProcductos.demo.model.Producto;
import com.ventasProcductos.demo.repository.ProductoRepository;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    // Obtener todos los productos
    public List<Producto> findAll() {
        return productoRepository.findAll();
    }

    // Obtener un producto por ID
    public Optional<Producto> findById(int id) {
        return productoRepository.findById(id);
    }

    // Guardar o actualizar un producto
    public Producto save(Producto producto) {
        return productoRepository.save(producto);
    }

    // Eliminar un producto por ID
    public void deleteById(int id) {
        productoRepository.deleteById(id);
    }

    public List<Producto> findByCategoria(String categoria) {
        return productoRepository.findByCategoria(categoria);
    }

}