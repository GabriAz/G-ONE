# G•ONE — Sistema Central Gabriel Azevedo
> **CRM + Controle + Notificações + Telegram — Uma fonte de verdade.**

---

## 🏷️ Identidade do Nome

**G•ONE** — escolhido pelo próprio Gabriel Azevedo em 02/03/2026.

| Elemento | Significado |
|---|---|
| **G** | Gabriel — o sistema é pessoal, feito para uma forma específica de operar |
| **•** | O ponto de conexão — onde tudo se une em um único núcleo |
| **ONE** | Uma fonte de verdade. Um lugar só. Zero duplicidade. |

> *"G•ONE não é um software. É um padrão de operação."*

---

## 🗂️ Repositórios de referência (somente leitura)
- `../Controle/` — sistema de tarefas/projetos em produção (Next.js + Prisma + MySQL)
- `../CRM/` — sistema de pipeline de leads (Node.js + Express + MySQL)

> 🔴 **Regra absoluta:** nenhuma dessas pastas será modificada. O G•ONE é um projeto novo.

---

## 1. Objetivo e Regra do Jogo

### 1.1 Objetivo
- Zero follow-up perdido
- Zero tarefa perdida
- Um lugar só para operar
- Previsibilidade (pipeline + execução + risco)

### 1.2 Mandamentos (regras duras)
- Nenhum item ativo pode existir sem **responsável**
- Nenhum item ativo pode existir sem **próxima ação** e/ou **data**
- Qualquer vencido vira **crítico**
- Crítico **insiste** até resolver (com limites para não virar spam)
- **Uma fonte de verdade** para atividades e prazos

---

## 2. Arquitetura — Núcleo Único + Módulos

> Não "fundir tudo em uma massa". **Núcleo único + módulos independentes.**

### 2.1 Módulos
| Módulo | Descrição |
|---|---|
| **CRM** | Leads / deals / pipeline |
| **Controle** | Tarefas / atividades / compromissos / projetos |
| **Notificações** | Motor + scheduler + logs |
| **Telegram** | Delivery + botões de ação |
| **Dashboard** | Cockpit de operação |

### 2.2 Núcleo Único — Activities
O núcleo é a tabela `activities` — fonte única de tudo que tem data, responsável e status.

> Se "tarefa no Controle" e "follow-up no CRM" ficarem separados → duplicidade e inconsistência no longo prazo.

---

## 3. Modelo de Dados Mínimo

### 3.1 Entidades Principais

#### Pessoas e Segurança
```
users
roles / permissões
telegram_accounts (user_id ↔ chat_id)
```

#### CRM
```
leads (prospects)
deals
pipeline_stages
deal_events (auditoria)
```

#### Controle
```
projects
tasks (mantida como referência histórica)
```

#### Núcleo — Activities (a mais importante)
```sql
activities
  id
  type:        FOLLOW_UP | TASK | MEETING | DELIVERY | REMINDER
  origin:      CRM | CONTROLE | SYSTEM
  entity_type: lead | deal | project | task | none
  entity_id
  title
  description
  due_at       (data + hora do evento)
  status:      OPEN | DONE | SNOOZED | CANCELED
  assigned_user_id
  priority:    LOW | MEDIUM | HIGH
  created_at
  updated_at
```

#### Notificações
```
notification_rules
notifications
notification_deliveries (tentativas, erros, retries)
notification_logs       (idempotência)
```

---

## 4. Pipeline CRM

### 4.1 Etapas (5–7)
1. Lead Novo
2. Qualificado
3. Diagnóstico / Reunião
4. Proposta Enviada
5. Negociação
6. Ganho ✅
7. Perdido ❌

### 4.2 Regra de movimentação (dura)
Não muda etapa sem:
- próxima ação definida (ou justificativa em Ganho/Perdido)
- responsável definido
- se "Proposta Enviada": follow-up automático obrigatório

---

## 5. Integração CRM → Controle

### 5.1 Evento: Deal = Ganho
Quando deal vira Ganho:
1. Cria `project`
2. Cria pacote de `activities` do tipo TASK (a partir de template/checklist)
3. Define prazos padrão
4. Notifica responsável e time

### 5.2 Templates de checklist
- Website
- Automação / IA
- Consultoria Estratégica
- Jurídico

---

## 6. Notificações — "Não esquecer nada" de verdade

> Notificação NÃO é só "mensagem". É um **processo de resolução**.

Cada notificação deve:
- Apontar o item (link direto)
- Oferecer ação rápida (resolver / adiar)
- Registrar ack (para parar insistência)

### 6.1 Seis Thresholds de Tempo
| Threshold | Quando |
|---|---|
| T-48h | 2 dias antes |
| T-24h | 1 dia antes |
| T-6h  | 6 horas antes |
| T-2h  | 2 horas antes |
| T-1h  | 1 hora antes |
| T-30min | 30 minutos antes |

### 6.2 Regras Críticas Adicionais
- **Vencido (T+0):** dispara imediatamente
- **Vencido insistente:** repete a cada 6h, máximo 3x por dia

Para quando:
- Item marcado como DONE
- Adiado com nova data (SNOOZED)
- Ack explícito

