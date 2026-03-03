# Montesino Gestionale — Architettura Completa

> Questo file è il blueprint per Claude Code. Contiene TUTTE le specifiche per costruire il sistema gestionale di Montesino SpA. Ogni fase è implementabile in sequenza.

---

## 1. Overview

**Prodotto:** Sistema gestionale integrato per advisory M&A
**Azienda:** Montesino SpA
**URL target:** gestionale.montesino.it
**Lingua interfaccia:** Italiano
**Multi-utente:** Sì, 4 ruoli con permessi diversi
**Mobile-first:** iPhone 15 Pro, iPad Pro 11", laptop

---

## 2. Stack Tecnologico

| Layer | Tecnologia |
|-------|-----------|
| Frontend | Next.js 15 (App Router, TypeScript) |
| UI | shadcn/ui + Tailwind CSS |
| Backend | Next.js API Routes + Supabase |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + RBAC custom |
| Storage | Supabase Storage (documenti) |
| Real-time | Supabase Realtime |
| Deploy | Vercel (CI/CD da GitHub) |

---

## 3. Ruoli e Permessi (RBAC)

### 3.1 Quattro ruoli

| Ruolo | Chi è | Vede | Può fare |
|-------|-------|------|----------|
| `admin` | CdA, IT | TUTTO | CRUD completo, gestione utenti, config |
| `advisor` | Team M&A | Deal assegnati + deal del proprio team | CRUD sui propri deal, upload doc, note |
| `client` | Clienti esterni | Solo documenti condivisi con loro | View/download documenti, commenti |
| `viewer` | Consulenti, revisori | Read-only su deal assegnati | Solo visualizzazione |

### 3.2 Team di progetto

Ogni deal ha un team. Struttura:
- **Lead** (1 advisor): responsabile, gestisce il team del deal
- **Member** (N advisor): partecipano, vedono tutto del deal
- **Viewer** (N viewer): read-only sul deal
- **Client** (N client): vedono solo i documenti con flag `is_client_visible = true`

Il CdA (admin) vede TUTTI i deal di TUTTI i team trasversalmente.

### 3.3 Creazione utenti

- Solo Admin può creare utenti dal pannello `/admin/users`
- Flusso: Admin inserisce email + nome + ruolo → sistema crea utente in Supabase Auth → utente riceve email con link per impostare password → al primo login vede la dashboard del suo ruolo
- Gli Advisor possono invitare Client direttamente dalla scheda deal (crea utente con ruolo `client` e lo aggiunge al team del deal)

### 3.4 Row Level Security (RLS)

TUTTE le tabelle devono avere RLS abilitato. Policy fondamentali:

```sql
-- Admin vede tutto
CREATE POLICY "admin_full_access" ON [tabella]
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Advisor vede i deal dove è nel team
CREATE POLICY "advisor_own_deals" ON deals
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM deal_members WHERE deal_id = deals.id
    )
  );

-- Client vede solo documenti condivisi
CREATE POLICY "client_shared_docs" ON documents
  FOR SELECT USING (
    is_client_visible = true AND
    EXISTS (
      SELECT 1 FROM deal_members
      WHERE deal_id = documents.deal_id
      AND user_id = auth.uid()
      AND role_in_deal = 'client'
    )
  );
```

---

## 4. Schema Database

### 4.1 Enum types

```sql
CREATE TYPE user_role AS ENUM ('admin', 'advisor', 'client', 'viewer');
CREATE TYPE deal_type AS ENUM ('buy_side', 'sell_side', 'advisory', 'valuation');
CREATE TYPE deal_status AS ENUM ('prospect', 'pitch', 'mandate_signed', 'analysis', 'marketing', 'negotiation', 'closing', 'completed', 'lost', 'on_hold');
CREATE TYPE deal_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE deal_member_role AS ENUM ('lead', 'member', 'viewer', 'client');
CREATE TYPE doc_type AS ENUM ('im', 'business_plan', 'contract', 'nda', 'teaser', 'financial', 'other');
CREATE TYPE activity_type AS ENUM ('call', 'meeting', 'email', 'note', 'status_change', 'document_upload');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE fee_status AS ENUM ('pending', 'partial', 'paid', 'overdue');
CREATE TYPE invoice_entity AS ENUM ('piva_forfettaria', 'assets_spa');
```

