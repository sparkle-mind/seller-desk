"use client";

import React, { useState } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { contactTopics } from "@/data/marketing";

// UI-only, like the auth screens: there is no contact endpoint on the server
// yet, so submitting shows a notice and sends nothing.
export default function ContactForm() {
  const [notice, setNotice] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setNotice(
      "Thanks for reaching out. This form is a UI-only preview, so your message was not sent or stored yet.",
    );
  };

  return (
    <form className="sd-pub-card space-y-5 p-6 sm:p-8" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="sd-pub-label">Full name</span>
          <input className="sd-pub-input" type="text" name="name" autoComplete="name" placeholder="Aanya Sharma" required />
        </label>
        <label className="block">
          <span className="sd-pub-label">Work email</span>
          <input
            className="sd-pub-input"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@yourbusiness.com"
            required
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="sd-pub-label">Business name</span>
          <input className="sd-pub-input" type="text" name="company" autoComplete="organization" placeholder="Optional" />
        </label>
        <label className="block">
          <span className="sd-pub-label">What can we help with?</span>
          <select className="sd-pub-input" name="topic" defaultValue={contactTopics[0].value}>
            {contactTopics.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="sd-pub-label">Message</span>
        <textarea
          className="sd-pub-input"
          name="message"
          placeholder="Tell us a little about your business and what you need."
          required
        />
      </label>

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5" style={{ color: "var(--text-tertiary)" }}>
          We use your details only to reply to this message.
        </p>
        <button type="submit" className="sd-pub-btn sd-pub-btn-primary sd-pub-btn-lg">
          Send message
          <ArrowForwardIcon className="sd-pub-arrow" sx={{ fontSize: 18 }} />
        </button>
      </div>

      {notice && (
        <p role="status" className="sd-pub-notice">
          <InfoOutlinedIcon sx={{ fontSize: 18 }} style={{ color: "var(--brand-text)", flexShrink: 0 }} />
          <span>{notice}</span>
        </p>
      )}
    </form>
  );
}
