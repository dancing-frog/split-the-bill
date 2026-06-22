import { useCallback, useEffect, useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import BillInputs from './components/BillInputs.jsx'
import PeopleList from './components/PeopleList.jsx'
import SettlementSummary from './components/SettlementSummary.jsx'
import SavedBillsLedger from './components/SavedBillsLedger.jsx'
import ReceiptPanel from './components/ReceiptPanel.jsx'
import HistoryPanel from './components/HistoryPanel.jsx'
import ExportPanel from './components/ExportPanel.jsx'
import { ToastContainer, useToasts } from './components/Toast.jsx'

const STORAGE_KEY = 'split-the-bill-calculator'
const MAX_HISTORY = 20

function createId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function createDefaultState() {
  return {
    billInputs: {
      baseBill: '',
      taxValue: '',
      taxMode: 'percent',
      tipValue: '',
      tipMode: 'percent',
    },
    people: [],
    newPersonName: '',
    splitMode: 'equal',
    personSplits: {},
    payerId: '',
    manualPayments: [],
    savedBills: [],
  }
}

function toPaise(value) {
  const numericValue = Number.parseFloat(value)
  return Number.isFinite(numericValue) ? Math.round(numericValue * 100) : 0
}

function fromPaise(value) {
  return value / 100
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function normalizePerson(person) {
  return {
    id: typeof person?.id === 'string' ? person.id : createId('person'),
    name: typeof person?.name === 'string' ? person.name.trim() : '',
    included: typeof person?.included === 'boolean' ? person.included : true,
    splitMode:
      person?.splitMode === 'amount' || person?.splitMode === 'percent' || person?.splitMode === 'shares'
        ? person.splitMode
        : 'equal',
    splitValue: typeof person?.splitValue === 'string' ? person.splitValue : '',
  }
}

function normalizeSavedBill(savedBill) {
  return {
    id: typeof savedBill?.id === 'string' ? savedBill.id : createId('saved'),
    savedAt:
      typeof savedBill?.savedAt === 'string' ? savedBill.savedAt : new Date().toISOString(),
    billInputs: {
      baseBill: typeof savedBill?.billInputs?.baseBill === 'string' ? savedBill.billInputs.baseBill : '',
      taxValue: typeof savedBill?.billInputs?.taxValue === 'string' ? savedBill.billInputs.taxValue : '',
      taxMode: savedBill?.billInputs?.taxMode === 'flat' ? 'flat' : 'percent',
      tipValue: typeof savedBill?.billInputs?.tipValue === 'string' ? savedBill.billInputs.tipValue : '',
      tipMode: savedBill?.billInputs?.tipMode === 'flat' ? 'flat' : 'percent',
    },
    people: Array.isArray(savedBill?.people)
      ? savedBill.people.map(normalizePerson).filter((person) => person.name)
      : [],
    splitMode: savedBill?.splitMode === 'custom' ? 'custom' : 'equal',
    personSplits:
      savedBill?.personSplits && typeof savedBill.personSplits === 'object'
        ? savedBill.personSplits
        : {},
    payerId: typeof savedBill?.payerId === 'string' ? savedBill.payerId : '',
  }
}

function normalizeManualPayment(payment) {
  return {
    id: typeof payment?.id === 'string' ? payment.id : createId('payment'),
    fromId: typeof payment?.fromId === 'string' ? payment.fromId : '',
    toId: typeof payment?.toId === 'string' ? payment.toId : '',
    amount: typeof payment?.amount === 'string' ? payment.amount : '',
    savedAt:
      typeof payment?.savedAt === 'string' ? payment.savedAt : new Date().toISOString(),
  }
}

function normalizeState(storedValue) {
  const defaultState = createDefaultState()

  if (!storedValue || typeof storedValue !== 'object') {
    return defaultState
  }

  return {
    billInputs: {
      baseBill:
        typeof storedValue.billInputs?.baseBill === 'string' ? storedValue.billInputs.baseBill : '',
      taxValue:
        typeof storedValue.billInputs?.taxValue === 'string' ? storedValue.billInputs.taxValue : '',
      taxMode: storedValue.billInputs?.taxMode === 'flat' ? 'flat' : 'percent',
      tipValue:
        typeof storedValue.billInputs?.tipValue === 'string' ? storedValue.billInputs.tipValue : '',
      tipMode: storedValue.billInputs?.tipMode === 'flat' ? 'flat' : 'percent',
    },
    people: Array.isArray(storedValue.people)
      ? storedValue.people.map(normalizePerson).filter((person) => person.name)
      : [],
    newPersonName:
      typeof storedValue.newPersonName === 'string' ? storedValue.newPersonName : '',
    splitMode: storedValue.splitMode === 'custom' ? 'custom' : 'equal',
    personSplits:
      storedValue.personSplits && typeof storedValue.personSplits === 'object'
        ? storedValue.personSplits
        : {},
    payerId: typeof storedValue.payerId === 'string' ? storedValue.payerId : '',
    manualPayments: Array.isArray(storedValue.manualPayments)
      ? storedValue.manualPayments.map(normalizeManualPayment)
      : [],
    savedBills: Array.isArray(storedValue.savedBills)
      ? storedValue.savedBills.map(normalizeSavedBill).slice(0, MAX_HISTORY)
      : [],
  }
}

function readInitialState() {
  if (typeof window === 'undefined') {
    return createDefaultState()
  }

  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY)
    if (!rawState) {
      return createDefaultState()
    }

    return normalizeState(JSON.parse(rawState))
  } catch {
    return createDefaultState()
  }
}

