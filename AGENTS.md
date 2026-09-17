# AGENTS.md

## Purpose

This file defines mandatory rules for AI coding agents working on the frontend of an agricultural drone-monitoring application.

The product helps a user:

- view agricultural fields and georeferenced drone photographs on a map;
- submit field imagery for weed analysis;
- inspect detected weeds, their species, count, coordinates, and vegetation stage;
- draw or edit a field boundary;
- build and save a drone route inside that boundary;
- view reference information about weed species and vegetation stages;
- export or consume analysis results in JSON or CSV form.

The primary goal is to preserve the existing architecture, visual language, coding conventions, UX patterns, and overall identity of the application while building these workflows accurately.

The agent must behave as a contributor to an existing product, not as a designer or engineer starting a new project from scratch.

Existing project conventions always take priority over the agent's personal preferences. The project code, actual API contracts, available data, and explicit user instructions are authoritative. This document must not be used as a reason to invent backend capabilities that do not exist.

When implementing a task, prefer the smallest, most consistent change that solves the problem.

---

# 0. Project Domain and Product Boundaries

This section contains project-specific rules. They are mandatory and take priority over generic UI suggestions later in this file.

## 0.1 Current Product Context

The application is a working interface for agronomists, drone operators, researchers, or field owners. It is not a marketing landing page and must not look like one.

The current product concept contains three main areas:

1. **Field map** — OpenStreetMap-based field exploration, field boundaries, drone photo placement, analysis controls, and weed detections tied to coordinates.
2. **Drone route setup** — field-boundary drawing/editing, route generation or manual route editing, coordinate inspection, and route saving.
3. **Plant information** — a practical weed reference catalog with species details, visual references, and vegetation-stage information.

The product is still being defined. Do not turn uncertain ideas into permanent architecture or claim unsupported functionality. Build requested features in a way that can evolve, but do not create speculative systems in advance.

## 0.2 MVP Priority

Unless the user explicitly changes priorities, prefer the following implementation order:

1. Show a usable map with a test field polygon.
2. Show georeferenced drone images or their footprints/markers on that map.
3. Allow the user to select a field or image and request analysis.
4. Show analysis status and detected weeds on the map and in a synchronized list.
5. Show species, confidence when available, vegetation stage, quantity, and coordinates.
6. Allow a field contour to be created or edited.
7. Build and save a drone route from coordinate points.
8. Add the plant reference catalog and detailed plant pages.
9. Add export controls only when the data or API required for export exists.

Do not add dashboards, analytics panels, collaboration features, account management, billing, weather, crop-yield forecasting, pesticide recommendations, or live drone control unless explicitly requested.

## 0.3 Mandatory Terminology

Use domain terms consistently. Prefer clear Russian product copy when the rest of the application is in Russian.

Recommended terms:

- `Поле` — an agricultural field represented by a polygon;
- `Контур поля` — the ordered boundary coordinates of a field;
- `Снимок` — one drone image;
- `Область снимка` — the geographic footprint covered by an image;
- `Маршрут` — an ordered line or set of waypoints for a drone;
- `Точка маршрута` — one waypoint;
- `Результат анализа` — the output returned by the analysis service;
- `Обнаружение` — one detected weed object or cluster returned by the model;
- `Вид сорняка` — identified weed species;
- `Стадия вегетации` — growth stage assigned to a detected weed;
- `Уверенность` — model confidence, shown only when supplied by the backend;
- `Не определено` — an honest fallback for unavailable species or stage data.

Do not use several different labels for the same concept on different screens.

## 0.4 Never Invent Agronomic or Model Results

Do not fabricate:

- weed species;
- vegetation stages;
- detection confidence;
- quantities;
- field coordinates;
- image geolocation;
- analysis duration;
- agronomic advice;
- chemical-treatment recommendations;
- model accuracy statistics.

Demo data is allowed only when a task explicitly requires a prototype or when the project already uses fixtures. Demo data must be clearly isolated and identifiable in code. Prefer deterministic fixtures over random values.

Never present mock analysis as a real neural-network result. A demo state should be visibly marked as test data where that distinction matters to the user.

## 0.5 Do Not Guess Missing Product Decisions

When a request depends on an unknown decision that materially changes behavior, ask or leave a narrow, explicit implementation seam rather than guessing.

Examples of decisions that must not be silently invented:

- whether analysis is run per image, per field, or per image batch;
- whether one detection represents one plant or a cluster;
- which vegetation-stage taxonomy the model uses;
- whether drone images contain EXIF GPS data;
- whether image footprints are provided by the backend or calculated on the client;
- whether routes are generated automatically or entered manually;
- drone altitude, camera overlap, speed, battery constraints, and no-fly rules;
- whether exports are created by the frontend or downloaded from the backend;
- roles and permissions;
- offline-map or offline-route requirements.

Do not block harmless UI scaffolding when a neutral implementation is possible. Keep uncertain domain choices behind typed props, adapters, or existing service boundaries without building a speculative abstraction framework.

---

# 0A. Core User Workflows

## 0A.1 Field Map Workflow

The field map is the primary operational screen. It should support a clear workflow:

1. The user opens the map.
2. Existing fields are visible and distinguishable by boundary.
3. The user selects a field.
4. Drone images belonging to the selected field become visible as markers, thumbnails, or geographic footprints according to available data.
5. The user selects one image or an explicitly supported group of images.
6. The user starts analysis.
7. The interface shows analysis progress or processing state without inventing an exact percentage.
8. Successful results appear both spatially on the map and in a readable list or details panel.
9. Selecting a detection on the map selects the same detection in the list, and vice versa, where both views are present.
10. The user can inspect species, vegetation stage, count semantics, coordinates, source image, and confidence if available.

The primary screen must remain understandable even before any field or image is selected.

## 0A.2 Drone Route Workflow

The route screen should guide the user through an ordered process:

