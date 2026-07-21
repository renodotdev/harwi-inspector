"use client";

import { Button } from "./ui";

export function PrintButton() {
  return (
    <Button variant="secondary" onClick={() => window.print()}>
      <span className="sm:hidden">Print</span>
      <span className="hidden sm:inline">Print / Save PDF</span>
    </Button>
  );
}
