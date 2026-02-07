let donutChart = null;
let lineChart = null;

let shopsCache = [];
let isEditMode = false;
let editingId = null;

const shopsTbody = document.getElementById("shopsTbody");
const shopsCount = document.getElementById("shopsCount");
const shopsActiveCount = document.getElementById("shopsActiveCount");

const btnNewShop = document.getElementById("btnNewShop");
const modalEl = document.getElementById("shopModal");
const modal = new bootstrap.Modal(modalEl);

const shopAlert = document.getElementById("shopAlert");

const shopStepHint = document.getElementById("shopStepHint");
const shopStepProgress = document.getElementById("shopStepProgress");
const shopStepBtn1 = document.getElementById("shopStepBtn1");
const shopStepBtn2 = document.getElementById("shopStepBtn2");
const shopStepBtn3 = document.getElementById("shopStepBtn3");

const shopStep1 = document.getElementById("shopStep1");
const shopStep2 = document.getElementById("shopStep2");
const shopStep3 = document.getElementById("shopStep3");

const shopPrev = document.getElementById("shopPrev");
const shopNext = document.getElementById("shopNext");
const shopSave = document.getElementById("shopSave");

const form = document.getElementById("shopForm");
const planSelect = document.getElementById("planId");

const donutPlans = document.getElementById("donutPlans");
const lineShops = document.getElementById("lineShops");
const yearBadge = document.getElementById("yearBadge");

const cepInput = document.getElementById("cep");
const stateInput = document.getElementById("state");
const cityInput = document.getElementById("city");
const streetInput = document.getElementById("street");

const shopSumUser = document.getElementById("shopSumUser");
const shopSumLink = document.getElementById("shopSumLink");

let currentStep = 1;

/* =========================
   Helpers UI
========================= */
function showAlert(type, msg) {
  shopAlert.className = `alert alert-${type}`;
  shopAlert.textContent = msg;
  shopAlert.classList.remove("d-none");
}
function hideAlert() {
  shopAlert.classList.add("d-none");
}
function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString("pt-BR"); } catch { return "-"; }
}
function slugify(tradeName) {
  const s = String(tradeName || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9\s]/g, " ")
    .trim().replace(/\s+/g, "_");
  return s || "barbearia";
}

function setModalTitle(title) {
  const el = modalEl.querySelector(".modal-title");
  if (el) el.textContent = title;
}

function setSaveButtonLabel(label) {
  shopSave.innerHTML = `<i class="fa-solid fa-floppy-disk me-2"></i>${label}`;
}

/* =========================
   Steps
========================= */
function setStep(n) {
  currentStep = n;

  shopStep1.classList.toggle("d-none", n !== 1);
  shopStep2.classList.toggle("d-none", n !== 2);
  shopStep3.classList.toggle("d-none", n !== 3);

  shopStepBtn1.classList.toggle("active", n === 1);
  shopStepBtn2.classList.toggle("active", n === 2);
  shopStepBtn3.classList.toggle("active", n === 3);

  const map = { 1: "33%", 2: "66%", 3: "100%" };
  shopStepProgress.style.width = map[n] || "33%";

  shopPrev.disabled = n === 1;
  shopNext.classList.toggle("d-none", n === 3);
  shopSave.classList.toggle("d-none", n !== 3);

  shopStepHint.textContent = n === 1
    ? "Step 01 • Dados da barbearia"
    : n === 2
      ? "Step 02 • Dados de Endereço"
      : "Step 03 • Dados de membros e faturamento";

  hideAlert();
}

function resetModal() {
  form.reset();
  setStep(1);
  hideAlert();

  isEditMode = false;
  editingId = null;

  setModalTitle("Adicionar nova barbearia");
  setSaveButtonLabel("Salvar Barbearia");

  updateAccessPreview(); // preview para criação
}

function validateStep1() {
  const tradeName = form.querySelector('[name="tradeName"]').value.trim();
  if (!tradeName) {
    showAlert("danger", "Preencha o Nome fantasia.");
    return false;
  }
  return true;
}

function validateStep2() {
  // Endereço opcional
  return true;
}

/* =========================
   Form data
========================= */
function readPayload() {
  const fd = new FormData(form);
  return {
    cnpj: fd.get("cnpj") || "",
    tradeName: fd.get("tradeName") || "",
    phone: fd.get("phone") || "",
    email: fd.get("email") || "",
    address: {
      cep: fd.get("cep") || "",
      state: fd.get("state") || "",
      city: fd.get("city") || "",
      street: fd.get("street") || "",
      number: fd.get("number") || "",
      complement: fd.get("complement") || ""
    },
    membersQty: Number(fd.get("membersQty") || 0),
    avgRevenue: Number(fd.get("avgRevenue") || 0),
    planId: fd.get("planId") || ""
  };
}

