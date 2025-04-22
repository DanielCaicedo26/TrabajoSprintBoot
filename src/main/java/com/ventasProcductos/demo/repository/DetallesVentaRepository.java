package com.ventasProcductos.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ventasProcductos.demo.model.DetallesVenta;

@Repository
public interface DetallesVentaRepository extends JpaRepository<DetallesVenta, Integer> {
    List<DetallesVenta> findByVentaId(int idVenta);
}