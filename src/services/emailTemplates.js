function shopAccessEmailTemplate({ tradeName, username, defaultPassword, loginUrl }) {
  const subject = `Acesso da Barbearia • ${tradeName}`;

  const text =
`Olá, ${tradeName}!

Seu acesso ao thynkBarber foi criado.

Usuário: ${username}
Senha inicial: ${defaultPassword}

Link de acesso: ${loginUrl}

IMPORTANTE: No primeiro login, será obrigatório alterar a senha.

— thynkBarber`;

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:18px">
    <h2 style="margin:0 0 6px 0;color:#1f2a37">Acesso criado • ${tradeName}</h2>
    <p style="margin:0 0 14px 0;color:#6b7280">
      Seu acesso ao <b>thynkBarber</b> foi criado com sucesso.
    </p>

    <div style="border:1px solid rgba(31,42,55,0.12);border-radius:14px;padding:14px;background:#fff">
      <p style="margin:0 0 8px 0"><b>Usuário:</b> ${username}</p>
      <p style="margin:0 0 8px 0"><b>Senha inicial:</b> ${defaultPassword}</p>
      <p style="margin:0"><b>Link:</b> <a href="${loginUrl}">${loginUrl}</a></p>
    </div>

    <p style="margin:14px 0 0 0;color:#6b7280">
      <b>Importante:</b> no primeiro login, será obrigatório alterar a senha.
    </p>

    <hr style="border:none;border-top:1px solid rgba(31,42,55,0.10);margin:16px 0">
    <p style="margin:0;color:#9ca3af;font-size:12px">thynkBarber</p>
  </div>
  `;

  return { subject, text, html };
}

module.exports = { shopAccessEmailTemplate };