function fillFormFromShop(shop) {
  // Step 1
  form.querySelector('[name="cnpj"]').value = shop.cnpj || "";
  form.querySelector('[name="tradeName"]').value = shop.tradeName || "";
  form.querySelector('[name="phone"]').value = shop.phone || "";
  form.querySelector('[name="email"]').value = shop.email || "";

  // Step 2
  form.querySelector('[name="cep"]').value = shop.address?.cep || "";
  form.querySelector('[name="state"]').value = shop.address?.state || "";
  form.querySelector('[name="city"]').value = shop.address?.city || "";
  form.querySelector('[name="street"]').value = shop.address?.street || "";
  form.querySelector('[name="number"]').value = shop.address?.number || "";
  form.querySelector('[name="complement"]').value = shop.address?.complement || "";

  // Step 3
  form.querySelector('[name="membersQty"]').value = String(shop.membersQty ?? 0);
  form.querySelector('[name="avgRevenue"]').value = String(shop.avgRevenue ?? 0);

  // plan
  const planId = shop.planId?._id || shop.planId || "";
  planSelect.value = planId ? String(planId) : "";
}

/* Preview de acesso */
function updateAccessPreviewFromCreate() {
  const tradeName = form.querySelector('[name="tradeName"]').value.trim();
  const user = slugify(tradeName);
  shopSumUser.textContent = user;
  shopSumLink.textContent = `${location.origin}/barbearia-login.html`;
}

function updateAccessPreviewFromEdit(shop) {
  shopSumUser.textContent = shop.username || "—";
  shopSumLink.textContent = `${location.origin}/barbearia-login.html`;
}

function updateAccessPreview() {
  if (isEditMode) return;
  updateAccessPreviewFromCreate();
}

/* CEP Auto preenchimento (ViaCEP) */
async function viaCepLookup(cep) {
  const clean = String(cep || "").replace(/\D/g, "");
  if (clean.length !== 8) return;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    const data = await res.json();
    if (data.erro) return;

    stateInput.value = data.uf || "";
    cityInput.value = data.localidade || "";
    streetInput.value = data.logradouro || "";
  } catch {
    // silencioso
  }
}

/* =========================
   API
========================= */
async function fetchPlansForSelect() {
  const res = await fetch("/api/plans");
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) return;

  const plans = data.plans || [];
  planSelect.innerHTML =
    `<option value="">Sem plano</option>` +
    plans.map(p => `<option value="${p._id}">${p.name} (${p.code})</option>`).join("");
}

