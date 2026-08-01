"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import {
  roomsStepSchema,
  type RoomsStepValues,
} from "../../schemas/rooms.schema";
import { useOnboardingStore } from "../../store/onboarding.store";
import { RoomCard } from "../RoomCard";
import { NavigationFooter } from "../NavigationFooter";
import type { RoomPhotoKey } from "../../constants/enums";

export function StepRooms() {
  const rooms = useOnboardingStore((s) => s.rooms);
  const addRoom = useOnboardingStore((s) => s.addRoom);
  const removeRoom = useOnboardingStore((s) => s.removeRoom);
  const updateRoom = useOnboardingStore((s) => s.updateRoom);
  const setRoomPhoto = useOnboardingStore((s) => s.setRoomPhoto);
  const setStep = useOnboardingStore((s) => s.setStep);

  // RHF mirrors Zustand rooms for validation only; RoomCard writes to the store.
  const { handleSubmit } = useForm<RoomsStepValues>({
    resolver: yupResolver(roomsStepSchema),
    values: { rooms },
  });

  const onNext = handleSubmit(
    () => setStep(5),
    () => {
      toast.error(
        "Please complete every room: name (min 2 characters), bed type, max guests, number of rooms, and price per night."
      );
    }
  );

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">
            🛏️ Room Types
          </h2>
          <p className="text-slate-400 font-medium text-sm mt-1">
            Add all room types in your hotel
          </p>
        </div>
        <button
          type="button"
          onClick={addRoom}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition"
        >
          + Add Room
        </button>
      </div>

      {rooms.map((room, index) => (
        <RoomCard
          key={index}
          room={room}
          index={index}
          canRemove={rooms.length > 1}
          onUpdate={(field, value) => updateRoom(index, field, value)}
          onRemove={() => removeRoom(index)}
          onPhoto={(photoKey, file) =>
            setRoomPhoto(index, photoKey as RoomPhotoKey, file)
          }
        />
      ))}

      <button
        type="button"
        onClick={addRoom}
        className="w-full border-2 border-dashed border-slate-300 text-slate-500 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-blue-400 hover:text-blue-600 transition"
      >
        + Add Another Room Type
      </button>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <p className="text-blue-700 font-bold text-sm">
          💡 {rooms.length} room type{rooms.length > 1 ? "s" : ""} added. Each
          type can have different pricing and features.
        </p>
      </div>

      <NavigationFooter onBack={() => setStep(3)} onNext={onNext} />
    </div>
  );
}
