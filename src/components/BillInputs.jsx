function ToggleButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-300 ease-out ${
        active
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  )
}

function MoneyField({ label, value, onChange, mode, onModeChange, valueFieldName, modeFieldName }) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{label}</h3>
          <p className="text-xs text-slate-400">Choose percent or flat amount.</p>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-black/20 p-1 border border-white/5">
          <ToggleButton
            active={mode === 'percent'}
            onClick={() => onModeChange(modeFieldName, 'percent')}
          >
            %
          </ToggleButton>
          <ToggleButton active={mode === 'flat'} onClick={() => onModeChange(modeFieldName, 'flat')}>
            Rs
          </ToggleButton>
        </div>
      </div>

      <input
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        value={value}
        onChange={(event) => {
          let val = event.target.value;
          if (val.startsWith('-')) val = val.substring(1);
          onChange(valueFieldName, val);
        }}
        onKeyDown={(e) => {
          if (e.key === '-' || e.key === '+') e.preventDefault();
        }}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/50 focus:bg-black/40 focus:ring-4 focus:ring-indigo-500/20"
        placeholder={mode === 'percent' ? '0' : '0.00'}
        aria-label={label}
      />
    </div>
  )
}

function BillInputs({
  billInputs,
  onBillValueChange,
  onBillModeChange,
  people,
  payerId,
  onPayerChange,
}) {
  return (
    <section className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">Bill Setup</h2>
          <p className="mt-1 text-sm text-slate-400">
            Enter the base bill, tax, and tip, then choose who paid the bill.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="baseBill" className="text-sm font-medium text-slate-300">
            Base Bill Amount
          </label>
          <input
            id="baseBill"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={billInputs.baseBill}
            onChange={(event) => {
              let val = event.target.value;
              if (val.startsWith('-')) val = val.substring(1);
              onBillValueChange('baseBill', val);
            }}
            onKeyDown={(e) => {
              if (e.key === '-' || e.key === '+') e.preventDefault();
            }}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/50 focus:bg-black/40 focus:ring-4 focus:ring-indigo-500/20"
            placeholder="0.00"
          />
        </div>

        <MoneyField
          label="Tax"
          value={billInputs.taxValue}
          onChange={onBillValueChange}
          mode={billInputs.taxMode}
          onModeChange={onBillModeChange}
          valueFieldName="taxValue"
          modeFieldName="taxMode"
        />

        <MoneyField
          label="Tip"
          value={billInputs.tipValue}
          onChange={onBillValueChange}
          mode={billInputs.tipMode}
          onModeChange={onBillModeChange}
          valueFieldName="tipValue"
          modeFieldName="tipMode"
        />

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="payerId" className="text-sm font-medium text-slate-300">
            Who paid?
          </label>
          <select
            id="payerId"
            value={payerId}
            onChange={(event) => onPayerChange(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition-all focus:border-indigo-500/50 focus:bg-black/40 focus:ring-4 focus:ring-indigo-500/20 [&>option]:bg-slate-900 [&>option]:text-white"
          >
            <option value="">Select payer</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}

export default BillInputs