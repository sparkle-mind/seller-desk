import React from "react";
import LegalPage from "@/components/public/LegalPage";

export const metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you use SellerDesk.",
};

// Template copy: have it reviewed by legal counsel before launch.
const sections = [
  {
    id: "agreement",
    heading: "Agreement",
    paragraphs: [
      "By creating an account or using SellerDesk, you agree to these terms. If you use SellerDesk on behalf of a business, you confirm you are allowed to accept them for that business.",
    ],
  },
  {
    id: "your-account",
    heading: "Your account",
    list: [
      "Keep your sign-in details secure and let us know about any unauthorised use.",
      "Provide accurate information and keep it up to date.",
      "You are responsible for activity that happens under your account.",
    ],
  },
  {
    id: "your-data",
    heading: "Your data",
    paragraphs: [
      "You own the business records you add to SellerDesk. You give us permission to store and process them only to provide the service to you.",
    ],
  },
  {
    id: "acceptable-use",
    heading: "Acceptable use",
    list: [
      "Do not use SellerDesk for anything unlawful or to infringe the rights of others.",
      "Do not attempt to disrupt, overload or gain unauthorised access to the service.",
      "Follow the policies of the marketplaces you sell on.",
    ],
  },
  {
    id: "plans-and-billing",
    heading: "Plans and billing",
    paragraphs: [
      "Paid plans are billed in advance for each billing period. You can change or cancel your plan at any time, and changes take effect from the next billing period.",
    ],
  },
  {
    id: "liability",
    heading: "Liability",
    paragraphs: [
      "SellerDesk helps you organise your business, but marketplace figures, fees and payouts remain the responsibility of each marketplace. Please confirm important numbers with the source before acting on them.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title={
        <>
          Terms of <em>Service</em>
        </>
      }
      description="The ground rules for using SellerDesk, in plain language."
      updated="November 2026"
      sections={sections}
    />
  );
}
