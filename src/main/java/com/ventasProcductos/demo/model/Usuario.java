package com.ventasProcductos.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    @Pattern(regexp = "^[^\\s]+$", message = "El nombre no puede contener espacios en blanco")
    private String nombre;
    
    @NotBlank(message = "El apellido no puede estar vacío")
    @Size(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres")
    @Pattern(regexp = "^[^\\s]+$", message = "El apellido no puede contener espacios en blanco")
    private String apellido;
    
    @NotNull(message = "El número de documento es obligatorio")
    @Min(value = 100000, message = "El número de documento debe tener al menos 6 dígitos")
    @Max(value = 999999999, message = "El número de documento no puede exceder 9 dígitos")
    @Column(unique = true)
    private int numeroDocumento;
    
    @NotBlank(message = "El número de celular no puede estar vacío")
    @Pattern(regexp = "^\\+57[0-9]{10}$", message = "El número de celular debe tener el formato +57 seguido de 10 dígitos sin espacios")
    private String numeroCelular;
    
    // Getters y Setters
    public String getNumeroCelular() {
        return numeroCelular;
    }
    
    public void setNumeroCelular(String numeroCelular) {
        this.numeroCelular = numeroCelular;
    }
    
    public String getApellido() {
        return apellido;
    }
    
    public void setApellido(String apellido) {
        this.apellido = apellido;
    }
    
    public int getNumeroDocumento() {
        return numeroDocumento;
    }
    
    public void setNumeroDocumento(int numeroDocumento) {
        this.numeroDocumento = numeroDocumento;
    }
    
    // Constructor sin argumentos
    public Usuario() {
    }
    
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}