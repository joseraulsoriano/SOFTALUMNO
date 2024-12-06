// Clase Pago
class Pago {
    constructor(mes, monto, estado) {
        this.mes = mes;
        this.monto = monto;
        this.estado = estado;
    }

    esPendiente() {
        return this.estado === "Pendiente";
    }

    realizarPago() {
        if (this.esPendiente()) {
            this.estado = "Pagado";
            return true;
        }
        return false;
    }
}

// Clase Alumno
class Alumno {
    constructor(datos) {
        Object.assign(this, datos);
        this.estadoPagos = this.estadoPagos.map(p => new Pago(p.mes, p.monto, p.estado));
    }

    async gestionarPago(mes, monto, comprobante) {
        const pago = this.estadoPagos.find(p => p.mes === mes);
        if (!pago) {
            alert("Mes inválido. No se encontró un pago correspondiente.");
            return;
        }

        if (pago.esPendiente()) {
            if (monto >= pago.monto) {
                // Validar el comprobante de pago
                const esValido = await this.validarComprobante(comprobante);
                if (esValido) {
                    pago.realizarPago();
                    console.log("Pago recibido");
                    alert("Pago registrado exitosamente.");
                    this.actualizarHistorialPagos();
                    document.getElementById("formPago").style.display = "none"; // Ocultar formulario de pago
                    await actualizarEstadoPago(this.id, "pagado"); // Actualizar estado en la base de datos simulada
                } else {
                    console.log("Pago rechazado");
                    alert("Comprobante de pago inválido.");
                }
            } else {
                alert(`Monto insuficiente. Debe pagar al menos $${pago.monto}.`);
            }
        } else {
            alert(`El mes ${mes} ya está pagado.`);
        }
    }

    async validarComprobante(comprobante) {
        // Convertir el archivo a base64
        const reader = new FileReader();
        reader.readAsDataURL(comprobante);
        return new Promise((resolve, reject) => {
            reader.onload = async () => {
                const base64Image = reader.result.split(',')[1];
                const apiKey = 'AIzaSyCuLZf3PprXWrWsZxjD0E57q89J3pwK0U0'; // Tu clave de API de Google Cloud Vision
                const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
                const body = {
                    requests: [
                        {
                            image: {
                                content: base64Image
                            },
                            features: [
                                {
                                    type: "TEXT_DETECTION"
                                }
                            ]
                        }
                    ]
                };

                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(body)
                    });
                    const data = await response.json();
                    const textAnnotations = data.responses[0].textAnnotations;
                    if (textAnnotations && textAnnotations.length > 0) {
                        const textoDetectado = textAnnotations[0].description;
                        console.log("Texto detectado:", textoDetectado);
                        // Aquí puedes implementar la lógica para verificar si el texto detectado es válido
                        // Por ejemplo, podrías buscar palabras clave específicas en el texto
                        const esValido = textoDetectado.includes('Pago') || textoDetectado.includes('Recibo') || textoDetectado.includes('Transferencia') || textoDetectado.includes('Depósito');
                        resolve(esValido);
                    } else {
                        resolve(false);
                    }
                } catch (error) {
                    console.error("Error al validar el comprobante:", error);
                    resolve(false);
                }
            };
            reader.onerror = (error) => {
                console.error("Error al leer el archivo:", error);
                reject(false);
            };
        });
    }

    actualizarHistorialPagos() {
        const tablaPagos = document.getElementById("tablaPagos");
        if (tablaPagos) {
            tablaPagos.innerHTML = this.estadoPagos.map(p => `
                <tr>
                    <td>${p.mes}</td>
                    <td>$${p.monto}</td>
                    <td>${p.estado}</td>
                </tr>
            `).join("");
        } else {
            console.error("No se encontró el contenedor de la tabla de pagos.");
        }
    }
}

// Función para actualizar el estado del pago en la base de datos simulada
async function actualizarEstadoPago(alumnoId, estado) {
    try {
        const response = await fetch(`actualizar_estado_pago/${alumnoId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ estado: estado })
        });

        if (!response.ok) {
            throw new Error("Error al actualizar el estado del pago");
        }

        console.log("Estado del pago actualizado correctamente");
    } catch (error) {
        console.error("Error al actualizar el estado del pago:", error);
    }
}

// Cargar datos del alumno
async function cargarDatosAlumno() {
    try {
        const response = await fetch("admin_datos.txt");
        const data = await response.json();
        const usuarioActual = localStorage.getItem("usuario");
        const alumnoData = data.usuarios.find(u => u.email === usuarioActual && u.rol === "alumno");

        if (alumnoData) {
            const alumno = new Alumno(alumnoData);
            alumno.actualizarHistorialPagos();

            // Gestionar pago
            const gestionarPagoBtn = document.getElementById("gestionarPago");
            if (gestionarPagoBtn) {
                gestionarPagoBtn.addEventListener("click", () => {
                    const formPago = document.getElementById("formPago");
                    formPago.style.display = "block"; // Mostrar formulario de pago
                });
            } else {
                console.error("No se encontró el botón de gestionar pago.");
            }

            // Cancelar pago
            const cancelarPagoBtn = document.getElementById("cancelarPago");
            if (cancelarPagoBtn) {
                cancelarPagoBtn.addEventListener("click", () => {
                    const formPago = document.getElementById("formPago");
                    formPago.style.display = "none"; // Ocultar formulario de pago
                });
            } else {
                console.error("No se encontró el botón de cancelar pago.");
            }

            const pagoFormulario = document.getElementById("pagoFormulario");
            if (pagoFormulario) {
                pagoFormulario.addEventListener("submit", (e) => {
                    e.preventDefault();
                    const mes = document.getElementById("mesPago").value;
                    const monto = parseFloat(document.getElementById("montoPago").value);
                    const comprobante = document.getElementById("comprobantePago").files[0];
                    if (mes && !isNaN(monto) && comprobante) {
                        alumno.gestionarPago(mes, monto, comprobante);
                    } else {
                        alert("Datos inválidos o comprobante no adjuntado.");
                    }
                });
            } else {
                console.error("No se encontró el formulario de pago.");
            }

            // Botón de Volver
            const volverBtn = document.getElementById("volver");
            if (volverBtn) {
                volverBtn.addEventListener("click", () => {
                    window.history.back();
                });
            } else {
                console.error("No se encontró el botón de volver.");
            }

            // Botón de Cerrar Sesión
            const logoutBtn = document.getElementById("logoutButton");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", () => {
                    localStorage.removeItem("usuario");
                    localStorage.removeItem("rol");
                    window.location.href = "index.html";
                });
            } else {
                console.error("No se encontró el botón de cerrar sesión.");
            }
        }
    } catch (error) {
        console.error("Error al cargar los datos del alumno:", error);
    }
}

async function guardarDatos(datos) {
    try {
        await fetch("admin_datos.txt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });
    } catch (error) {
        console.error("Error al guardar los datos:", error);
    }
}

document.addEventListener("DOMContentLoaded", cargarDatosAlumno);