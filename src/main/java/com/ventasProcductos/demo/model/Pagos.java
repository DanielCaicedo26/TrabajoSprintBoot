package com.ventasProcductos.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import java.time.LocalDateTime;

@Entity
public class Pagos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private int id;

    @ManyToOne
    @JoinColumn(name = "id_detalle_venta")
    private DetallesVenta detalleVenta;  // Cambiado de Venta a DetalleVenta

    @Column(name = "metodo_pago", nullable = false)
    private String metodoPago;

    @Column(name = "monto_total", nullable = false)
    private double montoTotal;  // Monto total del detalle de venta

    @Column(name = "monto", nullable = false)
    private double monto;  // Monto pagado

    @Column(name = "fecha_pago", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaPago;

    // Getters y Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public DetallesVenta getDetalleVenta() {
        return detalleVenta;
    }

    public void setDetalleVenta(DetallesVenta detalleVenta) {
        this.detalleVenta = detalleVenta;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public double getMontoTotal() {
        return montoTotal;
    }

    public void setMontoTotal(double montoTotal) {
        this.montoTotal = montoTotal;
    }

    public double getMonto() {
        return monto;
    }

    public void setMonto(double monto) {
        this.monto = monto;
    }

    public LocalDateTime getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(LocalDateTime fechaPago) {
        this.fechaPago = fechaPago;
    }
}