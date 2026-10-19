# Segurança, ativação e ativador administrativo

O QR Code exibido no site é apenas uma representação da cobrança criada no Asaas. O valor e o destinatário são definidos no servidor; o cliente não decide esses dados. A liberação ocorre somente após `PAYMENT_RECEIVED` confirmado pelo webhook autenticado ou após consulta válida ao Asaas.

O ativador administrativo não é uma página pública nem é incluído no APK. Use `tools/admin-activate.mjs` em uma máquina segura com `FPR_ADMIN_TOKEN` configurado no servidor. Exemplo: `FPR_ADMIN_TOKEN=... FPR_SITE_URL=https://seu-site node tools/admin-activate.mjs FPR-ABC12345`.

O app registra o ID, consulta o status remoto e valida o código no servidor antes de considerar a licença ativa. O estado do servidor é salvo em `data/activation-state.json` quando o ambiente permite escrita. Para produção, use armazenamento persistente gerenciado e HTTPS.

Nenhum APK pode garantir proteção absoluta contra cópia, modificação ou engenharia reversa. O APK não deve conter `ASAAS_API_KEY` nem `FPR_ADMIN_TOKEN`; essas credenciais ficam exclusivamente no servidor/ambiente seguro.
