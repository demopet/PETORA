# AGENTS.md — Project Governance & Workflow Contract

## Petora — Sistem Manajemen Terpadu Petshop & Petcare

---

## 1. Document Authority Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  TIER 1 — BASELINE CONTRACTS (Master Documents)             │
│  These are immutable without formal change control.          │
├─────────────────────────────────────────────────────────────┤
│  master-arsitektur.md          → Architecture & Tech Stack   │
│  master-spesifikasi-frontend.md → UI/UX & Design System     │
│  master-spesifikasii-modul.md  → Business Logic & Workflows │
│  master-test-cidi.md           → Testing & CI/CD Standards  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  TIER 2 — IMPLEMENTATION WORKFLOW                           │
│  This is the execution plan derived from Tier 1.            │
├─────────────────────────────────────────────────────────────┤
│  roadmap.md                    → Phase-by-phase delivery     │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  TIER 3 — EXECUTION ARTIFACTS                               │
│  Code, migrations, tests, configs.                          │
└─────────────────────────────────────────────────────────────┘
```

### 1.1 Master Documents as Baseline Contracts

| Document | Authority | Scope |
|---|---|---|
| `master-arsitektur.md` | **Architecture Law** | Database schema, TypeScript types, Zod schemas, RLS policies, service layer contracts, file structure, environment variables |
| `master-spesifikasi-frontend.md` | **Frontend Law** | Design tokens, component architecture, layout system, navigation, authentication UI, module UIs, form patterns, responsive design, accessibility |
| `master-spesifikasii-modul.md` | **Business Logic Law** | Module workflows, state machines, validation rules, API contracts, permission checks, edge cases, error matrix |
| `master-test-cidi.md` | **Quality Law** | Testing strategy, tooling, CI/CD pipeline, quality gates, test data management, environment management, monitoring |

### 1.2 Roadmap as Workflow

`roadmap.md` is the **implementation workflow** — the ordered sequence of phases that translates baseline contracts into working software.

- Roadmap phases must align with baseline contracts.
- Roadmap deliverables must satisfy the Definition of Done defined in `master-test-cidi.md`.
- Roadmap cannot introduce new technical decisions that contradict baseline contracts.

---

## 2. Core Principles

### 2.1 Contract-First Development

1. **Baseline contracts are immutable** during active development.
2. Any change to a baseline contract requires:
   - Formal proposal with rationale
   - Update to the affected `master-*.md` document
   - Propagation to `roadmap.md` if delivery timeline is affected
   - Team review and approval
3. Implementation must follow contracts exactly — no deviations.

### 2.2 Roadmap-Driven Delivery

1. Phases are executed in sequential order as defined in `roadmap.md`.
2. Each phase has a **Definition of Done (DoD)** that must be fully met before proceeding.
3. Phase dependencies are strict — Phase N cannot start until Phase N-1 is complete.
4. No "time estimates" — quality and contract compliance are the only measures.

### 2.3 Change Control Process

```
Change Request
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Identify affected master document(s)               │
│  Step 2: Propose change with rationale                       │
│  Step 3: Update master document(s)                           │
│  Step 4: Update roadmap.md if delivery changes               │
│  Step 5: Re-verify all dependent phases                      │
│  Step 6: Get formal approval                                 │
└─────────────────────────────────────────────────────────────┘
```

**Allowed changes without full process:**
- Bug fixes within existing contract bounds
- Documentation clarifications
- Test additions

**Requires full change control:**
- New features outside contract scope
- Architecture changes
- Schema changes
- Workflow modifications
- UI pattern changes

---

## 3. Quality Gates

### 3.1 Phase Gate

Each phase in `roadmap.md` has a DoD matrix. All criteria must be checked before marking complete.

### 3.2 Code Quality Gates (from master-test-cidi.md)

| Gate | Requirement | Blocker |
|---|---|---|
| TypeScript strict mode | No errors | Hard |
| ESLint | No errors | Hard |
| Prettier | Formatted | Hard |
| Unit tests | 100% pass, ≥80% coverage | Hard |
| Integration tests | 100% pass | Hard |
| E2E tests | 100% pass | Hard |
| RLS tests | 100% pass | Hard |
| Lighthouse | ≥90 all categories | Hard |
| Accessibility | No critical violations | Hard |
| Security audit | No high/critical CVE | Hard |
| Code review | ≥1 approval | Hard |

### 3.3 Baseline Compliance Gate

Before any PR can be merged:
- [ ] Implementation matches `master-arsitektur.md` contracts
- [ ] UI matches `master-spesifikasi-frontend.md` designs
- [ ] Business logic matches `master-spesifikasii-modul.md` workflows
- [ ] Tests match `master-test-cidi.md` requirements

---

## 4. Development Workflow

### 4.1 Phase Execution

1. Select current phase from `roadmap.md`
2. Review all relevant sections in master documents
3. Implement deliverables as specified
4. Run all quality gates
5. Mark phase DoD complete
6. Move to next phase

### 4.2 Feature Implementation

For each feature:
1. Read relevant master document sections
2. Write code following contracts exactly
3. Write tests per `master-test-cidi.md`
4. Verify against DoD
5. Submit PR with checklist

### 4.3 PR Checklist

```markdown
## Baseline Contract Compliance
- [ ] Architecture: matches master-arsitektur.md
- [ ] Frontend: matches master-spesifikasi-frontend.md
- [ ] Module logic: matches master-spesifikasii-modul.md
- [ ] Testing: matches master-test-cidi.md

