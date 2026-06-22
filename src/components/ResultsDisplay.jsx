function ResultsDisplay({
  baseBillPaise,
  taxPaise,
  tipPaise,
  grandTotalPaise,
  remainingToSplitPaise,
  people,
  formatCurrency,
  validationMessages,
  compact = false,
}) {
  if (compact) {
    return (
      <div className="mt-5 space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Summary</p>
            <h3 className="mt-1 text-sm font-semibold text-slate-900">Live Calculation</h3>
          </div>
          <p className="text-xs text-slate-500">Rs / INR</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-sm shadow-slate-900/10">
            <p className="text-xs text-slate-300">Grand total</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{formatCurrency(grandTotalPaise)}</p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-blue-950">
            <p className="text-xs font-medium text-blue-700">Remaining to split</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{formatCurrency(remainingToSplitPaise)}</p>
          </div>
        </div>

        <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700 sm:grid-cols-3">
          <p className="flex justify-between gap-3">
            <span>Base</span>
            <span className="font-semibold text-slate-900">{formatCurrency(baseBillPaise)}</span>
          </p>
          <p className="flex justify-between gap-3">
            <span>Tax</span>
            <span className="font-semibold text-slate-900">{formatCurrency(taxPaise)}</span>
          </p>
          <p className="flex justify-between gap-3">
            <span>Tip</span>
            <span className="font-semibold text-slate-900">{formatCurrency(tipPaise)}</span>
          </p>
        </div>

        <details className="rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer list-none text-sm font-semibold text-slate-700">
            Per person
          </summary>

          {people.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Add people to see each person&apos;s share.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {people.map((person) => (
                <li
                  key={person.id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="truncate font-medium text-slate-800">{person.name}</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(person.totalDuePaise ?? 0)}</span>
                </li>
              ))}
            </ul>
          )}
        </details>

        {validationMessages.length > 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-semibold">Validation</p>
            <ul className="mt-2 space-y-1">
              {validationMessages.map((message, index) => (
                <li key={`${message}-${index}`}>• {message}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <aside className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:sticky lg:top-8 lg:self-start">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">Summary</p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">Live Calculation</h2>
        <p className="mt-1 text-sm text-slate-500">Currency is shown in Rs / INR.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-lg shadow-slate-900/10">
          <p className="text-sm text-slate-300">Grand Total</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{formatCurrency(grandTotalPaise)}</p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-blue-950">
          <p className="text-sm font-medium text-blue-700">Remaining to Split</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{formatCurrency(remainingToSplitPaise)}</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        <p className="flex justify-between gap-3">
          <span>Base bill</span>
          <span className="font-semibold text-slate-900">{formatCurrency(baseBillPaise)}</span>
        </p>
        <p className="mt-2 flex justify-between gap-3">
          <span>Tax</span>
          <span className="font-semibold text-slate-900">{formatCurrency(taxPaise)}</span>
        </p>
        <p className="mt-2 flex justify-between gap-3">
          <span>Tip</span>
          <span className="font-semibold text-slate-900">{formatCurrency(tipPaise)}</span>
        </p>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
            Per Person
          </h3>
          <span className="text-xs font-medium text-slate-500">Total due</span>
        </div>

        {people.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Add people to see each person&apos;s share.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {people.map((person) => (
              <li
                key={person.id}
                className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 shadow-sm"
              >
                <span className="truncate text-sm font-medium text-slate-800">{person.name}</span>
                <span className="text-sm font-semibold text-slate-900">
                  {formatCurrency(person.totalDuePaise ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {validationMessages.length > 0 ? (
        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Validation</p>
          <ul className="mt-2 space-y-1">
            {validationMessages.map((message, index) => (
              <li key={`${message}-${index}`}>• {message}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  )
}

export default ResultsDisplay