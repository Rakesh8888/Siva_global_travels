# Lucky AI UI — Locked Design

This file records the user's approved Lucky AI chatbot design in `index.html`.

## Permanent preservation rule
Do not redesign, resize, reposition, rename, recolor, remove, or rearrange any Lucky AI chatbot UI element during unrelated code changes. Only change the chatbot UI when the user explicitly requests a specific change.

## Approved structure
- Floating AI launcher opens the chatbot panel.
- Header title: **LUCKY AI**, with green **Online** indicator.
- Language selector is in the header, between the Lucky AI title and the close button.
- Language selector offers the existing language list.
- Chat conversation area appears below the header.
- Orange **Voice** and **Live** controls appear side-by-side with matching sizing.
- Message input and **Send** button remain together below the voice controls.
- The panel is larger than the original compact panel and responsive on mobile.
- Preserve current spacing, rounded shapes, colors, button dimensions, responsive behavior, and existing element IDs/JavaScript behavior.

## Before any future code update
1. Keep the existing chatbot HTML/CSS and IDs unchanged unless the user asks otherwise.
2. If importing code from Google AI Studio or another source, merge only the requested non-UI changes into the existing project; do not replace the approved chatbot structure.
3. Review the diff to confirm the Lucky AI UI has not changed.
4. If a requested change could alter the chatbot UI, ask first unless the user clearly requested that exact UI change.