1. Select an existing field or create a field contour.
2. Draw, edit, or confirm the polygon boundary.
3. Inspect or edit coordinates where supported.
4. Create route waypoints or request route generation only if such logic exists.
5. Review the resulting route line and waypoint order.
6. Validate obvious client-side problems such as too few polygon points, an unclosed invalid contour, empty route, or coordinates outside valid ranges.
7. Save the route through the established API/state layer.

The frontend must not pretend to provide flight-safety validation. Route geometry in the UI is not proof that a route is legally or physically safe to fly.

## 0A.3 Plant Information Workflow

The plant reference section should prioritize identification and understanding, not decorative content.

The catalog may include, when real data exists:

- common and scientific name;
- reference images;
- short description;
- distinguishing features;
- vegetation stages;
- occurrence or associated crops;
- links from detections to the relevant plant page.

Provide search and filtering only when the dataset justifies them. Do not create empty filter systems for a tiny list.

---

# 0B. Map and Geospatial Rules

## 0B.1 Map Technology

Use OpenStreetMap as the map-data source when requested, but do not assume a rendering library without inspecting the project.

If the project already uses Leaflet, React Leaflet, MapLibre GL, OpenLayers, or another map library, continue using it. Do not install a competing map library.

When no map library exists, evaluate the smallest library that supports the actual requested features such as markers, polygons, image overlays, drawing, and route polylines. Do not install a dependency before checking project constraints and obtaining any approval required by the task.

OpenStreetMap data attribution must remain visible and comply with the tile provider's requirements. Do not hide, crop, cover, or remove attribution.

Do not assume public OpenStreetMap tile servers are suitable for unrestricted production traffic. Keep the tile URL/provider configurable when creating infrastructure for production use.

## 0B.2 Coordinate Conventions

Coordinate order is a high-risk area and must be explicit.

- UI labels should use `Широта` and `Долгота` rather than ambiguous `X` and `Y`.
- React Leaflet/Leaflet positions commonly use `[latitude, longitude]`.
- GeoJSON coordinates use `[longitude, latitude]`.
- Do not pass one format directly into the other without an explicit conversion.
- Use descriptive names such as `latitude`, `longitude`, `latLng`, `geoJsonCoordinates`, and `fieldBoundary`.
- Avoid generic names such as `x`, `y`, `coords`, or `point` at API boundaries unless existing contracts require them.
- Validate latitude within `[-90, 90]` and longitude within `[-180, 180]` for user-entered values.
- Preserve numeric precision from the source. Round only for display, never silently round stored or transmitted coordinates.
- Do not swap coordinate order to make a marker “look correct.” Fix the conversion at the boundary.

When an API contract is unclear, inspect actual payloads, types, backend documentation, or fixtures before implementing conversion logic.

## 0B.3 Geometry Conventions

Use established geometry structures when possible:

- field boundary → `Polygon` or `MultiPolygon` when the backend supports it;
- route → `LineString` or an ordered waypoint list;
- detection location → `Point`;
- drone-image coverage → `Polygon`, bounds, or a backend-provided footprint;
- image-space detection → bounding box, segmentation polygon, or center point according to the real analysis output.

Do not convert an image-space bounding box into a geographic weed coordinate unless the necessary camera pose, footprint, projection, or backend calculation exists.

Do not assume that the center GPS coordinate of a drone photo is the coordinate of every detected weed.

If the backend returns GeoJSON, preserve the GeoJSON structure in the data/service layer and adapt it deliberately for the map component.

## 0B.4 Field Drawing and Editing

Field polygons must be treated as ordered geometry, not an unordered set of points.

When implementing drawing or editing:

- show vertex handles only in edit mode;
- provide clear start, save, and cancel actions;
- confirm before discarding meaningful unsaved edits;
- prevent accidental map clicks from adding points outside drawing mode;
- keep the selected field visually distinct without using loud effects;
- calculate area only through an existing trusted geospatial utility or backend result;
- label calculated measurements with correct units;
- do not use screen pixels for geographic area or distance calculations.

## 0B.5 Drone Route Display

Route visualization should make sequence and direction understandable.

Use, when appropriate:

- an ordered polyline;
- numbered waypoints;
- start and finish distinction;
- a compact route summary containing only real values;
- a fit-to-route action;
- restrained selected/editing states.

Do not animate a drone along the route unless explicitly requested.

Do not infer altitude or route direction from point appearance alone. Preserve explicit waypoint order from the data model.

## 0B.6 Map Performance

Map screens can contain many images and detections. Avoid creating expensive synchronized state updates on every pan or zoom.

When data volume requires it:

- render only the layers needed for the current zoom/selection;
- use clustering only if it improves legibility and the chosen library supports it cleanly;
- memoize stable GeoJSON/layer data where it prevents real re-render cost;
- lazy-load thumbnails and larger image previews;
- avoid placing large base64 images directly in component state;
- do not optimize prematurely for a dataset size that has not been established.

---

# 0C. Drone Images and Analysis Results

## 0C.1 Drone Image Metadata

Treat the image file and its geographic metadata as related but distinct data.

An image record may contain:

- stable ID;
- filename or display name;
- thumbnail and original-image URL;
- capture time;
- center coordinate;
- footprint or bounds;
- altitude or orientation when actually supplied;
- field ID;
- upload/processing status;
- analysis ID or latest analysis status.

Do not parse EXIF in the browser unless the feature is explicitly required and the project has chosen that architecture. Do not fabricate a map location for an image without valid coordinates.

Images without coordinates must remain discoverable through an explicit unlocated state instead of silently disappearing.

## 0C.2 Analysis Lifecycle

Model the analysis lifecycle explicitly using the project's established conventions. Typical semantic states are:

- idle/not requested;
- queued;
- processing;
- succeeded;
- failed;
- cancelled, only if cancellation actually exists.

Do not represent every state with a single `isLoading` boolean when the workflow needs more detail.

The UI should:

