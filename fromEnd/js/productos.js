document.addEventListener('DOMContentLoaded', function () {
    const API_BASE = 'http://localhost:8080';
    const lista = document.getElementById('productos-lista');

    function cargarProductos() {
        fetch(`${API_BASE}/api/productos`)
            .then(res => res.json())
            .then(data => {
                lista.innerHTML = '';
                data.forEach(p => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${p.id}</td>
                        <td>${p.nombre}</td>
                        <td>$${p.precio.toFixed(2)}</td>
                        <td>${p.cantidad}</td>
                        <td>${p.categoria}</td>`;
                    lista.appendChild(tr);
                });
            });
    }

    cargarProductos();

    // Crear producto
    document.getElementById('crear-producto-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre-producto').value;
        const precio = document.getElementById('precio-producto').value;
        const cantidad = document.getElementById('cantidad-producto').value;
        const categoria = document.getElementById('categoria-producto').value;

        fetch(`${API_BASE}/api/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, precio, cantidad, categoria })
        })
        .then(res => res.json())
        .then(() => {
            cargarProductos();
            document.getElementById('crear-producto-form').reset();
            bootstrap.Modal.getInstance(document.getElementById('modalCrear')).hide();
        });
    });

    // Modificar producto
    document.getElementById('modificar-producto-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const id = document.getElementById('id-producto-modificar').value;
        const nombre = document.getElementById('nombre-producto-modificar').value;
        const precio = document.getElementById('precio-producto-modificar').value;
        const cantidad = document.getElementById('cantidad-producto-modificar').value;
        const categoria = document.getElementById('categoria-producto-modificar').value;

        fetch(`${API_BASE}/api/productos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, precio, cantidad, categoria })
        })
        .then(res => {
            if (res.ok) {
                cargarProductos();
                document.getElementById('modificar-producto-form').reset();
                bootstrap.Modal.getInstance(document.getElementById('modalModificar')).hide();
            } else {
                alert('Producto no encontrado');
            }
        });
    });

    // Eliminar producto
    document.getElementById('eliminar-producto-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const id = document.getElementById('id-producto-eliminar').value;

        fetch(`${API_BASE}/api/productos/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    cargarProductos();
                    document.getElementById('eliminar-producto-form').reset();
                    bootstrap.Modal.getInstance(document.getElementById('modalEliminar')).hide();
                } else {
                    alert('Producto no encontrado');
                }
            });
    });
});
