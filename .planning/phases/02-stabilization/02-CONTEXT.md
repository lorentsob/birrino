# Phase 02 Context - Stabilization

## Goal

Stabilizzare la base tecnica prima di nuovi miglioramenti, correggendo i punti che oggi rendono fragile il progetto: tooling lint rotto, insert di `consumption` incoerenti, residui legacy del vecchio auth flow e documentazione non allineata.

## In Scope

- Ripristinare un gate lint funzionante con la toolchain attuale
- Unificare il flusso di inserimento consumi
- Rimuovere o dismettere il codice legacy non piu` usato per sessioni anonime
- Riallineare i documenti principali al comportamento attuale
- Aggiungere copertura minima sulle nuove utility critiche

## Out of Scope

- Riscrittura architetturale server-side delle query Supabase
- Refactor completo di tutti i flussi di lettura/scrittura
- Nuove feature prodotto

## Risks

- La migrazione ESLint potrebbe introdurre nuove segnalazioni non viste prima
- La centralizzazione degli insert puo` toccare i flussi principali della UI
- La pulizia dei residui legacy va fatta senza rompere route o componenti ancora referenziati

## Verification

- `npm run lint`
- `npm run test`
- `npm run build`
