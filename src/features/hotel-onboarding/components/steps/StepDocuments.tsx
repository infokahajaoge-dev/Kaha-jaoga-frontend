"use client";

/* eslint-disable react-hooks/incompatible-library */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import {
  documentsStepSchema,
  type DocumentsStepValues,
} from "../../schemas/documents.schema";
import { useOnboardingStore } from "../../store/onboarding.store";
import { DocumentUploadSlot } from "../DocumentUploadSlot";
import { NavigationFooter } from "../NavigationFooter";

const inputClass =
  "w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm";
const inputErrorClass =
  "w-full p-3 bg-red-50 border border-red-300 rounded-2xl outline-none focus:ring-2 focus:ring-red-400 font-bold text-sm";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs font-bold mt-1">{message}</p>;
}

export function StepDocuments() {
  const documentsMeta = useOnboardingStore((s) => s.documentsMeta);
  const docs = useOnboardingStore((s) => s.docs);
  const docNames = useOnboardingStore((s) => s.docNames);
  const patchDocumentsMeta = useOnboardingStore((s) => s.patchDocumentsMeta);
  const setDoc = useOnboardingStore((s) => s.setDoc);
  const setStep = useOnboardingStore((s) => s.setStep);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<DocumentsStepValues>({
    resolver: yupResolver(documentsStepSchema),
    defaultValues: documentsMeta,
  });

  useEffect(() => {
    reset(documentsMeta);
  }, [documentsMeta, reset]);

  const gstNumber = watch("gst_number") || "";

  const onNext = handleSubmit(
    (values) => {
      if (!docs.gst || !docs.aadhaar) {
        toast.error("Please upload both documents!");
        return;
      }
      if (
        docs.gst.type !== "application/pdf" ||
        docs.aadhaar.type !== "application/pdf"
      ) {
        toast.error("GST and Aadhaar must be PDF files.");
        return;
      }
      patchDocumentsMeta(values);
      setStep(6);
    },
    () => {
      toast.error("Please enter valid GST and Aadhaar numbers.");
    }
  );

  return (
    <div className="space-y-4 md:space-y-5">
      <h2 className="text-xl md:text-2xl font-black tracking-tight">
        📄 Legal Documents
      </h2>
      <p className="text-slate-400 font-medium text-sm">
        Required for verification. All documents are kept strictly confidential.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-blue-700 font-bold text-sm">
          🔒 Your documents are encrypted and only visible to our verification
          team.
        </p>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
          GST Number *
        </label>
        <input
          type="text"
          placeholder="e.g. 22AAAAA0000A1Z5"
          maxLength={15}
          value={gstNumber}
          onChange={(e) =>
            setValue("gst_number", e.target.value.toUpperCase(), {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          className={`${errors.gst_number ? inputErrorClass : inputClass} uppercase`}
          aria-invalid={Boolean(errors.gst_number)}
        />
        <FieldError message={errors.gst_number?.message} />
      </div>

      <DocumentUploadSlot
        slot="gst"
        hasFile={Boolean(docs.gst)}
        fileName={docNames.gst}
        emptyTitle="GST Certificate *"
        emptyIcon="📄"
        onSelect={(file) => setDoc("gst", file)}
      />

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
          Aadhaar Number *
        </label>
        <input
          type="text"
          placeholder="XXXX XXXX XXXX"
          maxLength={12}
          className={
            errors.owner_aadhaar_number ? inputErrorClass : inputClass
          }
          aria-invalid={Boolean(errors.owner_aadhaar_number)}
          {...register("owner_aadhaar_number")}
        />
        <FieldError message={errors.owner_aadhaar_number?.message} />
      </div>

      <DocumentUploadSlot
        slot="aadhaar"
        hasFile={Boolean(docs.aadhaar)}
        fileName={docNames.aadhaar}
        emptyTitle="Aadhaar Card *"
        emptyIcon="🪪"
        onSelect={(file) => setDoc("aadhaar", file)}
      />

      <NavigationFooter
        onBack={() => {
          patchDocumentsMeta(getValues());
          setStep(4);
        }}
        onNext={onNext}
      />
    </div>
  );
}
