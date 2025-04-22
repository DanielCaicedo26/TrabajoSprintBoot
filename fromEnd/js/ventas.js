document.addEventListener('DOMContentLoaded', function () {
    const API_BASE = 'http://localhost:8080';
    const lista = document.getElementById('ventas-lista');

    function cargarVentas() {
        fetch(`${API_BASE}/api/ventas`)
            .then(response => response.json())
            .then(data => {
                lista.innerHTML = '';
                data.forEach(venta => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${venta.id}</td>
                        <td>${venta.usuario.id}</td>
                        <td>${venta.usuario.nombre}</td>
                        <td>${venta.usuario.apellido}</td>
                        <td>${venta.fecha}</td>
                        
                    `;
                    lista.appendChild(fila);
                });
            })
            .catch(error => console.error('Error al cargar las ventas:', error));
    }
    
    cargarVentas();

    document.getElementById('crear-venta-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const idUsuario = parseInt(document.getElementById('id-usuario').value);
        const fecha = document.getElementById('fecha-venta').value;

        fetch(`${API_BASE}/api/ventas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: { id: idUsuario }, fecha })
        })
            .then(response => response.json())
            .then(data => {
                console.log('Venta creada:', data);
                cargarVentas();
                document.getElementById('crear-venta-form').reset();
            })
            .catch(error => console.error('Error al crear la venta:', error));
    });

    document.getElementById('modificar-venta-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const id = parseInt(document.getElementById('id-venta-modificar').value);
        const idUsuario = parseInt(document.getElementById('id-usuario-modificar').value);
        const fecha = document.getElementById('fecha-venta-modificar').value;

        fetch(`${API_BASE}/api/ventas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: { id: idUsuario }, fecha })
        })
            .then(response => {
                if (response.ok) {
                    console.log('Venta modificada');
                    cargarVentas();
                    document.getElementById('modificar-venta-form').reset();
                } else {
                    alert('Venta no encontrada');
                }
            })
            .catch(error => console.error('Error al modificar la venta:', error));
    });

    document.getElementById('eliminar-venta-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const id = parseInt(document.getElementById('id-venta-eliminar').value);

        fetch(`${API_BASE}/api/ventas/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    console.log('Venta eliminada');
                    cargarVentas();
                    document.getElementById('eliminar-venta-form').reset();
                } else {
                    alert('Venta no encontrada');
                }
            })
            .catch(error => console.error('Error al eliminar la venta:', error));
    });
});