### 4.2 Tabelle

#### users
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  phone text,
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### companies
```sql
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sector text,
  revenue_range text,
  employee_count integer,
  website text,
  address jsonb, -- {via, citta, cap, provincia, paese}
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### contacts
```sql
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  role_title text,
  email text,
  phone text,
  is_decision_maker boolean DEFAULT false,
  linked_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### deals
```sql
CREATE TABLE deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE, -- es. MNT-2026-001
  title text NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  deal_type deal_type NOT NULL,
  status deal_status NOT NULL DEFAULT 'prospect',
  priority deal_priority DEFAULT 'medium',
  deal_value numeric, -- enterprise value stimato
  success_fee_pct numeric(5,3), -- percentuale
  success_fee_min numeric, -- minimum fee
  retainer_monthly numeric,
  mandate_date date,
  expected_close date,
  actual_close date,
  description text,
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### deal_members
```sql
CREATE TABLE deal_members (
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role_in_deal deal_member_role NOT NULL DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (deal_id, user_id)
);
```

#### documents
```sql
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  name text NOT NULL,
  doc_type doc_type DEFAULT 'other',
  storage_path text NOT NULL,
  version integer DEFAULT 1,
  is_client_visible boolean DEFAULT false,
  uploaded_by uuid REFERENCES users(id),
  file_size bigint,
  mime_type text,
  created_at timestamptz DEFAULT now()
);
```

#### success_fees
```sql
CREATE TABLE success_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid UNIQUE REFERENCES deals(id) ON DELETE CASCADE,
  deal_value_final numeric,
  fee_calculated numeric,
  fee_agreed numeric,
  payment_status fee_status DEFAULT 'pending',
  invoice_entity invoice_entity,
  paid_amount numeric DEFAULT 0,
  due_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### activities
```sql
CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  activity_type activity_type NOT NULL,
  title text NOT NULL,
  description text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
```

