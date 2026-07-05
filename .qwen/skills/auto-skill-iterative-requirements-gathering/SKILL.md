---
name: iterative-requirements-gathering
description: Systematic approach to iteratively extract and document project requirements until all details are clear — for building websites, apps, and services
source: auto-skill
extracted_at: '2026-07-04T05:31:26.346Z'
---

# Iterative Requirements Gathering Approach

When gathering project requirements from a client, follow this systematic approach to ensure thoroughness and completeness — especially following the principle: **keep asking questions until everything is clear, never stop early.**

## Core Principle
> "Не зупиняйся поки тобі не буде все ясно" — Keep digging into every detail. Do not assume or skip anything even if it seems minor. Present structured question lists for each category and wait for answers before moving on.

## Process Overview

### Step 1: High-Level Vision (Round 1)
- Start with the **big picture**: what is the product, who is it for, what problem does it solve?
- Initial categories to ask about: type of site/app, target audience, core features at a glance.
- Example questions: "What kind of website do you want?", "Who is your target audience?", "What is the primary goal?"

### Step 2: Refine Details (Round 2+)
- Based on initial answers, drill down into **specific sub-domains**:
    - Checkout flow (fields needed, payment vs notification)
    - Admin panel features (what actions admin can perform)
    - Design preferences (style reference, visual style)
    - Technical stack choices (Angular, NestJS, PaaS hosting etc.)
    - Languages/i18n requirements

### Step 3: Deep-Dive into Specifics (Round 3+)
- Each domain gets its own focused round of questions:
    - **Options system**: How do options work? Are they fixed or dynamic? Single-select or multi-select? Price calculation logic?
    - **Photo handling**: How many photos per product? Lightbox functionality? 
    - **Gallery features**: Search, filters, sort? Or just visual grid?
    - **Additional pages**: About, Contact, FAQ — which ones needed?
- Always present questions grouped by category in tables or lists for easy answering.

### Step 4: Confirm & Document (Final Round)
- Summarize all collected decisions in a clear table.
- Explicitly ask if anything is missing or should be changed.
- **Mark requirements as COMPLETE only when the client confirms everything is accurate.**

## File Structure Output
After gathering all requirements, produce these files:
1. `requirements.md` — Full requirement specification with functional + non-functional sections
2. `architecture.md` — System architecture (tech stack, DB schema outline, API endpoints, deployment strategy)
3. `implementation-plan.md` — 20-step breakdown with sub-steps for each main step

## Key Communication Rules
- **Present grouped questions**: Never ask just one question at a time. Always present 3-5 related questions per round organized by topic (catalog, checkout, pages, photos, etc.)
- **Wait patiently for answers**: Do not rush or assume. Let the user answer in any order.
- **Update live documentation**: Show the client what has been recorded so far — they can confirm or correct at each step.
- **No assumption skipping**: If a detail seems obvious (e.g., mobile responsiveness), still explicitly ask and get confirmation before marking it as done.
- **Iterate until zero ambiguity**: The final round should have no open questions remaining.

## Example Question Flow Template

| Round | Topic | Sample Questions |
|--|--|--|
| 1 | Vision & Type | "What kind of site?", "Target audience?" |
| 2 | Core Features | "Guest or registered checkout?", "Design reference style?" |
| 3A | Checkout Details | "Fields needed? Payment or notification? Status flow?" |
| 3B | Product Options | "Fixed options or dynamic? Single-select or multi? Price logic?" |
| 3C | Gallery Features | "Search bar? Filters? Sort? Or just grid?" |
| 3D | Additional Pages | "About page? Contact? FAQ? Any others?" |
| 3E | Photos | "How many per item? Lightbox behavior?" |
| 4 | Final Confirmation | "Any missed details? Ready to proceed to architecture?" |

When the user says anything like "так", "добре", "ого", it means that category is complete — move on to the next one. The skill's purpose is ensuring NO open questions remain when requirements gathering ends.
