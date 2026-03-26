# Birrino

## What This Is

Birrino e` una web app mobile-first per tracciare rapidamente le unita` alcoliche consumate durante una serata. L'app usa Supabase come backend, una UX in italiano orientata al gesto rapido, e una dashboard personale con storico, limiti settimanali e timer indicativo per la guida.

## Core Value

Registrare una bevuta deve essere veloce e i numeri mostrati devono restare affidabili.

## Requirements

### Validated

- ✓ Registrazione e accesso con username + PIN tramite Supabase Auth
- ✓ Catalogo bevande letto da Supabase e usato per creare record di consumo
- ✓ Dashboard personale con riepiloghi giornalieri, settimanali, mensili e annuali
- ✓ Selettore rapido bevande con categorie, recenti e preferiti
- ✓ PWA installabile con keepalive database tramite cron
- ✓ Tooling di lint, insert di `consumption` e documentazione principale stabilizzati

### Active

- [ ] Definire il prossimo miglioramento funzionale sul prodotto ora che la base e` stabile
- [ ] Estendere la copertura test oltre ai servizi di utilita` e ai flussi critici appena consolidati

### Out of Scope

- App native iOS/Android dedicate — il progetto e` chiaramente web-first/PWA
- Calcoli medico-legali di tasso alcolemico o idoneita` alla guida — oggi il prodotto espone solo stime semplificate
- Feature social o multiutente avanzate — il codice e` orientato a uso personale per profilo

## Context

- Stack principale: `Next.js` App Router, `React`, `Tailwind CSS`, `Radix UI`, `framer-motion`, `@supabase/supabase-js`.
- L'app e` fortemente client-side: i componenti UI interrogano direttamente Supabase senza un service layer coerente.
- La codebase porta ancora segni della migrazione da sessione anonima / localStorage a Supabase Auth con username + PIN.
- La documentazione principale e` stata riallineata al comportamento attuale, ma restano note storiche da trattare come archivio.
- La copertura test e` migliorata ma resta limitata rispetto ai flussi UI principali.

## Constraints

- **Tech stack**: Restare compatibili con `Next.js` + `Supabase` gia` in uso — evita refactor infrastrutturali gratuiti.
- **Product**: UX e copy sono in italiano e orientati a mobile — i miglioramenti devono preservare questa impostazione.
- **Data model**: Le query client dipendono da tabelle Supabase (`profiles`, `drinks`, `consumption`, `favorites`, `recents`) e da una RPC `check_username_available`.
- **Quality gate**: Ogni modifica va verificata almeno con `npm run lint`, con `npm run build` come controllo aggiuntivo quando utile.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Username visibile all'utente, email sintetica interna (`username@birrino.local`) | Evita di chiedere una mail reale ma usa Supabase Auth standard | ✓ Good |
| Query Supabase fatte direttamente dal client | Riduce il codice backend iniziale e velocizza il prototipo | ⚠️ Revisit |
| Mantenere solo la route legacy `app/[user]` e rimuovere lo shim `useAnonSession` | Riduce il rumore della migrazione senza rompere gli URL storici | ✓ Good |
| Keepalive database via `/api/keepalive` e cron | Mantiene attivo il progetto Supabase free tier | ✓ Good |
| Migrare il lint a ESLint flat config | Rende di nuovo eseguibile il gate richiesto dal repository | ✓ Good |

---
*Last updated: 2026-03-26 after stabilization phase*
