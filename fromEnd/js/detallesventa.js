const API_BASE = 'http://localhost:8080'; // Cambia esta URL si tu backend está en otro lado

document.addEventListener('DOMContentLoaded', function () {
    const listaDetallesVenta = document.getElementById('detalles-venta-lista');
    const productosContainer = document.getElementById('productos-container');
    const agregarProductoBtn = document.getElementById('agregar-producto');
    const subtotalTotalInput = document.getElementById('subtotal-total');
    const crearDetalleVentaForm = document.getElementById('crear-detalle-venta-form');
    const modificarDetalleVentaForm = document.getElementById('modificar-detalle-venta-form');
    const eliminarDetalleVentaForm = document.getElementById('eliminar-detalle-venta-form');
    
    let productosInfo = [];
    let contadorProductos = 0;

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

    function cargarProductosDisponibles() {
        fetch(`${API_BASE}/api/productos`)
            .then(res => res.json())
            .then(productos => {
                productosInfo = productos;
                actualizarSelectoresProductos();
            })
            .catch(error => console.error('Error al cargar productos disponibles:', error));
    }

    function actualizarSelectoresProductos() {
        const selectores = document.querySelectorAll('.id-producto');
        selectores.forEach(selector => {
            selector.innerHTML = '<option value="">Seleccione un producto disponible</option>';
            productosInfo.forEach(producto => {
                if (producto.cantidad > 0) {
                    const option = document.createElement('option');
                    option.value = producto.id;
                    option.textContent = `${producto.nombre} - $${producto.precio.toFixed(2)} (${producto.cantidad} disponibles)`;
                    option.dataset.precio = producto.precio;
                    option.dataset.stock = producto.cantidad;
                    selector.appendChild(option);
                }
            });
        });
    }

    function crearProductoHTML() {
        contadorProductos++;
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto';
        productoDiv.innerHTML = `
            <select class="id-producto" required>
                <option value="">Seleccione un producto disponible</option>
            </select>
            <input type="number" class="cantidad" placeholder="Cantidad" required min="1">
            <input type="number" class="precio" placeholder="Precio unitario" readonly>
            <input type="number" class="subtotal" placeholder="Subtotal" readonly>
            <button type="button" class="eliminar-producto">Eliminar</button>
        `;
        productosContainer.appendChild(productoDiv);

        const select = productoDiv.querySelector('.id-producto');
        const cantidad = productoDiv.querySelector('.cantidad');
        const precio = productoDiv.querySelector('.precio');
        const subtotal = productoDiv.querySelector('.subtotal');
        const eliminarBtn = productoDiv.querySelector('.eliminar-producto');

        actualizarSelectoresProductos();

        select.addEventListener('change', actualizarPrecioYSubtotal);
        cantidad.addEventListener('input', actualizarPrecioYSubtotal);

        function actualizarPrecioYSubtotal() {
            const selectedOption = select.options[select.selectedIndex];
            if (selectedOption && selectedOption.dataset.precio) {
                const precioUnitario = parseFloat(selectedOption.dataset.precio);
                const stock = parseInt(selectedOption.dataset.stock);
                let cantidadValue = parseInt(cantidad.value);

                if (cantidadValue > stock) {
                    alert(`No hay suficiente stock. Stock disponible: ${stock}`);
                    cantidadValue = stock;
                    cantidad.value = stock;
                }

                precio.value = precioUnitario.toFixed(2);
                const subtotalValue = precioUnitario * cantidadValue;
                subtotal.value = subtotalValue.toFixed(2);

                actualizarSubtotalTotal();
            } else {
                precio.value = '';
                subtotal.value = '';
            }
        }

        eliminarBtn.addEventListener('click', () => {
            productosContainer.removeChild(productoDiv);
            actualizarSubtotalTotal();
        });
    }

    function actualizarSubtotalTotal() {
        const subtotales = document.querySelectorAll('.subtotal');
        const total = Array.from(subtotales).reduce((sum, subtotalInput) => {
            return sum + (parseFloat(subtotalInput.value) || 0);
        }, 0);
        subtotalTotalInput.value = total.toFixed(2);
    }

    agregarProductoBtn.addEventListener('click', crearProductoHTML);

    crearDetalleVentaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const idVenta = document.getElementById('id-venta').value;
        const productos = Array.from(productosContainer.children).map(productoDiv => ({
            idProducto: productoDiv.querySelector('.id-producto').value,
            cantidad: productoDiv.querySelector('.cantidad').value,
            subtotal: productoDiv.querySelector('.subtotal').value
        }));

        fetch(`${API_BASE}/api/detalles_venta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idVenta: parseInt(idVenta),
                productos: productos
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al crear detalle de venta');
            return res.json();
        })
        .then(() => {
            cargarDetallesVenta();
            crearDetalleVentaForm.reset();
            productosContainer.innerHTML = '';
            subtotalTotalInput.value = '0.00';
            cargarProductosDisponibles();
        })
        .catch(error => {
            console.error('Error al crear detalle de venta:', error);
            alert(error.message);
        });
    });

    modificarDetalleVentaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('id-detalle-venta-modificar').value;
        const idVenta = document.getElementById('id-venta-modificar').value;
        const idProducto = document.getElementById('id-producto-modificar').value;
        const cantidad = document.getElementById('cantidad-modificar').value;
        const subtotal = document.getElementById('subtotal-modificar').value;
        
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
            if (!res.ok) throw new Error('Detalle de venta no encontrado');
            return res.json();
        })
        .then(() => {
            cargarDetallesVenta();
            modificarDetalleVentaForm.reset();
            cargarProductosDisponibles();
        })
        .catch(error => {
            console.error('Error al modificar detalle de venta:', error);
            alert(error.message);
        });
    });

    eliminarDetalleVentaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('id-detalle-venta-eliminar').value;
        
        fetch(`${API_BASE}/api/detalles_venta/${id}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (!res.ok) throw new Error('Detalle de venta no encontrado');
            cargarDetallesVenta();
            eliminarDetalleVentaForm.reset();
            cargarProductosDisponibles();
        })
        .catch(error => {
            console.error('Error al eliminar detalle de venta:', error);
            alert(error.message);
        });
    });

    // Inicializar la página
    cargarDetallesVenta();
    cargarProductosDisponibles();
});