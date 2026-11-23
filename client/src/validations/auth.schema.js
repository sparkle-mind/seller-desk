import { z } from "zod";
import { emailField, loginPasswordField, nameField, newPasswordField } from "./common.schema";

export const loginSchema = z.object({
  email: emailField,
  password: loginPasswordField,
  remember: z.boolean(),
});

export const signupSchema = z.object({
  name: nameField,
  email: emailField,
  password: newPasswordField,
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});
