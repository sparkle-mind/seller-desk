import { z } from "zod";

/** Reusable field rules shared across forms. */

export const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(254, "Email is too long")
  .pipe(z.email("Enter a valid email address"))
  .transform((value) => value.toLowerCase());

export const nameField = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(80, "Name must be 80 characters or fewer")
  .regex(/^[\p{L}\p{M}' .-]+$/u, "Name can only contain letters, spaces, apostrophes and hyphens");

// Login only checks presence: rules may change after an account was created.
export const loginPasswordField = z.string().min(1, "Password is required");

export const newPasswordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer")
  .regex(/[A-Za-z]/, "Password must include at least one letter")
  .regex(/\d/, "Password must include at least one number");
