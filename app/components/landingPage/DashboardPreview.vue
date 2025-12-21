<template>
  <!-- Hero Visual: Dashboard Interface -->
  <div
    class="mt-24 relative max-w-6xl mx-auto animate-fade-up opacity-0 group cursor-default"
    :style="{ animationDelay: '400ms' }"
  >
    <!-- Glow effect behind -->
    <div
      class="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-500/10 blur-[80px] rounded-full"
    />

    <!-- Browser Frame - with Magnify Effect on Hover -->
    <div
      class="border border-white/10 bg-[#0c0c0e] backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl shadow-black relative z-10 ring-1 ring-white/5 transition-transform duration-700 ease-out group-hover:scale-[1.02]"
    >
      <!-- Browser Chrome/Header -->
      <div
        class="h-11 bg-zinc-900/80 border-b border-white/5 flex items-center px-4 justify-between sticky top-0 z-20"
      >
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div class="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div class="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        <div
          class="flex items-center justify-center gap-2 bg-black/40 border border-white/5 rounded px-4 md:px-32 py-1"
        >
          <UIcon name="i-lucide-lock" class="w-3 h-3 text-zinc-500" />
          <span class="text-xs text-zinc-500 font-medium">wen365.xyz/dashboard</span>
        </div>
        <div class="w-14" />
      </div>

      <!-- App Container - Non-interactive internal content -->
      <div class="flex min-h-[600px] pointer-events-none select-none">
        <!-- Sidebar - Clean with Blurred Bars -->
        <div class="w-64 border-r border-white/5 bg-zinc-900/30 hidden md:flex flex-col p-6">
          <div class="flex items-center gap-2 mb-10">
            <div class="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div class="w-3 h-3 bg-black rounded-full" />
            </div>
            <span class="text-white font-bold text-lg tracking-tight">wen365</span>
          </div>

          <div class="space-y-6">
            <!-- Search Input Placeholder -->
            <div
              class="h-9 bg-zinc-800/50 rounded-lg w-full flex items-center px-3 gap-2 border border-white/5"
            >
              <UIcon name="i-lucide-search" class="w-3.5 h-3.5 text-zinc-600" />
              <span class="text-xs text-zinc-600">Search...</span>
            </div>

            <!-- Actual Dashboard Link - Monochrome Style -->
            <div
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white text-sm font-medium"
            >
              <UIcon name="i-lucide-layout-dashboard" class="w-4 h-4" />
              Dashboard
            </div>

            <!-- Blurred Skeleton Bars for other links -->
            <div class="space-y-4 pt-2">
              <div v-for="i in 4" :key="i" class="h-8 w-full flex items-center px-3 gap-3">
                <div class="w-4 h-4 rounded-sm bg-zinc-800/50" />
                <div class="h-3 w-24 bg-zinc-800/50 rounded-sm blur-[2px]" />
              </div>
            </div>
          </div>

          <!-- Bottom Sidebar Skeleton -->
          <div class="mt-auto space-y-4">
            <div class="h-8 w-full flex items-center px-3 gap-3">
              <div class="w-4 h-4 rounded-sm bg-zinc-800/50" />
              <div class="h-3 w-20 bg-zinc-800/50 rounded-sm blur-[2px]" />
            </div>
          </div>
        </div>

        <!-- Main Content Area - Detailed Dashboard Layout -->
        <div class="flex-1 bg-[#0c0c0e] flex flex-col">
          <!-- Top Section: Net Worth & Graph -->
          <div class="grid grid-cols-1 lg:grid-cols-3 border-b border-white/5 h-64">
            <!-- Stats -->
            <div
              class="p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 relative overflow-hidden"
            >
              <div class="relative z-10">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-medium text-zinc-500 uppercase tracking-wider"
                    >Total Net Worth</span
                  >
                </div>
                <div class="text-4xl text-white font-semibold tracking-tight mb-2">
                  $1,240,592<span class="text-zinc-500 text-2xl">.45</span>
                </div>
                <div
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"
                >
                  <UIcon name="i-lucide-trending-up" class="w-3 h-3" />
                  +$12,405 (2.4%)
                </div>
              </div>
              <!-- Subtle grid in stats bg -->
              <div
                class="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"
              />
            </div>

            <!-- Graph -->
            <div
              class="col-span-2 relative h-full flex items-end p-0 overflow-hidden group bg-[#0c0c0e]"
            >
              <div class="absolute top-6 right-6 flex gap-2 z-10">
                <div class="text-[10px] text-white bg-white/10 px-2 py-0.5 rounded">1D</div>
                <div class="text-[10px] text-zinc-500 px-2 py-0.5 rounded">1W</div>
                <div class="text-[10px] text-zinc-500 px-2 py-0.5 rounded">1M</div>
              </div>

              <!-- SVG Line Graph -->
              <svg
                class="w-full h-[80%] absolute bottom-0 left-0"
                preserveAspectRatio="none"
                viewBox="0 0 600 200"
              >
                <defs>
                  <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgba(16, 185, 129, 0.1)" />
                    <stop offset="100%" stop-color="rgba(16, 185, 129, 0)" />
                  </linearGradient>
                </defs>
                <!-- Fill Area -->
                <path
                  d="M0,150 C100,140 200,180 300,120 C400,60 500,80 600,40 V200 H0 Z"
                  fill="url(#graphGradient)"
                />
                <!-- Line -->
                <path
                  d="M0,150 C100,140 200,180 300,120 C400,60 500,80 600,40"
                  fill="none"
                  stroke="#10b981"
                  stroke-width="2"
                  class="animate-draw"
                />
              </svg>
            </div>
          </div>

          <!-- Middle Section: Asset Maturity & Allocation -->
          <div class="grid grid-cols-1 lg:grid-cols-3 border-b border-white/5">
            <div
              class="col-span-1 lg:col-span-2 p-6 border-b lg:border-b-0 lg:border-r border-white/5"
            >
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-medium text-zinc-400">Asset Maturity (Tax Status)</span>
                <span class="text-[10px] text-zinc-600">Threshold: 365 Days</span>
              </div>

              <!-- Maturity Bars -->
              <div class="space-y-5">
                <!-- Bitcoin -->
                <div>
                  <div class="flex justify-between text-xs mb-1.5">
                    <div class="flex items-center gap-2 text-white">
                      <UIcon name="i-lucide-bitcoin" class="w-3.5 h-3.5 text-orange-500" />
                      Bitcoin
                    </div>
                    <span class="text-emerald-400 font-medium">Long Term (420 days)</span>
                  </div>
                  <div class="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 w-full" />
                  </div>
                </div>

                <!-- Ethereum -->
                <div>
                  <div class="flex justify-between text-xs mb-1.5">
                    <div class="flex items-center gap-2 text-white">
                      <UIcon name="i-lucide-layers" class="w-3.5 h-3.5 text-blue-500" />
                      Ethereum
                    </div>
                    <span class="text-zinc-400">Short Term (215 / 365)</span>
                  </div>
                  <div class="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden relative">
                    <!-- Marker for 365 -->
                    <div class="absolute right-0 top-0 h-full w-px bg-white/20 z-10" />
                    <div class="h-full bg-zinc-500 w-[58%]" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Allocation Donut (Simulated) -->
            <div class="p-6 flex flex-col justify-center items-center relative">
              <div
                class="w-24 h-24 rounded-full border-[6px] border-zinc-800 border-t-emerald-500 border-r-blue-500 border-b-purple-500 border-l-orange-500 rotate-45"
              />
              <div class="absolute inset-0 flex items-center justify-center flex-col">
                <span class="text-white text-sm font-medium">4</span>
                <span class="text-[10px] text-zinc-500 uppercase">Assets</span>
              </div>
            </div>
          </div>

          <!-- Bottom Section: Asset Table -->
          <div class="bg-zinc-900/20 flex-1">
            <div
              class="px-6 py-3 border-b border-white/5 grid grid-cols-12 text-[10px] uppercase tracking-wider font-medium text-zinc-500"
            >
              <div class="col-span-5">Asset</div>
              <div class="col-span-4 text-right">Value</div>
              <div class="col-span-3 text-right">Status</div>
            </div>

            <!-- Row 1 -->
            <div
              class="px-6 py-3 border-b border-white/5 grid grid-cols-12 items-center hover:bg-white/[0.02] transition-colors group"
            >
              <div class="col-span-5 flex items-center gap-3">
                <div
                  class="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20"
                >
                  <UIcon name="i-lucide-bitcoin" class="w-3 h-3" />
                </div>
                <div>
                  <div class="text-sm text-white font-medium">Bitcoin</div>
                </div>
              </div>
              <div class="col-span-4 text-right text-sm text-white font-medium">$156,345.20</div>
              <div class="col-span-3 flex justify-end">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  >Long Term</span
                >
              </div>
            </div>

            <!-- Row 2 -->
            <div
              class="px-6 py-3 border-b border-white/5 grid grid-cols-12 items-center hover:bg-white/[0.02] transition-colors group"
            >
              <div class="col-span-5 flex items-center gap-3">
                <div
                  class="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20"
                >
                  <UIcon name="i-lucide-layers" class="w-3 h-3" />
                </div>
                <div>
                  <div class="text-sm text-white font-medium">Ethereum</div>
                </div>
              </div>
              <div class="col-span-4 text-right text-sm text-white font-medium">$45,504.32</div>
              <div class="col-span-3 flex justify-end">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-white/10"
                  >Short Term</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