### 6.3 Severidade (Anti-fadiga)
| Nível | Cor | Quando |
|---|---|---|
| Info | 🟢 | Entra no digest |
| Atenção | 🟡 | T-24h, T-2h etc. |
| Crítico | 🔴 | Vencidos + sem responsável + sem next action |

---

## 7. Telegram — Padrão Profissional

### 7.1 Onboarding
1. Botão "Conectar Telegram" no sistema
2. Gera link `t.me/SEU_BOT?start=<token>`
3. Bot valida token e salva `chat_id`

### 7.2 Mensagens com Botões
```
✅ Concluir
📅 Adiar 1 dia
📅 Adiar 3 dias
🔗 Abrir no sistema
👤 Reatribuir (opcional)
```

**Regra dura:** se adiar → grava nova data e zera crítico.

---

## 8. UI/UX

### 8.1 Menu Único
```
Dashboard
CRM
Controle
Notificações
Relatórios
Configurações
```

### 8.2 Tela "Hoje" (a mais importante)
Um painel único com:
- Vencidos (primeiro — em vermelho)
- Follow-ups de hoje
- Tarefas de hoje
- Próximos 7 dias

> Se essa tela for forte, você "opera por lista", não por memória.

### 8.3 Princípios de Usabilidade
- Cadastrar lead em < 60 segundos
- Nenhum formulário gigante
- Timeline em tudo (histórico)
- Ações rápidas em cards

---

## 9. Scheduler — Motor do Zero Esquecimento

### 9.1 Jobs Obrigatórios

| Job | Frequência | Função |
|---|---|---|
| Scan Activities | A cada 1–5 min | Aplica 6 thresholds, cria deliveries, loga |
| Scan Críticos | A cada 1h | Vencidos, sem responsável, sem next action |
| Digest Diário | 08:00 | Resumo do dia |
| Health Check | Contínuo | Alerta se Telegram falhar |

### 9.2 Idempotência (não duplicar alertas)
Chave única por: `activity_id + reminder_type`

> Sem isso: flood de mensagens.

---

## 10. Segurança e Armadilhas (onde isso costuma falhar)

### 10.1 Falhas Típicas
- Notificação demais → você ignora tudo
- Ausência de ack/estado → crítico repete sem parar
- Falta de "next action" → CRM vira cemitério
- Duplicidade CRM vs Controle → dados conflitam

### 10.2 Controles Obrigatórios
- Logs de envio
- Retries com backoff
- Fallback para inbox interna se Telegram falhar
- Dashboard de "falhas de notificação"

---

## 11. Execução em Etapas (Ordem Correta)

```
Etapa 1 — Núcleo de Activities (fundação)
  ├── Criar tabela activities
  ├── Adaptar fluxo do Controle → salvar em activities
  ├── Adaptar fluxo do CRM → salvar follow-ups em activities
  └── ✅ Critério: tudo que tem data vira activity

Etapa 2 — Motor de Notificações
  ├── Implementar notification_rules
  ├── Scheduler com 6 thresholds + vencido
  ├── Logs idempotentes
  └── ✅ Critério: 0 duplicidade, 0 perda

Etapa 3 — Telegram
  ├── Bot + onboarding (token → chat_id)
  ├── Envio por responsável
  ├── Botões com callbacks
  ├── Ack + snooze
  └── ✅ Critério: operar follow-up direto pelo Telegram

Etapa 4 — Integração CRM → Controle
  ├── Deal "Ganho" cria projeto
  ├── Checklist padrão por template
  ├── Notifica time
  └── ✅ Critério: não existe "ganhei e esqueci de iniciar"

Etapa 5 — Cockpit e Relatórios
  ├── KPIs CRM: conversão, ciclo, ticket médio
  ├── KPIs execução: vencidas, SLA, gargalos
  └── Risk Board (sem next action, parados)
```

---

## 12. Lista de Resolução de Problemas

### 1. Núcleo Único de Atividades
- [ ] 1.1 Criar tabela `activities`
- [ ] 1.2 Mapear tarefas do Controle → `activities`
- [ ] 1.3 Mapear follow-ups do CRM → `activities`
- [ ] 1.4 Criar tela "Hoje" baseada em `activities`

### 2. Notificações
- [ ] 2.1 Definir 6 thresholds padrão
- [ ] 2.2 Implementar scheduler idempotente
- [ ] 2.3 Implementar criticidade (vencido / sem responsável / sem next action)
- [ ] 2.4 Criar inbox interna de notificações

### 3. Telegram
- [ ] 3.1 Criar bot e token seguro
- [ ] 3.2 Vincular usuário ↔ chat_id por start token
- [ ] 3.3 Enviar notificações por responsável
- [ ] 3.4 Botões: concluir, adiar, abrir
- [ ] 3.5 Logs + retries + alertas de falha

### 4. Handoff CRM → Controle
- [ ] 4.1 Evento "Ganho" cria projeto
- [ ] 4.2 Templates de checklist
- [ ] 4.3 Prazos padrão e responsáveis
- [ ] 4.4 Auditoria do handoff

### 5. Dashboard
- [ ] 5.1 Receita prevista x fechada
- [ ] 5.2 Gargalos do pipeline
- [ ] 5.3 Execução: vencidos e risco
- [ ] 5.4 Saúde do sistema de notificações

---

*Criado em 02/03/2026 — Nexus v0.1 — Planejamento inicial*