function calculateCustomSplit(totalPaise, people, personSplits) {
  const allocations = people.map(() => 0)
  const flexiblePeople = []
  let fixedTotal = 0

  people.forEach((person, index) => {
    const split = personSplits[person.id] ?? { mode: 'equal', value: '' }
    const splitValue = Number.parseFloat(split.value) || 0

    if (split.mode === 'amount') {
      const amountPaise = Math.max(0, toPaise(split.value))
      allocations[index] = amountPaise
      fixedTotal += amountPaise
      return
    }

    if (split.mode === 'percent') {
      const amountPaise = Math.round((totalPaise * Math.max(0, splitValue)) / 100)
      allocations[index] = amountPaise
      fixedTotal += amountPaise
      return
    }

    flexiblePeople.push({
      index,
      weight: split.mode === 'shares' ? Math.max(0, splitValue) || 0 : 1,
    })
  })

  if (fixedTotal > totalPaise) {
    return {
      allocations,
      isValid: false,
      error: 'Custom amount and percent values exceed the amount left to split.',
    }
  }

  const remainder = totalPaise - fixedTotal

  if (flexiblePeople.length === 0) {
    return {
      allocations,
      isValid: remainder === 0,
      error:
        remainder === 0
          ? ''
          : 'The split does not cover the full amount. Add equal people or adjust the fixed values.',
    }
  }

  const totalWeight = flexiblePeople.reduce((sum, person) => sum + person.weight, 0)

  if (totalWeight <= 0) {
    return {
      allocations,
      isValid: false,
      error: 'At least one equal or share-based split needs a positive value.',
    }
  }

  const provisional = flexiblePeople.map((person) => {
    const rawShare = (remainder * person.weight) / totalWeight
    const floorShare = Math.floor(rawShare)
    return {
      index: person.index,
      floorShare,
      fraction: rawShare - floorShare,
    }
  })

  let leftover = remainder - provisional.reduce((sum, entry) => sum + entry.floorShare, 0)

  provisional
    .sort((left, right) => right.fraction - left.fraction)
    .forEach((entry) => {
      allocations[entry.index] += entry.floorShare
      if (leftover > 0) {
        allocations[entry.index] += 1
        leftover -= 1
      }
    })

  return {
    allocations,
    isValid: leftover === 0,
    error: leftover === 0 ? '' : 'The split could not be balanced exactly.',
  }
}

