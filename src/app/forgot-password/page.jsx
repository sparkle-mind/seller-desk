import React from "react";
import AuthPage from "@/components/auth/AuthPage";

export const metadata = {
  title: "Reset password | SellerDesk",
  description: "Continue recovering access to your SellerDesk account.",
};

export default function ForgotPasswordPage() {
  return <AuthPage mode="forgot" />;
}
