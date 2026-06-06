# Product Vision — Encounters of the Void

## One-sentence pitch

Encounters of the Void is a standalone responsive web campaign tool for Pen & Paper Game Masters that helps them organize worlds, create custom creatures, and prepare and run combat encounters through clean, flexible, reusable layouts.

## Core promise

Give Game Masters the freedom to run their campaign their way without losing control of the chaos.

The product should make a GM feel:

- organized, not boxed in
- in control during preparation and at the table
- free to shape the workspace around their own campaign structure
- fast when creating or adjusting encounters
- calm because the interface stays clean even when the campaign is complex

## Target users

Primary users are Pen & Paper Game Masters who prepare and run tabletop campaigns, especially GMs familiar with Pathfinder-style encounter complexity, custom creatures, detailed stats, and tactical combat.

The tool should also be usable by GMs running other systems, but Pathfinder-style depth is the reference point for complexity and encounter needs.

## Product shape

Encounters of the Void is a standalone campaign tool, not just a board-game companion and not merely a simulator.

It should support:

- account login
- saved campaigns/worlds
- saved layouts and reusable designs
- custom creature creation
- encounter creation and management
- responsive use across desktop, tablet, and mobile

Tablet support is especially important because many GMs run games at the table from a tablet or laptop. Mobile should remain usable for review, quick edits, and lightweight management.

## Design pillars

### 1. Flexible structure, not forced structure

Every GM organizes differently. The app should provide useful building blocks instead of enforcing one rigid campaign workflow.

Layouts, dashboards, encounter views, creature sheets, notes, and reusable designs should be customizable enough that different GMs can shape the tool around their own habits.

### 2. Encounter management first

The strongest product use case is creating, adjusting, and running encounters.

Features should prioritize:

- encounter preparation
- creature and NPC management
- custom monster creation
- notes and tactical details relevant during combat
- fast edits while the game is running
- clear access to the information a GM needs right now

### 3. Clean design beats feature density

The app must feel tidy, calm, and readable. A powerful GM tool can still be clean.

Avoid "GM spreadsheet hell": if a feature makes the interface noisier, harder to scan, or more chaotic, it needs a strong reason to exist.

### 4. Reusable GM patterns

GMs repeatedly use similar structures, encounter formats, creature layouts, and preparation styles.

The product should let users save and reuse layouts, templates, and designs across campaigns, worlds, creatures, and encounters.

### 5. System-flexible, Pathfinder-shaped

The project comes from running Pathfinder games, building many encounters, and creating custom creatures. Pathfinder-style depth should inform the product's power level.

However, avoid locking the product into a single ruleset too early unless that becomes an explicit product decision.

### 6. Responsive by default

All major workflows should be usable across desktop, tablet, and mobile.

This does not mean every device needs the same layout. It means every feature needs a deliberate responsive design:

- desktop for full campaign prep and dense layout editing
- tablet for table-side encounter running and campaign control
- mobile for quick lookup, review, and small edits

## Ticket-writing principles

When writing implementation tickets, prefer work that strengthens at least one of these areas:

1. easier encounter creation or encounter running
2. cleaner organization of campaign/world information
3. customizable layouts or reusable templates/designs
4. custom creature creation and management
5. responsive usability across desktop, tablet, and mobile
6. login-backed persistence of user layouts, campaigns, and reusable designs

Every UI ticket should explicitly consider clarity, customization, and responsive behavior.

## Anti-vision

Encounters of the Void should not become:

- bloated
- chaotic
- rigid
- a generic note-taking clone
- a dense spreadsheet UI
- a virtual tabletop replacement by accident
- a rules database first and GM workflow tool second
- a one-size-fits-all campaign manager

## Core product tension

The product must offer high GM freedom without turning into interface chaos.

The preferred pattern is:

> modular defaults + customizable layouts + reusable templates

Not:

> 500 knobs and no structure