function buildSettlementTransfers(netBalances, people) {
  const debtors = netBalances
    .map((balance, index) => ({
      id: people[index]?.id ?? createId('debtor'),
      name: people[index]?.name ?? 'Unknown',
      remaining: Math.abs(balance),
    }))
    .filter((entry, index) => netBalances[index] < 0)
    .sort((left, right) => right.remaining - left.remaining)

  const creditors = netBalances
    .map((balance, index) => ({
      id: people[index]?.id ?? createId('creditor'),
      name: people[index]?.name ?? 'Unknown',
      remaining: balance,
    }))
    .filter((entry, index) => netBalances[index] > 0)
    .sort((left, right) => right.remaining - left.remaining)

  const transfers = []

  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0]
    const creditor = creditors[0]
    const amountPaise = Math.min(debtor.remaining, creditor.remaining)

    transfers.push({
      from: debtor.name,
      to: creditor.name,
      amountPaise,
    })

    debtor.remaining -= amountPaise
    creditor.remaining -= amountPaise

    if (debtor.remaining === 0) {
      debtors.shift()
    }

    if (creditor.remaining === 0) {
      creditors.shift()
    }
  }

  return transfers
}

function calculateBillTotalPaise(billInputs) {
  const baseBillPaise = toPaise(billInputs.baseBill)
  const taxInputPaise = toPaise(billInputs.taxValue)
  const tipInputPaise = toPaise(billInputs.tipValue)

  const taxPaise =
    billInputs.taxMode === 'percent'
      ? Math.round((baseBillPaise * taxInputPaise) / 100)
      : taxInputPaise

  const tipPaise =
    billInputs.tipMode === 'percent'
      ? Math.round((baseBillPaise * tipInputPaise) / 100)
      : tipInputPaise

  return baseBillPaise + taxPaise + tipPaise
}

function buildSavedBillsLedger(savedBills, manualPayments) {
  const usersById = new Map()
  const matrix = new Map()

  const ensureUser = (id, name = 'Unknown') => {
    if (!id) {
      return
    }

    if (!usersById.has(id)) {
      usersById.set(id, {
        id,
        name,
      })
    }

    if (!matrix.has(id)) {
      matrix.set(id, new Map())
    }
  }

  const addEdge = (fromId, toId, amountPaise) => {
    if (!fromId || !toId || fromId === toId || amountPaise <= 0) {
      return
    }

    ensureUser(fromId)
    ensureUser(toId)

    const fromRow = matrix.get(fromId) ?? new Map()
    const toRow = matrix.get(toId) ?? new Map()

    fromRow.set(toId, (fromRow.get(toId) ?? 0) - amountPaise)
    toRow.set(fromId, (toRow.get(fromId) ?? 0) + amountPaise)

    matrix.set(fromId, fromRow)
    matrix.set(toId, toRow)
  }

  savedBills.forEach((savedBill) => {
    const billTotalPaise = calculateBillTotalPaise(savedBill.billInputs)
    const includedPeople = savedBill.people.filter((person) => person.included !== false)

    includedPeople.forEach((person) => ensureUser(person.id, person.name))

    if (!savedBill.payerId || includedPeople.length === 0) {
      return
    }

    const splitResult = calculateCustomSplit(
      billTotalPaise,
      includedPeople,
      savedBill.personSplits ?? {},
    )

    includedPeople.forEach((person, index) => {
      const amountPaise = splitResult.allocations[index] ?? 0

      if (person.id !== savedBill.payerId && amountPaise > 0) {
        addEdge(person.id, savedBill.payerId, amountPaise)
      }
    })
  })

  manualPayments.forEach((payment) => {
    const amountPaise = toPaise(payment.amount)
    if (amountPaise > 0) {
      addEdge(payment.toId, payment.fromId, amountPaise)
    }
  })

  const users = Array.from(usersById.values()).sort((left, right) => left.name.localeCompare(right.name))

  const ledgerMatrix = users.reduce((accumulator, user) => {
    const row = {}
    users.forEach((otherUser) => {
      row[otherUser.id] = matrix.get(user.id)?.get(otherUser.id) ?? 0
    })

    accumulator[user.id] = row
    return accumulator
  }, {})

  const balances = users.map((user) => ({
    id: user.id,
    name: user.name,
    balancePaise: Object.values(ledgerMatrix[user.id] ?? {}).reduce((sum, value) => sum + value, 0),
  }))

  const relations = users.map((user) => ({
    ...user,
    relations: users
      .filter((otherUser) => otherUser.id !== user.id)
      .map((otherUser) => ({
        id: otherUser.id,
        name: otherUser.name,
        amountPaise: ledgerMatrix[user.id]?.[otherUser.id] ?? 0,
      }))
      .filter((relation) => relation.amountPaise !== 0),
  }))

  return {
    users,
    matrix: ledgerMatrix,
    balances,
    relations,
  }
}

