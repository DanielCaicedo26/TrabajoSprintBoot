document.addEventListener('DOMContentLoaded', function () {
    const API_BASE = 'http://localhost:8080';
    const lista = document.getElementById('usuarios-lista');

    function manejarErrorHTTP(response) {
        if (response.status === 429) {
            throw new Error("Has enviado demasiadas solicitudes. Por favor espera un momento.");
        }
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || "Error desconocido");
            });
        }
        return response.json();
    }

    function cargarUsuarios() {
        fetch(`${API_BASE}/api/usuarios`)
            .then(manejarErrorHTTP)
            .then(data => {
                lista.innerHTML = '';
                data.forEach(usuario => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${usuario.id}</td>
                        <td>${usuario.nombre}</td>
                        <td>${usuario.apellido}</td>
                        <td>${usuario.numeroDocumento}</td>
                        <td>${usuario.numeroCelular}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="mostrarEditarModal(${usuario.id}, '${usuario.nombre}', '${usuario.apellido}', '${usuario.numeroCelular}')">Modificar</button>
                        </td>
                    `;
                    lista.appendChild(fila);
                });
            })
            .catch(error => {
                console.error('Error al cargar usuarios:', error);
                alert(error.message);
            });
    }

    cargarUsuarios();

    document.getElementById('crear-usuario-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const nombre = document.getElementById('nombre-usuario').value;
        const apellido = document.getElementById('apellido-usuario').value;
        const numeroDocumento = document.getElementById('numero-documento-usuario').value;
        const numeroCelular = document.getElementById('numero-celular-usuario').value;

        fetch(`${API_BASE}/api/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, apellido, numeroDocumento, numeroCelular })
        })
        .then(manejarErrorHTTP)
        .then(() => {
            alert("Usuario creado exitosamente");
            cargarUsuarios();
            document.getElementById('crear-usuario-form').reset();
        })
        .catch(error => {
            alert("Error: " + error.message);
        });
    });

    window.mostrarEditarModal = function (id, nombre, apellido, numeroCelular) {
        document.getElementById('editar-id').value = id;
        document.getElementById('editar-nombre').value = nombre;
        document.getElementById('editar-apellido').value = apellido;
        document.getElementById('editar-numero-celular').value = numeroCelular;
        const modal = new bootstrap.Modal(document.getElementById('editarUsuarioModal'));
        modal.show();
    };

    document.getElementById('editar-usuario-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const id = document.getElementById('editar-id').value;
        const nombre = document.getElementById('editar-nombre').value;
        const apellido = document.getElementById('editar-apellido').value;
        const numeroCelular = document.getElementById('editar-numero-celular').value;

        fetch(`${API_BASE}/api/usuarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, apellido, numeroCelular })
        })
        .then(manejarErrorHTTP)
        .then(() => {
            alert('Usuario actualizado con éxito');
            cargarUsuarios();
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarUsuarioModal'));
            modal.hide();
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
    });

    document.getElementById('actualizar-numero-documento-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const numeroDocumentoActual = document.getElementById('numero-documento-actual').value;
        const nuevoNumeroDocumento = document.getElementById('nuevo-numero-documento').value;

        fetch(`${API_BASE}/api/usuarios/documento/${numeroDocumentoActual}/actualizar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoNumeroDocumento)
        })
        .then(manejarErrorHTTP)
        .then(() => {
            alert('Número de documento actualizado');
            cargarUsuarios();
            document.getElementById('actualizar-numero-documento-form').reset();
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
    });

    document.getElementById('eliminar-usuario-documento-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const numeroDocumento = document.getElementById('numero-documento-eliminar').value;

        fetch(`${API_BASE}/api/usuarios/documento/${numeroDocumento}`, {
            method: 'DELETE'
        })
        .then(manejarErrorHTTP)
        .then(() => {
            alert('Usuario eliminado');
            cargarUsuarios();
            document.getElementById('eliminar-usuario-documento-form').reset();
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
    });

    window.buscarUsuario = function () {
        const keyword = document.getElementById('busqueda').value.trim();

        if (keyword === "") {
            alert("Ingrese un término de búsqueda.");
            return;
        }

        fetch(`${API_BASE}/api/usuarios/buscar?keyword=${encodeURIComponent(keyword)}`)
            .then(manejarErrorHTTP)
            .then(data => {
                const tbody = document.getElementById("usuarios-lista");
                tbody.innerHTML = "";

                if (data.length === 0) {
                    tbody.innerHTML = "<tr><td colspan='6' class='text-center'>No se encontraron usuarios</td></tr>";
                    return;
                }

                data.forEach(usuario => {
                    const fila = `<tr>
                        <td>${usuario.id}</td>
                        <td>${usuario.nombre}</td>
                        <td>${usuario.apellido}</td>
                        <td>${usuario.numeroDocumento}</td>
                        <td>${usuario.numeroCelular}</td>
                    </tr>`;
                    tbody.innerHTML += fila;
                });
            })
            .catch(error => {
                alert('Error: ' + error.message);
            });
    };
});
