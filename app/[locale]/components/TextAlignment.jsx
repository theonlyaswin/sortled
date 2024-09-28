"use client"; // This tells Next.js this is a Client Component

import { useEffect, useState } from "react";

export default function TextAlignment({ locale, children }) {
  const [textAlign, setTextAlign] = useState("left");

  useEffect(() => {
    // Update text alignment based on locale
    if (locale === "ar") {
      setTextAlign("right");
    } else {
      setTextAlign("left");
    }
  }, [locale]); // Re-run when the locale prop changes

  return (
    <div style={{ textAlign: textAlign }}>
      {children}
    </div>
  );
}
