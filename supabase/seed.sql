-- ============================================================
-- Montesino Gestionale — Seed Data
-- ============================================================
-- Run after 001_initial_schema.sql
-- UUIDs are deterministic for easy reference

-- ────────────────────────────────────────────────────────────
-- 1. USERS (3: 1 admin, 2 advisors)
-- ────────────────────────────────────────────────────────────

INSERT INTO users (id, email, full_name, role, phone, is_active) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'marco.rossi@montesino.it', 'Marco Rossi', 'admin', '+39 02 1234567', true),
  ('a0000000-0000-0000-0000-000000000002', 'giulia.bianchi@montesino.it', 'Giulia Bianchi', 'advisor', '+39 02 2345678', true),
  ('a0000000-0000-0000-0000-000000000003', 'luca.ferrari@montesino.it', 'Luca Ferrari', 'advisor', '+39 02 3456789', true);

-- ────────────────────────────────────────────────────────────
-- 2. COMPANIES (5 Italian fictitious companies)
-- ────────────────────────────────────────────────────────────

INSERT INTO companies (id, name, sector, revenue_range, employee_count, website, address, notes, created_by) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Tecnologie Alpina S.r.l.', 'Tecnologia', '5-10M €', 45, 'www.tecnologiealpina.it',
   '{"via": "Via Monte Rosa 12", "cap": "20149", "citta": "Milano", "provincia": "MI", "paese": "Italia"}'::jsonb,
   'Azienda software specializzata in soluzioni ERP per PMI', 'a0000000-0000-0000-0000-000000000001'),

  ('c0000000-0000-0000-0000-000000000002', 'Meridiana Food Group S.p.A.', 'Alimentare', '50-100M €', 320, 'www.meridianafood.it',
   '{"via": "Corso Italia 88", "cap": "80100", "citta": "Napoli", "provincia": "NA", "paese": "Italia"}'::jsonb,
   'Gruppo alimentare con 3 stabilimenti produttivi nel Sud Italia', 'a0000000-0000-0000-0000-000000000002'),

  ('c0000000-0000-0000-0000-000000000003', 'Costruzioni Venete S.p.A.', 'Edilizia', '10-50M €', 150, 'www.costruzionivenete.it',
   '{"via": "Via Padova 45", "cap": "35100", "citta": "Padova", "provincia": "PD", "paese": "Italia"}'::jsonb,
   'Impresa edile attiva nel Nord-Est, specializzata in riqualificazione urbana', 'a0000000-0000-0000-0000-000000000001'),

  ('c0000000-0000-0000-0000-000000000004', 'BioFarma Italia S.r.l.', 'Farmaceutico', '10-50M €', 80, 'www.biofarmaitalia.it',
   '{"via": "Via della Scienza 7", "cap": "00144", "citta": "Roma", "provincia": "RM", "paese": "Italia"}'::jsonb,
   'Azienda biotech focalizzata su integratori e nutraceutici', 'a0000000-0000-0000-0000-000000000003'),

  ('c0000000-0000-0000-0000-000000000005', 'Logistica Emiliana S.r.l.', 'Logistica', '1-5M €', 25, 'www.logisticaemiliana.it',
   '{"via": "Via Emilia Ovest 200", "cap": "43100", "citta": "Parma", "provincia": "PR", "paese": "Italia"}'::jsonb,
   'Operatore logistico regionale con focus su catena del freddo', 'a0000000-0000-0000-0000-000000000002');

-- ────────────────────────────────────────────────────────────
-- 3. CONTACTS (10)
-- ────────────────────────────────────────────────────────────

