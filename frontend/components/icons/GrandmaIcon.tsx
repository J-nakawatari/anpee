"use client";

export function GrandmaIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="200" r="150" fill="#fce8e0"/>
      <circle cx="160" cy="180" r="10" fill="#333"/>
      <circle cx="240" cy="180" r="10" fill="#333"/>
      <path d="M150 240 Q200 260 250 240" stroke="#333" strokeWidth="4" fill="none"/>
      <circle cx="120" cy="150" r="30" fill="#d4a373" opacity="0.3"/>
      <circle cx="280" cy="150" r="30" fill="#d4a373" opacity="0.3"/>
    </svg>
  );
}