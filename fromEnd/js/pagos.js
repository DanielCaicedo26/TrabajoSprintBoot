document.addEventListener('DOMContentLoaded', function () {
    const API_BASE = 'http://localhost:8080'; // Cambia esta URL si tu backend está en otro lado
    const lista = document.getElementById('pagos-lista');

    // Cargar detalles de venta para el selector
    async function cargarDetallesVenta() {
        try {
            const response = await fetch(`${API_BASE}/api/detalles_venta`);
            if (!response.ok) {
                throw new Error('Error al cargar detalles de venta');
            }
            const detalles = await response.json();
            
            // Actualizar selectores de detalles de venta
            const selectores = document.querySelectorAll('.selector-detalle-venta');
            selectores.forEach(selector => {
                selector.innerHTML = '<option value="">Seleccione un detalle de venta</option>';
                detalles.forEach(detalle => {
                    const option = document.createElement('option');
                    option.value = detalle.id;
                    option.textContent = `ID: ${detalle.id} - Producto: ${detalle.producto.nombre} - Subtotal: $${detalle.subtotal.toFixed(2)}`;
                    option.dataset.subtotal = detalle.subtotal;
                    selector.appendChild(option);
                });
            });
        } catch (error) {
            console.error('Error al cargar detalles de venta:', error);
        }
    }

    function cargarPagos() {
        fetch(`${API_BASE}/api/pagos`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar pagos: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                lista.innerHTML = '';
                if (data.length === 0) {
                    lista.innerHTML = '<li class="list-group-item">No hay pagos disponibles.</li>';
                } else {
                    data.forEach(pago => {
                        const li = document.createElement('li');
                        li.className = 'list-group-item';
                        
                        // Formatear la fecha si existe
                        let fechaFormateada = 'N/A';
                        if (pago.fechaPago) {
                            try {
                                const fecha = new Date(pago.fechaPago);
                                fechaFormateada = fecha.toLocaleDateString();
                            } catch (e) {
                                console.error('Error al formatear fecha:', e);
                                fechaFormateada = pago.fechaPago;
                            }
                        }
                        
                        li.innerHTML = `
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>ID Pago:</strong> ${pago.id} | 
                                    <strong>Detalle Venta ID:</strong> ${pago.detalleVenta && pago.detalleVenta.id ? pago.detalleVenta.id : 'N/A'} | 
                                    <strong>Método:</strong> ${pago.metodoPago || 'N/A'} | 
                                    <strong>Monto Total:</strong> $${(pago.montoTotal || 0).toFixed(2)} | 
                                    <strong>Monto Pagado:</strong> $${(pago.monto || 0).toFixed(2)} | 
                                    <strong>Fecha:</strong> ${fechaFormateada}
                                </div>
                            </div>
                        `;
                        lista.appendChild(li);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                lista.innerHTML = `<li class="list-group-item text-danger">Error al cargar pagos: ${error.message}</li>`;
            });
    }

    // Función para actualizar el monto total basado en el detalle de venta seleccionado
    function actualizarMontoTotal(selectElement, montoTotalElement) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        if (selectedOption && selectedOption.dataset.subtotal) {
            montoTotalElement.value = parseFloat(selectedOption.dataset.subtotal).toFixed(2);
        } else {
            montoTotalElement.value = '';
        }
    }

    // Inicializar la página
    cargarPagos();
    cargarDetallesVenta();

    // Evento para actualizar monto total al seleccionar detalle de venta
    document.getElementById('id-detalle-venta').addEventListener('change', function() {
        actualizarMontoTotal(this, document.getElementById('monto-total'));
    });

    document.getElementById('id-detalle-venta-modificar').addEventListener('change', function() {
        actualizarMontoTotal(this, document.getElementById('monto-total-modificar'));
    });

    document.getElementById('crear-pago-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const idDetalleVenta = document.getElementById('id-detalle-venta').value;
        const metodoPago = document.getElementById('metodo-pago').value;
        const montoTotal = document.getElementById('monto-total').value;
        const montoPagado = document.getElementById('monto-pagado').value;
        
        // Validar que el monto pagado no supere el monto total
        if (parseFloat(montoPagado) > parseFloat(montoTotal)) {
            alert('El monto pagado no puede ser mayor que el monto total');
            return;
        }
        
        // Crear fecha actual en formato ISO para el backend
        const ahora = new Date();
        const fechaHoraActual = ahora.toISOString().replace('Z', '');

        fetch(`${API_BASE}/api/pagos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                detalleVenta: { id: parseInt(idDetalleVenta) }, 
                metodoPago: metodoPago, 
                montoTotal: parseFloat(montoTotal),
                monto: parseFloat(montoPagado),
                fechaPago: fechaHoraActual // Añadir fecha y hora actual
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al crear pago: ' + response.status);
            }
            return response.json();
        })
        .then(() => {
            alert('Pago creado exitosamente');
            cargarPagos();
            document.getElementById('crear-pago-form').reset();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al crear pago: ' + error.message);
        });
    });

    document.getElementById('modificar-pago-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const id = document.getElementById('id-pago-modificar').value;
        const idDetalleVenta = document.getElementById('id-detalle-venta-modificar').value;
        const metodoPago = document.getElementById('metodo-pago-modificar').value;
        const montoTotal = document.getElementById('monto-total-modificar').value;
        const montoPagado = document.getElementById('monto-pagado-modificar').value;
        
        // Validar que el monto pagado no supere el monto total
        if (parseFloat(montoPagado) > parseFloat(montoTotal)) {
            alert('El monto pagado no puede ser mayor que el monto total');
            return;
        }
        
        // Crear fecha actual en formato ISO para el backend
        const ahora = new Date();
        const fechaHoraActual = ahora.toISOString().replace('Z', '');

        fetch(`${API_BASE}/api/pagos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                detalleVenta: { id: parseInt(idDetalleVenta) }, 
                metodoPago: metodoPago, 
                montoTotal: parseFloat(montoTotal),
                monto: parseFloat(montoPagado),
                fechaPago: fechaHoraActual // Actualizar fecha y hora
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Pago no encontrado o error al modificar');
            }
            return response.json();
        })
        .then(() => {
            alert('Pago modificado exitosamente');
            cargarPagos();
            document.getElementById('modificar-pago-form').reset();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al modificar pago: ' + error.message);
        });
    });

    document.getElementById('eliminar-pago-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const id = document.getElementById('id-pago-eliminar').value;

        fetch(`${API_BASE}/api/pagos/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Pago no encontrado o error al eliminar');
            }
            alert('Pago eliminado exitosamente');
            cargarPagos();
            document.getElementById('eliminar-pago-form').reset();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al eliminar pago: ' + error.message);
        });
    });
});