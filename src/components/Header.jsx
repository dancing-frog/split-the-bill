function Header() {
  return (
    <header className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-400">
            Split-the-Bill Calculator
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Vaibhav Kalani
          </h1>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            23ucc609@lnmiit.ac.in
          </p>
        </div>

        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-white/10 border border-white/20 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-out hover:bg-white/20 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Built for Digital Heroes
        </a>
      </div>
    </header>
  )
}

export default Header