## Phase Alignment
- [ ] Current phase from roadmap.md
- [ ] DoD criteria met
- [ ] Dependencies satisfied

## Quality Gates
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] `npm run test:integration` passes (if applicable)
- [ ] `npm run test:e2e` passes (if applicable)
- [ ] Code review approved
```

---

## 5. Document Maintenance

### 5.1 Master Document Updates

- Master documents are **versioned** and have **change logs**.
- Updates require team consensus.
- Updates must maintain backward compatibility unless explicitly breaking.

### 5.2 Roadmap Updates

- Roadmap is updated at phase boundaries.
- Deliverable checkboxes are updated during development.
- Dependencies matrix is maintained.

### 5.3 Synchronization

When a master document changes:
1. Identify all roadmap phases affected
2. Update roadmap.md section references
3. Notify team of contract changes
4. Update implementation plans if needed

---

## 6. Enforcement

### 6.1 Automated Enforcement

- CI/CD pipeline enforces quality gates from `master-test-cidi.md`
- TypeScript, ESLint, Prettier enforced on every PR
- Test coverage thresholds enforced
- Build verification required

### 6.2 Manual Enforcement

- Code review verifies baseline contract compliance
- Phase completion requires manual DoD verification
- Architecture changes require architecture review

### 6.3 Non-Compliance

If implementation deviates from baseline contracts:
1. PR is blocked
2. Developer must align code with contracts
3. If contract is wrong, follow change control process to update contract first

---

## 7. Quick Reference

### 7.1 Document Purposes

| Document | Read When |
|---|---|
| `master-arsitektur.md` | Designing DB, writing types, creating schemas, setting up project |
| `master-spesifikasi-frontend.md` | Building UI, creating components, designing layouts |
| `master-spesifikasii-modul.md` | Implementing business logic, workflows, state machines |
| `master-test-cidi.md` | Writing tests, setting up CI/CD, quality assurance |
| `roadmap.md` | Planning sprints, tracking progress, understanding dependencies |

### 7.2 Decision Authority

| Decision Type | Authority | Document |
|---|---|---|
| Database schema change | Architecture review | `master-arsitektur.md` |
| New UI pattern | Design review | `master-spesifikasi-frontend.md` |
| Business workflow change | Product + Architecture | `master-spesifikasii-modul.md` |
| Testing strategy change | QA + Architecture | `master-test-cidi.md` |
| Phase sequencing | Product | `roadmap.md` |

---

*This AGENTS.md file is the governing document for project workflow and contract enforcement. All contributors must adhere to these rules.*
