"use client";

/* React Compiler skips memoization around RHF watch() — expected */
/* eslint-disable react-hooks/incompatible-library */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import {
  hotelStepSchema,
  type HotelStepValues,
} from "../../schemas/hotel.schema";
import { useOnboardingStore } from "../../store/onboarding.store";
import {
  AMENITY_CHIPS,
  HOTEL_CATEGORIES,
  HOTEL_TYPES,
  STAR_RATINGS,
} from "../../constants/enums";
import { NavigationFooter } from "../NavigationFooter";

const inputClass =
  "w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm";
const inputErrorClass =
  "w-full p-3 bg-red-50 border border-red-300 rounded-2xl outline-none focus:ring-2 focus:ring-red-400 font-bold text-sm";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs font-bold mt-1">{message}</p>;
}

export function StepHotel() {
  const hotel = useOnboardingStore((s) => s.hotel);
  const patchHotel = useOnboardingStore((s) => s.patchHotel);
  const setStep = useOnboardingStore((s) => s.setStep);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } =
    useForm<HotelStepValues>({
      resolver: yupResolver(hotelStepSchema),
      defaultValues: hotel,
    });

  useEffect(() => {
    reset(hotel);
  }, [hotel, reset]);

  const amenities = watch("amenities") || "";

  const onNext = handleSubmit(
    (values) => {
      patchHotel(values);
      setStep(2);
    },
    () => {
      toast.error("Please fix hotel name, price, or website.");
    }
  );

  return (
    <div className="space-y-4 md:space-y-5">
      <h2 className="text-xl md:text-2xl font-black tracking-tight">
        🏨 Hotel Information
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Hotel Name *
          </label>
          <input
            type="text"
            placeholder="e.g. The Grand Palace"
            className={errors.name ? inputErrorClass : inputClass}
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Hotel Type *
          </label>
          <select className={inputClass} {...register("hotel_type")}>
            {HOTEL_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Category *
          </label>
          <select className={inputClass} {...register("category")}>
            {HOTEL_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Star Rating
          </label>
          <select className={inputClass} {...register("star_rating")}>
            {STAR_RATINGS.map((s) => (
              <option key={s} value={s}>
                {s} Star{s !== "1" ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Total Rooms
          </label>
          <input
            type="number"
            placeholder="e.g. 50"
            className={inputClass}
            {...register("total_rooms")}
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
          Base Price Per Night (₹) *
        </label>
        <input
          type="number"
          placeholder="e.g. 5000"
          min={0}
          step="any"
          className={errors.price ? inputErrorClass : inputClass}
          aria-invalid={Boolean(errors.price)}
          {...register("price")}
        />
        <FieldError message={errors.price?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Check-in
          </label>
          <input type="time" className={inputClass} {...register("check_in_time")} />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Check-out
          </label>
          <input
            type="time"
            className={inputClass}
            {...register("check_out_time")}
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
          Hotel Description
        </label>
        <textarea
          placeholder="Describe your hotel, unique features and what makes it special..."
          rows={4}
          className={`${inputClass} resize-none`}
          {...register("description")}
        />
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
          Website (Optional)
        </label>
        <input
          type="url"
          placeholder="https://yourhotel.com"
          className={errors.website ? inputErrorClass : inputClass}
          aria-invalid={Boolean(errors.website)}
          {...register("website")}
        />
        <FieldError message={errors.website?.message} />
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
          Hotel Amenities
        </label>
        <input
          type="text"
          placeholder="Free WiFi, Pool, Breakfast, Spa"
          className={inputClass}
          {...register("amenities")}
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {AMENITY_CHIPS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                const current = amenities
                  ? amenities.split(",").map((x) => x.trim())
                  : [];
                if (!current.includes(a)) {
                  setValue(
                    "amenities",
                    [...current, a].filter(Boolean).join(", "),
                    { shouldDirty: true }
                  );
                }
              }}
              className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-600 transition border border-slate-200"
            >
              + {a}
            </button>
          ))}
        </div>
      </div>

      <NavigationFooter
        singleNext
        nextLabel="Next — Hotel Address →"
        onNext={onNext}
      />
    </div>
  );
}
