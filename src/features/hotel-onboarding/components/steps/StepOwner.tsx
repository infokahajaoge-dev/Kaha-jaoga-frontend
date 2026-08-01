"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import {
  ownerStepSchema,
  type OwnerStepValues,
} from "../../schemas/owner.schema";
import { useOnboardingStore } from "../../store/onboarding.store";
import {
  hotelOnboardingService,
  SUBMIT_PHASE_LABEL,
  type SubmitPhase,
} from "../../services/hotelOnboarding.service";
import { formatApiError } from "@/src/utils/apiError";
import { NavigationFooter } from "../NavigationFooter";
import { PasswordInput } from "@/components/PasswordInput";

const inputClass =
  "w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm";
const inputErrorClass =
  "w-full p-3 bg-red-50 border border-red-300 rounded-2xl outline-none focus:ring-2 focus:ring-red-400 font-bold text-sm";

const SUCCESS_DELAY_MS = 1800;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs font-bold mt-1">{message}</p>;
}

export function StepOwner() {
  const router = useRouter();
  const owner = useOnboardingStore((s) => s.owner);
  const hotel = useOnboardingStore((s) => s.hotel);
  const address = useOnboardingStore((s) => s.address);
  const rooms = useOnboardingStore((s) => s.rooms);
  const loading = useOnboardingStore((s) => s.loading);
  const submitPhase = useOnboardingStore((s) => s.submitPhase);
  const patchOwner = useOnboardingStore((s) => s.patchOwner);
  const setStep = useOnboardingStore((s) => s.setStep);
  const setSubmitPhase = useOnboardingStore((s) => s.setSubmitPhase);
  const beginSubmit = useOnboardingStore((s) => s.beginSubmit);
  const endSubmit = useOnboardingStore((s) => s.endSubmit);
  const resetStore = useOnboardingStore((s) => s.reset);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<OwnerStepValues>({
    resolver: yupResolver(ownerStepSchema),
    defaultValues: owner,
  });

  useEffect(() => {
    reset(owner);
  }, [owner, reset]);

  const onSubmit = handleSubmit(
    async (values) => {
      // Sync Zustand lock — second click returns false before any await.
      if (!beginSubmit()) return;

      patchOwner(values);

      const draft = {
        ...useOnboardingStore.getState(),
        owner: { ...useOnboardingStore.getState().owner, ...values },
      };

      if (
        !draft.hotel.name ||
        !draft.address.address_city ||
        !draft.hotel.price ||
        !draft.owner.owner_email ||
        !draft.owner.password
      ) {
        toast.error("Please fill all required fields!");
        endSubmit();
        return;
      }
      if (!draft.photos.exterior) {
        toast.error("Please upload at least the main exterior photo!");
        endSubmit();
        return;
      }
      if (!draft.docs.gst || !draft.docs.aadhaar) {
        toast.error("Please upload both GST Certificate and Aadhaar Card!");
        endSubmit();
        return;
      }

      try {
        await hotelOnboardingService.submit(draft, (phase: SubmitPhase) => {
          setSubmitPhase(phase);
        });

        toast.success("Hotel submitted successfully.", {
          description:
            "Your hotel has been submitted for review. Our team will review it and notify you once it has been approved.",
          duration: 5000,
        });

        await new Promise((r) => setTimeout(r, SUCCESS_DELAY_MS));
        resetStore();
        router.push("/");
      } catch (err: unknown) {
        toast.error(formatApiError(err));
        endSubmit();
      }
    },
    () => {
      toast.error("Please fix the highlighted owner fields.");
    }
  );

  const nextLabel =
    loading && submitPhase !== "idle"
      ? SUBMIT_PHASE_LABEL[submitPhase] || "Submitting..."
      : "Submit ✓";

  return (
    <div className="space-y-4 md:space-y-5">
      <h2 className="text-xl md:text-2xl font-black tracking-tight">
        👤 Owner Details
      </h2>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
          Full Name *
        </label>
        <input
          type="text"
          placeholder="As per Aadhaar Card"
          className={errors.owner_name ? inputErrorClass : inputClass}
          disabled={loading}
          aria-invalid={Boolean(errors.owner_name)}
          {...register("owner_name")}
        />
        <FieldError message={errors.owner_name?.message} />
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
          Email Address *
        </label>
        <input
          type="email"
          placeholder="your@email.com"
          className={errors.owner_email ? inputErrorClass : inputClass}
          disabled={loading}
          aria-invalid={Boolean(errors.owner_email)}
          {...register("owner_email")}
        />
        <FieldError message={errors.owner_email?.message} />
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          placeholder="+91 98765 43210"
          className={errors.owner_phone ? inputErrorClass : inputClass}
          disabled={loading}
          aria-invalid={Boolean(errors.owner_phone)}
          {...register("owner_phone")}
        />
        <FieldError message={errors.owner_phone?.message} />
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
          Create Password *
        </label>
        <PasswordInput
          placeholder="Min 8 characters"
          className={errors.password ? inputErrorClass : inputClass}
          disabled={loading}
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <p className="font-black text-sm uppercase tracking-widest text-slate-400 mb-3">
          Submission Summary
        </p>
        <div className="space-y-2">
          {[
            { label: "Hotel", val: hotel.name },
            {
              label: "Type",
              val: `${hotel.hotel_type} · ${hotel.star_rating}★`,
            },
            {
              label: "Location",
              val: `${address.address_city}, ${address.address_state}`,
            },
            {
              label: "Base Price",
              val: hotel.price
                ? "₹" + parseInt(hotel.price).toLocaleString() + "/night"
                : "",
            },
            { label: "Room Types", val: `${rooms.length} added` },
            { label: "Documents", val: "GST + Aadhaar ✓" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex justify-between text-sm py-1 border-b border-slate-100"
            >
              <span className="text-slate-400 font-bold">{item.label}</span>
              <span className="font-black text-slate-900 text-right ml-2">
                {item.val}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <p className="font-black text-sm uppercase tracking-widest text-slate-400 mb-3">
          Room Types
        </p>
        {rooms.map((room, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-[#0f2c4c] rounded-full flex items-center justify-center text-white text-[9px] font-black">
                {i + 1}
              </span>
              <span className="font-bold text-sm text-slate-700 truncate">
                {room.room_name || `Room Type ${i + 1}`} · {room.bed_type}
              </span>
            </div>
            <span className="font-black text-[#0f2c4c] text-sm ml-2">
              ₹{parseInt(room.price_per_night || "0").toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-amber-700 font-bold text-sm">
          ⚠️ By submitting, you confirm all information is accurate and
          documents are genuine.
        </p>
      </div>

      <NavigationFooter
        onBack={() => {
          if (loading) return;
          patchOwner(getValues());
          setStep(5);
        }}
        onNext={onSubmit}
        nextLabel={nextLabel}
        nextDisabled={loading}
        backDisabled={loading}
        nextClassName="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-sm"
      />
    </div>
  );
}
