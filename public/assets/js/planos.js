let plansCache = [];
let donutChart = null;
let lineChart = null;

const tbody = document.getElementById("plansTbody");
const plansCount = document.getElementById("plansCount");
const activeCount = document.getElementById("activeCount");
const activeInBarbearias = document.getElementById("activeInBarbearias");
const activeYearBadge = document.getElementById("activeYearBadge");

const btnNewPlan = document.getElementById("btnNewPlan");
const modalEl = document.getElementById("planModal");
const modal = new bootstrap.Modal(modalEl);

// Steps
const stepHint = document.getElementById("stepHint");
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");

const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnSave = document.getElementById("btnSave");

const form = document.getElementById("planForm");
const modalAlert = document.getElementById("modalAlert");

let currentStep = 1;

// Stepper UI
const stepProgress = document.getElementById("stepProgress");
const stepBtn1 = document.getElementById("stepBtn1");
const stepBtn2 = document.getElementById("stepBtn2");
const stepBtn3 = document.getElementById("stepBtn3");

// Switches (Step 2)
const permMetas = document.getElementById("perm_metas");
const permCrm = document.getElementById("perm_crm");
const permInovacao = document.getElementById("perm_inovacao");
const permEducacao = document.getElementById("perm_educacao");
const permSuporte = document.getElementById("perm_suporteEspecializado");
const permAssinaturas = document.getElementById("perm_assinaturas");
const permIntegracoes = document.getElementById("perm_integracoes");

// Step 3 fields/badges
const crmBadge = document.getElementById("crmBadge");
const supportBadge = document.getElementById("supportBadge");
const subsBadge = document.getElementById("subsBadge");
const integrBadge = document.getElementById("integrBadge");

const suporteEnabled = document.getElementById("suporteEnabled");
const assinaturasLimit = document.getElementById("assinaturasLimit");
const integracoesEnabled = document.getElementById("integracoesEnabled");

// Resumo ao vivo
const sumName = document.getElementById("sumName");
const sumCategory = document.getElementById("sumCategory");
const sumResponsible = document.getElementById("sumResponsible");
const sumStart = document.getElementById("sumStart");
const sumEnd = document.getElementById("sumEnd");
const sumPrice = document.getElementById("sumPrice");
const sumPromo = document.getElementById("sumPromo");
const sumRole = document.getElementById("sumRole");
const sumRoleName = document.getElementById("sumRoleName");
const sumPerms = document.getElementById("sumPerms");

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR");
  } catch {
    return "-";
  }
}

function showModalAlert(type, msg) {
  modalAlert.className = `alert alert-${type}`;
  modalAlert.textContent = msg;
  modalAlert.classList.remove("d-none");
}

function hideModalAlert() {
  modalAlert.classList.add("d-none");
}

