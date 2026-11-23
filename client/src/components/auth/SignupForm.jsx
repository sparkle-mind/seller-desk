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
import { signupSchema } from "@/validations/auth.schema";
import AuthLayout from "./AuthLayout";
import PasswordInput from "./PasswordInput";
import { registerService } from "@/lib/api/services/authServices";

const allowedFields = ["name", "email", "password"];

export default function SignupForm() {
  const router = useRouter();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const signupMutation = useMutation({
    mutationFn: registerService,

    onSuccess: (data) => {
      toast.success(data?.message || "Account created. Please sign in.");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(error?.message || "Something went wrong. Please try again.");
    },
  });

  const onSubmit = (values) => {
    signupMutation.mutate(values);
  };

  const isPending = signupMutation.isPending;

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Your business, in sync."
      description="One clear view of your products, orders, stock, and marketplace performance."
      switchText="Already have an account?"
      switchLabel="Sign in"
      switchHref="/login"
    >
      <form
        className="mt-9 space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-busy={isPending}
      >
        {/* Name */}
        <label className="block" htmlFor="signup-name">
          <span className="sd-pub-label">Your name</span>

          <input
            {...register("name")}
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="e.g. Aanya Sharma"
            className="sd-pub-input"
            disabled={isPending}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "signup-name-error" : undefined}
          />

          <FieldError id="signup-name-error" message={errors.name?.message} />
        </label>

        {/* Email */}
        <label className="block" htmlFor="signup-email">
          <span className="sd-pub-label">Work email</span>

          <input
            {...register("email")}
            id="signup-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@yourbusiness.com"
            className="sd-pub-input"
            disabled={isPending}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "signup-email-error" : undefined}
          />

          <FieldError id="signup-email-error" message={errors.email?.message} />
        </label>

        {/* Password */}
        <label className="block" htmlFor="signup-password">
          <span className="sd-pub-label">Password</span>

          <PasswordInput
            {...register("password")}
            id="signup-password"
            autoComplete="new-password"
            placeholder="8+ characters, with a letter and a number"
            disabled={isPending}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "signup-password-error" : undefined
            }
          />

          <FieldError
            id="signup-password-error"
            message={errors.password?.message}
          />
        </label>

        {/* Terms and Privacy */}
        <p
          className="text-xs leading-5"
          style={{ color: "var(--text-tertiary)" }}
        >
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="sd-pub-link">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="sd-pub-link">
            Privacy Policy
          </Link>
          .
        </p>

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
              aria-label="Creating account"
            />
          )}

          <span>{isPending ? "Creating account…" : "Create account"}</span>
        </button>
      </form>
    </AuthLayout>
  );
}
