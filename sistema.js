// Función para cargar los usuarios desde el archivo admin_datos.txt
async function cargarUsuarios() {
    try {
        const response = await fetch("admin_datos.txt");
        const data = await response.json();
        return data.usuarios; // Retorna los usuarios
    } catch (error) {
        console.error("Error al cargar los datos de usuarios:", error);
        return null; // Si hay un error, retorna null
    }
}

// Función para validar las credenciales del usuario
function validarCredenciales(usuarios, usuario, password) {
    // Buscar el usuario por el email
    const usuarioEncontrado = usuarios.find(u => u.email === usuario); // Buscar por email
    if (usuarioEncontrado && usuarioEncontrado.password === password) {
        return true; // Si se encuentra y las contraseñas coinciden, devuelve true
    } else {
        return false; // Si no se encuentra o la contraseña no coincide, devuelve false
    }
}

// Login y validación
document.getElementById("loginForm")?.addEventListener("submit", async function (e) {
    e.preventDefault(); // Evitar que el formulario se envíe
    const usuario = document.getElementById("usuario").value; // Obtener el email del formulario
    const password = document.getElementById("password").value; // Obtener la contraseña del formulario

    const usuarios = await cargarUsuarios();  // Cargar los usuarios desde el archivo
    console.log("Usuarios:", usuarios); // Verificar que los usuarios se cargan correctamente

    // Verificar si el usuario existe y si la contraseña coincide
    if (usuarios && validarCredenciales(usuarios, usuario, password)) {
        redirigirPorRol(usuarios, usuario); // Llama a la función que decide el destino
    } else {
        alert("Usuario o contraseña incorrectos."); // Si no coincide, muestra un mensaje de error
    }
});

// Redirigir según el rol
function redirigirPorRol(usuarios, usuario) {
    const usuarioEncontrado = usuarios.find(u => u.email === usuario);
    const rol = usuarioEncontrado ? usuarioEncontrado.rol : null; // Obtener el rol del usuario

    if (rol) {
        localStorage.setItem("usuario", usuario); // Guardamos el usuario
        localStorage.setItem("rol", rol); // Guardamos el rol
        console.log("Usuario guardado en localStorage:", usuario); // Verifica si el usuario está guardado

        // Redirigir según el rol
        if (rol === "administrador") {
            window.location.href = "admin.html"; // Redirige al panel del Administrador
        } else if (rol === "maestro") {
            window.location.href = "maestro.html"; // Redirige al panel del Maestro
        } else if (rol === "alumno") {
            window.location.href = "panelAlumno.html"; // Redirige al panel del Alumno
        }
    } else {
        console.error("Rol no encontrado.");
        alert("Error: Rol no encontrado.");
    }
}

// Mostrar correos y contraseñas de los alumnos
document.addEventListener("DOMContentLoaded", async () => {
    const usuarios = await cargarUsuarios();
    const listaAlumnos = document.getElementById("listaAlumnos");
    if (usuarios) {
        usuarios.forEach(usuario => {
            if (usuario.rol === "alumno") {
                const li = document.createElement("li");
                li.textContent = `Correo: ${usuario.email}, Contraseña: ${usuario.password}`;
                listaAlumnos.appendChild(li);
            }
        });
    }
});