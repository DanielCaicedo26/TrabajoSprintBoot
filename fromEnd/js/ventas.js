document.addEventListener("DOMContentLoaded", function() {
    const API_URL = "http://localhost:8080";
    const ventasLista = document.getElementById("ventas-lista");
    const selectUsuario = document.getElementById("select-usuario");
    const selectUsuarioModificar = document.getElementById("select-usuario-modificar");

    // Función para cargar los usuarios en los selectores
    function cargarUsuarios() {
        fetch(API_URL + "/api/usuarios")
            .then(response => response.json())
            .then(usuarios => {
                // Limpiar selectores actuales
                selectUsuario.innerHTML = '<option value="">Seleccione un usuario</option>';
                selectUsuarioModificar.innerHTML = '<option value="">Seleccione un usuario</option>';
                
                // Agregar cada usuario a los selectores
                usuarios.forEach(usuario => {
                    const option = document.createElement('option');
                    option.value = usuario.id;
                    option.textContent = `${usuario.nombre} ${usuario.apellido} (ID: ${usuario.id})`;
                    
                    // Agregar al selector de creación
                    selectUsuario.appendChild(option.cloneNode(true));
                    
                    // Agregar al selector de modificación
                    selectUsuarioModificar.appendChild(option);
                });
            })
            .catch(error => console.error("Error al cargar los usuarios:", error));
    }

    // Función para cargar las ventas
    function cargarVentas() {
        fetch(API_URL + "/api/ventas")
            .then(response => response.json())
            .then(ventas => {
                ventasLista.innerHTML = '';
                ventas.forEach(venta => {
                    const tr = document.createElement('tr');
                    
                    // Formatear la fecha y hora para mostrarla de manera más legible
                    let fechaFormateada = venta.fecha;
                    if (venta.fecha) {
                        const fecha = new Date(venta.fecha);
                        if (!isNaN(fecha.getTime())) {  // Verificar que la fecha sea válida
                            fechaFormateada = fecha.toLocaleString();
                        }
                    }
                    
                    tr.innerHTML = `
                        <td>${venta.id}</td>
                        <td>${venta.usuario.id}</td>
                        <td>${venta.usuario.nombre}</td>
                        <td>${venta.usuario.apellido}</td>
                        <td>${fechaFormateada}</td>
                    `;
                    ventasLista.appendChild(tr);
                });
            })
            .catch(error => console.error("Error al cargar las ventas:", error));
    }

    // Cargar usuarios y ventas al iniciar
    cargarUsuarios();
    cargarVentas();

    // Evento para crear una venta
    document.getElementById("crear-venta-form").addEventListener("submit", function(event) {
        event.preventDefault();
        
        const usuarioId = parseInt(selectUsuario.value);
        const fechaVenta = document.getElementById("fecha-venta").value;
        const horaVenta = document.getElementById("hora-venta").value;
        
        if (!usuarioId) {
            alert("Por favor, seleccione un usuario");
            return;
        }
        
        // Combinar fecha y hora
        const fechaHoraCompleta = fechaVenta + "T" + horaVenta + ":00";

        fetch(API_URL + "/api/ventas", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario: {
                    id: usuarioId
                },
                fecha: fechaHoraCompleta
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Venta creada:", data);
            cargarVentas();
            document.getElementById("crear-venta-form").reset();
            
            // Cerrar el modal manualmente
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalCrearVenta'));
            modal.hide();
        })
        .catch(error => console.error("Error al crear la venta:", error));
    });

    // Evento para modificar una venta
    document.getElementById("modificar-venta-form").addEventListener("submit", function(event) {
        event.preventDefault();
        
        const ventaId = parseInt(document.getElementById("id-venta-modificar").value);
        const usuarioId = parseInt(selectUsuarioModificar.value);
        const fechaVenta = document.getElementById("fecha-venta-modificar").value;
        const horaVenta = document.getElementById("hora-venta-modificar").value;
        
        if (!usuarioId) {
            alert("Por favor, seleccione un usuario");
            return;
        }
        
        // Combinar fecha y hora
        const fechaHoraCompleta = fechaVenta + "T" + horaVenta + ":00";

        fetch(API_URL + "/api/ventas/" + ventaId, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario: {
                    id: usuarioId
                },
                fecha: fechaHoraCompleta
            })
        })
        .then(response => {
            if (response.ok) {
                console.log("Venta modificada");
                cargarVentas();
                document.getElementById("modificar-venta-form").reset();
                
                // Cerrar el modal manualmente
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalModificarVenta'));
                modal.hide();
            } else {
                alert("Venta no encontrada");
            }
        })
        .catch(error => console.error("Error al modificar la venta:", error));
    });

    // Evento para eliminar una venta
    document.getElementById("eliminar-venta-form").addEventListener("submit", function(event) {
        event.preventDefault();
        
        const ventaId = parseInt(document.getElementById("id-venta-eliminar").value);

        fetch(API_URL + "/api/ventas/" + ventaId, {
            method: "DELETE"
        })
        .then(response => {
            if (response.ok) {
                console.log("Venta eliminada");
                cargarVentas();
                document.getElementById("eliminar-venta-form").reset();
                
                // Cerrar el modal manualmente
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalEliminarVenta'));
                modal.hide();
            } else {
                alert("Venta no encontrada");
            }
        })
        .catch(error => console.error("Error al eliminar la venta:", error));
    });

    // Agregamos event listeners para los modales
    document.getElementById('modalCrearVenta').addEventListener('show.bs.modal', function () {
        // Asegurarse de cargar usuarios actualizados cada vez que se abre el modal
        cargarUsuarios();
    });

    document.getElementById('modalModificarVenta').addEventListener('show.bs.modal', function () {
        // Asegurarse de cargar usuarios actualizados cada vez que se abre el modal
        cargarUsuarios();
    });
});