- prevent accidental duplicate submissions when a request is already active;
- retain useful previous results when appropriate instead of erasing them before a new request succeeds;
- show a clear retry path after failure;
- avoid fake progress percentages;
- distinguish “no weeds detected” from “analysis failed” and “no analysis has been run”;
- handle stale or replaced results according to the API contract.

## 0C.3 Detection Data

Use the backend response as the source of truth. A detection may include:

- detection ID;
- source image ID;
- species ID and display name;
- vegetation-stage ID and display name;
- confidence;
- image-space geometry;
- geographic point or geometry;
- count or cluster size;
- review/verification state.

Fields that are not returned must remain optional. Do not fill missing fields with invented values.

Confidence should be formatted consistently, normally as a percentage for display while preserving the original numeric value internally. Confirm whether the API uses `0..1` or `0..100` before formatting.

## 0C.4 Counting Semantics

“Number of weeds” is ambiguous unless the model contract defines it.

The interface must distinguish among:

- number of detection records;
- number of individual plants;
- estimated plants in a cluster;
- number of affected areas;
- counts grouped by species or stage.

Do not sum cluster records as individual plants unless the response explicitly provides that meaning.

When displaying totals, make the label match the data, for example `Обнаружено объектов`, `Растений`, or `Участков`, rather than always writing `Сорняков`.

## 0C.5 Vegetation Stages

Vegetation-stage values must come from the analysis service or a project-approved taxonomy.

Do not invent a universal stage list. Different species or models may use different stages.

If the backend provides a stage code and a localized display label, store the code as the stable value and use the label in UI. Unknown codes must degrade gracefully to `Не определено` or another existing project fallback.

## 0C.6 Image Annotation

Annotated image views must preserve the relationship between the original image and model geometry.

- Account for image scaling when drawing boxes, masks, points, or labels.
- Use the image's natural dimensions or normalized coordinates according to the API contract.
- Do not calculate overlays from the displayed element dimensions alone without handling resize.
- Keep annotations legible but avoid covering the detected plant unnecessarily.
- Selecting an annotation should synchronize with detection details when such a panel exists.
- Provide a way to hide/show annotations when it materially helps inspection.
- Do not burn annotations permanently into the source image on the frontend unless export explicitly requires it.

If only geographic coordinates are available, show the result on the map. Do not invent an image bounding box.

## 0C.7 Export

JSON and CSV exports must reflect real analysis data and documented semantics.

Prefer the existing backend export endpoint when available. If export is generated in the frontend:

- use stable machine-readable field names unless the product specifies localized headers;
- encode CSV safely, including commas, quotes, and line breaks;
- preserve coordinate order explicitly in field names;
- preserve identifiers needed to trace a row to its field, image, and analysis;
- represent missing values consistently;
- avoid exporting UI-only labels as if they were stable codes;
- do not export secrets, internal URLs, or unrelated metadata.

Suggested concepts, not a contract: `analysisId`, `fieldId`, `imageId`, `detectionId`, `speciesCode`, `speciesName`, `vegetationStageCode`, `vegetationStageName`, `confidence`, `latitude`, `longitude`, and count semantics. Match the actual API rather than forcing these names.

---

# 0D. Screen-Specific UX Requirements

## 0D.1 Field Map Page

The page should normally prioritize map area while keeping essential controls discoverable.

Potential composition, to be adapted to existing project patterns:

- page header or compact toolbar;
- field selector and map layer controls;
- main map canvas;
- collapsible or fixed details panel for images and detections;
- analysis action near the selected image/field context;
- filters for species/stage only when results exist and filtering is needed.

Do not cover the map with large opaque panels. Do not place controls at random corners. Group map controls by purpose and preserve enough map visibility on common laptop screens.

## 0D.2 Drone Route Page

The page should clearly separate map interaction from route parameters and save actions.

The user must be able to understand:

- which field is active;
- whether the contour is being viewed or edited;
- how many points are in the route;
- which point is selected;
- whether changes are saved;
- why saving is unavailable when validation fails.

Do not make coordinate editing dependent on dragging alone. Where the product requires precision, provide explicit numeric inputs or an inspectable point list in addition to map manipulation.

## 0D.3 Plant Information Page

Prefer a compact catalog/list and a clear details view over a decorative gallery.

Reference images are functional identification aids. Preserve aspect ratio, provide useful alternative text, and indicate when an image is unavailable.

Linking from a detection to a plant page should use stable species identifiers, not a display-name string when IDs exist.

---

# 0E. Data Architecture and Frontend Boundaries

## 0E.1 Types

Define or reuse explicit types for domain entities at stable boundaries. Avoid one enormous generic `MapItem` or `AnalysisData` type.

Likely separate concepts include:

- field;
- field geometry;
- drone image;
- image footprint;
- analysis job;
- analysis result;
- weed detection;
- species;
- vegetation stage;
- route;
- waypoint.

Do not create all of these types in advance. Add them as actual data enters the application.

## 0E.2 API Layer

Map components must not contain raw request construction when the project has an API/service layer.

Keep concerns separated:

- API DTOs reflect backend contracts;
- adapters normalize coordinate conventions and optional fields;
- domain/UI types represent what components need;
- components render data and emit user intent;
- map-library objects should not leak through the entire application state unless existing architecture intentionally uses them.

Do not silently normalize invalid backend data. Surface errors through established error handling and keep conversions testable.

## 0E.3 State Management

Keep transient map state local when possible, for example hover state, an open popup, or current drawing mode.

Use shared/server state for entities needed across screens, such as selected field, saved routes, images, and analysis results, only according to existing project architecture.

Avoid storing duplicate forms of the same coordinate data in several global stores. Prefer a canonical representation and explicit adapters at boundaries.

## 0E.4 URL and Navigation State

When existing routing patterns support it, stable selections such as field ID, image ID, analysis ID, or species ID may belong in route parameters or query parameters so views can be shared and restored.

