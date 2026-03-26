# Requirements: Birrino

**Defined:** 2026-03-26
**Core Value:** Registrare una bevuta deve essere veloce e i numeri mostrati devono restare affidabili.

## Current Product Requirements

### Access & Identity

- [x] **AUTH-01**: L'utente puo` creare un profilo con username e PIN di 4 cifre
- [x] **AUTH-02**: L'utente puo` accedere al proprio profilo con username e PIN
- [x] **AUTH-03**: La sessione autenticata sopravvive al refresh della pagina

### Consumption Tracking

- [x] **TRACK-01**: L'utente puo` scegliere una bevanda da un catalogo salvato su Supabase
- [x] **TRACK-02**: L'utente puo` aggiungere rapidamente una bevuta con quantita` 1
- [x] **TRACK-03**: L'utente puo` aggiungere una bevuta con quantita` personalizzata
- [x] **TRACK-04**: Ogni consumo e` associato al profilo corrente

### Insights & Safety

- [x] **INS-01**: L'utente vede il totale settimanale rispetto al limite di 14 unita`
- [x] **INS-02**: L'utente vede riepiloghi giorno/settimana/mese/anno
- [x] **INS-03**: L'utente riceve un avviso visivo quando supera il limite settimanale
- [x] **SAFE-01**: L'utente vede una stima del tempo residuo prima di guidare

### Experience & Operations

- [x] **EXP-01**: L'app funziona come PWA installabile
- [x] **EXP-02**: L'app espone recenti e preferiti quando le tabelle di supporto sono disponibili
- [x] **OPS-01**: Il progetto include un meccanismo keepalive per evitare il freeze del database

## Next Iteration Requirements

### Maintainability

- [ ] **NEXT-01**: Documentazione e planning devono descrivere il flusso auth e dati realmente in uso
- [ ] **NEXT-02**: I residui del vecchio flusso anonimo devono essere rimossi o resi espliciti
- [ ] **NEXT-03**: I flussi critici di autenticazione e inserimento consumi devono avere copertura di test minima

## Out of Scope

| Feature | Reason |
|---------|--------|
| OAuth/social login | Il prodotto usa un accesso minimale username + PIN |
| Dashboard multiutente o admin | Non emerge dal codice un caso d'uso amministrativo |
| Calcolo BAC clinico o referti medici | Il modello attuale usa solo stime di unita` e tempi semplificati |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| TRACK-01 | Phase 1 | Complete |
| TRACK-02 | Phase 1 | Complete |
| TRACK-03 | Phase 1 | Complete |
| TRACK-04 | Phase 1 | Complete |
| INS-01 | Phase 1 | Complete |
| INS-02 | Phase 1 | Complete |
| INS-03 | Phase 1 | Complete |
| SAFE-01 | Phase 1 | Complete |
| EXP-01 | Phase 1 | Complete |
| EXP-02 | Phase 1 | Complete |
| OPS-01 | Phase 1 | Complete |
| NEXT-01 | Phase 2 | Complete |
| NEXT-02 | Phase 2 | Complete |
| NEXT-03 | Phase 3 | Complete |

**Coverage:**
- Current product requirements: 14 total
- Mapped to phases: 14
- Next iteration requirements: 3

---
*Requirements defined: 2026-03-26*
*Last updated: 2026-03-26 after stabilization phase*
