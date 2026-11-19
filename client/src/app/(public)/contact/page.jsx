import React from "react";
import Link from "next/link";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import PageHero from "@/components/public/PageHero";
import ContactForm from "@/components/public/ContactForm";
import { contactTopics } from "@/data/marketing";

export const metadata = {
  title: "Contact",
  description: "Talk to the SellerDesk team about demos, support or partnerships.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let&apos;s talk about <em>your business.</em>
          </>
        }
        description="Whether you're comparing plans, stuck on a setting or want to work together, send us a note and a real person will get back to you."
      />

      <section className="pb-20 sm:pb-28">
        <div className="sd-pub-container grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          <div className="space-y-4">
            {contactTopics.map(({ value, title, description, Icon }) => (
              <div key={value} className="sd-pub-card sd-pub-reveal flex gap-4 p-5 sm:p-6">
                <span className="sd-pub-icon">
                  <Icon sx={{ fontSize: 21 }} />
                </span>
                <div>
                  <h2 className="sd-pub-h3" style={{ fontSize: "1.12rem", color: "var(--text-primary)" }}>
                    {title}
                  </h2>
                  <p className="mt-1 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                    {description}
                  </p>
                </div>
              </div>
            ))}

            <div
              className="flex items-start gap-3 rounded-2xl p-5 text-sm leading-6"
              style={{ border: "1px dashed var(--border-strong)", color: "var(--text-secondary)", borderRadius: 16 }}
            >
              <ScheduleOutlinedIcon sx={{ fontSize: 20 }} style={{ color: "var(--brand-text)", marginTop: 2 }} />
              <p>
                We usually reply within one business day. Already a customer? You can also{" "}
                <Link href="/login" className="sd-pub-link">
                  sign in
                </Link>{" "}
                to your workspace.
              </p>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