Do not put large geometries, full analysis payloads, or image data in the URL.

## 0E.5 Mocking Before Backend Completion

When backend endpoints are unavailable and the user requests frontend progress:

- place mock data behind the same typed service boundary intended for real data;
- keep fixtures deterministic and small;
- cover empty, loading, success, partial-data, and error states;
- avoid scattering hard-coded objects through page components;
- make removal or replacement of the mock implementation straightforward;
- clearly state which interactions are simulated in the completion summary.

Do not build a full fake backend unless explicitly requested.

---

# 0F. Domain-Specific Accessibility and Responsive Behavior

The map must not be the only way to access important information.

- Provide a textual/list representation of detections when users need to inspect them.
- Ensure map actions have accessible labels.
- Do not encode weed species or vegetation stage by color alone.
- Pair status colors with text or icons.
- Ensure selected boundaries, markers, and routes remain distinguishable with adequate contrast.
- Preserve keyboard access for surrounding controls even when the map library has limited keyboard behavior.
- Avoid tiny map buttons and waypoint targets.

For smaller screens:

- keep the map usable;
- move details into a drawer, sheet, or stacked section using existing project patterns;
- avoid permanently covering most of the map;
- preserve access to analysis results and primary actions;
- do not assume route editing is comfortable on every phone-sized viewport; provide a clear supported experience rather than a broken desktop layout.

---

# 0G. Domain-Specific Validation Checklist

For map, analysis, image, or route changes, verify the relevant items before completion:

- latitude/longitude order is correct at every boundary;
- GeoJSON order is not confused with map-library order;
- field polygons and route points preserve ordering;
- invalid coordinate input is handled;
- map attribution remains visible;
- map does not fail when coordinates or image footprints are absent;
- empty, loading, processing, successful, and failed analysis states are distinct;
- “no detections” is not displayed as an error;
- confidence scale is confirmed before percentage formatting;
- count labels match what is actually counted;
- image annotations remain aligned after resize;
- selected list items and map objects stay synchronized where applicable;
- unsaved drawing/route edits are not lost silently;
- test fixtures are not presented as production results;
- no agronomic claims or flight-safety guarantees were invented;
- TypeScript, lint, and available focused tests pass.

---

# 1. Core Principles

The following rules are mandatory.

1. Preserve the existing project structure.
2. Follow existing patterns before introducing new ones.
3. Do not refactor unrelated code.
4. Do not redesign existing UI unless explicitly requested.
5. Do not introduce unnecessary abstractions.
6. Do not add dependencies unless they are clearly necessary.
7. Use Tailwind CSS for styling wherever the project already uses Tailwind.
8. Reuse existing components, utilities, styles, constants, hooks, and patterns.
9. Match the visual language of the existing application.
10. Inspect relevant existing screens/components before implementing new UI.
11. Prefer calm, neutral, modern interfaces over visually aggressive ones.
12. Avoid typical AI-generated UI patterns.
13. Do not invent a new design system when one already exists.
14. Do not silently change architecture.
15. Do not solve a local problem with a project-wide rewrite.

Consistency is more important than novelty.

---

# 2. Existing Project Is the Source of Truth

Before making changes, inspect the existing codebase.

The agent must understand how similar functionality is already implemented.

Before creating a new component, screen, layout, hook, service, type, utility, or pattern, search the project for an existing equivalent.

For example, before creating:

- a button,
- modal,
- dropdown,
- form field,
- card,
- page container,
- empty state,
- loader,
- sidebar item,
- navigation element,
- badge,
- table,
- toast,
- dialog,
- filter,
- search field,
- pagination control,

the agent must first inspect how these elements already look and work elsewhere in the application.

Do not create parallel implementations of the same concept without a strong reason.

If several examples exist, use the one that is closest to the current context.

---

# 3. Preserve Project Structure

The current directory and module structure should be treated as intentional.

Do not move files merely because another structure looks cleaner.

Do not reorganize directories unless the task explicitly requires it.

Do not rename existing modules, components, hooks, stores, services, routes, or directories without a clear functional reason.

When adding a new file, place it next to similar files.

Examples:

- new reusable UI component → existing shared UI/components directory;
- page-specific component → next to the page or feature using it;
- hook → wherever existing hooks of the same scope live;
- API function → existing API/service layer;
- types → existing project convention for types;
- constants → existing constants/config location;
- helper → existing utils/helpers location.

Follow the project's architecture rather than imposing a generic architecture.

---

# 4. Minimal Changes

Always make the smallest change necessary.

Do not modify unrelated files.

Do not perform opportunistic cleanup unless it is directly required by the task.

Avoid:

- renaming unrelated variables;
- reformatting entire files;
- rearranging imports unnecessarily;
- rewriting working components;
- converting code to another pattern only because you prefer it;
- replacing existing libraries with alternatives;
- changing component APIs without need;
- changing styles outside the requested area.

A pull request for a small feature should remain a small feature.

---

# 5. Existing Patterns Before New Abstractions

Never introduce abstractions prematurely.

Before creating:

- generic wrappers,
- factories,
- configuration engines,
- custom DSLs,
- generic form systems,
- generic table systems,
- generic layout engines,
- new design-system layers,

determine whether the abstraction is actually needed.

If something is used once or twice, a straightforward implementation is usually preferable.

Prefer readable duplication over overly clever abstraction when the abstraction would make the code harder to understand.

The project should remain easy to modify by a human developer.

---

# 6. Frontend Technology

Use the technologies already present in the project.

Do not replace technologies unless explicitly asked.

For React applications:

- use functional components;
- use hooks consistently with existing project conventions;
- avoid unnecessary state;
- avoid unnecessary effects;
- derive values instead of synchronizing duplicated state where possible;
- keep components reasonably focused;
- avoid excessive component splitting.

For TypeScript:

- preserve strict typing;
- avoid `any`;
- avoid type assertions unless justified;
- prefer inferred types where they remain clear;
- define explicit types for component boundaries and public APIs;
- reuse existing project types.

