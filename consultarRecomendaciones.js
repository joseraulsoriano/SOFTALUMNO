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
}

// Clase Recomendacion
class Recomendacion {
    constructor(fecha, texto, clase, maestro, detalles) {
        this.fecha = fecha;
        this.texto = texto;
        this.clase = clase;
        this.maestro = maestro;
        this.detalles = detalles;
    }

    mostrar() {
        return `
            <div class="recomendacion">
                <p><strong>Fecha:</strong> ${this.fecha}</p>
                <p><strong>Texto:</strong> ${this.texto}</p>
                <p><strong>Clase:</strong> ${this.clase}</p>
                <p><strong>Maestro:</strong> ${this.maestro}</p>
                <p><strong>Detalles:</strong> ${this.detalles}</p>
            </div>
        `;
    }
}

// Clase Alumno
class Alumno {
    constructor(datos) {
        Object.assign(this, datos);
        this.estadoPagos = this.estadoPagos.map(p => new Pago(p.mes, p.monto, p.estado));
        this.recomendaciones = this.recomendaciones.map(r => new Recomendacion(r.fecha, r.texto, r.clase, r.maestro, r.detalles));
    }

    consultarRecomendaciones() {
        const contenedor = document.getElementById("recomendaciones");
        const adeudos = this.estadoPagos.filter(p => p.esPendiente());

        if (adeudos.length > 0) {
            const detalleAdeudos = adeudos.map(p => `Mes: ${p.mes}, Monto: $${p.monto}`).join("<br>");
            contenedor.innerHTML = `
                <p style="color:red;"><strong>Acceso Denegado:</strong> Regularice sus pagos.</p>
                <p>Detalles de adeudos:</p>
                <p>${detalleAdeudos}</p>
            `;
            document.getElementById("actualizar").style.display = "block"; // Mostrar botón de actualizar
        } else if (this.recomendaciones.length === 0) {
            contenedor.innerHTML = `<p>No hay recomendaciones disponibles en este momento.</p>`;
            document.getElementById("actualizar").style.display = "none"; // Ocultar botón de actualizar
        } else {
            const select = document.createElement("select");
            select.id = "selectRecomendacion";
            select.innerHTML = this.recomendaciones.map((r, index) => `
                <option value="${index}">Recomendación del ${r.fecha}</option>
            `).join("");
            select.addEventListener("change", () => {
                this.mostrarDetalleRecomendacion(select.value);
            });
            contenedor.innerHTML = "";
            contenedor.appendChild(select);
            this.mostrarDetalleRecomendacion(0); // Mostrar la primera recomendación por defecto
            document.getElementById("actualizar").style.display = "none"; // Ocultar botón de actualizar
        }
    }

    mostrarDetalleRecomendacion(index) {
        const recomendacion = this.recomendaciones[index];
        const detalleContainer = document.getElementById("detalleRecomendacion");
        detalleContainer.innerHTML = recomendacion.mostrar();
        detalleContainer.style.display = "block";  // Mostrar el detalle
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
            localStorage.setItem("alumno", JSON.stringify(alumno)); // Guardar el alumno en localStorage
            alumno.consultarRecomendaciones();

            // Botón de Actualizar
            const actualizarBtn = document.getElementById("actualizar");
            if (actualizarBtn) {
                actualizarBtn.addEventListener("click", () => {
                    alumno.consultarRecomendaciones();
                });
            } else {
                console.error("No se encontró el botón de actualizar.");
            }

            // Botón de Volver
            document.getElementById("volver").addEventListener("click", () => {
                window.history.back();
            });

            // Botón de Cerrar Sesión
            document.getElementById("logoutButton").addEventListener("click", () => {
                localStorage.removeItem("usuario");
                localStorage.removeItem("rol");
                localStorage.removeItem("alumno"); // Eliminar el alumno de localStorage
                window.location.href = "index.html";
            });
        }
    } catch (error) {
        console.error("Error al cargar los datos del alumno:", error);
    }
}

document.addEventListener("DOMContentLoaded", cargarDatosAlumno);

// Función global para mostrar el detalle de la recomendación
function mostrarDetalleRecomendacion(index) {
    const alumno = JSON.parse(localStorage.getItem("alumno"));
    if (alumno && alumno.recomendaciones) {
        const recomendacion = alumno.recomendaciones[index];
        const detalleContainer = document.getElementById("detalleRecomendacion");
        detalleContainer.innerHTML = `
            <div class="recomendacion">
                <p><strong>Fecha:</strong> ${recomendacion.fecha}</p>
                <p><strong>Texto:</strong> ${recomendacion.texto}</p>
                <p><strong>Clase:</strong> ${recomendacion.clase}</p>
                <p><strong>Maestro:</strong> ${recomendacion.maestro}</p>
                <p><strong>Detalles:</strong> ${recomendacion.detalles}</p>
            </div>
        `;
        detalleContainer.style.display = "block";  // Mostrar el detalle
    } else {
        console.error("No se encontraron las recomendaciones del alumno.");
    }
}