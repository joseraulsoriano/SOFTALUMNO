const logoutBtn = document.getElementById("logoutButton");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("usuario");
        localStorage.removeItem("rol");
        window.location.href = "index.html";
    });