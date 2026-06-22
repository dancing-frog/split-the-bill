import { useMemo, useState } from 'react'

function SettlementSummary({
  people,
  payerId,
  balances,
  transfers,
  formatCurrency,
  title = 'Paid By / Settlement',
  description = 'The payer is selected in Bill Setup. This panel shows who owes whom.',
  showPayerLabel = true,
  manualPayments = [],
  onAddManualPayment,
  onDeleteManualPayment,
}) {
  const payer = people.find((person) => person.id === payerId)
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [amount, setAmount] = useState('')

  const transferPeople = useMemo(() => people, [people])

  const handleSubmitPayment = (event) => {
    event.preventDefault()

    if (!fromId || !toId || fromId === toId || !amount) {
      return
    }

    onAddManualPayment?.({
      fromId,
      toId,
      amount,
    })

    setFromId('')
    setToId('')
    setAmount('')
  }

  return (
    <section className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <h3 className="text-sm font-semibold text-slate-100">Balances</h3>
          <ul className="mt-3 space-y-2">
            {people.length === 0 ? (
              <li className="text-sm text-slate-500">Add people to see balances.</li>
            ) : (
              people.map((person, index) => (
                <li key={person.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-300">{person.name}</span>
                  <span className={balances[index] >= 0 ? 'font-semibold text-emerald-400' : 'font-semibold text-rose-400'}>
                    {formatCurrency(Math.abs(balances[index] ?? 0))}
                    {showPayerLabel && payer?.id === person.id ? ' paid' : balances[index] >= 0 ? ' owed' : ' owes'}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-semibold text-slate-100">Settlement summary</h3>
          {transfers.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No settlement yet. Select a payer to generate transfers.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {transfers.map((transfer, index) => (
                <li key={`${transfer.from}-${transfer.to}-${index}`} className="rounded-2xl bg-black/20 border border-white/5 px-3 py-2 transition-all hover:bg-white/5">
                  {transfer.from} pays <span className="text-white font-medium">{transfer.to}</span> {formatCurrency(transfer.amountPaise)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {onAddManualPayment ? (
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <h3 className="text-sm font-semibold text-slate-100">Record payment</h3>
            <form onSubmit={handleSubmitPayment} className="mt-3 grid gap-3 sm:grid-cols-3">
              <select
                value={fromId}
                onChange={(event) => setFromId(event.target.value)}
                className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition-all focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20 [&>option]:bg-slate-900"
              >
                <option value="">From</option>
                {transferPeople.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>

              <select
                value={toId}
                onChange={(event) => setToId(event.target.value)}
                className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition-all focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20 [&>option]:bg-slate-900"
              >
                <option value="">To</option>
                {transferPeople.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Amount"
                  className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20"
                />

                <button
                  type="submit"
                  className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 ease-out hover:bg-indigo-500 hover:scale-[1.02]"
                >
                  Save
                </button>
              </div>
            </form>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
              {manualPayments.length === 0 ? (
                <p className="text-sm text-slate-500">No manual payments saved yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-slate-300">
                  {manualPayments.map((payment) => (
                    <li key={payment.id} className="flex items-center justify-between gap-3 rounded-xl bg-black/20 border border-white/5 px-3 py-2">
                      <span>
                        {transferPeople.find((person) => person.id === payment.fromId)?.name ?? 'Unknown'} pays{' '}
                        {transferPeople.find((person) => person.id === payment.toId)?.name ?? 'Unknown'} {formatCurrency(
                          Math.round(Number.parseFloat(payment.amount || 0) * 100),
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteManualPayment?.(payment.id)}
                        className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default SettlementSummary
