import React from "react";
import AuthPage from "@/components/auth/AuthPage";

export const metadata = {
  title: "Create account | SellerDesk",
  description: "Create your SellerDesk workspace.",
};

export default function SignupPage() {
  return <AuthPage mode="signup" />;
}
