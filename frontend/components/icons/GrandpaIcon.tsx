"use client";

export function GrandpaIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="200" r="150" fill="#f4e8d0"/>
      <circle cx="160" cy="180" r="10" fill="#333"/>
      <circle cx="240" cy="180" r="10" fill="#333"/>
      <path d="M150 240 Q200 260 250 240" stroke="#333" strokeWidth="4" fill="none"/>
      <path d="M120 150 Q200 100 280 150" stroke="#999" strokeWidth="3" fill="none"/>
    </svg>
  );
}