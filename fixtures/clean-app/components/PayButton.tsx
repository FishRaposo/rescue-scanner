"use client";

export function PayButton() {
  return (
    <button
      onClick={() =>
        fetch("/api/pay", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ amount_cents: 2000, email: "a@b.c" }),
        })
      }
    >
      Pay
    </button>
  );
}
