# AGENTS Guide

This document explains how automated agents (e.g. Codex or Claude) should work in
this repository. Follow these practices whenever you modify the codebase.

## 1. Required Checks

- Run `npm run lint` after making any changes and fix issues before committing.
- You may run `npm run build` to ensure the Next.js project compiles.

## Commit Guidelines

- Use short, imperative commit messages.
- Separate unrelated changes into distinct commits.

## 2. Project Structure

- `app/` – Next.js pages and layouts
- `components/` – Reusable React components
- `lib/` – Helper libraries and utilities
- `hooks/` – Custom React hooks
- `types/` – Shared TypeScript types
- `public/` – Static assets

## 3. Coding Conventions

- Use TypeScript for all source files.
- Follow ESLint rules defined in `.eslintrc.json`.
- Prefer functional React components and descriptive variable names.
- Place page components in `app/` and reusable pieces in `components/`.

## 4. Testing

- Install dependencies with `npm install` if needed.
- Run the development server via `npm run dev` during local testing.
- Execute `npm run lint` before each commit and ensure no errors remain.
- Optionally run `npm run build` to verify a production build succeeds.

## 5. Pull Request Guidelines

- Title format: `[Feature] Add user authentication` (short and descriptive).
- Summarize the changes in the PR body and reference related issues.
- Keep commits focused; avoid bundling unrelated modifications together.

## 6. Verification Steps

- `npm run lint` – Lint the codebase.
- `npm run build` – Build the project for production.

## 7. File Scope

Instructions in this file apply to the entire repository. Subdirectories may
contain their own `AGENTS.md` files that override these rules for files within
their scope.