function moneyBR(v) {
  const num = Number(v);
  if (!isFinite(num)) return "—";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getPermLabel(p) {
  const keys = Object.entries(p || {})
    .filter(([, v]) => !!v)
    .map(([k]) => k);

  if (!keys.length) return `<span class="text-muted">Nenhuma</span>`;

  const map = {
    metas: "Metas",
    crm: "CRM",
    inovacao: "Inovação",
    educacao: "Educação",
    suporteEspecializado: "Suporte",
    assinaturas: "Assinaturas",
    integracoes: "Integrações"
  };

  const labels = keys.map(k => map[k] || k);
  return (
    labels
      .slice(0, 3)
      .map(x => `<span class="badge soft-badge me-1">${x}</span>`)
      .join("") + (labels.length > 3 ? `<span class="text-muted small">+${labels.length - 3}</span>` : "")
  );
}

function renderTable(plans) {
  plansCount.textContent = `${plans.length} planos`;

  const actives = plans.filter(p => p.isActive).length;
  activeCount.textContent = `${actives} ativos`;

  if (!plans.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-muted">Nenhum plano cadastrado ainda.</td></tr>`;
    return;
  }

  tbody.innerHTML = plans
    .map(p => {
      return `
      <tr>
        <td><span class="badge soft-badge">${p.code}</span></td>
        <td>
          <div class="fw-semibold">${p.name}</div>
          <div class="text-muted small">${p.category || "Sem categoria"} • <span class="text-muted">Role:</span> ${p.roleKey}</div>
        </td>
        <td class="text-muted">${fmtDate(p.createdAt)}</td>
        <td class="text-muted">${fmtDate(p.endAt)}</td>
        <td>${p.responsible}</td>
        <td>${getPermLabel(p.permissions)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${p._id}" title="Editar">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn btn-sm btn-outline-primary me-1" data-action="toggle" data-id="${p._id}" title="Ativar/Desativar">
            <i class="fa-solid ${p.isActive ? "fa-toggle-on" : "fa-toggle-off"}"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${p._id}" title="Excluir">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
    })
    .join("");
}

/* =========================
   API calls
========================= */
async function fetchPlans() {
  const res = await fetch("/api/plans");
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.message || "Erro ao listar planos.");
  plansCache = data.plans || [];
  renderTable(plansCache);
}

async function fetchDonut() {
  const res = await fetch("/api/plans/stats/active-by-category");
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) return;

  const labels = data.labels || [];
  const values = data.values || [];

  const ctx = document.getElementById("donutChart");
  if (!ctx) return;

  if (donutChart) donutChart.destroy();

  donutChart = new Chart(ctx, {
    type: "doughnut",
    data: { labels, datasets: [{ data: values }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
      cutout: "68%"
    }
  });
}

async function fetchLine(year) {
  const res = await fetch(`/api/plans/stats/active-by-month?year=${encodeURIComponent(year)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) return;

  const labels = data.labels || [];
  const values = data.values || [];
  activeYearBadge.textContent = `Ano: ${data.year || year}`;

  const ctx = document.getElementById("lineChart");
  if (!ctx) return;

  if (lineChart) lineChart.destroy();

  lineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{ label: "Ativos", data: values, tension: 0.25 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });
}

async function fetchActiveInBarbearias() {
  const res = await fetch("/api/plans/stats/active-in-barbearias");
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) return;
  activeInBarbearias.textContent = `${data.count || 0} ativos em barbearias`;
}

/* =========================
   Modal logic
========================= */
function updateSummary() {
  const name = form.querySelector('[name="name"]').value.trim();
  const category = form.querySelector('[name="category"]').value.trim() || "Sem categoria";
  const responsible = form.querySelector('[name="responsible"]').value.trim();

  const startAt = form.querySelector('[name="startAt"]').value;
  const endAt = form.querySelector('[name="endAt"]').value;

  const price = form.querySelector('[name="price"]').value;
  const promo = form.querySelector('[name="promoPrice"]').value;

  sumName.textContent = name || "—";
  sumCategory.textContent = category || "—";
  sumResponsible.textContent = responsible || "—";
  sumStart.textContent = startAt ? new Date(startAt + "T00:00:00").toLocaleDateString("pt-BR") : "—";
  sumEnd.textContent = endAt ? new Date(endAt + "T00:00:00").toLocaleDateString("pt-BR") : "—";

  sumPrice.textContent = price !== "" ? moneyBR(price) : "—";
  sumPromo.textContent = promo !== "" ? moneyBR(promo) : "—";

  // Preview (backend gera o real)
  sumRole.textContent = "ROLE_PLN_000X";
  sumRoleName.textContent = `Plano: ${name || "—"} (PLN-000X)`;

  const perms = [];
  if (permMetas.checked) perms.push("Metas");
  if (permCrm.checked) perms.push("CRM");
  if (permInovacao.checked) perms.push("Inovação");
  if (permEducacao.checked) perms.push("Educação");
  if (permSuporte.checked) perms.push("Suporte");
  if (permAssinaturas.checked) perms.push("Assinaturas");
  if (permIntegracoes.checked) perms.push("Integrações");

  sumPerms.innerHTML = perms.length
    ? perms.map(p => `<span class="badge soft-badge">${p}</span>`).join("")
    : `<span class="text-muted small">Nenhuma selecionada</span>`;
}

function applyStep3Availability() {
  // CRM Apps
  const crmOn = permCrm.checked;
  crmBadge.textContent = crmOn ? "CRM habilitado" : "CRM desabilitado";
  document.querySelectorAll('input[name="crmApps"]').forEach(cb => {
    cb.disabled = !crmOn;
    if (!crmOn) cb.checked = false;
  });
  document.querySelectorAll(".crm-app").forEach(lbl => lbl.classList.toggle("disabled", !crmOn));

  // Suporte
  const supOn = permSuporte.checked;
  supportBadge.textContent = supOn ? "Disponível" : "Desabilitado";
  suporteEnabled.disabled = !supOn;
  if (!supOn) suporteEnabled.value = "0";

  // Assinaturas
  const subsOn = permAssinaturas.checked;
  subsBadge.textContent = subsOn ? "Disponível" : "Desabilitado";
  assinaturasLimit.disabled = !subsOn;
  if (!subsOn) assinaturasLimit.value = "0";

  // Integrações
  const integOn = permIntegracoes.checked;
  integrBadge.textContent = integOn ? "Disponível" : "Desabilitado";
  integracoesEnabled.disabled = !integOn;
  if (!integOn) integracoesEnabled.value = "0";
}

function setStep(n) {
  currentStep = n;

  step1.classList.toggle("d-none", n !== 1);
  step2.classList.toggle("d-none", n !== 2);
  step3.classList.toggle("d-none", n !== 3);

  // Stepper UI
  stepBtn1.classList.toggle("active", n === 1);
  stepBtn2.classList.toggle("active", n === 2);
  stepBtn3.classList.toggle("active", n === 3);

  const progressMap = { 1: "33%", 2: "66%", 3: "100%" };
  stepProgress.style.width = progressMap[n] || "33%";

  btnPrev.disabled = n === 1;
  btnNext.classList.toggle("d-none", n === 3);
  btnSave.classList.toggle("d-none", n !== 3);

  const hints = {
    1: "Step 01 • Dados do Plano",
    2: "Step 02 • Permissões do Plano",
    3: "Step 03 • Permissões das áreas"
  };
  stepHint.textContent = hints[n] || "";
  hideModalAlert();

  applyStep3Availability();
  updateSummary();
}

function resetModal() {
  form.reset();

  // defaults
  form.querySelector('[name="planQtyLimit"]').value = "0";
  assinaturasLimit.value = "0";
  integracoesEnabled.value = "0";
  suporteEnabled.value = "0";

  permMetas.checked = false;
  permCrm.checked = false;
  permInovacao.checked = false;
  permEducacao.checked = false;
  permSuporte.checked = false;
  permAssinaturas.checked = false;
  permIntegracoes.checked = false;

  document.querySelectorAll('input[name="crmApps"]').forEach(cb => {
    cb.checked = false;
    cb.disabled = true;
  });

  setStep(1);
  updateSummary();
}

function readPayloadFromForm() {
  const fd = new FormData(form);

  const crmApps = [];
  document.querySelectorAll('input[name="crmApps"]:checked').forEach(cb => crmApps.push(cb.value));

  return {
    name: fd.get("name"),
    category: fd.get("category"),
    startAt: fd.get("startAt"),
    endAt: fd.get("endAt"),
    responsible: fd.get("responsible"),
    planQtyLimit: Number(fd.get("planQtyLimit") || 0),
    price: Number(fd.get("price") || 0),
    promoPrice: fd.get("promoPrice") || "",

    permissions: {
      metas: permMetas.checked,
      crm: permCrm.checked,
      inovacao: permInovacao.checked,
      educacao: permEducacao.checked,
      suporteEspecializado: permSuporte.checked,
      assinaturas: permAssinaturas.checked,
      integracoes: permIntegracoes.checked
    },

    areaRules: {
      crmApps,
      assinaturasLimit: Number(fd.get("assinaturasLimit") || 0),
      integracoesEnabled: fd.get("integracoesEnabled") === "1",
      suporteEnabled: fd.get("suporteEnabled") === "1"
    }
  };
}

function validateStep1() {
  const name = form.querySelector('[name="name"]').value.trim();
  const startAt = form.querySelector('[name="startAt"]').value;
  const endAt = form.querySelector('[name="endAt"]').value;
  const responsible = form.querySelector('[name="responsible"]').value.trim();
  const price = form.querySelector('[name="price"]').value;

  if (!name || !startAt || !endAt || !responsible || price === "") {
    showModalAlert("danger", "Preencha: Nome, Início, Fim, Responsável e Valor.");
    return false;
  }
  if (new Date(endAt) < new Date(startAt)) {
    showModalAlert("danger", "A data de fim não pode ser menor que a data de início.");
    return false;
  }
  return true;
}

/* =========================
   Events
========================= */
btnNewPlan.addEventListener("click", () => {
  resetModal();
  modal.show();
});

btnPrev.addEventListener("click", () => setStep(Math.max(1, currentStep - 1)));

btnNext.addEventListener("click", () => {
  if (currentStep === 1 && !validateStep1()) return;
  setStep(Math.min(3, currentStep + 1));
});

// Stepper clicks
stepBtn1.addEventListener("click", () => setStep(1));
stepBtn2.addEventListener("click", () => {
  if (!validateStep1()) return;
  setStep(2);
});
stepBtn3.addEventListener("click", () => {
  if (!validateStep1()) return;
  setStep(3);
});

// Live summary & availability
form.addEventListener("input", () => updateSummary());
form.addEventListener("change", () => {
  applyStep3Availability();
  updateSummary();
});

btnSave.addEventListener("click", async () => {
  if (!validateStep1()) {
    setStep(1);
    return;
  }

  const payload = readPayloadFromForm();

  try {
    btnSave.disabled = true;
    btnSave.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin me-2"></i>Salvando...`;

    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      showModalAlert("danger", data.message || "Erro ao salvar.");
      return;
    }

    modal.hide();
    await refreshAll();
  } catch {
    showModalAlert("danger", "Falha de conexão ao salvar.");
  } finally {
    btnSave.disabled = false;
    btnSave.innerHTML = `<i class="fa-solid fa-floppy-disk me-2"></i>Salvar Plano`;
  }
});

tbody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if (action === "toggle") {
    await fetch(`/api/plans/${id}/toggle`, { method: "PATCH" });
    await refreshAll();
  }

  if (action === "delete") {
    const ok = confirm("Tem certeza que deseja excluir este plano?");
    if (!ok) return;
    await fetch(`/api/plans/${id}`, { method: "DELETE" });
    await refreshAll();
  }

  if (action === "edit") {
    alert("Editar: endpoint pronto (PUT /api/plans/:id). Se quiser, eu já coloco o modal em modo edição com preenchimento automático.");
  }
});

/* =========================
   Init / Refresh
========================= */
async function refreshAll() {
  await fetchPlans();
  await fetchDonut();
  await fetchLine(new Date().getFullYear());
  await fetchActiveInBarbearias();
}

(async function init() {
  try {
    await refreshAll();
  } catch {
    tbody.innerHTML = `<tr><td colspan="7" class="text-danger">Erro ao carregar planos.</td></tr>`;
  }
})();
