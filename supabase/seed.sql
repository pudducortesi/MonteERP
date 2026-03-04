-- ============================================================
-- Montesino Gestionale — Seed Data
-- ============================================================
-- Run after 001_initial_schema.sql and 002_practice_areas_and_extensions.sql
-- UUIDs are deterministic for easy reference

-- ────────────────────────────────────────────────────────────
-- 1. USERS (5: 1 admin, 2 advisors, 1 client, 1 viewer)
-- ────────────────────────────────────────────────────────────

INSERT INTO users (id, email, full_name, role, phone, is_active) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'riccardo.pudduc@montesino.it', 'Riccardo Puddu Cortesi', 'admin', '+39 02 8725 4001', true),
  ('a0000000-0000-0000-0000-000000000002', 'andrea.martignano@montesino.it', 'Andrea Martignano', 'advisor', '+39 02 8725 4002', true),
  ('a0000000-0000-0000-0000-000000000003', 'mirco.galeri@montesino.it', 'Mirco Galeri', 'advisor', '+39 02 8725 4003', true),
  ('a0000000-0000-0000-0000-000000000004', 'g.zanon@costruzionivenete.it', 'Giovanni Zanon', 'client', '+39 340 1112233', true),
  ('a0000000-0000-0000-0000-000000000005', 'f.pavan@costruzionivenete.it', 'Federica Pavan', 'viewer', '+39 340 4445566', true);

-- ────────────────────────────────────────────────────────────
-- 2. COMPANIES (8 Italian companies with financial data)
-- ────────────────────────────────────────────────────────────

INSERT INTO companies (id, name, sector, revenue_range, employee_count, website, address, notes, created_by, revenue, ebitda, net_debt, fiscal_year) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Tecnologie Alpina S.r.l.', 'Tecnologia & Software', '5-10M €', 45, 'www.tecnologiealpina.it',
   '{"via": "Via Monte Rosa 12", "cap": "20149", "citta": "Milano", "provincia": "MI", "paese": "Italia"}'::jsonb,
   'Azienda software specializzata in soluzioni ERP per PMI. Crescita organica 15% YoY.', 'a0000000-0000-0000-0000-000000000001',
   8200000, 1640000, -500000, '2024'),

  ('c0000000-0000-0000-0000-000000000002', 'Meridiana Food Group S.p.A.', 'Food & Beverage', '50-100M €', 320, 'www.meridianafood.it',
   '{"via": "Corso Italia 88", "cap": "80100", "citta": "Napoli", "provincia": "NA", "paese": "Italia"}'::jsonb,
   'Gruppo alimentare con 3 stabilimenti produttivi nel Sud Italia. Terza generazione.', 'a0000000-0000-0000-0000-000000000002',
   72000000, 9360000, 12000000, '2024'),

  ('c0000000-0000-0000-0000-000000000003', 'Costruzioni Venete S.p.A.', 'Edilizia & Infrastrutture', '10-50M €', 150, 'www.costruzionivenete.it',
   '{"via": "Via Padova 45", "cap": "35100", "citta": "Padova", "provincia": "PD", "paese": "Italia"}'::jsonb,
   'Impresa edile attiva nel Nord-Est, specializzata in riqualificazione urbana.', 'a0000000-0000-0000-0000-000000000001',
   28000000, 3080000, 5600000, '2024'),

  ('c0000000-0000-0000-0000-000000000004', 'BioFarma Italia S.r.l.', 'Life Sciences & Biotech', '10-50M €', 80, 'www.biofarmaitalia.it',
   '{"via": "Via della Scienza 7", "cap": "00144", "citta": "Roma", "provincia": "RM", "paese": "Italia"}'::jsonb,
   'Azienda biotech focalizzata su integratori e nutraceutici. Pipeline R&D promettente.', 'a0000000-0000-0000-0000-000000000003',
   15000000, 2250000, -1200000, '2024'),

  ('c0000000-0000-0000-0000-000000000005', 'Logistica Emiliana S.r.l.', 'Logistica & Trasporti', '1-5M €', 25, 'www.logisticaemiliana.it',
   '{"via": "Via Emilia Ovest 200", "cap": "43100", "citta": "Parma", "provincia": "PR", "paese": "Italia"}'::jsonb,
   'Operatore logistico regionale con focus su catena del freddo.', 'a0000000-0000-0000-0000-000000000002',
   3800000, 380000, 800000, '2024'),

  ('c0000000-0000-0000-0000-000000000006', 'GreenTech Energy S.p.A.', 'Energia & Rinnovabili', '10-50M €', 95, 'www.greentechenergy.it',
   '{"via": "Via Torino 156", "cap": "10100", "citta": "Torino", "provincia": "TO", "paese": "Italia"}'::jsonb,
   'Società attiva nel fotovoltaico e storage, 5 impianti in Piemonte e Lombardia.', 'a0000000-0000-0000-0000-000000000001',
   22000000, 4400000, 8000000, '2024'),

  ('c0000000-0000-0000-0000-000000000007', 'Fashion House Milano S.r.l.', 'Moda & Lusso', '5-10M €', 35, 'www.fashionhousemilano.it',
   '{"via": "Via Montenapoleone 8", "cap": "20121", "citta": "Milano", "provincia": "MI", "paese": "Italia"}'::jsonb,
   'Brand premium di accessori in pelle made in Italy. Export 60%.', 'a0000000-0000-0000-0000-000000000003',
   7500000, 1125000, 200000, '2024'),

  ('c0000000-0000-0000-0000-000000000008', 'Fondazione Vittorini', 'Non-Profit & Fondazioni', '<1M €', 12, 'www.fondazionevittorini.it',
   '{"via": "Piazza del Duomo 5", "cap": "20122", "citta": "Milano", "provincia": "MI", "paese": "Italia"}'::jsonb,
   'Fondazione culturale dedicata alla promozione della letteratura italiana.', 'a0000000-0000-0000-0000-000000000001',
   800000, NULL, NULL, '2024');