Do not introduce complex TypeScript tricks purely for elegance.

Readability is more important than type-level cleverness.

---

# 7. Styling

Tailwind CSS is the default styling mechanism.

If the existing application uses Tailwind, new UI must use Tailwind unless there is a concrete technical reason not to.

Do not introduce:

- CSS modules,
- styled-components,
- Emotion,
- inline style objects,
- new CSS files,

for ordinary component styling when Tailwind is already sufficient.

Follow existing Tailwind conventions in the repository.

Before styling a component, inspect nearby components for:

- spacing;
- padding;
- typography;
- border radius;
- border colors;
- backgrounds;
- muted text;
- hover behavior;
- focus behavior;
- container widths;
- responsive breakpoints.

Reuse those patterns.

---

# 8. Tailwind Consistency

Do not invent arbitrary values unless necessary.

Prefer project-standard classes.

For example, if the project consistently uses:

- `rounded-lg`,
- `border`,
- `text-sm`,
- `text-muted-foreground`,
- `bg-background`,
- `bg-muted`,
- `px-4`,
- `py-2`,

do not randomly introduce:

- `rounded-[17px]`,
- `px-[19px]`,
- `tracking-[0.017em]`,
- custom shadows,
- custom RGB values,

unless a design requirement clearly demands it.

Avoid excessive arbitrary Tailwind values.

Visual consistency is more valuable than microscopic pixel optimization.

---

# 9. Never Guess the Design in Isolation

When implementing UI, inspect the application first.

The agent should look at related existing:

- screens;
- sections;
- forms;
- cards;
- navigation;
- dialogs;
- buttons;
- typography;
- spacing;
- interaction patterns.

The application itself is the first and strongest visual reference.

A newly implemented screen should look like it belongs to the existing application.

It should not look like a separately generated template.

---

# 10. External Design References

When a new visual structure must be designed and there is no clear equivalent inside the project, use high-quality contemporary product design references.

Good sources include:

- Dribbble;
- Pinterest;
- established SaaS products;
- respected productivity tools;
- modern developer tools;
- modern financial or business applications;
- well-designed consumer web applications.

Use references for:

- information hierarchy;
- layout composition;
- spacing rhythm;
- grouping;
- navigation patterns;
- empty states;
- card composition;
- form structure;
- dashboards;
- filtering layouts;
- responsive behavior.

Do not blindly copy a reference.

Translate its structural ideas into the visual language of this application.

The existing product style always takes priority over external inspiration.

---

# 11. Avoid AI-Generated Design Aesthetics

The UI must not look obviously AI-generated.

Avoid the visual patterns frequently produced by generic AI website generators.

Especially avoid:

- excessive gradients;
- glowing backgrounds;
- neon accents;
- purple-blue gradient combinations without reason;
- gradient borders;
- glassmorphism used everywhere;
- decorative blur blobs;
- random floating shapes;
- giant marketing-style headings inside application interfaces;
- unnecessary hero sections;
- oversized cards;
- excessive roundness;
- excessive shadows;
- excessive visual decoration;
- meaningless badges;
- fake analytics cards;
- arbitrary statistics;
- ornamental icons;
- unnecessary floating action elements;
- pseudo-premium gold effects;
- random background patterns;
- over-designed empty states;
- dramatic dark-mode lighting effects;
- animations added only for visual spectacle.

Do not try to make every screen visually impressive.

The interface should primarily feel usable, deliberate, stable, and cohesive.

---

# 12. Preferred Visual Style

Prefer a calm, neutral, contemporary interface.

The desired visual qualities are:

- restrained;
- clean;
- practical;
- modern;
- quiet;
- structured;
- mature;
- product-focused;
- readable;
- consistent.

Prefer visual hierarchy through:

- typography;
- whitespace;
- grouping;
- alignment;
- subtle background differences;
- borders;
- restrained use of color.

Do not rely on effects to create hierarchy.

---

# 13. Color Usage

Use colors intentionally.

The interface should generally remain neutral.

Primary colors should be used for:

- important actions;
- selected states;
- active navigation;
- meaningful emphasis.

Do not turn the primary accent color into decoration.

Avoid unnecessarily coloring:

- every icon;
- every section;
- every badge;
- every card;
- every heading.

Neutral grays should carry most of the interface.

Semantic colors should preserve semantic meaning.

Examples:

- red → destructive/error;
- green → success/positive state;
- yellow/orange → warning;
- accent → interactive/selected state.

Do not use semantic colors merely for visual variety.

---

# 14. Gradients

Avoid gradients by default.

A gradient should only be used if:

1. gradients are already part of the application's visual language; or
2. the user explicitly asks for one; or
3. there is a concrete design reference that clearly justifies it.

Never add gradients because the screen feels visually empty.

Never use gradients as a substitute for thoughtful composition.

---

# 15. Shadows

Use shadows sparingly.

Prefer borders and background separation for structure.

Avoid:

- large diffuse shadows;
- colored shadows;
- glow effects;
- layered dramatic shadows;
- shadows on every card.

If existing components use no shadow, new components should normally use no shadow.

If shadows exist, copy their established strength.

---

# 16. Border Radius

Follow the existing radius scale.

Do not make everything excessively rounded.

Buttons, inputs, cards, dialogs, and containers should use radius values consistent with the rest of the application.

Avoid the common AI pattern where every container is a large `rounded-2xl` or `rounded-3xl` card.

Containers do not always need to be cards.

---

# 17. Cards

Do not solve every layout problem with cards.

Use cards only when they represent meaningful grouping or elevation.

Avoid nesting cards inside cards unless the existing design does so.

Prefer:

- sections;
- rows;
- dividers;
- whitespace;
- grouped lists;

when those structures communicate hierarchy more naturally.

---

# 18. Typography

Follow the existing typography scale.

Do not invent new font sizes unless necessary.