INSERT INTO contacts (id, company_id, full_name, role_title, email, phone, is_decision_maker, notes, created_by) VALUES
  ('t0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Alessandro Conti', 'CEO', 'a.conti@tecnologiealpina.it', '+39 335 1234567', true, 'Fondatore, molto disponibile', 'a0000000-0000-0000-0000-000000000001'),
  ('t0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Sara Marchetti', 'CFO', 's.marchetti@tecnologiealpina.it', '+39 335 2345678', true, NULL, 'a0000000-0000-0000-0000-000000000001'),
  ('t0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'Roberto Esposito', 'Presidente CdA', 'r.esposito@meridianafood.it', '+39 338 9876543', true, 'Terza generazione famiglia fondatrice', 'a0000000-0000-0000-0000-000000000002'),
  ('t0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'Chiara Russo', 'Direttore Finanziario', 'c.russo@meridianafood.it', '+39 338 8765432', false, NULL, 'a0000000-0000-0000-0000-000000000002'),
  ('t0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Vincenzo Amato', 'Direttore Operativo', 'v.amato@meridianafood.it', '+39 338 7654321', false, 'Contatto operativo principale', 'a0000000-0000-0000-0000-000000000002'),
  ('t0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 'Giovanni Zanon', 'Amministratore Delegato', 'g.zanon@costruzionivenete.it', '+39 340 1112233', true, NULL, 'a0000000-0000-0000-0000-000000000001'),
  ('t0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003', 'Federica Pavan', 'Responsabile Legale', 'f.pavan@costruzionivenete.it', '+39 340 4445566', false, NULL, 'a0000000-0000-0000-0000-000000000001'),
  ('t0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000004', 'Elena Sorrentino', 'CEO', 'e.sorrentino@biofarmaitalia.it', '+39 347 9998877', true, 'Background scientifico, PhD in biochimica', 'a0000000-0000-0000-0000-000000000003'),
  ('t0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000004', 'Dario Pellegrini', 'VP Business Development', 'd.pellegrini@biofarmaitalia.it', '+39 347 6655443', false, NULL, 'a0000000-0000-0000-0000-000000000003'),
  ('t0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000005', 'Matteo Ferri', 'Titolare', 'm.ferri@logisticaemiliana.it', '+39 342 1122334', true, 'Interessato a cessione parziale', 'a0000000-0000-0000-0000-000000000002');

-- ────────────────────────────────────────────────────────────
-- 4. DEALS (8 in various pipeline stages)
-- ────────────────────────────────────────────────────────────

INSERT INTO deals (id, code, title, company_id, deal_type, status, priority, deal_value, success_fee_pct, success_fee_min, retainer_monthly, mandate_date, expected_close, description, notes, created_by) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'MNT-2025-001', 'Acquisizione Tecnologie Alpina', 'c0000000-0000-0000-0000-000000000001', 'buy_side', 'negotiation', 'high', 8500000, 2.500, 150000, 5000, '2025-01-15', '2025-06-30',
   'Mandato buy-side per fondo PE interessato all''acquisizione di Tecnologie Alpina', 'Il fondo ha già fatto due incontri con il management', 'a0000000-0000-0000-0000-000000000001'),

  ('d0000000-0000-0000-0000-000000000002', 'MNT-2025-002', 'Vendita Meridiana Food', 'c0000000-0000-0000-0000-000000000002', 'sell_side', 'marketing', 'critical', 45000000, 1.800, 500000, 8000, '2025-02-01', '2025-09-30',
   'Mandato sell-side: la famiglia Esposito vuole vendere il 100% del gruppo', 'Preparazione IM in corso, 12 potenziali acquirenti identificati', 'a0000000-0000-0000-0000-000000000002'),

  ('d0000000-0000-0000-0000-000000000003', 'MNT-2025-003', 'Valuation Costruzioni Venete', 'c0000000-0000-0000-0000-000000000003', 'valuation', 'analysis', 'medium', 25000000, NULL, NULL, 3000, '2025-03-01', '2025-05-15',
   'Incarico di valutazione per pianificazione successoria', 'Raccolta dati finanziari ultimi 5 anni in corso', 'a0000000-0000-0000-0000-000000000001'),

  ('d0000000-0000-0000-0000-000000000004', 'MNT-2025-004', 'Advisory BioFarma', 'c0000000-0000-0000-0000-000000000004', 'advisory', 'mandate_signed', 'high', 15000000, 2.000, 200000, 6000, '2025-03-10', '2025-12-31',
   'Advisory strategico per round di finanziamento Series B', 'Target raccolta 15M€, in contatto con 5 VC', 'a0000000-0000-0000-0000-000000000003'),

  ('d0000000-0000-0000-0000-000000000005', 'MNT-2025-005', 'Cessione Logistica Emiliana', 'c0000000-0000-0000-0000-000000000005', 'sell_side', 'pitch', 'low', 3000000, 3.000, 50000, NULL, NULL, '2025-08-31',
   'Il titolare vuole cedere il 60% e rimanere come manager', 'Primo incontro fatto, preparare proposta di mandato', 'a0000000-0000-0000-0000-000000000002'),

  ('d0000000-0000-0000-0000-000000000006', 'MNT-2025-006', 'Acquisizione target farmaceutico', NULL, 'buy_side', 'prospect', 'medium', NULL, 2.000, 100000, NULL, NULL, '2025-10-31',
   'Ricerca target per gruppo farmaceutico internazionale', 'Pipeline di 20 target iniziali da screenare', 'a0000000-0000-0000-0000-000000000003'),

  ('d0000000-0000-0000-0000-000000000007', 'MNT-2024-015', 'Vendita TechStart S.r.l.', NULL, 'sell_side', 'completed', 'high', 12000000, 2.500, 200000, 5000, '2024-06-01', '2024-12-15',
   'Vendita completata con successo a fondo PE', 'Closing avvenuto il 15/12/2024, fee incassata', 'a0000000-0000-0000-0000-000000000001'),

  ('d0000000-0000-0000-0000-000000000008', 'MNT-2024-018', 'Advisory Gruppo Tessile Nord', NULL, 'advisory', 'lost', 'low', 8000000, 1.500, 100000, 3000, '2024-09-01', '2025-03-31',
   'Advisory per ristrutturazione - il cliente ha scelto un altro advisor', 'Perso a favore di competitor, motivo: relazione pregressa con altro advisor', 'a0000000-0000-0000-0000-000000000002');

-- ────────────────────────────────────────────────────────────
-- 5. DEAL MEMBERS
-- ────────────────────────────────────────────────────────────

INSERT INTO deal_members (deal_id, user_id, role_in_deal) VALUES
  -- Deal 1: Acquisizione Tecnologie Alpina
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'lead'),
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'member'),
  -- Deal 2: Vendita Meridiana Food
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'lead'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'member'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'member'),
  -- Deal 3: Valuation Costruzioni Venete
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'lead'),
  -- Deal 4: Advisory BioFarma
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'lead'),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'member'),
  -- Deal 5: Cessione Logistica Emiliana
  ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'lead'),
  -- Deal 6: Acquisizione target farmaceutico
  ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'lead'),
  ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'member'),
  -- Deal 7: Vendita TechStart (completed)
  ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'lead'),
  ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 'member'),
  -- Deal 8: Advisory Gruppo Tessile (lost)
  ('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 'lead');

-- ────────────────────────────────────────────────────────────
-- 6. ACTIVITIES (15)
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
  ('e0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'meeting', 'Kick-off meeting con CEO BioFarma', 'Definiti obiettivi, timeline e deliverable', NULL, '2025-03-12 14:30:00+00'),
  ('e0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'call', 'Primo contatto con titolare Logistica Emiliana', 'Interessato a cedere 60%, vuole restare come manager', NULL, '2025-04-01 16:00:00+00'),
  ('e0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'status_change', 'Status cambiato: Closing → Completato', NULL, '{"old_status": "closing", "new_status": "completed"}'::jsonb, '2024-12-15 17:00:00+00'),
  ('e0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'note', 'Deal chiuso con successo', 'Vendita a 12M€, fee 2.5% = 300K€. Cliente molto soddisfatto.', NULL, '2024-12-15 17:30:00+00'),
  ('e0000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 'status_change', 'Status cambiato: Negoziazione → Perso', NULL, '{"old_status": "negotiation", "new_status": "lost"}'::jsonb, '2025-02-28 12:00:00+00'),
  ('e0000000-0000-0000-0000-000000000015', 'd0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'email', 'Invio long list target farmaceutici', 'Inviata lista di 20 potenziali target al cliente per screening iniziale', NULL, '2025-04-14 09:00:00+00');

-- ────────────────────────────────────────────────────────────
-- 7. DOCUMENTS (5 records, no actual files)
-- ────────────────────────────────────────────────────────────

INSERT INTO documents (id, deal_id, name, doc_type, storage_path, version, is_client_visible, uploaded_by, file_size, mime_type, created_at) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'NDA Tecnologie Alpina - Fondo PE.pdf', 'nda', 'd0000000-0000-0000-0000-000000000001/nda/nda_alpina.pdf', 1, false, 'a0000000-0000-0000-0000-000000000001', 245000, 'application/pdf', '2025-01-20 10:00:00+00'),
  ('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'Information Memorandum Meridiana Food v1.pdf', 'im', 'd0000000-0000-0000-0000-000000000002/im/im_meridiana_v1.pdf', 1, false, 'a0000000-0000-0000-0000-000000000002', 3500000, 'application/pdf', '2025-03-15 14:00:00+00'),
  ('f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'Information Memorandum Meridiana Food v2.pdf', 'im', 'd0000000-0000-0000-0000-000000000002/im/im_meridiana_v2.pdf', 2, true, 'a0000000-0000-0000-0000-000000000002', 4200000, 'application/pdf', '2025-04-12 16:45:00+00'),
  ('f0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 'Teaser Meridiana Food.pdf', 'teaser', 'd0000000-0000-0000-0000-000000000002/teaser/teaser_meridiana.pdf', 1, true, 'a0000000-0000-0000-0000-000000000002', 890000, 'application/pdf', '2025-03-01 09:30:00+00'),
  ('f0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000004', 'Business Plan BioFarma 2025-2028.pdf', 'business_plan', 'd0000000-0000-0000-0000-000000000004/business_plan/bp_biofarma.pdf', 1, false, 'a0000000-0000-0000-0000-000000000003', 2800000, 'application/pdf', '2025-03-18 11:00:00+00');

-- ────────────────────────────────────────────────────────────
-- 8. SUCCESS FEES (3)
-- ────────────────────────────────────────────────────────────

INSERT INTO success_fees (id, deal_id, deal_value_final, fee_calculated, fee_agreed, payment_status, invoice_entity, paid_amount, due_date, notes) VALUES
  ('g0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000007', 12000000, 300000, 280000, 'paid', 'assets_spa', 280000, '2025-01-15', 'Fee incassata il 10/01/2025, sconto di 20K accordato per fidelizzazione'),
  ('g0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 8500000, 212500, NULL, 'pending', 'piva_forfettaria', 0, '2025-07-31', 'Fee soggetta a closing, stimata su base deal value attuale'),
  ('g0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 45000000, 810000, 750000, 'pending', 'assets_spa', 0, '2025-10-31', 'Fee concordata a 750K€ con pagamento a 30 giorni dal closing');

-- ────────────────────────────────────────────────────────────
-- 9. TASKS (10)
-- ────────────────────────────────────────────────────────────

INSERT INTO tasks (id, deal_id, assigned_to, created_by, title, description, due_date, status, priority) VALUES
  ('h0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Preparare analisi comparabili', 'Raccogliere transazioni comparabili nel settore software ERP', '2025-04-20 18:00:00+00', 'in_progress', 'high'),
  ('h0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Revisione contratto di acquisizione', 'Coordinarsi con studio legale per revisione bozza SPA', '2025-04-25 18:00:00+00', 'todo', 'high'),
  ('h0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Aggiornare IM con dati Q1 2025', 'Integrare risultati primo trimestre 2025 nell''Information Memorandum', '2025-04-30 18:00:00+00', 'todo', 'medium'),
  ('h0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Organizzare management presentation', 'Preparare presentazione per potenziali acquirenti shortlistati', '2025-05-15 18:00:00+00', 'todo', 'high'),
  ('h0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Completare modello DCF', 'Finalizzare modello di valutazione DCF con scenari base/bull/bear', '2025-04-18 18:00:00+00', 'in_progress', 'high'),
  ('h0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Report di valutazione finale', 'Redigere report completo con range di valutazione e metodologia', '2025-05-10 18:00:00+00', 'todo', 'medium'),
  ('h0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Preparare investor deck', 'Creare pitch deck per VC, focus su traction e unit economics', '2025-04-22 18:00:00+00', 'in_progress', 'high'),
  ('h0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Screening VC target', 'Identificare e contattare 10 VC italiani ed europei nel biotech', '2025-04-28 18:00:00+00', 'todo', 'medium'),
  ('h0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Preparare proposta di mandato', 'Redigere proposta di mandato per cessione Logistica Emiliana', '2025-04-16 18:00:00+00', 'done', 'medium'),
  ('h0000000-0000-0000-0000-000000000010', NULL, 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Review fee forecast Q2', 'Aggiornare forecast fee per il secondo trimestre', '2025-04-30 18:00:00+00', 'todo', 'low');
