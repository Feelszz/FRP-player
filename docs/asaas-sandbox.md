# Asaas Sandbox no FPR Player

O site cria uma cobrança Pix dinâmica no endpoint `/api/asaas/create-payment`. O valor oficial é R$ 41,00; quando a página é aberta com `#ativacao-dev`, o valor é R$ 0,05. O QR Code exibido após o formulário vem diretamente da cobrança criada no Asaas.

O webhook deve apontar para `/api/asaas/webhook`. O código de ativação só é gerado no evento `PAYMENT_RECEIVED` e somente quando o valor recebido coincide com o valor da cobrança. O endpoint `/api/asaas/payment-status?orderId=...` é consultado pelo site para exibir o código depois da confirmação.

Configure `ASAAS_API_KEY` com uma chave da conta Sandbox e defina `ASAAS_WEBHOOK_TOKEN` com o mesmo token configurado no webhook do Asaas. Nunca use a chave de produção no Sandbox.

O armazenamento atual dos pedidos é em memória, adequado para homologação. Antes de produção, os pedidos, códigos e idempotência do webhook devem ser persistidos em banco de dados. O envio de e-mail do código também requer um provedor de e-mail configurado; o site mantém esse estado separado e não libera o código antes da confirmação do Pix.
