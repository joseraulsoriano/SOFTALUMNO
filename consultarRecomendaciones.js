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
    constructor(fecha, texto) {
        this.fecha = fecha;
        this.texto = texto;
    }

    mostrar() {
        return `
            <div class="recomendacion">
                <p><strong>Fecha:</strong> ${this.fecha}</p>
                <p><strong>Texto:</strong> ${this.texto}</p>
            </div>
        `;
    }
}

// Clase Alumno
class Alumno {
    constructor(datos) {
        Object.assign(this, datos);
        this.estadoPagos = this.estadoPagos.map(p => new Pago(p.mes, p.monto, p.estado));
        this.recomendaciones = this.recomendaciones.map(r => new Recomendacion(r.fecha, r.texto));
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
        } else if (this.recomendaciones.length === 0) {
            contenedor.innerHTML = `<p>No hay recomendaciones disponibles en este momento.</p>`;
        } else {
            contenedor.innerHTML = this.recomendaciones.map((r, index) => `
                <div class="recomendacion">
                    <p><strong>Fecha:</strong> ${r.fecha}</p>
                    <button onclick="mostrarDetalleRecomendacion(${index})">Ver Detalle</button>
                </div>
            `).join("");
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
            alumno.consultarRecomendaciones();

            // Botón de Volver
            document.getElementById("volver").addEventListener("click", () => {
                window.history.back();
            });

            // Botón de Cerrar Sesión
            document.getElementById("logoutButton").addEventListener("click", () => {
                localStorage.removeItem("usuario");
                localStorage.removeItem("rol");
                window.location.href = "index.html";
            });
        }
    } catch (error) {
        console.error("Error al cargar los datos del alumno:", error);
    }
}

document.addEventListener("DOMContentLoaded", cargarDatosAlumno);