function procesarDatos() {
    const jsonInput = document.getElementById('jsonInput').value.trim();
    const resultadoDiv = document.getElementById('resultado');
    const errorDiv = document.getElementById('error');

    resultadoDiv.innerHTML = '';
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    if (!jsonInput) {
        mostrarError('Por favor, ingresa los datos JSON');
        return;
    }

    try {
        const jsonPreprocesado = jsonInput
            .replace(/Decimal\(["']([0-9.]+)["']\)/g, '$1')
            .replace(/None/g, 'null')
            .replace(/False/g, 'false')
            .replace(/True/g, 'true');

        const data = JSON.parse(jsonPreprocesado);

        if (!Array.isArray(data)) {
            mostrarError('Los datos deben ser un array de productos');
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Puntos</th>
                        <th>Precio</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach(producto => {
            const nombre = producto.nombre || 'Sin nombre';
            const cantidad = producto.cantidad || '0';

            if (producto.inventario && Array.isArray(producto.inventario)) {
                producto.inventario.forEach(inventario => {
                    const sku = inventario.sku || 'Sin SKU';

                    if (inventario.precios && Array.isArray(inventario.precios)) {
                        inventario.precios.forEach(precioInfo => {
                            const precio = parseFloat(precioInfo.precio) || 0;
                            const puntos = precioInfo.punto || 0;

                            html += `
                                <tr>
                                    <td>${sku}</td>
                                    <td>${nombre}</td>
                                    <td>${cantidad}</td>
                                    <td>${puntos}</td>
                                    <td class="precio">S/. ${precio.toFixed(2)}</td>
                                </tr>
                            `;
                        });
                    }
                });
            }
        });

        html += `
                </tbody>
            </table>
        `;

        resultadoDiv.innerHTML = html;

        if (data.length > 0) {
            // Crear el botón de copiar con el icono
            const copyButton = document.createElement('button');
            copyButton.classList.add('copy-btn');

            // Crear el icono dentro del botón
            const icon = document.createElement('i');
            icon.classList.add('fas', 'fa-copy'); // Aquí usamos el icono de copiar

            copyButton.appendChild(icon);

            // Evento para copiar la tabla al portapapeles
            copyButton.onclick = function () {
                copiarTablaAlPortapapeles('resultado');
            };

            resultadoDiv.appendChild(copyButton);
        }

    } catch (e) {
        mostrarError('Error al procesar los datos: ' + e.message);
        console.error(e);
    }
}

function copiarTablaAlPortapapeles(elementId) {
    const tabla = document.getElementById(elementId).querySelector('table');
    if (!tabla) return;

    let datosTabla = '';
    const encabezados = [];
    tabla.querySelectorAll('thead th').forEach(th => {
        encabezados.push(th.textContent.trim());
    });
    datosTabla += encabezados.join(' | ') + '\n';

    tabla.querySelectorAll('tbody tr').forEach(fila => {
        const datosFila = [];
        fila.querySelectorAll('td').forEach(celda => {
            datosFila.push(celda.textContent.trim());
        });
        datosTabla += datosFila.join(' | ') + '\n';
    });

    try {
        navigator.clipboard.writeText(datosTabla.trim()).then(() => alert('¡Datos de la tabla copiados al portapapeles!'));
    } catch (err) {
        alert('Error al copiar los datos de la tabla: ' + err);
    }
}

function mostrarError(mensaje) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = mensaje;
    errorDiv.style.display = 'block';
}
