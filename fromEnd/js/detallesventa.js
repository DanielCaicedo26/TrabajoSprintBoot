const API_BASE = 'http://localhost:8080'; // Cambia esta URL si tu backend está en otro lado

document.addEventListener('DOMContentLoaded', function () {
    const listaDetallesVenta = document.getElementById('detalles-venta-lista');
    const selectProducto = document.getElementById('id-producto');
    const selectProductoModificar = document.getElementById('id-producto-modificar');
    const cantidadInput = document.getElementById('cantidad');
    const precioInput = document.getElementById('precio');
    
    // Almacenar información de productos
    let productosInfo = [];
    
    // Cargar detalles de venta
    function cargarDetallesVenta() {
        fetch(`${API_BASE}/api/detalles_venta`)
            .then(res => res.json())
            .then(data => {
                listaDetallesVenta.innerHTML = '';
                data.forEach(detalle => {
                    const li = document.createElement('li');
                    li.textContent = `ID: ${detalle.id}, Venta: ${detalle.venta.id}, Producto: ${detalle.producto.nombre}, Cantidad: ${detalle.cantidad}, Subtotal: $${detalle.subtotal.toFixed(2)}`;
                    listaDetallesVenta.appendChild(li);
                });
            })
            .catch(error => console.error('Error al cargar detalles de venta:', error));
    }
    
    // Cargar productos disponibles
    function cargarProductosDisponibles() {
        fetch(`${API_BASE}/api/productos`)
            .then(res => res.json())
            .then(productos => {
                // Guardar información de productos
                productosInfo = productos;
                
                // Limpiar opciones existentes
                selectProducto.innerHTML = '<option value="">Seleccione un producto disponible</option>';
                selectProductoModificar.innerHTML = '<option value="">Seleccione un producto disponible</option>';
                
                // Agregar opciones para cada producto disponible
                productos.forEach(producto => {
                    if (producto.cantidad > 0) {
                        const option = document.createElement('option');
                        option.value = producto.id;
                        option.textContent = `${producto.nombre} - $${producto.precio.toFixed(2)} (${producto.cantidad} disponibles)`;
                        option.dataset.precio = producto.precio;
                        
                        const optionModificar = option.cloneNode(true);
                        
                        selectProducto.appendChild(option);
                        selectProductoModificar.appendChild(optionModificar);
                    }
                });
            })
            .catch(error => console.error('Error al cargar productos disponibles:', error));
    }
    
    // Actualizar precio automáticamente cuando se selecciona un producto
    selectProducto.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption && selectedOption.dataset.precio) {
            precioInput.value = selectedOption.dataset.precio;
            // Si hay una cantidad, actualizar el subtotal
            if (cantidadInput.value) {
                actualizarSubtotal();
            }
        } else {
            precioInput.value = '';
        }
    });
    
    // Actualizar subtotal cuando cambia la cantidad
    cantidadInput.addEventListener('input', actualizarSubtotal);
    
    function actualizarSubtotal() {
        const cantidad = parseInt(cantidadInput.value) || 0;
        const precio = parseFloat(precioInput.value) || 0;
        const subtotal = document.getElementById('subtotal');
        if (subtotal) {
            subtotal.value = (cantidad * precio).toFixed(2);
        }
    }
    
    // Configurar eventos similares para el formulario de modificación
    const cantidadModificarInput = document.getElementById('cantidad-modificar');
    const precioModificarInput = document.getElementById('precio-modificar');
    
    selectProductoModificar.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption && selectedOption.dataset.precio) {
            precioModificarInput.value = selectedOption.dataset.precio;
            if (cantidadModificarInput.value) {
                actualizarSubtotalModificar();
            }
        } else {
            precioModificarInput.value = '';
        }
    });
    
    cantidadModificarInput.addEventListener('input', actualizarSubtotalModificar);
    
    function actualizarSubtotalModificar() {
        const cantidad = parseInt(cantidadModificarInput.value) || 0;
        const precio = parseFloat(precioModificarInput.value) || 0;
        const subtotal = document.getElementById('subtotal-modificar');
        if (subtotal) {
            subtotal.value = (cantidad * precio).toFixed(2);
        }
    }
    
    // Inicializar la página
    cargarDetallesVenta();
    cargarProductosDisponibles();
    
    // Crear detalle de venta
    document.getElementById('crear-detalle-venta-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const idVenta = document.getElementById('id-venta').value;
        const idProducto = document.getElementById('id-producto').value;
        const cantidad = document.getElementById('cantidad').value;
        const precio = document.getElementById('precio').value;
        const subtotal = cantidad * precio;
        
        fetch(`${API_BASE}/api/detalles_venta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                venta: { id: parseInt(idVenta) },
                producto: { id: parseInt(idProducto) },
                cantidad: parseInt(cantidad),
                subtotal: parseFloat(subtotal)
            })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Error al crear detalle de venta');
            }
            return res.json();
        })
        .then(() => {
            cargarDetallesVenta();
            document.getElementById('crear-detalle-venta-form').reset();
            // Recargar productos disponibles después de crear un detalle
            cargarProductosDisponibles();
        })
        .catch(error => {
            console.error('Error al crear detalle de venta:', error);
            alert(error.message);
        });
    });
    
    // Modificar detalle de venta
    document.getElementById('modificar-detalle-venta-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('id-detalle-venta-modificar').value;
        const idVenta = document.getElementById('id-venta-modificar').value;
        const idProducto = document.getElementById('id-producto-modificar').value;
        const cantidad = document.getElementById('cantidad-modificar').value;
        const precio = document.getElementById('precio-modificar').value;
        const subtotal = cantidad * precio;
        
        fetch(`${API_BASE}/api/detalles_venta/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                venta: { id: parseInt(idVenta) },
                producto: { id: parseInt(idProducto) },
                cantidad: parseInt(cantidad),
                subtotal: parseFloat(subtotal)
            })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Detalle de venta no encontrado');
            }
            return res.json();
        })
        .then(() => {
            cargarDetallesVenta();
            document.getElementById('modificar-detalle-venta-form').reset();
            // Recargar productos disponibles después de modificar un detalle
            cargarProductosDisponibles();
        })
        .catch(error => {
            console.error('Error al modificar detalle de venta:', error);
            alert(error.message);
        });
    });
    
    // Eliminar detalle de venta
    document.getElementById('eliminar-detalle-venta-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('id-detalle-venta-eliminar').value;
        
        fetch(`${API_BASE}/api/detalles_venta/${id}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (res.ok) {
                cargarDetallesVenta();
                document.getElementById('eliminar-detalle-venta-form').reset();
                // Recargar productos disponibles después de eliminar un detalle
                cargarProductosDisponibles();
            } else {
                throw new Error('Detalle de venta no encontrado');
            }
        })
        .catch(error => {
            console.error('Error al eliminar detalle de venta:', error);
            alert(error.message);
        });
    });
});
