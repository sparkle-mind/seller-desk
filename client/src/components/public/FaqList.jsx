import React from "react";
import AddIcon from "@mui/icons-material/Add";

// Native <details> accordion: keyboard accessible and works without JS.
export default function FaqList({ items }) {
  return (
    <div className="border-t" style={{ borderColor: "var(--border)" }}>
      {items.map((item, index) => (
        <details key={item.question} className="sd-pub-faq" open={index === 0}>
          <summary>
            <span>{item.question}</span>
            <span className="sd-pub-faq-icon" aria-hidden="true">
              <AddIcon sx={{ fontSize: 18 }} />
            </span>
          </summary>
          <p className="sd-pub-faq-answer sd-pub-body">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
