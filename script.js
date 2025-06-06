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
            <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
                <thead>
                    <tr style="background-color: #1e50a2; color: white;">
                        <th style="border-bottom: 1px solid #ddd; padding: 6px; text-align: left; font-size: 12px;">SKU</th>
                        <th style="border-bottom: 1px solid #ddd; padding: 6px; text-align: left; font-size: 12px;">Producto</th>
                        <th style="border-bottom: 1px solid #ddd; padding: 6px; text-align: left; font-size: 12px;">Cantidad</th>
                        <th style="border-bottom: 1px solid #ddd; padding: 6px; text-align: left; font-size: 12px;">Puntos</th>
                        <th style="border-bottom: 1px solid #ddd; padding: 6px; text-align: left; font-size: 12px;">Precio</th>
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
                            const esFilaPar = data.indexOf(producto) % 2 === 0;

                            html += `
                                <tr style="background-color: ${esFilaPar ? '#f9f9f9' : 'white'};">
                                    <td style="border-bottom: 1px solid #ddd; padding: 4px; font-size: 12px; text-align: left;">${sku}</td>
                                    <td style="border-bottom: 1px solid #ddd; padding: 4px; font-size: 12px; text-align: left; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${nombre}</td>
                                    <td style="border-bottom: 1px solid #ddd; padding: 4px; font-size: 12px; text-align: left;">${cantidad}</td>
                                    <td style="border-bottom: 1px solid #ddd; padding: 4px; font-size: 12px; text-align: left;">${puntos}</td>
                                    <td style="border-bottom: 1px solid #ddd; padding: 4px; font-size: 12px; text-align: left; color: #1e50a2; font-weight: bold;">S/. ${precio.toFixed(2)}</td>
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


