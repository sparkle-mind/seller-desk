import React from "react";
import AuthPage from "@/components/auth/AuthPage";

export const metadata = {
  title: "Sign in | SellerDesk",
  description: "Sign in to your SellerDesk workspace.",
};

export default function LoginPage() {
  return <AuthPage mode="login" />;
}