-- ────────────────────────────────────────────────────────────
-- 3. CONTACTS (15)
-- ────────────────────────────────────────────────────────────

INSERT INTO contacts (id, company_id, full_name, role_title, email, phone, is_decision_maker, notes, created_by) VALUES
  ('t0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Alessandro Conti', 'CEO & Fondatore', 'a.conti@tecnologiealpina.it', '+39 335 1234567', true, 'Fondatore, molto disponibile. Aperto a exit parziale.', 'a0000000-0000-0000-0000-000000000001'),
  ('t0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Sara Marchetti', 'CFO', 's.marchetti@tecnologiealpina.it', '+39 335 2345678', true, 'Gestisce aspetti finanziari, molto precisa.', 'a0000000-0000-0000-0000-000000000001'),
  ('t0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'Roberto Esposito', 'Presidente CdA', 'r.esposito@meridianafood.it', '+39 338 9876543', true, 'Terza generazione famiglia fondatrice. Volontà di vendere 100%.', 'a0000000-0000-0000-0000-000000000002'),
  ('t0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'Chiara Russo', 'Direttore Finanziario', 'c.russo@meridianafood.it', '+39 338 8765432', false, 'Referente per due diligence finanziaria.', 'a0000000-0000-0000-0000-000000000002'),
  ('t0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Vincenzo Amato', 'Direttore Operativo', 'v.amato@meridianafood.it', '+39 338 7654321', false, 'Contatto operativo principale.', 'a0000000-0000-0000-0000-000000000002'),
  ('t0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 'Giovanni Zanon', 'Amministratore Delegato', 'g.zanon@costruzionivenete.it', '+39 340 1112233', true, 'Pianificazione successoria in corso.', 'a0000000-0000-0000-0000-000000000001'),
  ('t0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003', 'Federica Pavan', 'Responsabile Legale', 'f.pavan@costruzionivenete.it', '+39 340 4445566', false, 'Referente legale per contratti e compliance.', 'a0000000-0000-0000-0000-000000000001'),
  ('t0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000004', 'Elena Sorrentino', 'CEO', 'e.sorrentino@biofarmaitalia.it', '+39 347 9998877', true, 'PhD in biochimica, background scientifico solido.', 'a0000000-0000-0000-0000-000000000003'),
  ('t0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000004', 'Dario Pellegrini', 'VP Business Development', 'd.pellegrini@biofarmaitalia.it', '+39 347 6655443', false, 'Contatto per partnership e licensing.', 'a0000000-0000-0000-0000-000000000003'),
  ('t0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000005', 'Matteo Ferri', 'Titolare', 'm.ferri@logisticaemiliana.it', '+39 342 1122334', true, 'Interessato a cessione parziale, vuole restare come manager.', 'a0000000-0000-0000-0000-000000000002'),
  ('t0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000006', 'Marco Bellini', 'CEO', 'm.bellini@greentechenergy.it', '+39 333 5551234', true, 'Ex McKinsey, visione strategica forte. Cerca partner industriale.', 'a0000000-0000-0000-0000-000000000001'),
  ('t0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000006', 'Laura Colombo', 'CFO', 'l.colombo@greentechenergy.it', '+39 333 5559876', true, 'Esperienza in structured finance.', 'a0000000-0000-0000-0000-000000000001'),
  ('t0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000007', 'Isabella Moretti', 'Fondatrice & Creative Director', 'i.moretti@fashionhousemilano.it', '+39 345 6667788', true, 'Terza generazione nel settore pelle. Brand identity fortissima.', 'a0000000-0000-0000-0000-000000000003'),
  ('t0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000008', 'Prof. Antonio Ferrara', 'Presidente Fondazione', 'a.ferrara@fondazionevittorini.it', '+39 02 8833445', true, 'Professore emerito UniMi. Referente istituzionale.', 'a0000000-0000-0000-0000-000000000001'),
  ('t0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000007', 'Stefano Ricci', 'Head of Export', 's.ricci@fashionhousemilano.it', '+39 345 9990011', false, 'Gestisce mercati Asia e Medio Oriente.', 'a0000000-0000-0000-0000-000000000003');

-- ────────────────────────────────────────────────────────────
-- 4. DEALS (12 across 8 practice areas)
-- ────────────────────────────────────────────────────────────

INSERT INTO deals (id, code, title, company_id, deal_type, status, priority, deal_value, success_fee_pct, success_fee_min, retainer_monthly, mandate_date, expected_close, description, notes, created_by, practice_area, sub_service) VALUES
  -- M&A / Capital Markets
  ('d0000000-0000-0000-0000-000000000001', 'MNT-2025-001', 'Acquisizione Tecnologie Alpina', 'c0000000-0000-0000-0000-000000000001', 'buy_side', 'negotiation', 'high', 8500000, 2.500, 150000, 5000, '2025-01-15', '2025-06-30',
   'Mandato buy-side per fondo PE interessato all''acquisizione di Tecnologie Alpina', 'Il fondo ha già fatto due incontri con il management', 'a0000000-0000-0000-0000-000000000001', 'ma_capital_markets', 'Buy-Side Advisory'),

  ('d0000000-0000-0000-0000-000000000002', 'MNT-2025-002', 'Vendita Meridiana Food Group', 'c0000000-0000-0000-0000-000000000002', 'sell_side', 'marketing', 'critical', 45000000, 1.800, 500000, 8000, '2025-02-01', '2025-09-30',
   'Mandato sell-side: la famiglia Esposito vuole vendere il 100% del gruppo', 'Preparazione IM in corso, 12 potenziali acquirenti identificati', 'a0000000-0000-0000-0000-000000000002', 'ma_capital_markets', 'Sell-Side Advisory'),

  -- Valuation (within M&A)
  ('d0000000-0000-0000-0000-000000000003', 'MNT-2025-003', 'Valuation Costruzioni Venete', 'c0000000-0000-0000-0000-000000000003', 'valuation', 'analysis', 'medium', 25000000, NULL, NULL, 3000, '2025-03-01', '2025-05-15',
   'Incarico di valutazione per pianificazione successoria', 'Raccolta dati finanziari ultimi 5 anni in corso', 'a0000000-0000-0000-0000-000000000001', 'ma_capital_markets', 'Business Valuation'),

  -- Advisory (Capital Markets)
  ('d0000000-0000-0000-0000-000000000004', 'MNT-2025-004', 'Series B BioFarma Italia', 'c0000000-0000-0000-0000-000000000004', 'advisory', 'mandate_signed', 'high', 15000000, 2.000, 200000, 6000, '2025-03-10', '2025-12-31',
   'Advisory strategico per round di finanziamento Series B', 'Target raccolta 15M€, in contatto con 5 VC', 'a0000000-0000-0000-0000-000000000003', 'ma_capital_markets', 'Capital Raising'),

  -- Debt & Grant
  ('d0000000-0000-0000-0000-000000000005', 'MNT-2025-005', 'Finanziamento GreenTech Energy', 'c0000000-0000-0000-0000-000000000006', 'debt_advisory', 'analysis', 'high', 12000000, 1.000, 80000, 4000, '2025-02-15', '2025-07-31',
   'Strutturazione project finance per nuovo impianto fotovoltaico 15MW', 'In contatto con 3 banche e 2 fondi infrastrutturali', 'a0000000-0000-0000-0000-000000000001', 'debt_grant', 'Project Finance'),

  ('d0000000-0000-0000-0000-000000000006', 'MNT-2025-006', 'Bando PNRR BioFarma', 'c0000000-0000-0000-0000-000000000004', 'grant_funding', 'mandate_signed', 'medium', 2000000, NULL, NULL, 2500, '2025-03-20', '2025-06-30',
   'Supporto per presentazione domanda fondi PNRR Missione 6 Salute', 'Deadline bando 30/06, documentazione in preparazione', 'a0000000-0000-0000-0000-000000000003', 'debt_grant', 'Finanza Agevolata'),

  -- Transformation
  ('d0000000-0000-0000-0000-000000000007', 'MNT-2025-007', 'Ristrutturazione Logistica Emiliana', 'c0000000-0000-0000-0000-000000000005', 'transformation', 'negotiation', 'medium', 3000000, 3.000, 50000, 3000, '2025-01-20', '2025-08-31',
   'Piano di ristrutturazione aziendale e cessione parziale 60%', 'Il titolare vuole cedere ma restare come manager', 'a0000000-0000-0000-0000-000000000002', 'transformation', 'Ristrutturazione Aziendale'),

  -- Corporate Protection
  ('d0000000-0000-0000-0000-000000000008', 'MNT-2025-008', 'Protezione patrimoniale Zanon', 'c0000000-0000-0000-0000-000000000003', 'corporate_protection', 'mandate_signed', 'low', NULL, NULL, NULL, 2000, '2025-04-01', '2025-09-30',
   'Pianificazione successoria e protezione patrimonio familiare Zanon', 'Famiglia con 3 figli, necessità di patto parasociale', 'a0000000-0000-0000-0000-000000000001', 'corporate_protection', 'Passaggio Generazionale'),

  -- Communication
  ('d0000000-0000-0000-0000-000000000009', 'MNT-2025-009', 'Rebranding Fashion House Milano', 'c0000000-0000-0000-0000-000000000007', 'communication', 'analysis', 'medium', NULL, NULL, NULL, 5000, '2025-03-15', '2025-07-31',
   'Strategia di comunicazione e rebranding per espansione mercati internazionali', 'Focus su mercato asiatico e digital presence', 'a0000000-0000-0000-0000-000000000003', 'communication', 'Brand Strategy'),

  -- Individuals & Patrimony
  ('d0000000-0000-0000-0000-000000000010', 'MNT-2025-010', 'Wealth Planning Famiglia Esposito', 'c0000000-0000-0000-0000-000000000002', 'patrimony', 'mandate_signed', 'high', NULL, NULL, NULL, 3000, '2025-02-20', '2025-12-31',
   'Pianificazione patrimoniale post-vendita per famiglia Esposito', 'Ricavi attesi dalla vendita ca. 45M€, strutturare holding e trust', 'a0000000-0000-0000-0000-000000000002', 'individuals_patrimony', 'Wealth Planning'),

  -- Completed deal
  ('d0000000-0000-0000-0000-000000000011', 'MNT-2024-015', 'Vendita TechStart S.r.l.', NULL, 'sell_side', 'completed', 'high', 12000000, 2.500, 200000, 5000, '2024-06-01', '2024-12-15',
   'Vendita completata con successo a fondo PE', 'Closing avvenuto il 15/12/2024, fee incassata', 'a0000000-0000-0000-0000-000000000001', 'ma_capital_markets', 'Sell-Side Advisory'),

  -- Lost deal
  ('d0000000-0000-0000-0000-000000000012', 'MNT-2024-018', 'Advisory Gruppo Tessile Nord', NULL, 'advisory', 'lost', 'low', 8000000, 1.500, 100000, 3000, '2024-09-01', '2025-03-31',
   'Advisory per ristrutturazione - il cliente ha scelto un altro advisor', 'Perso a favore di competitor, motivo: relazione pregressa con altro advisor', 'a0000000-0000-0000-0000-000000000002', 'transformation', 'Turnaround');

-- ────────────────────────────────────────────────────────────
-- 5. DEAL MEMBERS
-- ────────────────────────────────────────────────────────────

INSERT INTO deal_members (deal_id, user_id, role_in_deal) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'lead'),
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'member'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'lead'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'member'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'member'),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'lead'),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'member'),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'lead'),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'member'),
  ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'lead'),
  ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'member'),
  ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'lead'),
  ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'lead'),
  ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'member'),
  ('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'lead'),
  ('d0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', 'lead'),
  ('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002', 'lead'),
  ('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'member'),
  ('d0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'lead'),
  ('d0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000003', 'member'),
  ('d0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000002', 'lead');

-- ────────────────────────────────────────────────────────────
-- 6. ACTIVITIES (20)
-- ────────────────────────────────────────────────────────────

INSERT INTO activities (id, deal_id, user_id, activity_type, title, description, metadata, created_at) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'status_change', 'Status cambiato: Analisi → Negoziazione', NULL, '{"old_status": "analysis", "new_status": "negotiation"}'::jsonb, '2025-04-10 09:30:00+00'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'meeting', 'Riunione con management Tecnologie Alpina', 'Presentazione del piano industriale post-acquisizione', NULL, '2025-04-08 14:00:00+00'),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'call', 'Call con fondo PE - aggiornamento valutazione', 'Discusso range di prezzo 7.5M-9M€', NULL, '2025-04-05 11:00:00+00'),
  ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'document_upload', 'Documento caricato: Information Memorandum v2', NULL, '{"doc_type": "im", "version": 2}'::jsonb, '2025-04-12 16:45:00+00'),
  ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'email', 'Invio teaser a 12 potenziali acquirenti', 'Inviato blind teaser, attesa feedback entro 2 settimane', NULL, '2025-04-07 10:15:00+00'),
  ('e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'meeting', 'Due diligence meeting - area finanziaria', 'Incontro con CFO e revisori contabili', NULL, '2025-04-01 09:00:00+00'),
  ('e0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'note', 'Nota interna: metodo valutazione', 'Utilizzeremo DCF + multipli di transazioni comparabili. EV/EBITDA settore edilizia: 5-7x', NULL, '2025-03-20 15:30:00+00'),
  ('e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'call', 'Call con commercialista dell''azienda', 'Richiesti bilanci ultimi 5 anni e piano industriale', NULL, '2025-03-15 11:30:00+00'),
  ('e0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'status_change', 'Status cambiato: Pitch → Mandato', NULL, '{"old_status": "pitch", "new_status": "mandate_signed"}'::jsonb, '2025-03-10 10:00:00+00'),
  ('e0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'meeting', 'Kick-off meeting con CEO BioFarma', 'Definiti obiettivi, timeline e deliverable per capital raising', NULL, '2025-03-12 14:30:00+00'),
  ('e0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'call', 'Call con Banca Intesa - project finance', 'Discussione struttura finanziamento, LTV richiesto 70%', NULL, '2025-04-01 16:00:00+00'),
  ('e0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'meeting', 'Site visit impianto GreenTech Novara', 'Visita tecnica con perito bancario per valutazione asset', NULL, '2025-03-28 10:00:00+00'),
  ('e0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'note', 'Analisi struttura costi completata', 'Identificati 3 centri di costo da ottimizzare. Saving potenziale 15%.', NULL, '2025-03-25 14:00:00+00'),
  ('e0000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', 'meeting', 'Workshop brand identity con Isabella Moretti', 'Definiti valori del brand e target audience per mercato Asia', NULL, '2025-04-05 10:00:00+00'),
  ('e0000000-0000-0000-0000-000000000015', 'd0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002', 'call', 'Call con notaio per struttura trust', 'Discussione preliminare su struttura trust per patrimonio Esposito', NULL, '2025-04-02 11:00:00+00'),
  ('e0000000-0000-0000-0000-000000000016', 'd0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'status_change', 'Status cambiato: Closing → Completato', NULL, '{"old_status": "closing", "new_status": "completed"}'::jsonb, '2024-12-15 17:00:00+00'),
  ('e0000000-0000-0000-0000-000000000017', 'd0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'note', 'Deal chiuso con successo', 'Vendita a 12M€, fee 2.5% = 300K€. Cliente molto soddisfatto.', NULL, '2024-12-15 17:30:00+00'),
  ('e0000000-0000-0000-0000-000000000018', 'd0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000002', 'status_change', 'Status cambiato: Negoziazione → Perso', NULL, '{"old_status": "negotiation", "new_status": "lost"}'::jsonb, '2025-02-28 12:00:00+00'),
  ('e0000000-0000-0000-0000-000000000019', 'd0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'email', 'Invio documentazione bando PNRR', 'Inviata prima bozza documentazione al MISE per pre-valutazione', NULL, '2025-04-14 09:00:00+00'),
  ('e0000000-0000-0000-0000-000000000020', 'd0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'meeting', 'Incontro famiglia Zanon - patto parasociale', 'Presentazione bozza patto parasociale ai 3 figli', NULL, '2025-04-15 15:00:00+00');

-- ────────────────────────────────────────────────────────────
-- 7. DOCUMENTS (8 records, no actual files)
-- ────────────────────────────────────────────────────────────

INSERT INTO documents (id, deal_id, name, doc_type, storage_path, version, is_client_visible, uploaded_by, file_size, mime_type, created_at) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'NDA Tecnologie Alpina - Fondo PE.pdf', 'nda', 'd0000000-0000-0000-0000-000000000001/nda/nda_alpina.pdf', 1, false, 'a0000000-0000-0000-0000-000000000001', 245000, 'application/pdf', '2025-01-20 10:00:00+00'),
  ('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'Information Memorandum Meridiana Food v1.pdf', 'im', 'd0000000-0000-0000-0000-000000000002/im/im_meridiana_v1.pdf', 1, false, 'a0000000-0000-0000-0000-000000000002', 3500000, 'application/pdf', '2025-03-15 14:00:00+00'),
  ('f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'Information Memorandum Meridiana Food v2.pdf', 'im', 'd0000000-0000-0000-0000-000000000002/im/im_meridiana_v2.pdf', 2, true, 'a0000000-0000-0000-0000-000000000002', 4200000, 'application/pdf', '2025-04-12 16:45:00+00'),
  ('f0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 'Teaser Meridiana Food.pdf', 'teaser', 'd0000000-0000-0000-0000-000000000002/teaser/teaser_meridiana.pdf', 1, true, 'a0000000-0000-0000-0000-000000000002', 890000, 'application/pdf', '2025-03-01 09:30:00+00'),
  ('f0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000004', 'Business Plan BioFarma 2025-2028.pdf', 'business_plan', 'd0000000-0000-0000-0000-000000000004/business_plan/bp_biofarma.pdf', 1, false, 'a0000000-0000-0000-0000-000000000003', 2800000, 'application/pdf', '2025-03-18 11:00:00+00'),
  ('f0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000005', 'Term Sheet Project Finance GreenTech.pdf', 'financial', 'd0000000-0000-0000-0000-000000000005/financial/term_sheet_greentech.pdf', 1, false, 'a0000000-0000-0000-0000-000000000001', 1500000, 'application/pdf', '2025-03-10 09:00:00+00'),
  ('f0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000003', 'Bilancio Costruzioni Venete 2024.pdf', 'financial', 'd0000000-0000-0000-0000-000000000003/financial/bilancio_cv_2024.pdf', 1, false, 'a0000000-0000-0000-0000-000000000001', 5200000, 'application/pdf', '2025-03-05 16:00:00+00'),
  ('f0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000009', 'Brand Guidelines Fashion House Milano.pdf', 'other', 'd0000000-0000-0000-0000-000000000009/other/brand_guidelines_fhm.pdf', 1, true, 'a0000000-0000-0000-0000-000000000003', 8900000, 'application/pdf', '2025-03-20 11:30:00+00');

-- ────────────────────────────────────────────────────────────
-- 8. SUCCESS FEES (5)
-- ────────────────────────────────────────────────────────────

INSERT INTO success_fees (id, deal_id, deal_value_final, fee_calculated, fee_agreed, payment_status, invoice_entity, paid_amount, due_date, notes) VALUES
  ('g0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000011', 12000000, 300000, 280000, 'paid', 'assets_spa', 280000, '2025-01-15', 'Fee incassata il 10/01/2025. Sconto di 20K€ accordato per fidelizzazione.'),
  ('g0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 8500000, 212500, NULL, 'pending', 'piva_forfettaria', 0, '2025-07-31', 'Fee soggetta a closing, stimata su base deal value attuale.'),
  ('g0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 45000000, 810000, 750000, 'pending', 'assets_spa', 0, '2025-10-31', 'Fee concordata a 750K€ con pagamento a 30gg dal closing.'),
  ('g0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000005', 12000000, 120000, 100000, 'partial', 'montesino_srl', 50000, '2025-08-15', 'Acconto 50K€ ricevuto. Saldo a erogazione finanziamento.'),
  ('g0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000012', 8000000, 120000, NULL, 'overdue', 'assets_spa', 0, '2025-03-15', 'Fee su deal perso. Da verificare se retainer copre parzialmente.');

-- ────────────────────────────────────────────────────────────
-- 9. TASKS (15)
-- ────────────────────────────────────────────────────────────

INSERT INTO tasks (id, deal_id, assigned_to, created_by, title, description, due_date, status, priority) VALUES
  ('h0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Preparare analisi comparabili', 'Raccogliere transazioni comparabili nel settore software ERP italiano ed europeo', '2025-04-20 18:00:00+00', 'in_progress', 'high'),
  ('h0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Revisione contratto di acquisizione', 'Coordinarsi con studio legale Bonelli Erede per revisione bozza SPA', '2025-04-25 18:00:00+00', 'todo', 'high'),
  ('h0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Aggiornare IM con dati Q1 2025', 'Integrare risultati primo trimestre 2025 nell''Information Memorandum v3', '2025-04-30 18:00:00+00', 'todo', 'medium'),
  ('h0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Organizzare management presentation', 'Preparare presentazione per 5 acquirenti shortlistati', '2025-05-15 18:00:00+00', 'todo', 'high'),
  ('h0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Completare modello DCF', 'Finalizzare modello di valutazione DCF con scenari base/bull/bear', '2025-04-18 18:00:00+00', 'in_progress', 'high'),
  ('h0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Report di valutazione finale', 'Redigere report completo con range di valutazione e metodologia', '2025-05-10 18:00:00+00', 'todo', 'medium'),
  ('h0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Preparare investor deck', 'Creare pitch deck per VC, focus su traction e unit economics', '2025-04-22 18:00:00+00', 'in_progress', 'high'),
  ('h0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Screening VC target', 'Identificare e contattare 10 VC italiani ed europei nel biotech', '2025-04-28 18:00:00+00', 'todo', 'medium'),
  ('h0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Finalizzare term sheet con Intesa', 'Negoziare condizioni finali project finance con Banca Intesa', '2025-04-30 18:00:00+00', 'todo', 'high'),
  ('h0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Completare documentazione PNRR', 'Preparare allegati tecnici e piano economico per bando Missione 6', '2025-06-15 18:00:00+00', 'in_progress', 'high'),
  ('h0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Piano cessione 60% Logistica Emiliana', 'Preparare struttura dell''operazione di cessione parziale', '2025-05-20 18:00:00+00', 'todo', 'medium'),
  ('h0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Bozza patto parasociale Zanon', 'Redigere patto parasociale per successione famiglia Zanon', '2025-05-05 18:00:00+00', 'todo', 'medium'),
  ('h0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Analisi competitor mercato Asia', 'Mappatura competitor e potenziali partner per ingresso mercato asiatico', '2025-05-01 18:00:00+00', 'todo', 'medium'),
  ('h0000000-0000-0000-0000-000000000014', NULL, 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Review fee forecast Q2', 'Aggiornare forecast fee per il secondo trimestre 2025', '2025-04-30 18:00:00+00', 'todo', 'low'),
  ('h0000000-0000-0000-0000-000000000015', NULL, 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Aggiornamento pipeline report mensile', 'Preparare report mensile pipeline per CdA Montesino', '2025-04-28 18:00:00+00', 'todo', 'low');

-- ────────────────────────────────────────────────────────────
-- 10. DEAL COUNTERPARTIES (5)
-- ────────────────────────────────────────────────────────────

INSERT INTO deal_counterparties (id, deal_id, company_id, contact_id, role, status, notes) VALUES
  ('i0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000006', 't0000000-0000-0000-0000-000000000011', 'buyer', 'interested', 'GreenTech Energy interessata a diversificazione nel food & sustainability'),
  ('i0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', NULL, NULL, 'buyer', 'nda_signed', 'Fondo PE internazionale - nome confidenziale. NDA firmato 01/04.'),
  ('i0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', NULL, NULL, 'buyer', 'in_dd', 'Fondo PE italiano mid-market. Due diligence finanziaria in corso.'),
  ('i0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000005', NULL, NULL, 'lender', 'contacted', 'Banca Intesa - divisione project finance. Primo meeting positivo.'),
  ('i0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000004', NULL, NULL, 'investor', 'contacted', 'VC europeo specializzato in life sciences. Inviato teaser.');

-- ────────────────────────────────────────────────────────────
-- 11. DEAL NOTES (5)
-- ────────────────────────────────────────────────────────────

INSERT INTO deal_notes (id, deal_id, user_id, content, is_pinned) VALUES
  ('j0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'ATTENZIONE: il fondo PE ha deadline interna per closing entro Q2. Accelerare due diligence.', true),
  ('j0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Roberto Esposito ha confermato che non accetterà offerte sotto 40M€. Floor price definito.', true),
  ('j0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Multiplo EBITDA di settore per edilizia specializzata: 5.5x-7x. Costruzioni Venete ha margini sopra la media.', false),
  ('j0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Banca Intesa disponibile a finanziare fino a 70% LTV. Condizioni: DSCR > 1.3x, security package standard.', false),
  ('j0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002', 'Famiglia Esposito preferisce struttura con trust di diritto italiano. Evitare giurisdizioni estere.', true);