function App() {
  const initialState = useMemo(() => readInitialState(), [])
  const [activeTab, setActiveTab] = useState('bill')
  const [billInputs, setBillInputs] = useState(initialState.billInputs)
  const [people, setPeople] = useState(initialState.people)
  const [newPersonName, setNewPersonName] = useState(initialState.newPersonName)
  const [splitMode, setSplitMode] = useState(initialState.splitMode)
  const [personSplits, setPersonSplits] = useState(initialState.personSplits)
  const [payerId, setPayerId] = useState(initialState.payerId)
  const [manualPayments, setManualPayments] = useState(initialState.manualPayments)
  const [savedBills, setSavedBills] = useState(initialState.savedBills)
  const [toasts, addToast, dismissToast] = useToasts()

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          billInputs,
          people,
          newPersonName,
          splitMode,
          personSplits,
          payerId,
          manualPayments,
          savedBills,
        }),
      )
    } catch {
      // Ignore storage errors so the calculator remains usable offline.
    }
  }, [billInputs, people, newPersonName, splitMode, personSplits, payerId, manualPayments, savedBills])

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [],
  )

  const formatCurrency = useCallback(
    (valuePaise) => `Rs ${currencyFormatter.format(fromPaise(valuePaise))}`,
    [currencyFormatter],
  )

  const baseBillPaise = toPaise(billInputs.baseBill)
  const taxInputPaise = toPaise(billInputs.taxValue)
  const tipInputPaise = toPaise(billInputs.tipValue)
  const taxPaise = billInputs.taxMode === 'percent' ? Math.round((baseBillPaise * taxInputPaise) / 100) : taxInputPaise
  const tipPaise = billInputs.tipMode === 'percent' ? Math.round((baseBillPaise * tipInputPaise) / 100) : tipInputPaise
  const grandTotalPaise = baseBillPaise + taxPaise + tipPaise

  const includedPeople = people.filter((person) => person.included !== false)
  const useCustomSplit =
    splitMode === 'custom' ||
    includedPeople.some((person) => (personSplits[person.id]?.mode ?? 'equal') !== 'equal')

  const remainingToSplitPaise = grandTotalPaise
  const customSplit = calculateCustomSplit(remainingToSplitPaise, includedPeople, personSplits)

  const peopleWithTotals = includedPeople.map((person, index) => {
    const splitSharePaise = useCustomSplit
      ? customSplit.allocations[index] ?? 0
      : includedPeople.length > 0
        ? Math.floor(remainingToSplitPaise / includedPeople.length)
        : 0
    const paidPaise = person.id === payerId ? grandTotalPaise : 0
    const totalDuePaise = splitSharePaise

    return {
      id: person.id,
      name: person.name,
      splitMode: person.splitMode,
      splitValue: person.splitValue,
      splitSharePaise,
      totalDuePaise,
      netPaise: paidPaise - totalDuePaise,
    }
  })

  const settlementTransfers = useMemo(
    () =>
      payerId
        ? buildSettlementTransfers(
            peopleWithTotals.map((person) => person.netPaise),
            includedPeople,
          )
        : [],
    [includedPeople, payerId, peopleWithTotals],
  )

  const savedBillsLedger = useMemo(
    () => buildSavedBillsLedger(savedBills, manualPayments),
    [manualPayments, savedBills],
  )

  const validationMessages = []

  if (people.length === 0) {
    validationMessages.push('Add at least one person to calculate a split.')
  }

  if (includedPeople.length === 0 && people.length > 0) {
    validationMessages.push('Include at least one person in the bill.')
  }

  if (useCustomSplit && !customSplit.isValid && customSplit.error) {
    validationMessages.push(customSplit.error)
  }

  const payerName = people.find((person) => person.id === payerId)?.name ?? ''

  const receiptText = useMemo(() => {
    const lines = [
      'Split-the-Bill Receipt',
      `Date: ${formatDateTime(new Date().toISOString())}`,
      `Base bill: ${formatCurrency(baseBillPaise)}`,
      `Tax: ${formatCurrency(taxPaise)}`,
      `Tip: ${formatCurrency(tipPaise)}`,
      `Grand total: ${formatCurrency(grandTotalPaise)}`,
      `Remaining split: ${formatCurrency(remainingToSplitPaise)}`,
      '',
      'People:',
    ]

    peopleWithTotals.forEach((person) => {
      lines.push(`- ${person.name}: ${formatCurrency(person.totalDuePaise)} (split ${formatCurrency(person.splitSharePaise)})`)
    })

    lines.push('', `Paid by: ${payerName || 'Not selected'}`)

    if (settlementTransfers.length > 0) {
      lines.push('', 'Settlement:')
      settlementTransfers.forEach((transfer) => {
        lines.push(`- ${transfer.from} pays ${transfer.to} ${formatCurrency(transfer.amountPaise)}`)
      })
    }

    return lines.join('\n')
  }, [
    baseBillPaise,
    formatCurrency,
    grandTotalPaise,
    payerName,
    peopleWithTotals,
    remainingToSplitPaise,
    settlementTransfers,
    taxPaise,
    tipPaise,
  ])

  const handleBillValueChange = (field, value) => {
    setBillInputs((currentInputs) => ({
      ...currentInputs,
      [field]: value,
    }))
  }

  const handleBillModeChange = (field, mode) => {
    setBillInputs((currentInputs) => ({
      ...currentInputs,
      [field]: mode,
    }))
  }

  const handleAddPerson = (name) => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      return
    }

    const id = createId('person')
    setPeople((currentPeople) => [
      ...currentPeople,
      {
        id,
        name: trimmedName,
        included: true,
        splitMode: 'equal',
        splitValue: '',
      },
    ])
    setPersonSplits((currentSplits) => ({
      ...currentSplits,
      [id]: { mode: 'equal', value: '' },
    }))
    setNewPersonName('')
    addToast({ type: 'success', title: 'Person Added', message: `${trimmedName} has been added to the bill.` })
  }

  const handleRemovePerson = (id) => {
    const removedName = people.find((person) => person.id === id)?.name ?? 'Person'
    setPeople((currentPeople) => currentPeople.filter((person) => person.id !== id))
    setPersonSplits((currentSplits) => {
      const next = { ...currentSplits }
      delete next[id]
      return next
    })
    setPayerId((currentPayerId) => (currentPayerId === id ? '' : currentPayerId))
    addToast({ type: 'warning', title: 'Person Removed', message: `${removedName} has been removed.` })
  }

  const handleTogglePersonIncluded = (id) => {
    const person = people.find((p) => p.id === id)
    const willBeIncluded = person?.included === false
    setPeople((currentPeople) =>
      currentPeople.map((p) =>
        p.id === id
          ? {
              ...p,
              included: !p.included,
            }
          : p,
      ),
    )

    setPayerId((currentPayerId) => (currentPayerId === id ? '' : currentPayerId))
    addToast({
      type: willBeIncluded ? 'success' : 'info',
      message: `${person?.name ?? 'Person'} is now ${willBeIncluded ? 'included in' : 'excluded from'} the bill.`,
    })
  }

  const handlePersonSplitChange = (id, field, value) => {
    setSplitMode('custom')
    setPersonSplits((currentSplits) => ({
      ...currentSplits,
      [id]: {
        mode: field === 'mode' ? value : currentSplits[id]?.mode ?? 'equal',
        value: field === 'value' ? value : currentSplits[id]?.value ?? '',
      },
    }))
  }

  const handleSetPayer = (id) => {
    setPayerId(id)
  }

  const handleAddManualPayment = (payment) => {
    setManualPayments((currentPayments) => [
      {
        id: createId('payment'),
        fromId: payment.fromId,
        toId: payment.toId,
        amount: payment.amount,
        savedAt: new Date().toISOString(),
      },
      ...currentPayments,
    ])
    addToast({ type: 'success', title: 'Payment Recorded', message: 'Manual payment has been added.' })
  }

  const handleDeleteManualPayment = (id) => {
    setManualPayments((currentPayments) => currentPayments.filter((payment) => payment.id !== id))
    addToast({ type: 'warning', message: 'Manual payment deleted.' })
  }

  const handleSaveBill = () => {
    const snapshot = {
      id: createId('saved'),
      savedAt: new Date().toISOString(),
      billInputs,
      people,
      splitMode,
      personSplits,
      payerId,
      manualPayments,
    }

    setSavedBills((currentBills) => [snapshot, ...currentBills].slice(0, MAX_HISTORY))
    addToast({ type: 'success', title: 'Bill Saved', message: 'Your bill has been saved to history.', duration: 4000 })
  }

  const handleRestoreBill = (snapshot) => {
    setBillInputs(snapshot.billInputs)
    setPeople(Array.isArray(snapshot.people) ? snapshot.people.map(normalizePerson) : [])
    setNewPersonName('')
    setSplitMode(snapshot.splitMode === 'custom' ? 'custom' : 'equal')
    setPersonSplits(snapshot.personSplits && typeof snapshot.personSplits === 'object' ? snapshot.personSplits : {})
    setPayerId(typeof snapshot.payerId === 'string' ? snapshot.payerId : '')
    addToast({ type: 'info', title: 'Bill Restored', message: 'Saved bill has been loaded.', duration: 4000 })
    setActiveTab('bill')
  }

  const handleDeleteSavedBill = (id) => {
    setSavedBills((currentBills) => currentBills.filter((bill) => bill.id !== id))
    addToast({ type: 'warning', message: 'Saved bill deleted.' })
  }

  const handleCopyReceipt = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      addToast({ type: 'error', message: 'Clipboard not available in this browser.' })
      return
    }

    try {
      await navigator.clipboard.writeText(receiptText)
      addToast({ type: 'success', title: 'Copied!', message: 'Receipt copied to clipboard.' })
    } catch {
      addToast({ type: 'error', message: 'Failed to copy receipt to clipboard.' })
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Subtle glowing orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[300px] w-[300px] animate-blob rounded-full bg-indigo-600/5 mix-blend-screen blur-[100px]" />
        <div className="animation-delay-2000 absolute top-40 -right-40 h-[400px] w-[400px] animate-blob rounded-full bg-purple-600/5 mix-blend-screen blur-[100px]" />
        <div className="animation-delay-4000 absolute -bottom-40 left-20 h-[300px] w-[300px] animate-blob rounded-full bg-emerald-600/5 mix-blend-screen blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Header />

        <nav className="mt-6 inline-flex w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-1.5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setActiveTab('bill')}
            aria-pressed={activeTab === 'bill'}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ease-out ${
              activeTab === 'bill'
                ? 'bg-white/10 text-white shadow-lg border border-white/10 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Bill & Payment
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            aria-pressed={activeTab === 'saved'}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ease-out ${
              activeTab === 'saved'
                ? 'bg-white/10 text-white shadow-lg border border-white/10 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Saved
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            aria-pressed={activeTab === 'export'}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ease-out ${
              activeTab === 'export'
                ? 'bg-white/10 text-white shadow-lg border border-white/10 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Export
          </button>
        </nav>

        <main className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          {activeTab === 'bill' && (
            <>
              <div className="space-y-6">
                <BillInputs
                  billInputs={billInputs}
                  onBillValueChange={handleBillValueChange}
                  onBillModeChange={handleBillModeChange}
                  people={includedPeople}
                  payerId={payerId}
                  onPayerChange={handleSetPayer}
                />

                <PeopleList
                  people={people}
                  newPersonName={newPersonName}
                  onNewPersonNameChange={setNewPersonName}
                  onAddPerson={handleAddPerson}
                  onRemovePerson={handleRemovePerson}
                  onTogglePersonIncluded={handleTogglePersonIncluded}
                  splitMode={useCustomSplit ? 'custom' : splitMode}
                  personSplits={personSplits}
                  onSplitModeChange={setSplitMode}
                  onPersonSplitChange={handlePersonSplitChange}
                  formatCurrency={formatCurrency}
                  remainingToSplitPaise={remainingToSplitPaise}
                  customSplitError={customSplit.error}
                  validationMessages={validationMessages}
                />
              </div>

              <div className="space-y-6">
                <SettlementSummary
                  people={includedPeople}
                  payerId={payerId}
                  balances={peopleWithTotals.map((person) => person.netPaise)}
                  transfers={settlementTransfers}
                  formatCurrency={formatCurrency}
                />

                <ReceiptPanel
                  receiptText={receiptText}
                  onCopyReceipt={handleCopyReceipt}
                  onSaveBill={handleSaveBill}
                />
              </div>
            </>
          )}

          {activeTab === 'saved' && (
            <>
              <div className="space-y-6">
                <SavedBillsLedger
                  users={savedBillsLedger.users}
                  matrix={savedBillsLedger.matrix}
                  balances={savedBillsLedger.balances}
                  relations={savedBillsLedger.relations}
                  manualPayments={manualPayments}
                  onAddManualPayment={handleAddManualPayment}
                  onDeleteManualPayment={handleDeleteManualPayment}
                  formatCurrency={formatCurrency}
                />
              </div>

              <div className="space-y-6">
                <HistoryPanel
                  savedBills={savedBills}
                  onRestoreBill={handleRestoreBill}
                  onDeleteSavedBill={handleDeleteSavedBill}
                  formatCurrency={formatCurrency}
                  formatDateTime={formatDateTime}
                />
              </div>
            </>
          )}

          {activeTab === 'export' && (
            <ExportPanel
              baseBillPaise={baseBillPaise}
              taxPaise={taxPaise}
              tipPaise={tipPaise}
              grandTotalPaise={grandTotalPaise}
              billInputs={billInputs}
              payerName={payerName}
              peopleWithTotals={peopleWithTotals}
              settlementTransfers={settlementTransfers}
              formatCurrency={formatCurrency}
              ledgerUsers={savedBillsLedger.users}
              ledgerBalances={savedBillsLedger.balances}
              ledgerRelations={savedBillsLedger.relations}
              savedBillsCount={savedBills.length}
              onDownloadComplete={(filename) =>
                addToast({ type: 'success', title: 'PDF Downloaded', message: `${filename} saved to your device.`, duration: 4000 })
              }
            />
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default App
