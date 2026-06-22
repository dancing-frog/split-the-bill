function PeopleList({
  people,
  newPersonName,
  onNewPersonNameChange,
  onAddPerson,
  onRemovePerson,
  onTogglePersonIncluded,
  splitMode,
  personSplits,
  onSplitModeChange,
  onPersonSplitChange,
  formatCurrency,
  remainingToSplitPaise,
  customSplitError,
  validationMessages,
}) {
  const handleSubmit = (event) => {
    event.preventDefault()

    const trimmedName = newPersonName.trim()

    if (!trimmedName) {
      return
    }

    onAddPerson(trimmedName)
  }

  return (
    <section className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">People & Split</h2>
          <p className="mt-1 text-sm text-slate-400">Add people, toggle inclusion, and configure their split.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
            {people.length} total
          </span>

          <div className="inline-flex rounded-full bg-black/20 p-1 border border-white/5 text-sm">
            <button
              type="button"
              onClick={() => onSplitModeChange('equal')}
              className={`rounded-full px-3 py-1.5 font-medium transition-all duration-300 ease-out ${
                splitMode === 'equal' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Equal
            </button>
            <button
              type="button"
              onClick={() => onSplitModeChange('custom')}
              className={`rounded-full px-3 py-1.5 font-medium transition-all duration-300 ease-out ${
                splitMode === 'custom' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Custom
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="personName" className="sr-only">
          Person name
        </label>
        <input
          id="personName"
          type="text"
          value={newPersonName}
          onChange={(event) => onNewPersonNameChange(event.target.value)}
          placeholder="Enter a name"
          className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/50 focus:bg-black/40 focus:ring-4 focus:ring-indigo-500/20"
        />

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 ease-out hover:bg-indigo-500 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500 disabled:hover:scale-100"
          disabled={!newPersonName.trim()}
        >
          Add Person
        </button>
      </form>

      {/* Remaining to split info */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
        <p className="text-sm text-slate-300">
          Remaining to split:{' '}
          <span className="font-semibold text-white">{formatCurrency(remainingToSplitPaise)}</span>
        </p>
        {customSplitError ? <p className="mt-1 text-sm text-rose-400">{customSplitError}</p> : null}
      </div>

      <div className="mt-4 space-y-3">
        {people.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-sm text-slate-400">
            No people added yet. Add at least one person to calculate the split.
          </div>
        ) : (
          <ul className="space-y-3">
            {people.map((person) => {
              const isIncluded = person.included !== false
              const splitConfig = personSplits[person.id] ?? { mode: 'equal', value: '' }

              return (
                <li
                  key={person.id}
                  className={`rounded-2xl border px-4 py-3 transition-all duration-300 ease-out hover:bg-white/10 hover:scale-[1.01] ${
                    isIncluded
                      ? 'border-white/10 bg-white/5'
                      : 'border-white/5 bg-transparent opacity-60 grayscale'
                  }`}
                >
                  {/* Top row: toggle, name, remove */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onTogglePersonIncluded(person.id)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 ease-out ${
                          isIncluded
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/10 text-slate-300 border border-white/10'
                        }`}
                      >
                        {isIncluded ? 'Included' : 'Excluded'}
                      </button>
                      <span className={`truncate text-sm font-medium ${isIncluded ? 'text-white' : 'text-slate-400'}`}>{person.name}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemovePerson(person.id)}
                      className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-all duration-300 hover:bg-rose-500/20"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Inline custom split controls — only shown when included */}
                  {isIncluded && splitMode === 'custom' && (
                    <div className="mt-3 flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-3 sm:flex-row sm:items-center">
                      <select
                        value={splitConfig.mode}
                        onChange={(event) => onPersonSplitChange(person.id, 'mode', event.target.value)}
                        className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition-all focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20 [&>option]:bg-slate-900"
                      >
                        <option value="equal">Equal</option>
                        <option value="amount">Amount (Rs)</option>
                        <option value="percent">Percent (%)</option>
                      </select>

                      {splitConfig.mode !== 'equal' && (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={splitConfig.value}
                          onChange={(event) => onPersonSplitChange(person.id, 'value', event.target.value)}
                          placeholder={splitConfig.mode === 'percent' ? '0' : '0.00'}
                          className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20"
                        />
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {validationMessages.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200 backdrop-blur-md">
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

export default PeopleList