Prefer a small and consistent hierarchy.

Typical product UI hierarchy should rely on a limited set of levels such as:

- page title;
- section title;
- body;
- secondary text;
- label;
- caption.

Do not make ordinary dashboard/page titles look like landing-page hero headings.

Avoid oversized typography.

Avoid excessive boldness.

Use font weight to create hierarchy, but do not make every important element `font-bold`.

---

# 19. Spacing

Spacing should be systematic.

Inspect the application's existing spacing rhythm before choosing values.

Prefer consistent combinations such as:

- small gap for tightly related elements;
- medium gap inside groups;
- larger gap between sections.

Avoid arbitrary spacing.

Do not increase padding merely to make a screen look more luxurious.

Interfaces should remain reasonably information-dense.

---

# 20. Layout

Prefer straightforward layouts.

Use:

- flex;
- grid;
- normal document flow;
- sticky positioning where appropriate.

Avoid unnecessary absolute positioning.

Avoid complicated layout hacks when a normal flex/grid solution exists.

Responsive behavior should be deliberate.

Do not treat mobile as a scaled-down desktop layout.

---

# 21. Responsive Design

New interfaces must account for different screen sizes when the application is responsive.

Check existing breakpoints.

Do not invent a new breakpoint strategy.

When necessary:

- stack horizontal groups;
- allow wrapping;
- collapse secondary actions;
- preserve readable content widths;
- prevent horizontal overflow;
- maintain usable touch targets.

Do not hide important functionality on mobile merely because fitting it is difficult.

---

# 22. Buttons

Before creating a button style, inspect existing buttons.

Reuse existing button components whenever possible.

Button hierarchy should remain clear.

Typical hierarchy:

- primary;
- secondary;
- ghost;
- destructive.

Do not create a unique button design for each screen.

Avoid overly large buttons unless the context requires them.

Avoid buttons that contain unnecessary icons.

An icon should clarify an action, not decorate it.

---

# 23. Icons

Reuse the project's existing icon library.

Do not add another icon library for one missing icon unless absolutely necessary.

Icons should:

- have consistent sizing;
- use consistent stroke width;
- inherit text color where appropriate;
- align correctly with labels.

Do not use icons purely to fill empty space.

Avoid placing icons next to every text label.

---

# 24. Forms

Forms should follow existing form conventions.

Reuse:

- inputs;
- labels;
- selects;
- checkboxes;
- switches;
- validation messages;
- helper text;
- form layout patterns.

A form should prioritize clarity and speed of completion.

Avoid decorative containers around every field.

Labels should be explicit.

Placeholder text should not replace labels when a label is required.

Validation messages should be clear and concise.

---

# 25. Dialogs and Modals

Reuse existing dialog/modal patterns.

Do not create a new modal implementation if one exists.

Dialogs should:

- have a clear title;
- explain consequences when needed;
- contain focused actions;
- avoid unnecessary content;
- provide a clear cancel/close path.

Destructive actions must be visually and semantically distinguished.

Do not use a modal for something that can happen naturally inline.

---

# 26. Empty States

Empty states should remain simple.

Prefer:

- short title;
- short explanation;
- relevant action.

Avoid giant illustrations, decorative gradients, fake product screenshots, or excessive copy unless the application's established design uses them.

---

# 27. Loading States

Use existing loading patterns.

Do not introduce new loading animations arbitrarily.

Prefer:

- existing spinner;
- skeleton;
- disabled loading button;
- subtle placeholder.

Avoid flashy animated loaders.

Prevent layout shift when practical.

---

# 28. Error States

Error messages should be useful.

Explain:

- what failed;
- what the user can do next,

when that information is available.

Avoid raw technical errors in user-facing UI.

Do not suppress errors silently.

Use the application's existing toast, inline error, or error-page conventions.

---

# 29. Interaction Design

Interactions should be predictable.

Hover, active, selected, focus, and disabled states should align with existing components.

Do not invent unusual interactions for common actions.

Prefer platform and web conventions.

For example:

- clicking a row may open its details if similar rows do;
- trash icon means delete;
- chevron typically means expandable/navigational behavior;
- disabled controls should visually communicate disabled state.

---

# 30. Animation

Animations are optional, not mandatory.

Do not animate something merely because animation is possible.

If animation is used, it should:

- communicate state;
- make spatial relationships clearer;
- improve perceived continuity.

Prefer short, subtle transitions.

Avoid:

- bouncing;
- glowing;
- continuous motion;
- dramatic scaling;
- excessive stagger animations;
- decorative motion.

Respect reduced-motion preferences where relevant.

---

# 31. Accessibility

Do not sacrifice accessibility for aesthetics.

Use semantic HTML wherever possible.

Requirements include:

- buttons for actions;
- links for navigation;
- labels for form controls;
- correct heading hierarchy;
- keyboard accessibility;
- visible focus states;
- sufficient color contrast;
- meaningful `aria-*` attributes when needed;
- `alt` text for meaningful images.

Do not attach click handlers to arbitrary `div` elements when a semantic element exists.

---

# 32. Component Reuse

Reuse project components before building new ones.

Before implementing a new UI primitive, search for:

- `Button`;
- `Input`;
- `Select`;
- `Modal`;
- `Dialog`;
- `Card`;
- `Badge`;
- `Tabs`;
- `Dropdown`;
- `Toast`;
- `Tooltip`;
- `Checkbox`;
- `Switch`;
- `Avatar`;
- `Table`;
- `Pagination`.

Do not duplicate these components.

If an existing component is missing a small capability, extend it carefully rather than copying it.

However, do not make a reusable component significantly more complex solely to support one unusual page.

---

# 33. Component Boundaries

Do not split components excessively.

A component should usually be extracted when:

- it is reused;
- it represents a meaningful conceptual section;
- extraction materially improves readability;
- it contains isolated logic worth separating.

Do not turn every five lines of JSX into another component.

