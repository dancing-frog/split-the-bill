function SplitEditor({
  people,
  splitMode,
  personSplits,
  onSplitModeChange,
  onPersonSplitChange,
  formatCurrency,
  remainingToSplitPaise,
  customSplitError,
  validationMessages,
}) {
  const includedPeople = people.filter((person) => person.included !== false)

  return (
    <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Custom Split</h2>
          <p className="mt-1 text-sm text-slate-500">
            Switch between equal split and person-specific custom amounts or percentages.
          </p>
        </div>

        <div className="inline-flex rounded-full bg-slate-100 p-1 text-sm">
          <button
            type="button"
            onClick={() => onSplitModeChange('equal')}
            className={`rounded-full px-4 py-2 font-medium transition ${
              splitMode === 'equal' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Equal
          </button>
          <button
            type="button"
            onClick={() => onSplitModeChange('custom')}
            className={`rounded-full px-4 py-2 font-medium transition ${
              splitMode === 'custom' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600">
          Remaining to split: <span className="font-semibold text-slate-900">{formatCurrency(remainingToSplitPaise)}</span>
        </p>
        {customSplitError ? <p className="mt-2 text-sm text-rose-600">{customSplitError}</p> : null}
      </div>

      <div className="mt-4 space-y-3">
        {people.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
            Add people first to configure custom splits.
          </div>
        ) : includedPeople.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
            Include people in the bill to configure custom splits.
          </div>
        ) : (
          includedPeople.map((person) => {
            const splitConfig = personSplits[person.id] ?? { mode: 'equal', value: '' }

            return (
              <div key={person.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{person.name}</p>
                    <p className="text-xs text-slate-500">Choose equal, amount, or percent.</p>
                  </div>

                  <select
                    value={splitConfig.mode}
                    onChange={(event) => onPersonSplitChange(person.id, 'mode', event.target.value)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="equal">Equal</option>
                    <option value="amount">Amount</option>
                    <option value="percent">Percent</option>
                  </select>
                </div>

                {splitConfig.mode !== 'equal' ? (
                  <div className="mt-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={splitConfig.value}
                      onChange={(event) => {
                        let val = event.target.value;
                        if (val.startsWith('-')) val = val.substring(1);
                        onPersonSplitChange(person.id, 'value', val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === '+') e.preventDefault();
                      }}
                      placeholder={splitConfig.mode === 'percent' ? '0' : '0.00'}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>

      {validationMessages.length > 0 ? (
        <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Validation</p>
          <ul className="mt-2 space-y-1">
            {validationMessages.map((message, index) => (
              <li key={`${message}-${index}`}>• {message}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

export default SplitEditor

