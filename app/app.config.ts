export default defineAppConfig({
  ui: {
    colors: {
      primary: "zinc", // Monochrome primary (passt zu deinem Design)
      secondary: "slate", // Alternative für secondary
      success: "emerald", // Grün für Success (wie in deinem Dashboard)
      warning: "amber", // Gelb für Warnings
      error: "red", // Rot für Errors
      info: "blue", // Blau für Info
      neutral: "zinc", // Neutral für Text/Hintergründe
    },
    dashboardGroup: {
      // Replaces Nuxt UI default `fixed inset-0 flex overflow-hidden`.
      // `fixed inset-0` pins to the layout viewport; on iOS Safari the visual
      // viewport is smaller (address bar overlaps), so the bottom of the
      // internal scroll area (`UDashboardPanel #body`) sits behind Safari's
      // chrome and is unreachable. `h-dvh` tracks the dynamic visual viewport.
      base: "flex h-dvh overflow-hidden",
    },
  },
});
