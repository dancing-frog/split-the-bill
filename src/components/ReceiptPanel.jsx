function ReceiptPanel({ receiptText, onCopyReceipt, onSaveBill }) {
  return (
    <section className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-white">Shareable Receipt</h2>
        <p className="mt-1 text-sm text-slate-400">
          Copy the current breakdown or save it to history.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onCopyReceipt}
          className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 ease-out hover:bg-indigo-500 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Copy Receipt
        </button>
        <button
          type="button"
          onClick={onSaveBill}
          className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 ease-out hover:bg-white/20 hover:scale-[1.02]"
        >
          Save Bill
        </button>
      </div>

      <pre className="mt-4 max-h-72 overflow-auto rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300 whitespace-pre-wrap">
        {receiptText}
      </pre>
    </section>
  )
}

export default ReceiptPanel
