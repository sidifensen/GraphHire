# Design System Strategy: The Analytical Precision Framework

## 1. Overview & Creative North Star: "The Digital Curator"
In the high-stakes world of AI recruitment, data can easily become noise. This design system moves away from the "generic dashboard" aesthetic toward **The Digital Curator**. Our North Star is a fusion of high-end editorial layouts and surgical data precision. 

Rather than boxing information into rigid grids, we treat the UI as an expansive, breathable canvas. We leverage **intentional asymmetry**—offsetting data visualizations against clean typographic columns—to guide the eye through the candidate's story. We break the "template" look by using overlapping layers, high-contrast typography scales, and a philosophy of "Data as Art," where skill trees and radar graphs are treated as hero elements rather than secondary widgets.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
Our palette is rooted in a deep, authoritative blue, but its execution is what defines the premium experience.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Traditional borders create visual "clutter" that traps data. Instead, boundaries must be defined solely through:
*   **Background Shifts:** Using `surface-container-low` sections against a `surface` background.
*   **Tonal Transitions:** Subtle shifts in saturation to define focus areas.

### Surface Hierarchy & Nesting
We treat the UI as physical layers of "Fine Paper" or "Frosted Glass." Use the `surface-container` tiers to create depth:
*   **Base:** `surface` (#faf8ff) for the main canvas.
*   **Sections:** `surface-container-low` (#f2f3ff) for grouping secondary content.
*   **Active Focus:** `surface-container-highest` (#dae2fd) for the most critical interactive cards.

### The "Glass & Gradient" Rule
To elevate the platform above standard SaaS tools, utilize **Glassmorphism** for floating elements (e.g., candidate comparison overlays). Apply `surface` colors at 70% opacity with a `backdrop-blur-xl`. 

**Signature Texture:** Use a linear gradient from `primary` (#004ac6) to `primary_container` (#2563eb) for primary CTAs and hero data visualizations to provide a "lit from within" professional polish.

---

## 3. Typography: Editorial Authority
We utilize a dual-font strategy to balance human warmth with technical precision.

*   **Display & Headlines (Manrope):** Chosen for its geometric modernism. Large scales (e.g., `display-lg` at 3.5rem) should be used for candidate names or key AI insights to create an editorial feel.
*   **Body & Labels (Inter):** The workhorse for data. Inter’s high x-height ensures readability in dense talent matrices and skill descriptions.

**Hierarchy as Identity:** 
By pairing a `display-sm` headline in `on_surface` with a `label-md` uppercase sub-header in `on_surface_variant`, we create a high-contrast, sophisticated rhythm that feels like a premium financial journal rather than a simple database.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often too heavy for a data-centric platform. We achieve "lift" through color theory.

*   **The Layering Principle:** Place a `surface_container_lowest` (#ffffff) card on a `surface_container_low` (#f2f3ff) background. This creates a soft, natural lift that is easier on the eyes during long recruiting sessions.
*   **Ambient Shadows:** When an element must float (e.g., a Skill Tree detail modal), use: `shadow-[0px_20px_50px_rgba(19,27,46,0.06)]`. The shadow is a tinted version of `on_surface` at a very low opacity to mimic natural light.
*   **The "Ghost Border" Fallback:** If a container absolutely requires a boundary for accessibility, use `outline_variant` at **15% opacity**. Never use 100% opaque lines.

---

## 5. Components: Surgical Precision

### Buttons & CTAs
*   **Primary:** A signature gradient (Primary to Primary-Container). Roundedness: `xl` (0.75rem). No border.
*   **Secondary:** `surface_container_high` background with `on_primary_fixed_variant` text.
*   **Tertiary:** Transparent background, `primary` text, with a 2px `surface_tint` underline that appears only on hover.

### High-Fidelity Data Visuals
*   **Radar Graphs:** Use `primary` for the fill with 20% opacity and `primary_fixed` for the structural strokes. Points should be `secondary` (#006c49) to indicate "Growth Areas."
*   **Skill Trees:** Nodes should use `surface_container_highest`. Connections should be "Ghost Borders" (Outline-variant at 20%). Use `primary` glow effects for "AI-Matched" skills.

### Cards & Lists
*   **Forbid Dividers:** Do not use lines between list items. Use the `gap-4` (16px) spacing scale and subtle `surface` color alternations to separate candidate entries.
*   **Padding:** Strict adherence to `p-6` (24px) for all primary containers to ensure "The Digital Curator" aesthetic of breathing room.

### Input Fields
*   **State:** Default fields use `surface_container_low`. On focus, transition to `surface_container_lowest` with a 2px `primary` bottom-border only (Editorial style).

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts where the left 60% is data and the right 40% is editorial insight.
*   **Do** use `on_surface_variant` for secondary labels to create a sophisticated grey-scale hierarchy.
*   **Do** embrace negative space; if a screen feels "full," increase the padding to `p-10`.

### Don't:
*   **Don't** use 1px solid borders for anything other than specific accessibility requirements.
*   **Don't** use pure black (#000000) for text; always use `on_surface` (#131b2e) for a softer, premium feel.
*   **Don't** use standard "out-of-the-box" Tailwind shadows; they are too heavy for this refined system.
*   **Don't** crowd charts. Every visualization should have at least 32px of "clearance" from other elements.