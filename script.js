function procesarDatos() {
    const jsonInput = document.getElementById('jsonInput').value.trim();
    const resultadoDiv = document.getElementById('resultado');
    const errorDiv = document.getElementById('error');
    let totalPuntos = 0;
    let totalSoles = 0;

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
            <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
                <thead>
                    <tr style="background-color: #1e50a2; color: white;">
                        <th style="padding: 6px; font-size: 12px;">SKU</th>
                        <th style="padding: 6px; font-size: 12px;">Producto</th>
                        <th style="padding: 6px; font-size: 12px;">Cantidad</th>
                        <th style="padding: 6px; font-size: 12px;">Puntos<br>(unit)</th>
                        <th style="padding: 6px; font-size: 12px;">Total<br>Puntos</th>
                        <th style="padding: 6px; font-size: 12px;">Precio<br>(unit)</th>
                        <th style="padding: 6px; font-size: 12px;">Subtotal<br>Precio</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach((producto, productoIndex) => {
            const nombre = producto.nombre || 'Sin nombre';
            const cantidad = parseFloat(producto.cantidad) || 0;

            if (producto.inventario && Array.isArray(producto.inventario)) {
                producto.inventario.forEach(inventario => {
                    const sku = inventario.sku || 'Sin SKU';

                    if (inventario.precios && Array.isArray(inventario.precios)) {
                        inventario.precios.forEach(precioInfo => {
                            const precioUnit = parseFloat(precioInfo.precio) || 0;
                            const puntosUnit = parseFloat(precioInfo.punto) || 0;

                            const subtotalPuntos = puntosUnit * cantidad;
                            const subtotalPrecio = precioUnit * cantidad;

                            totalPuntos += subtotalPuntos;
                            totalSoles += subtotalPrecio;

                            const esFilaPar = productoIndex % 2 === 0;

                            html += `
                                <tr style="background-color: ${esFilaPar ? '#f9f9f9' : 'white'};">
                                    <td style="border-bottom: 1px solid #ddd; padding: 4px; font-size: 12px;">${sku}</td>
                                    <td style="border-bottom: 1px solid #ddd; padding: 4px; font-size: 12px;">${nombre}</td>
                                    <td style="border-bottom: 1px solid #ddd; padding: 4px; font-size: 12px;">${cantidad}</td>
                                    <td style="border-bottom: 1px solid #ddd; padding: 4px; font-size: 12px;">${puntosUnit}</td>
                                    <td style="border-bottom: 1px solid #ddd; padding: 4px; font-size: 12px;">${subtotalPuntos}</td>
                                    <td style="border-bottom: 1px solid #ddd; padding: 4px; font-size: 12px;">S/. ${precioUnit.toFixed(2)}</td>
                                    <td style="border-bottom: 1px solid #ddd; padding: 4px; font-size: 12px; color: #1e50a2; font-weight: bold;">S/. ${subtotalPrecio.toFixed(2)}</td>
                                </tr>
                            `;
                        });
                    }
                });
            }
        });

        html += `
            <tr style="background-color: #eaf2ff; font-weight: bold;">
                <td colspan="4" style="padding: 6px; text-align: right;">Totales:</td>
                <td style="padding: 6px;">${totalPuntos}</td>
                <td></td>
                <td style="padding: 6px;">S/. ${totalSoles.toFixed(2)}</td>
            </tr>
        </tbody></table>
        `;

        resultadoDiv.innerHTML = html;

        if (data.length > 0) {
            const copyButton = document.createElement('button');
            copyButton.classList.add('copy-btn');

            const icon = document.createElement('i');
            icon.classList.add('fas', 'fa-copy');

            copyButton.appendChild(icon);

            copyButton.onclick = function () {
                copiarTablaAlPortapapeles('resultado');
            };

            resultadoDiv.appendChild(copyButton);
        }

        document.getElementById('jsonInput').value = '';

    } catch (e) {
        mostrarError('Error al procesar los datos: ' + e.message);
        console.error(e);
    }
}

function copiarTablaAlPortapapeles(elementId) {
    const tabla = document.getElementById(elementId).querySelector('table');
    if (!tabla) return;

    const tablaHTML = tabla.outerHTML;

    try {
        navigator.clipboard.write([
            new ClipboardItem({
                'text/html': new Blob([tablaHTML], { type: 'text/html' }),
                'text/plain': new Blob([tablaHTML], { type: 'text/plain' })
            })
        ]).then(() => {
            alert('¡Tabla copiada al portapapeles! Pégala en Gmail para verla con formato.');
        });
    } catch (err) {
        alert('Error al copiar la tabla: ' + err);
    }
}

function mostrarError(mensaje) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = mensaje;
    errorDiv.style.display = 'block';
}
