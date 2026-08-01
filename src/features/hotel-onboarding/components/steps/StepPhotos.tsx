"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import {
  photosStepSchema,
  type PhotosStepValues,
} from "../../schemas/photos.schema";
import { useOnboardingStore } from "../../store/onboarding.store";
import { PHOTO_SLOTS, type PhotoSlotKey } from "../../constants/enums";
import { ImageUploadSlot } from "../ImageUploadSlot";
import { NavigationFooter } from "../NavigationFooter";

export function StepPhotos() {
  const photos = useOnboardingStore((s) => s.photos);
  const previews = useOnboardingStore((s) => s.previews);
  const setPhoto = useOnboardingStore((s) => s.setPhoto);
  const setStep = useOnboardingStore((s) => s.setStep);

  const { handleSubmit } = useForm<PhotosStepValues>({
    resolver: yupResolver(photosStepSchema),
    defaultValues: {},
  });

  const onNext = handleSubmit(() => {
    if (!photos.exterior) {
      toast.error("Please upload the main exterior photo!");
      return;
    }
    setStep(4);
  });

  return (
    <div className="space-y-4 md:space-y-5">
      <h2 className="text-xl md:text-2xl font-black tracking-tight">
        📸 Hotel Photos
      </h2>
      <p className="text-slate-400 font-medium text-sm">
        Upload high quality photos. Main exterior photo is required.
      </p>

      <div className="grid grid-cols-1 gap-4">
        {PHOTO_SLOTS.map((photo) => (
          <ImageUploadSlot
            key={photo.key}
            slotKey={photo.key}
            label={photo.label}
            icon={photo.icon}
            required={photo.required}
            preview={previews[photo.key]}
            onSelect={(file) => setPhoto(photo.key as PhotoSlotKey, file)}
          />
        ))}
      </div>

      <NavigationFooter onBack={() => setStep(2)} onNext={onNext} />
    </div>
  );
}
