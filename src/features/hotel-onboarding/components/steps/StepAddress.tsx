"use client";

/* eslint-disable react-hooks/incompatible-library */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import {
  addressStepSchema,
  type AddressStepValues,
} from "../../schemas/address.schema";
import { useOnboardingStore } from "../../store/onboarding.store";
import { INDIAN_STATES } from "../../constants/enums";
import { NavigationFooter } from "../NavigationFooter";

const inputClass =
  "w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm";
const inputErrorClass =
  "w-full p-3 bg-red-50 border border-red-300 rounded-2xl outline-none focus:ring-2 focus:ring-red-400 font-bold text-sm";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs font-bold mt-1">{message}</p>;
}

export function StepAddress() {
  const address = useOnboardingStore((s) => s.address);
  const patchAddress = useOnboardingStore((s) => s.patchAddress);
  const setStep = useOnboardingStore((s) => s.setStep);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { errors },
  } = useForm<AddressStepValues>({
    resolver: yupResolver(addressStepSchema),
    defaultValues: address,
  });

  useEffect(() => {
    reset(address);
  }, [address, reset]);

  const street = watch("address_street");
  const city = watch("address_city");
  const state = watch("address_state");
  const pincode = watch("address_pincode");

  const onNext = handleSubmit(
    (values) => {
      patchAddress(values);
      setStep(3);
    },
    () => {
      toast.error("Please fill street, city, state, and PIN code.");
    }
  );

  return (
    <div className="space-y-4 md:space-y-5">
      <h2 className="text-xl md:text-2xl font-black tracking-tight">
        📍 Hotel Address
      </h2>
      <p className="text-slate-400 font-medium text-sm">
        Provide the complete registered address of your hotel property.
      </p>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
          Street Address *
        </label>
        <input
          type="text"
          placeholder="e.g. 123 Marine Drive, Near Gateway of India"
          className={errors.address_street ? inputErrorClass : inputClass}
          aria-invalid={Boolean(errors.address_street)}
          {...register("address_street")}
        />
        <FieldError message={errors.address_street?.message} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            City *
          </label>
          <input
            type="text"
            placeholder="e.g. Mumbai"
            className={errors.address_city ? inputErrorClass : inputClass}
            aria-invalid={Boolean(errors.address_city)}
            {...register("address_city")}
          />
          <FieldError message={errors.address_city?.message} />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            State *
          </label>
          <select
            className={errors.address_state ? inputErrorClass : inputClass}
            aria-invalid={Boolean(errors.address_state)}
            {...register("address_state")}
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <FieldError message={errors.address_state?.message} />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
          PIN Code *
        </label>
        <input
          type="text"
          placeholder="e.g. 400001"
          maxLength={20}
          className={errors.address_pincode ? inputErrorClass : inputClass}
          aria-invalid={Boolean(errors.address_pincode)}
          {...register("address_pincode")}
        />
        <FieldError message={errors.address_pincode?.message} />
      </div>

      {street && city && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
            Full Address Preview
          </p>
          <p className="font-bold text-[#0f2c4c] text-sm">
            {street}, {city}, {state} - {pincode}
          </p>
        </div>
      )}

      <NavigationFooter
        onBack={() => {
          patchAddress(getValues());
          setStep(1);
        }}
        onNext={onNext}
      />
    </div>
  );
}