async function fetchShops() {
  const res = await fetch("/api/barbearias");
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.message || "Erro ao listar barbearias.");

  shopsCache = data.barbearias || [];

  shopsCount.textContent = `${shopsCache.length} barbearias`;
  shopsActiveCount.textContent = `${shopsCache.filter(s => s.isActive).length} ativas`;

  if (!shopsCache.length) {
    shopsTbody.innerHTML = `<tr><td colspan="6" class="text-muted">Nenhuma barbearia cadastrada ainda.</td></tr>`;
    return;
  }

  shopsTbody.innerHTML = shopsCache.map(s => `
    <tr>
      <td><span class="badge soft-badge">${String(s.code).padStart(3,"0")}</span></td>
      <td>
        <div class="fw-semibold">${s.tradeName}</div>
        <div class="text-muted small">Usuário: ${s.username}</div>
      </td>
      <td class="text-muted">${s.email || "-"}</td>
      <td class="text-muted">${fmtDate(s.createdAt)}</td>
      <td>
        ${s.planId?.name
          ? `<span class="badge soft-badge">${s.planId.name}</span>`
          : `<span class="text-muted">Sem plano</span>`}
      </td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${s._id}" title="Editar">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button class="btn btn-sm btn-outline-primary me-1" data-action="toggle" data-id="${s._id}" title="Ativar/Desativar">
          <i class="fa-solid ${s.isActive ? "fa-toggle-on" : "fa-toggle-off"}"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${s._id}" title="Excluir">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join("");
}

async function fetchDonutPlans() {
  const res = await fetch("/api/barbearias/stats/by-plan");
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) return;

  if (donutChart) donutChart.destroy();
  donutChart = new Chart(donutPlans, {
    type: "doughnut",
    data: { labels: data.labels || [], datasets: [{ data: data.values || [] }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
      cutout: "68%"
    }
  });
}

async function fetchLineShops(year) {
  const res = await fetch(`/api/barbearias/stats/created-by-month?year=${encodeURIComponent(year)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) return;

  yearBadge.textContent = `Ano: ${data.year || year}`;

  if (lineChart) lineChart.destroy();
  lineChart = new Chart(lineShops, {
    type: "line",
    data: {
      labels: data.labels || [],
      datasets: [{ data: data.values || [], tension: 0.25 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

async function refreshAll() {
  await fetchPlansForSelect();
  await fetchShops();
  await fetchDonutPlans();
  await fetchLineShops(new Date().getFullYear());
}

/* =========================
   Open modal
========================= */
function openCreateModal() {
  resetModal();
  modal.show();
}

function openEditModal(shop) {
  resetModal();

  isEditMode = true;
  editingId = shop._id;

  setModalTitle(`Editar barbearia • ${shop.tradeName}`);
  setSaveButtonLabel("Salvar alterações");

  fillFormFromShop(shop);
  updateAccessPreviewFromEdit(shop);

  setStep(1);
  modal.show();
}

/* =========================
   Events
========================= */
btnNewShop.addEventListener("click", () => openCreateModal());

shopPrev.addEventListener("click", () => setStep(Math.max(1, currentStep - 1)));

shopNext.addEventListener("click", () => {
  if (currentStep === 1 && !validateStep1()) return;
  if (currentStep === 2 && !validateStep2()) return;
  setStep(Math.min(3, currentStep + 1));
});

shopStepBtn1.addEventListener("click", () => setStep(1));
shopStepBtn2.addEventListener("click", () => { if (!validateStep1()) return; setStep(2); });
shopStepBtn3.addEventListener("click", () => { if (!validateStep1()) return; setStep(3); });

form.addEventListener("input", () => updateAccessPreview());
cepInput.addEventListener("blur", () => viaCepLookup(cepInput.value));

shopSave.addEventListener("click", async () => {
  if (!validateStep1()) { setStep(1); return; }

  const payload = readPayload();

  try {
    shopSave.disabled = true;
    shopSave.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin me-2"></i>Salvando...`;

    // CREATE
    if (!isEditMode) {
      const res = await fetch("/api/barbearias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        showAlert("danger", data.message || "Erro ao salvar.");
        return;
      }

      const email = data.barbearia?.email || payload.email || "";
      const accessUser = data.access?.username;
      const accessPass = data.access?.defaultPassword;
      const loginUrl = data.access?.loginUrl || `${location.origin}/barbearia-login.html`;

      if (data.mailSent) {
        const msg = email
          ? `Barbearia criada! Enviamos os dados de acesso automaticamente para: ${email}`
          : `Barbearia criada! (Sem e-mail cadastrado para envio automático.)`;
        alert(`${msg}\n\nLink de acesso: ${loginUrl}`);
      } else {
        let warn = "Barbearia criada, mas não foi possível enviar o e-mail automaticamente.";
        if (!email) warn = "Barbearia criada, mas não há e-mail informado para envio automático.";

        alert(
          `${warn}\n\n` +
          `Usuário: ${accessUser}\n` +
          `Senha inicial: ${accessPass}\n` +
          `Link de acesso: ${loginUrl}\n\n` +
          `No primeiro login, será obrigatório alterar a senha.`
        );
      }

      modal.hide();
      await refreshAll();
      return;
    }

    // EDIT
    const res = await fetch(`/api/barbearias/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      showAlert("danger", data.message || "Erro ao salvar alterações.");
      return;
    }

    alert("Barbearia atualizada com sucesso!");
    modal.hide();
    await refreshAll();
  } catch {
    showAlert("danger", "Falha de conexão.");
  } finally {
    shopSave.disabled = false;
    // volta label correto
    setSaveButtonLabel(isEditMode ? "Salvar alterações" : "Salvar Barbearia");
  }
});

shopsTbody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === "toggle") {
    await fetch(`/api/barbearias/${id}/toggle`, { method: "PATCH" });
    await refreshAll();
    return;
  }

  if (action === "delete") {
    const ok = confirm("Tem certeza que deseja excluir esta barbearia?");
    if (!ok) return;
    await fetch(`/api/barbearias/${id}`, { method: "DELETE" });
    await refreshAll();
    return;
  }

  if (action === "edit") {
    const shop = shopsCache.find(s => String(s._id) === String(id));
    if (!shop) {
      alert("Não foi possível carregar esta barbearia para edição.");
      return;
    }
    openEditModal(shop);
    return;
  }
});

/* Init */
(async function init() {
  try {
    await refreshAll();
  } catch {
    shopsTbody.innerHTML = `<tr><td colspan="6" class="text-danger">Erro ao carregar barbearias.</td></tr>`;
  }
})();
