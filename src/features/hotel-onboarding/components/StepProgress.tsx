"use client";

import { WIZARD_STEPS } from "../constants/steps";
import type { WizardStepIndex } from "../constants/steps";

type StepProgressProps = {
  step: WizardStepIndex;
};

export function StepProgress({ step }: StepProgressProps) {
  return (
    <div className="flex items-center justify-between mb-8 px-2">
      {WIZARD_STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-black text-xs transition ${
                step > i + 1
                  ? "bg-green-500 text-white"
                  : step === i + 1
                    ? "bg-[#0f2c4c] text-white"
                    : "bg-slate-200 text-slate-400"
              }`}
            >
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span
              className={`text-[8px] md:text-[9px] font-black uppercase tracking-wider text-center ${
                step >= i + 1 ? "text-[#0f2c4c]" : "text-slate-300"
              }`}
            >
              {s}
            </span>
          </div>
          {i < WIZARD_STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-1 mb-4 ${
                step > i + 1 ? "bg-green-500" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