#### tasks
```sql
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES users(id),
  created_by uuid REFERENCES users(id),
  title text NOT NULL,
  description text,
  due_date timestamptz,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## 5. Moduli Applicativi

### 5.1 Layout Globale

- **Sidebar sinistra** (collassabile su mobile): navigazione moduli con icone
- **Header top**: breadcrumb, ricerca globale, notifiche, profilo utente
- **Main content**: area centrale responsive
- La sidebar mostra solo i moduli accessibili per il ruolo dell'utente
- Admin vede tutto. Client vede solo "I miei documenti". Viewer vede solo "I miei deal".

Menu sidebar:
- 🏠 Dashboard
- 📊 Pipeline (admin, advisor)
- 🤝 CRM (admin, advisor)
- 📁 Documenti (tutti, filtrato per ruolo)
- 💰 Success Fee (admin, advisor)
- 📅 Calendario (admin, advisor)
- ⚙️ Admin (solo admin)

### 5.2 Dashboard (/)

Personalizzata per ruolo:

**Admin/CdA:**
- KPI cards: deal attivi, pipeline value totale, success fee forecast, fee incassate YTD
- Pipeline funnel chart (deal count + value per stage)
- Deal in scadenza (prossime milestone/expected close)
- Attività recenti (timeline globale)
- Team workload (quanti deal per advisor)

**Advisor:**
- I propri deal attivi con status
- Task in scadenza (prossimi 7 giorni)
- Attività recenti sui propri deal
- Quick actions: nuovo deal, nuova attività, nuovo task

**Client:**
- Documenti condivisi con me (lista semplice)
- Status del/dei deal dove sono coinvolto

**Viewer:**
- Vista read-only dei deal assegnati
- Timeline attività dei deal assegnati

### 5.3 Pipeline M&A (/pipeline)

- **Vista Kanban** (default): colonne = deal_status, card = deal
- Drag-and-drop per cambiare status
- Card mostra: codice, titolo, azienda, valore, team avatars, giorni in stage, priority badge
- **Vista Tabella** (toggle): sorting, filtri, ricerca full-text
- Filtri: per advisor, deal_type, priority, date range, azienda
- Click su card → apre deal detail

### 5.4 Deal Detail (/deals/[id])

Pagina completa del deal con tabs:
- **Overview**: dati principali, team, status, valore, date
- **Timeline**: tutte le activities ordinate cronologicamente
- **Documenti**: lista documenti del deal, upload, versioni
- **Team**: membri con ruoli, aggiungi/rimuovi (solo lead/admin)
- **Fee**: success fee tracking per questo deal
- **Tasks**: task collegati al deal

### 5.5 CRM (/crm)

Due sotto-pagine:
- **Aziende** (/crm/companies): lista con ricerca, filtri settore/fatturato, click → scheda azienda
- **Contatti** (/crm/contacts): lista con ricerca, filtri azienda/ruolo

**Scheda Azienda** (/crm/companies/[id]):
- Dati anagrafici editabili
- Contatti collegati
- Deal associati (link diretti)
- Timeline attività

### 5.6 Documenti (/documents)

- Lista globale documenti con filtri: per deal, per tipo, per data
- Upload drag-and-drop con selezione deal e tipo
- Preview in-browser per PDF e immagini
- Download diretto
- Toggle "visibile ai client" (solo lead/admin del deal)
- Versioning: storico versioni per ogni documento

### 5.7 Success Fee (/fees)

- Tabella con tutti i deal che hanno success fee
- Colonne: deal code, titolo, valore deal, fee %, fee calcolata, fee concordata, status pagamento, entità fatturazione, importo pagato, scadenza
- KPI cards in alto: totale fee attese, incassate, in ritardo, forecast
- Filtri: per status pagamento, per entità fatturazione, per periodo
- Click su riga → apre fee detail per modifica

### 5.8 Calendario & Task (/calendar)

- Vista calendario mensile/settimanale (task + milestone deal)
- Lista task con filtri: per deal, per assegnatario, per status, per priority
- Creazione task rapida con collegamento deal opzionale
- Task board mini (todo/in_progress/done) per deal specifico

### 5.9 Admin (/admin)

Solo per ruolo admin:
- **Gestione Utenti** (/admin/users): lista utenti, crea nuovo, modifica ruolo, disattiva
- **Inviti** (/admin/invites): inviti pendenti
- **Log attività**: audit trail globale

---

## 6. Struttura Cartelle

```
montesino-gestionale/
├── .github/
│   └── workflows/           # CI/CD (opzionale)
├── public/
│   └── assets/              # Logo, favicon
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx    # Solo via invite link
│   │   │   └── reset-password/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           # Sidebar + header + auth guard
│   │   │   ├── page.tsx             # Dashboard principale
│   │   │   ├── pipeline/page.tsx    # Kanban
│   │   │   ├── deals/
│   │   │   │   ├── page.tsx         # Lista deal
│   │   │   │   └── [id]/page.tsx    # Deal detail
│   │   │   ├── crm/
│   │   │   │   ├── companies/page.tsx
│   │   │   │   ├── companies/[id]/page.tsx
│   │   │   │   └── contacts/page.tsx
│   │   │   ├── documents/page.tsx
│   │   │   ├── fees/page.tsx
│   │   │   ├── calendar/page.tsx
│   │   │   └── admin/
│   │   │       ├── users/page.tsx
│   │   │       └── invites/page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── deals/
│   │   │   ├── documents/
│   │   │   └── admin/
│   │   └── layout.tsx               # Root layout
│   ├── components/
│   │   ├── ui/                      # shadcn/ui
│   │   ├── layout/                  # Sidebar, Header, Nav
│   │   ├── pipeline/                # KanbanBoard, DealCard
│   │   ├── crm/                     # CompanyForm, ContactCard
│   │   ├── documents/               # UploadZone, DocPreview
│   │   └── dashboard/               # KPICard, PipelineChart
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts            # Browser client
│   │   │   ├── server.ts            # Server client
│   │   │   └── middleware.ts         # Auth middleware
│   │   ├── auth/
│   │   │   └── rbac.ts              # Role checks, guards
│   │   ├── hooks/                   # useDeals, useUser, etc.
│   │   └── utils/                   # Formatters, validators
│   ├── types/
│   │   └── index.ts                 # TypeScript types + enums
│   └── styles/
│       └── globals.css              # Tailwind + custom vars
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql   # Tutto lo schema sopra
│   └── seed.sql                     # Dati di test
├── .env.local                       # Credenziali (NON committare)
├── .env.local.example               # Template
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── ARCHITECTURE.md                  # Questo file
```

---

## 7. Regole di Design

- **Colori base**: Navy #1B2A4A (primario), Gold #C9A84C (accenti), bianco/grigio chiaro per sfondi
- **Font**: i default di shadcn/ui vanno bene (sistema). Il branding finale si fa dopo.
- **Componenti**: usare shadcn/ui per TUTTO (Button, Card, Dialog, Table, Badge, etc.)
- **Responsive**: sidebar collassa in hamburger su mobile, tabelle scrollano orizzontalmente
- **Loading states**: skeleton loader su ogni sezione
- **Empty states**: illustrazione + CTA per ogni lista vuota
- **Toast notifications**: per conferme azioni (salvataggio, eliminazione, etc.)
- **Lingua**: tutta l'interfaccia in italiano. Label dei form, titoli, bottoni, messaggi di errore.

---

## 8. Piano di Implementazione (Fasi)

### Fase 1 — Foundation
1. Setup Next.js 15 + TypeScript + Tailwind + shadcn/ui
2. Configurazione Supabase client (browser + server)
3. Schema database: TUTTE le migrations SQL (enum types + tabelle + RLS policies)
4. Auth: login page, middleware protezione route, session management
5. Layout: sidebar + header + navigazione responsive
6. Dashboard placeholder con messaggio di benvenuto per ruolo
7. Pagina admin/users: lista utenti, creazione nuovo utente

### Fase 2 — Pipeline & CRM
1. Pipeline Kanban con drag-and-drop (libreria: @hello-pangea/dnd)
2. Deal CRUD completo (create, read, update) con form validati
3. Deal detail page con tabs (overview, timeline, team)
4. CRM: companies CRUD + contacts CRUD
5. Company detail page con contatti e deal collegati
6. Activity logging automatico (status change, document upload, etc.)
7. Deal members management (aggiunta/rimozione dal team)

### Fase 3 — Documenti & Fee
1. Document upload con Supabase Storage + drag-and-drop zone
2. Categorizzazione documenti per tipo
3. Versioning documenti
4. Flag client_visible per condivisione
5. Preview in-browser (PDF viewer, image viewer)
6. Success fee CRUD
7. Calcolo automatico fee (deal_value × success_fee_pct, con check minimum)
8. Dashboard fee con KPI

### Fase 4 — Dashboard & Task
1. Dashboard Admin con KPI reali da database
2. Pipeline funnel chart (recharts)
3. Dashboard advisor personalizzata
4. Dashboard client/viewer
5. Task CRUD con collegamento deal
6. Vista calendario (libreria: react-big-calendar o simile)
7. Notifiche in-app per scadenze e assegnazioni

### Fase 5 — Polish
1. Branding Montesino (colori, logo, favicon)
2. Performance: caching, ottimizzazione query
3. Ricerca globale
4. Export dati (CSV)
5. Seed data realistici per demo
6. Testing e bug fix