Avoid directory trees containing dozens of one-use micro-components.

---

# 34. State Management

Follow the project's current state management strategy.

Do not introduce a new state management library.

Prefer local component state for local UI state.

Use global state only when the state actually needs to be global.

Avoid duplicated state.

Do not store derived values when they can be computed.

Do not synchronize state with `useEffect` unless necessary.

---

# 35. Data Fetching

Use the existing data-fetching architecture.

Do not introduce another request library.

Reuse:

- API clients;
- query keys;
- hooks;
- service functions;
- schemas;
- request utilities;
- error handling.

Preserve caching and invalidation conventions already present in the project.

Do not make raw fetch requests directly inside random UI components if the project has an API layer.

---

# 36. Naming

Follow existing naming conventions.

Names should describe intent.

Avoid generic names such as:

- `data`;
- `thing`;
- `item2`;
- `handler`;
- `temp`;
- `value1`;

when more precise names are possible.

Do not rename existing public APIs for stylistic reasons.

---

# 37. Code Readability

Prefer boring, readable code.

The ideal implementation should be understandable by another developer quickly.

Avoid:

- unnecessary one-liners;
- deeply nested ternaries;
- excessive functional composition;
- obscure utility abstractions;
- magic values;
- clever metaprogramming.

A slightly longer implementation is acceptable if it is significantly easier to understand.

---

# 38. Comments

Do not add comments that merely repeat the code.

Bad:

```ts
// Set loading to true
setLoading(true);
```

Use comments only when explaining:

- non-obvious reasoning;
- a browser limitation;
- a workaround;
- an architectural decision;
- unusual business logic.

Prefer readable code over explanatory comments.

---

# 39. Dependencies

Do not install packages without strong justification.

Before installing a dependency:

1. check whether equivalent functionality already exists in the project;
2. determine whether the browser/framework can solve it directly;
3. determine whether the dependency is maintained;
4. consider bundle impact.

Do not install an entire library to solve a trivial utility problem.

---

# 40. Do Not Replace Existing Libraries Arbitrarily

If the project already uses a library for:

- icons;
- forms;
- validation;
- dates;
- UI primitives;
- requests;
- state;
- animation;
- charts,

continue using it.

Do not introduce competing libraries for the same purpose.

---

# 41. Preserve Business Logic

Do not alter existing business rules unless explicitly required.

When changing UI around existing logic, avoid rewriting the logic unnecessarily.

Be especially careful with:

- permissions;
- validation;
- pricing;
- authentication;
- role checks;
- filtering;
- status transitions;
- destructive actions;
- date calculations.

Visual changes must not accidentally change application behavior.

---

# 42. Routing

Follow existing routing conventions.

Do not restructure routes without necessity.

Reuse existing:

- layouts;
- route guards;
- loaders;
- route parameters;
- navigation helpers.

New pages should fit naturally into the current route hierarchy.

---

# 43. New Pages

When creating a new page:

1. inspect at least one or more comparable existing pages;
2. reuse the existing page container;
3. reuse title/header conventions;
4. match existing horizontal padding;
5. match vertical section spacing;
6. reuse buttons and form controls;
7. follow the existing responsive approach.

The result should look like an existing page that was always part of the product.

---

# 44. Designing New Screens

When no directly comparable screen exists, build the information architecture first.

Determine:

- primary user goal;
- primary action;
- secondary actions;
- information priority;
- state changes;
- error states;
- empty states;
- mobile behavior.

Only then decide visual composition.

Avoid decorating an unclear information hierarchy.

---

# 45. Reference-Based Design Workflow

For significant new UI, follow this hierarchy of references:

1. Existing implementation in this project.
2. Similar component or page in this project.
3. Existing design tokens and styling conventions.
4. High-quality external product references.
5. Dribbble or Pinterest for structural inspiration.

Never reverse this priority.

Dribbble should not override the application's established design language.

Use Dribbble and Pinterest primarily for composition ideas, not for decorative effects.

---

# 46. What to Take From Dribbble/Pinterest

Good things to study:

- hierarchy;
- content grouping;
- layout proportions;
- navigation composition;
- toolbar organization;
- sidebar structure;
- filter arrangement;
- table organization;
- spacing;
- content density;
- card composition;
- responsive patterns.

Be skeptical of:

- excessive gradients;
- concept-only interfaces;
- unrealistic whitespace;
- tiny inaccessible text;
- decorative dashboards;
- fake charts;
- meaningless data;
- animation-heavy concepts;
- interfaces designed for screenshots rather than real usage.

Real usability has priority over portfolio aesthetics.

---

# 47. Avoid Generic Dashboard Syndrome

Do not automatically turn every screen into a dashboard.

Do not add:

- "Welcome back" banners;
- summary metric cards;
- arbitrary charts;
- progress indicators;
- activity feeds;
- decorative analytics;

unless the product actually needs them.

UI elements should be driven by product requirements, not by template conventions.

---

# 48. Avoid Placeholder Product Copy

Do not add generic AI-written interface text such as:

- "Unlock your potential";
- "Take control of your workflow";
- "Everything you need in one place";
- "Empower your productivity";
- "Seamlessly manage your experience";
- "Transform the way you work";

unless specifically requested.

Product copy should be direct and functional.

Prefer:

- "Create project";
- "No tasks yet";
- "Search users";
- "Changes saved";
- "Delete account".

---

# 49. No Fake Content

Do not invent:

- users;
- prices;
- percentages;
- analytics;
- transactions;
- names;
- companies;
- dates;
- performance statistics;

for production UI unless placeholder/demo content is explicitly requested.

When data is unavailable, create the UI to consume actual application data.

---

# 50. Icons and Decorative Elements

Decorative visuals should have a reason to exist.

Do not add:

- sparkle icons;
- rocket icons;
- stars;
- magic wands;
- lightning bolts;
- floating blobs;

just to make the interface appear modern.

Avoid icon-heavy interfaces.

