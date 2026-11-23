"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import CircularProgress from "@mui/material/CircularProgress";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FieldError from "@/components/common/form/FieldError";
import { useToast } from "@/components/common/ToastProvider";
import { authService } from "@/services/auth.service";
import { forgotPasswordSchema } from "@/validations/auth.schema";
import AuthLayout from "./AuthLayout";

export default function ForgotPasswordForm() {
  const toast = useToast();
  const [notice, setNotice] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const forgotMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (_data, { email }) => {
      setNotice(`If an account exists for ${email}, a password reset link is on its way.`);
      reset();
    },
    onError: (error) => {
      if (error?.fieldErrors?.email) {
        setError("email", { message: error.fieldErrors.email });
      } else {
        toast.error(error?.message || "Could not send reset link");
      }
    },
  });

  const onSubmit = (values) => {
    setNotice("");
    forgotMutation.mutate(values);
  };
  const isPending = forgotMutation.isPending;

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Let’s get you back in."
      description="Enter the email address associated with your account to continue."
      switchText="Remembered your password?"
      switchLabel="Back to sign in"
      switchHref="/login"
    >
      <form
        className="mt-9 space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-busy={isPending}
      >
        <label className="block" htmlFor="forgot-email">
          <span className="sd-pub-label">Work email</span>
          <input
            {...register("email")}
            id="forgot-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@yourbusiness.com"
            className="sd-pub-input"
            disabled={isPending}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "forgot-email-error" : undefined}
          />
          <FieldError id="forgot-email-error" message={errors.email?.message} />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="sd-pub-btn sd-pub-btn-primary sd-pub-btn-lg sd-pub-btn-block"
        >
          {isPending && <CircularProgress size={16} color="inherit" thickness={5} />}
          <span>{isPending ? "Sending…" : "Send reset link"}</span>
        </button>

        {notice && (
          <p role="status" className="sd-pub-notice">
            <InfoOutlinedIcon
              sx={{ fontSize: 18 }}
              style={{ color: "var(--brand-text)", flexShrink: 0 }}
            />
            <span>{notice}</span>
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
