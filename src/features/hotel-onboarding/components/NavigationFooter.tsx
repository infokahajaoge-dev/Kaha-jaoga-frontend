"use client";

type NavigationFooterProps = {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backDisabled?: boolean;
  nextClassName?: string;
  hideBack?: boolean;
  singleNext?: boolean;
};

const backClass =
  "flex-1 bg-slate-100 text-slate-700 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-slate-100";
const nextDefault =
  "flex-1 bg-[#0f2c4c] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition text-sm disabled:opacity-60 disabled:cursor-not-allowed";

export function NavigationFooter({
  onBack,
  onNext,
  nextLabel = "Next →",
  nextDisabled = false,
  backDisabled = false,
  nextClassName,
  hideBack = false,
  singleNext = false,
}: NavigationFooterProps) {
  if (singleNext || hideBack) {
    return (
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className={
          nextClassName ||
          "w-full bg-[#0f2c4c] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        }
      >
        {nextLabel}
      </button>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={backDisabled}
        className={backClass}
      >
        ← Back
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className={nextClassName || nextDefault}
      >
        {nextLabel}
      </button>
    </div>
  );
}
