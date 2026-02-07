# ✂️ thynkBarber

Sistema SaaS para gestão de barbearias, com painel administrativo, planos com permissões, cadastro de barbearias, autenticação separada e estrutura preparada para crescimento.

---

## 📌 Visão Geral

O **thynkBarber** é uma plataforma desenvolvida para administrar múltiplas barbearias em um único sistema, permitindo:

- Gestão centralizada (Admin)
- Criação de planos com permissões (Roles)
- Cadastro e controle de barbearias
- Envio automático de credenciais por e-mail
- Primeiro acesso com troca obrigatória de senha
- Base sólida para funcionalidades futuras (agenda, CRM, financeiro)

---

## 🧱 Stack Tecnológica

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- bcryptjs
- express-session
- Nodemailer
- dotenv

### Frontend
- HTML5
- CSS3
- Bootstrap 5
- JavaScript (Vanilla)
- Chart.js
- Font Awesome
- Animate.css

### APIs Externas
- ViaCEP (autopreenchimento de endereço)

---

## 📁 Estrutura de Pastas

```bash
/
├── public/
│   ├── assets/
│   │   ├── css/
│   │   │   └── admin.css
│   │   └── js/
│   │       ├── admin-shell.js
│   │       ├── planos.js
│   │       └── barbearias.js
│   ├── login.html
│   ├── dashboard.html
│   ├── planos.html
│   ├── barbearias.html
│   ├── barbearia-login.html
│   └── barbearia-change-password.html
│
├── server/
│   ├── app.js
│   ├── server.js
│   └── src/
│       ├── config/
│       │   ├── db.js
│       │   ├── session.js
│       │   └── mailer.js
│       ├── controllers/
│       │   ├── adminController.js
│       │   ├── planController.js
│       │   └── barbeariaController.js
│       ├── middlewares/
│       │   ├── requireAdmin.js
│       │   ├── requireShop.js
│       │   └── errorHandler.js
│       ├── models/
│       │   ├── Admin.js
│       │   ├── Plan.js
│       │   └── Barbearia.js
│       ├── routes/
│       │   ├── adminRoutes.js
│       │   ├── planRoutes.js
│       │   └── barbeariaRoutes.js
│       ├── services/
│       │   ├── planService.js
│       │   ├── barbeariaService.js
│       │   └── emailTemplates.js
│       └── utils/
│           ├── asyncHandler.js
│           └── validators.js
🔐 Autenticação
Admin
Login via usuário e senha

Sessão com express-session

Middleware de proteção: requireAdmin

Barbearia
Login separado do admin

Usuário gerado automaticamente

Senha inicial padrão

Primeiro login obriga troca de senha

🧩 Modelos (MongoDB)
Admin
username
passwordHash
createdAt
Plan (Plano / Role)
code
name
roleKey
price
promoPrice
validFrom
validUntil
permissions
limits
isActive
Barbearia
code (0–999)
tradeName
cnpj
phone
email
address
membersQty
avgRevenue
planId
roleKey
username
passwordHash
mustChangePassword
isActive
createdAt
🌐 Rotas e APIs
Admin
Método	Rota	Descrição
POST	/api/admin/login	Login admin
GET	/api/admin/me	Sessão
POST	/api/admin/logout	Logout
Planos
Método	Rota
GET	/api/plans
POST	/api/plans
PUT	/api/plans/:id
PATCH	/api/plans/:id/toggle
DELETE	/api/plans/:id
GET	/api/plans/stats
Barbearias (Admin)
Método	Rota
GET	/api/barbearias
POST	/api/barbearias
PUT	/api/barbearias/:id
PATCH	/api/barbearias/:id/toggle
DELETE	/api/barbearias/:id
Estatísticas
Rota	Função
/api/barbearias/stats/by-plan	Gráfico rosquinha
/api/barbearias/stats/created-by-month	Gráfico em linha
Barbearia (Login)
Método	Rota
POST	/api/barbearias/auth/login
POST	/api/barbearias/auth/change-password
GET	/api/barbearias/auth/me
POST	/api/barbearias/auth/logout
📧 Envio de E-mail (Nodemailer)
Enviado automaticamente ao criar uma barbearia

Contém:

Usuário

Senha inicial

Link de acesso

Aviso de troca de senha

Variáveis .env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=seu_email@gmail.com
MAIL_PASS=senha_de_app
MAIL_FROM="thynkBarber <seu_email@gmail.com>"
APP_PUBLIC_URL=http://localhost:3000
📊 Frontend
Layout moderno (Light / Bege / Azul)

Modais em 3 steps

Validações por etapa

Preview de acesso

Gráficos com Chart.js

Sem scroll lateral

Totalmente responsivo

🔒 Regras de Negócio
Código da barbearia: 0–999

Username único e automático

Plano define permissões (Role)

Senhas sempre criptografadas

Falha de e-mail não bloqueia criação

Admin e Barbearia isolados

🚀 Próxima Atualização (Roadmap)
🔥 Painel da Barbearia
/barbearia.html

Sidebar própria

Dashboard individual

🔐 Permissões por Plano
Menus dinâmicos

Acesso limitado conforme role

📅 Agenda (Core do Sistema)
Agendamentos

Serviços

Profissionais

Clientes

🔮 Futuro
CRM

Financeiro

Metas

Relatórios

Integrações externas

Pagamentos (Stripe / Mercado Pago)

📄 Licença
Projeto privado / uso interno.
