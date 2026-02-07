const form = document.getElementById("loginForm");
const alertBox = document.getElementById("alertBox");
const btnLogin = document.getElementById("btnLogin");
const togglePass = document.getElementById("togglePass");
const year = document.getElementById("year");
year.textContent = new Date().getFullYear();

togglePass.addEventListener("click", () => {
  const passInput = form.querySelector('input[name="password"]');
  const icon = togglePass.querySelector("i");
  const isPassword = passInput.type === "password";
  passInput.type = isPassword ? "text" : "password";
  icon.className = isPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
});

function showAlert(type, msg){
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = msg;
  alertBox.classList.remove("d-none");
}

function hideAlert(){
  alertBox.classList.add("d-none");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAlert();

  const fd = new FormData(form);
  const payload = {
    username: fd.get("username"),
    password: fd.get("password")
  };

  btnLogin.disabled = true;
  btnLogin.classList.add("loading");
  btnLogin.innerHTML = `<span>Entrando...</span> <i class="fa-solid fa-circle-notch fa-spin"></i>`;

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      showAlert("danger", data.message || "Falha no login.");
      btnLogin.disabled = false;
      btnLogin.innerHTML = `<span>Entrar</span> <i class="fa-solid fa-arrow-right-to-bracket"></i>`;
      return;
    }

    // sucesso -> redirect
    window.location.href = data.redirectTo || "/dashboard.html";
  } catch (err) {
    showAlert("danger", "Erro de conexão. Tente novamente.");
    btnLogin.disabled = false;
    btnLogin.innerHTML = `<span>Entrar</span> <i class="fa-solid fa-arrow-right-to-bracket"></i>`;
  }
});
