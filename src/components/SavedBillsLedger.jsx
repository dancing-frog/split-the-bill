import { useMemo, useState } from 'react'

const LARGE_MATRIX_THRESHOLD = 6

function SavedBillsLedger({
  users,
  matrix,
  balances,
  relations,
  manualPayments,
  onAddManualPayment,
  onDeleteManualPayment,
  formatCurrency,
}) {
  const [sectionMode, setSectionMode] = useState('overview')
  const [overviewMode, setOverviewMode] = useState(users.length > LARGE_MATRIX_THRESHOLD ? 'list' : 'matrix')
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [amount, setAmount] = useState('')

  const effectiveOverviewMode = users.length > LARGE_MATRIX_THRESHOLD ? 'list' : overviewMode
  const showMatrix = effectiveOverviewMode === 'matrix' && users.length <= LARGE_MATRIX_THRESHOLD
  const canShowMatrix = users.length > 0
  const ledgerRows = useMemo(() => relations, [relations])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!fromId || !toId || fromId === toId || !amount) {
      return
    }

    onAddManualPayment?.({ fromId, toId, amount })
    setFromId('')
    setToId('')
    setAmount('')
    setSectionMode('overview')
  }

  return (
    <section className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">All Saved Bills</h2>
          <p className="mt-1 text-sm text-slate-400">
            Pairwise totals across every saved bill and any saved manual payments.
          </p>
        </div>

        <div className="inline-flex rounded-full bg-black/20 p-1 text-sm border border-white/5">
          <button
            type="button"
            onClick={() => setSectionMode('overview')}
            className={`rounded-full px-4 py-2 font-medium transition-all duration-300 ease-out ${
              sectionMode === 'overview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setSectionMode('record')}
            className={`rounded-full px-4 py-2 font-medium transition-all duration-300 ease-out ${
              sectionMode === 'record' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Record Payment
          </button>
        </div>
      </div>

      {sectionMode === 'overview' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-slate-300">
              Positive values mean the row user should receive money. Negative values mean they owe that amount.
            </p>

            {canShowMatrix ? (
              <div className="inline-flex rounded-full bg-white/5 p-1 text-xs ring-1 ring-white/10">
                <button
                  type="button"
                  onClick={() => setOverviewMode('matrix')}
                  className={`rounded-full px-3 py-1.5 font-medium transition-all duration-300 ease-out ${
                    effectiveOverviewMode === 'matrix'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  disabled={users.length > LARGE_MATRIX_THRESHOLD}
                >
                  Matrix
                </button>
                <button
                  type="button"
                  onClick={() => setOverviewMode('list')}
                  className={`rounded-full px-3 py-1.5 font-medium transition-all duration-300 ease-out ${
                    effectiveOverviewMode === 'list'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  List
                </button>
              </div>
            ) : null}
          </div>

          {users.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-sm text-slate-400">
              Save at least one bill to see the rollup ledger.
            </div>
          ) : showMatrix ? (
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-black/20">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-white/5 backdrop-blur-md px-4 py-3 text-left font-semibold text-slate-100 border-b border-white/10">
                      User
                    </th>
                    {users.map((user) => (
                      <th key={user.id} className="whitespace-nowrap bg-white/5 px-4 py-3 text-left font-semibold text-slate-100 border-b border-white/10">
                        {user.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((rowUser) => (
                    <tr key={rowUser.id} className="border-t border-white/5">
                      <th className="sticky left-0 z-10 bg-white/5 backdrop-blur-md px-4 py-3 text-left font-medium text-white border-b border-white/5">
                        {rowUser.name}
                      </th>
                      {users.map((colUser) => {
                        const valuePaise = matrix[rowUser.id]?.[colUser.id] ?? 0

                        return (
                          <td key={colUser.id} className="whitespace-nowrap px-4 py-3 text-slate-300 border-b border-white/5">
                            {rowUser.id === colUser.id ? (
                              <span className="text-slate-600">-</span>
                            ) : valuePaise === 0 ? (
                              <span className="text-slate-600">0</span>
                            ) : valuePaise > 0 ? (
                              <span className="font-semibold text-emerald-400">+{formatCurrency(valuePaise)}</span>
                            ) : (
                              <span className="font-semibold text-rose-400">-{formatCurrency(Math.abs(valuePaise))}</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-3">
              {ledgerRows.map((user) => (
                <div key={user.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-white">{user.name}</h3>
                    <span className={balances.find((entry) => entry.id === user.id)?.balancePaise >= 0 ? 'font-semibold text-emerald-400' : 'font-semibold text-rose-400'}>
                      {formatCurrency(Math.abs(balances.find((entry) => entry.id === user.id)?.balancePaise ?? 0))}
                    </span>
                  </div>

                  {user.relations.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">No pairwise balances yet.</p>
                  ) : (
                    <ul className="mt-3 space-y-2 text-sm text-slate-300">
                      {user.relations.map((relation) => (
                        <li key={relation.id} className="flex items-center justify-between gap-3 rounded-2xl bg-black/20 border border-white/5 px-3 py-2 transition-all hover:bg-white/5">
                          <span>{relation.amountPaise < 0 ? <>{user.name} owes <span className="text-white font-medium">{relation.name}</span></> : <><span className="text-white font-medium">{relation.name}</span> owes {user.name}</>}</span>
                          <span className={relation.amountPaise > 0 ? 'font-semibold text-emerald-400' : 'font-semibold text-rose-400'}>
                            {relation.amountPaise > 0 ? '+' : '-'}{formatCurrency(Math.abs(relation.amountPaise))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-slate-300">
              Record a payment between any two users. It will be included in the saved-bill ledger.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-3">
            <select
              value={fromId}
              onChange={(event) => setFromId(event.target.value)}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white outline-none transition-all focus:border-indigo-500/50 focus:bg-black/60 focus:ring-4 focus:ring-indigo-500/20 [&>option]:bg-slate-900"
            >
              <option value="">From</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>

            <select
              value={toId}
              onChange={(event) => setToId(event.target.value)}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white outline-none transition-all focus:border-indigo-500/50 focus:bg-black/60 focus:ring-4 focus:ring-indigo-500/20 [&>option]:bg-slate-900"
            >
              <option value="">To</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
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
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/50 focus:bg-black/60 focus:ring-4 focus:ring-indigo-500/20"
              />

              <button
                type="submit"
                className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 ease-out hover:bg-indigo-500 hover:scale-[1.02]"
              >
                Save
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white">Saved payments</h3>
            {manualPayments.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No manual payments saved yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {manualPayments.map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between gap-3 rounded-2xl bg-black/20 border border-white/5 px-3 py-2 transition-all hover:bg-white/5">
                    <span>
                      {users.find((user) => user.id === payment.fromId)?.name ?? 'Unknown'} pays <span className="text-white font-medium">{users.find((user) => user.id === payment.toId)?.name ?? 'Unknown'}</span> {formatCurrency(Math.round(Number.parseFloat(payment.amount || 0) * 100))}
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
      )}
    </section>
  )
}

export default SavedBillsLedger