Text is often clearer than an icon.

---

# 51. Neutral Design Is Preferred

When unsure between a bold and restrained solution, choose the restrained one.

When unsure between decoration and whitespace, choose whitespace.

When unsure between a new visual pattern and an existing pattern, choose the existing pattern.

When unsure between a clever interaction and a conventional one, choose the conventional one.

---

# 52. Avoid Overengineering

Do not make the solution substantially more complex than the task.

For example, do not introduce:

- a generic schema-driven UI renderer;
- a plugin architecture;
- a custom event bus;
- a new state layer;
- a custom styling abstraction;
- unnecessary context providers;

for a small feature.

Complexity must justify itself.

---

# 53. Refactoring Rules

Refactoring is allowed when it is directly necessary to implement the requested change safely.

Refactoring should be:

- local;
- incremental;
- behavior-preserving.

Do not combine feature work with broad architectural cleanup.

If the existing implementation is imperfect but works and does not block the requested feature, leave it alone.

---

# 54. Existing Code Style

Match the code style of nearby files.

This includes:

- import order;
- semicolons;
- quote style;
- component declarations;
- arrow function usage;
- destructuring;
- naming;
- export style;
- type placement.

Do not impose a different style.

Automated formatter/linter configuration is authoritative.

---

# 55. Do Not Reformat Entire Files

When editing existing files, preserve surrounding formatting.

Avoid large diffs caused only by formatting.

A change that modifies five logical lines should not result in a 200-line diff.

---

# 56. Validation Before Completion

Before considering work complete, verify:

- TypeScript types;
- linting where available;
- imports;
- unused variables;
- component props;
- runtime edge cases;
- responsive behavior;
- empty states;
- loading states;
- error states;
- visual consistency.

Do not claim something is working without checking the relevant code path as far as available tooling allows.

---

# 57. Visual Self-Review

After implementing UI, review it conceptually against the rest of the application.

Ask:

- Does this look like the same product?
- Did I reuse existing spacing?
- Did I use the same typography?
- Did I introduce unnecessary colors?
- Did I add unnecessary rounded cards?
- Did I use gradients?
- Did I add excessive shadows?
- Did I create a new interaction pattern?
- Does this feel like generic AI UI?
- Could the design be simpler?
- Is the hierarchy understandable without decoration?

If the new UI attracts attention primarily because of its styling rather than its function, simplify it.

---

# 58. Implementation Priority

When multiple solutions are valid, prioritize them in this order:

1. Existing project pattern.
2. Existing reusable component.
3. Minimal implementation.
4. Consistency.
5. Maintainability.
6. Accessibility.
7. Performance.
8. Visual novelty.

Visual novelty should almost never determine the architecture.

---

# 59. Handling Uncertainty

When unsure about implementation details, inspect the codebase.

Do not guess if the answer can be inferred from existing code.

Search for similar:

- components;
- hooks;
- API calls;
- routes;
- state;
- layouts;
- styling patterns.

Use the closest existing implementation as a template.

---

# 60. When Multiple Existing Examples Conflict

If the project contains multiple patterns:

1. prefer the most recently used pattern;
2. prefer the pattern used in the same feature area;
3. prefer shared reusable components;
4. prefer the simpler pattern;
5. avoid creating a third pattern.

Do not attempt a global standardization unless requested.

---

# 61. User Instructions Override General Preferences

Explicit instructions from the user always take priority over generic preferences in this file.

However, unless explicitly requested, the agent should not assume permission to:

- redesign;
- restructure;
- refactor;
- add dependencies;
- change APIs;
- modify unrelated behavior.

---

# 62. Final Output Expectations

After completing a task, summarize only meaningful changes.

Mention:

- what was implemented;
- any important architectural choice;
- relevant edge cases;
- tests/checks performed.

Do not provide long explanations for trivial edits.

Do not claim to have run commands that were not actually run.

---

# 63. Forbidden Default Behaviors

Unless explicitly requested, do NOT:

- redesign the entire page;
- reorganize directories;
- rewrite working components;
- replace libraries;
- create a new design system;
- add gradients;
- add glassmorphism;
- add decorative background blobs;
- add unnecessary animations;
- add excessive shadows;
- add arbitrary cards;
- add arbitrary statistics;
- add fake content;
- create marketing copy;
- install dependencies;
- change unrelated code;
- create duplicate UI primitives;
- use `any`;
- ignore TypeScript errors;
- suppress lint errors;
- use inline styles when Tailwind works;
- introduce random arbitrary Tailwind values;
- create giant components without reason;
- split everything into micro-components;
- over-abstract simple code.

---

# 64. Preferred Decision Heuristics

Use these rules when making implementation decisions.

### If an existing component exists

Use it.

### If an existing pattern exists

Follow it.

### If several patterns exist

Choose the closest one.

### If no pattern exists

Implement the simplest conventional solution.

### If external design inspiration is needed

Study structure from high-quality references, then adapt it to the application.

### If the design feels too plain

Do not automatically add decoration.

Improve:

- spacing;
- hierarchy;
- typography;
- alignment;
- grouping.

### If something feels empty

Do not automatically add gradients, illustrations, badges, or cards.

Empty space is acceptable.

### If a component can be implemented with Tailwind

Use Tailwind.

### If a new dependency can be avoided

Avoid it.

### If a refactor is unrelated to the requested task

Do not perform it.

---

# 65. Final Design Philosophy

This application should look like it was designed intentionally by a product team, not generated from a prompt.

The ideal interface is not trying to impress the user visually at every moment.

It should feel:

- natural;
- restrained;
- cohesive;
- familiar;
- polished;
- functional.

Good design in this project is primarily expressed through consistency, hierarchy, spacing, typography, and thoughtful interaction.

Not through effects.

Not through decoration.

Not through novelty.

When in doubt, simplify.

When in doubt, follow the existing project.

When in doubt, reuse.

When in doubt, choose the quieter solution.
