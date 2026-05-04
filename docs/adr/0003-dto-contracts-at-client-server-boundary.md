# 0003. DTO contracts at the client/server boundary

- **Status:** accepted
- **Date:** 2025-11-17

## Context

The Wen365 server fetches Tokens from Alchemy, whose response shape is verbose, vendor-specific, and subject to change without notice (hex balances, nullable metadata, pagination keys). Leaking those types to the client would couple UI components to an external API, and any Alchemy field rename would cascade into Vue templates.

## Decision

We define stable **DTOs** in `shared/types/` (`PortfolioDto`, `TokenDto`, `TokenMetadataDto`, `NetworkId`) that are auto-imported by Nuxt 4 in both client and server code. Alchemy-shaped types live only in `server/types/alchemy.ts`; the transform from Alchemy → DTO happens in the server (currently in `portfolio.service.ts` via a Zod schema) and is never skipped. Zod validates at the API boundary so invalid upstream data fails loudly on the server rather than silently on the client.

## Consequences

- **Positive**: the client only knows Wen365's own shapes; Alchemy migrations stay server-side.
- **Positive**: DTO changes are visible in the diff (one file) rather than scattered across Vue components.
- **Positive**: Zod catches upstream contract drift at the seam, not three layers deeper.
- **Negative**: the DTO types duplicate some structure already implicit in the Alchemy response — every new field is a two-place edit (Alchemy schema + DTO).
- **Out of scope**: whether Alchemy → DTO lives in `server/mappers/` or `server/services/` is an implementation detail, not fixed by this ADR.
