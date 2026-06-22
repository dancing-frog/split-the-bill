function HistoryPanel({ savedBills, onRestoreBill, onDeleteSavedBill, formatCurrency, formatDateTime }) {
  return (
    <section className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-white">Saved Bills</h2>
        <p className="mt-1 text-sm text-slate-400">
          Restore a previous calculation from local history.
        </p>
      </div>

      {savedBills.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-sm text-slate-400">
          No saved bills yet.
        </div>
      ) : (
        <div className="space-y-3">
          {savedBills.map((savedBill) => {
            const billTotalPaise =
              Math.round(Number.parseFloat(savedBill.billInputs.baseBill || 0) * 100) +
              (savedBill.billInputs.taxMode === 'percent'
                ? Math.round((Math.round(Number.parseFloat(savedBill.billInputs.baseBill || 0) * 100) * (Number.parseFloat(savedBill.billInputs.taxValue) || 0)) / 100)
                : Math.round(Number.parseFloat(savedBill.billInputs.taxValue || 0) * 100)) +
              (savedBill.billInputs.tipMode === 'percent'
                ? Math.round((Math.round(Number.parseFloat(savedBill.billInputs.baseBill || 0) * 100) * (Number.parseFloat(savedBill.billInputs.tipValue) || 0)) / 100)
                : Math.round(Number.parseFloat(savedBill.billInputs.tipValue || 0) * 100))

            return (
              <div key={savedBill.id} className="rounded-3xl border border-white/10 bg-black/20 p-4 transition-all hover:bg-white/5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{formatDateTime(savedBill.savedAt)}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      <span className="text-emerald-400 font-medium">{formatCurrency(billTotalPaise)}</span> · {savedBill.people.length} people
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onRestoreBill(savedBill)}
                      className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-all duration-300 ease-out hover:bg-indigo-500 hover:scale-[1.05]"
                    >
                      Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSavedBill(savedBill.id)}
                      className="rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400 transition-all duration-300 hover:bg-rose-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default HistoryPanel
