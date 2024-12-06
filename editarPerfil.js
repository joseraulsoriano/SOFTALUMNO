// Clase Alumno
class Alumno {
    constructor(datos) {
        Object.assign(this, datos);
    }

    cargarPerfil() {
        const perfilContainer = document.getElementById("perfilAlumno");
        if (perfilContainer) {
            perfilContainer.innerHTML = `
                <p><strong>Nombre:</strong> ${this.nombre}</p>
                <p><strong>Nivel de Estudio:</strong> ${this.nivelEstudio}</p>
                <p><strong>Donde Estudia:</strong> ${this.dondeEstudia}</p>
                <p><strong>Qué Estudia:</strong> ${this.queEstudia}</p>
                <p><strong>Interés de Disciplina:</strong> ${this.interesDisciplina}</p>
                <p><strong>Disciplinas Previas:</strong> ${this.disciplinasPrevias.join(", ")}</p>
                <p><strong>Teléfono:</strong> ${this.telefono}</p>
                <p><strong>Fecha de Nacimiento:</strong> ${this.fechaNacimiento}</p>
                <p><strong>Domicilio:</strong> ${this.domicilio}</p>
                <p><strong>Lugar de Nacimiento:</strong> ${this.lugarNacimiento}</p>
                <p><strong>Peso:</strong> ${this.peso} kg</p>
                <p><strong>Altura:</strong> ${this.altura} cm</p>
            `;
        } else {
            console.error("No se encontró el contenedor del perfil del alumno.");
        }
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
            alumno.cargarPerfil();

            // Editar perfil
            const formEditarPerfil = document.getElementById("formularioEditar");
            document.getElementById("editarPerfil").addEventListener("click", () => {
                formEditarPerfil.style.display = "block";
            });

            document.getElementById("cancelarEdicion").addEventListener("click", () => {
                formEditarPerfil.style.display = "none";
            });

            document.getElementById("editarFormulario").addEventListener("submit", async (e) => {
                e.preventDefault();
                const campo = document.getElementById("campoEditar").value;
                const nuevoValor = document.getElementById("nuevoValor").value.trim();
                if (nuevoValor) {
                    if (campo === "disciplinasPrevias") alumno[campo] = nuevoValor.split(",");
                    else alumno[campo] = nuevoValor;
                    alert(`${campo} actualizado exitosamente.`);
                    alumno.cargarPerfil();
                    formEditarPerfil.style.display = "none";

                    // Guardar los datos actualizados
                    await guardarDatos(data);
                }
            });

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