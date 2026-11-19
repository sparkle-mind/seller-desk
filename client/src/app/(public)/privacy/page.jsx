import React from "react";
import LegalPage from "@/components/public/LegalPage";

export const metadata = {
  title: "Privacy Policy",
  description: "How SellerDesk collects, uses and protects your information.",
};

// Template copy: have it reviewed by legal counsel before launch.
const sections = [
  {
    id: "overview",
    heading: "Overview",
    paragraphs: [
      "This policy explains what information SellerDesk collects when you use our website and workspace, how we use it, and the choices you have.",
    ],
  },
  {
    id: "information-we-collect",
    heading: "Information we collect",
    list: [
      "Account details such as your name, email address and business name.",
      "Business records you add to your workspace, including products, inventory, orders, suppliers and expenses.",
      "Messages you send us through the contact form or support channels.",
      "Basic technical information such as browser type and device, used to keep the service working well.",
    ],
  },
  {
    id: "how-we-use-it",
    heading: "How we use information",
    list: [
      "To provide, maintain and improve the SellerDesk workspace.",
      "To respond to your questions and support requests.",
      "To keep accounts secure and prevent misuse.",
      "To send important service notices about your account.",
    ],
  },
  {
    id: "sharing",
    heading: "Sharing",
    paragraphs: [
      "We do not sell your personal information or your business data. We share information only with service providers who help us run SellerDesk, when you ask us to, or when the law requires it.",
    ],
  },
  {
    id: "your-choices",
    heading: "Your choices",
    paragraphs: [
      "You can update your account details at any time, export your records to CSV from inside the workspace, and ask us to delete your account and its data.",
    ],
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    paragraphs: [
      "If we make meaningful changes, we will update the date at the top of this page and, where appropriate, let you know inside the workspace.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title={
        <>
          Privacy <em>Policy</em>
        </>
      }
      description="Your business data is yours. Here is how we look after it."
      updated="November 2026"
      sections={sections}
    />
  );
}
