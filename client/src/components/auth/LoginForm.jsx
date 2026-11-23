"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import CircularProgress from "@mui/material/CircularProgress";

import FieldError from "@/components/common/form/FieldError";
import { useToast } from "@/components/common/ToastProvider";
import { loginSchema } from "@/validations/auth.schema";

import AuthLayout from "./AuthLayout";
import PasswordInput from "./PasswordInput";
import { loginService } from "@/lib/api/services/authServices";

const allowedFields = ["email", "password"];

export default function LoginForm() {
  const router = useRouter();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
    mode: "onTouched",
  });

  const loginMutation = useMutation({
    mutationFn: loginService,

    onSuccess: (data) => {
      toast.success(data?.message || "Signed in successfully");
      router.replace("/dashboard");
    },

    onError: (error) => {
      const responseData = error?.response?.data ?? error;
      const fieldErrors = responseData?.fieldErrors;

      if (fieldErrors && typeof fieldErrors === "object") {
        let hasFieldErrors = false;

        Object.entries(fieldErrors).forEach(([field, message]) => {
          if (allowedFields.includes(field) && typeof message === "string") {
            setError(field, {
              type: "server",
              message,
            });

            hasFieldErrors = true;
          }
        });

        if (hasFieldErrors) return;
      }

      toast.error(
        responseData?.message || "Something went wrong. Please try again.",
      );
    },
  });

  const onSubmit = (values) => {
    loginMutation.mutate(values);
  };

  const isPending = loginMutation.isPending;

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Good to see you again."
      description="Sign in to pick up where you left off and keep every channel running smoothly."
      switchText="New to SellerDesk?"
      switchLabel="Create an account"
      switchHref="/signup"
    >
      <form
        className="mt-9 space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-busy={isPending}
      >
        {/* Email */}
        <label className="block" htmlFor="login-email">
          <span className="sd-pub-label">Work email</span>

          <input
            {...register("email")}
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@yourbusiness.com"
            className="sd-pub-input"
            disabled={isPending}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-error" : undefined}
          />

          <FieldError id="login-email-error" message={errors.email?.message} />
        </label>

        {/* Password */}
        <label className="block" htmlFor="login-password">
          <span className="sd-pub-label">Password</span>

          <PasswordInput
            {...register("password")}
            id="login-password"
            autoComplete="current-password"
            placeholder="Enter your password"
            disabled={isPending}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
            }
          />

          <FieldError
            id="login-password-error"
            message={errors.password?.message}
          />
        </label>

        {/* Remember me and Forgot password */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <label
            className="inline-flex cursor-pointer items-center gap-2"
            style={{ color: "var(--text-secondary)" }}
          >
            <input
              {...register("remember")}
              type="checkbox"
              className="h-4 w-4"
              disabled={isPending}
              style={{ accentColor: "var(--brand)" }}
            />
            Remember me
          </label>

          <Link href="/forgot-password" className="sd-pub-link">
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="sd-pub-btn sd-pub-btn-primary sd-pub-btn-lg sd-pub-btn-block"
        >
          {isPending && (
            <CircularProgress
              size={16}
              color="inherit"
              thickness={5}
              aria-label="Signing in"
            />
          )}

          <span>{isPending ? "Signing in…" : "Sign in"}</span>
        </button>
      </form>
    </AuthLayout>
  );
}
