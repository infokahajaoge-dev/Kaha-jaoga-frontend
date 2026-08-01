"use client";

import Navbar from "@/components/Navbar";
import { useOnboardingStore } from "../store/onboarding.store";
import { StepProgress } from "./StepProgress";
import { StepHotel } from "./steps/StepHotel";
import { StepAddress } from "./steps/StepAddress";
import { StepPhotos } from "./steps/StepPhotos";
import { StepRooms } from "./steps/StepRooms";
import { StepDocuments } from "./steps/StepDocuments";
import { StepOwner } from "./steps/StepOwner";

export function WizardShell() {
  const currentStep = useOnboardingStore((s) => s.currentStep);

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="text-center mb-8">
          <span className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            Hotel Partner Program
          </span>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter text-slate-900 mt-4 mb-2">
            List Your Hotel
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Join Kaha Jaoge and reach thousands of travellers across India
          </p>
        </div>

        <StepProgress step={currentStep} />

        <div className="bg-white rounded-[28px] md:rounded-[40px] shadow-xl border border-slate-100 p-6 md:p-10">
          {currentStep === 1 && <StepHotel />}
          {currentStep === 2 && <StepAddress />}
          {currentStep === 3 && <StepPhotos />}
          {currentStep === 4 && <StepRooms />}
          {currentStep === 5 && <StepDocuments />}
          {currentStep === 6 && <StepOwner />}
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-8">
          {[
            { icon: "🌍", title: "Huge Reach", desc: "50K+ travellers" },
            { icon: "💰", title: "Zero Commission", desc: "Keep 100%" },
            { icon: "⚡", title: "Go Live Fast", desc: "48 hours" },
          ].map((b) => (
            <div
              key={b.title}
              className="bg-white p-4 md:p-5 rounded-[20px] md:rounded-[24px] shadow-sm border border-slate-100 text-center"
            >
              <p className="text-2xl md:text-3xl mb-1 md:mb-2">{b.icon}</p>
              <p className="font-black text-xs md:text-sm text-slate-900">
                {b.title}
              </p>
              <p className="text-slate-400 text-[10px] md:text-xs font-medium mt-0.5">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
