# Roadmap: Birrino

## Overview

La roadmap immediata serve a consolidare il progetto esistente prima di aggiungere nuove feature. In questa sessione il focus e` costruire memoria persistente del repository, mappare la codebase e preparare il prossimo miglioramento su basi chiare.

## Phases

- [x] **Phase 1: Audit & Mapping** - Inizializzare `.planning/` e documentare stack, struttura, integrazioni e rischi reali
- [x] **Phase 2: Improvement Definition** - Scegliere e delimitare il miglioramento prioritario
- [x] **Phase 3: Implementation & Verification** - Implementare il miglioramento scelto e verificarlo

## Phase Details

### Phase 1: Audit & Mapping
**Goal**: Ottenere una mappa affidabile del progetto reale, non della documentazione storica.
**Depends on**: Nothing
**Requirements**: [MAP-01, MAP-02]
**Success Criteria**:
1. `.planning/` esiste ed e` coerente con il repository corrente
2. La codebase map copre stack, architettura, convenzioni, test e aree di rischio
3. I principali punti di drift o fragilita` sono esplicitati
**Plans**: 2 plans

Plans:
- [x] 01-01: Inizializzare planning docs di progetto
- [x] 01-02: Mappare la codebase esistente

### Phase 2: Improvement Definition
**Goal**: Decidere il prossimo miglioramento ad alto impatto e trasformarlo in scope eseguibile.
**Depends on**: Phase 1
**Requirements**: [NEXT-01, NEXT-02]
**Success Criteria**:
1. Il miglioramento scelto ha un obiettivo utente chiaro
2. Sono noti file coinvolti, rischi e strategia di verifica
3. Esiste almeno un piano eseguibile per l'implementazione
**Plans**: TBD

Plans:
- [x] 02-01: Definire il miglioramento prioritario
- [x] 02-02: Preparare il piano di implementazione

### Phase 3: Implementation & Verification
**Goal**: Consegnare il miglioramento scelto con verifica tecnica minima.
**Depends on**: Phase 2
**Requirements**: [NEXT-03]
**Success Criteria**:
1. Il comportamento nuovo o corretto e` osservabile nell'app
2. `npm run lint` passa senza errori
3. La documentazione di planning viene aggiornata con esito e rischi residui
**Plans**: TBD

Plans:
- [x] 03-01: Implementare il miglioramento
- [x] 03-02: Verificare e chiudere il phase summary

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Audit & Mapping | 2/2 | Complete | 2026-03-26 |
| 2. Improvement Definition | 2/2 | Complete | 2026-03-26 |
| 3. Implementation & Verification | 2/2 | Complete | 2026-03-26 |
