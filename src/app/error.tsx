"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, RefreshCw } from "lucide-react";
import { MagneticButton } from "@/components/motion/MagneticButton";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AETHERIA Error Boundary]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[1440px] flex-col justify-center px-5 py-20 md:px-8">
      <div className="rounded-[30px] border border-line-strong bg-surface p-8 sm:p-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 font-mono text-[10.5px] font-semibold tracking-[0.18em] text-accent">
          <AlertTriangle className="size-3.5" />
          TELEMETRY INTERRUPTED {"//"} ARCHIVE RECOVERY MODE
        </div>

        <h1 className="mt-6 font-display text-[40px] leading-tight text-ink sm:text-[54px]">
          Temporary Archive Telemetry{" "}
          <em className="font-normal italic text-accent">Interruption.</em>
        </h1>
        <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-muted">
          An unexpected rendering exception occurred while synchronizing this view. Your collector
          bag, wishlist, and serialized session state remain intact.
        </p>
        {error?.digest && (
          <p className="mt-3 font-mono text-[11px] tracking-[0.16em] text-muted">
            DIGEST REFERENCE: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <MagneticButton type="button" size="lg" onClick={() => reset()}>
            <RefreshCw className="size-4" strokeWidth={1.75} />
            Retry Connection
          </MagneticButton>
          <Link
            href="/shop"
            className="inline-flex h-13 items-center gap-2 rounded-full border border-line-strong bg-canvas px-6 font-mono text-[11px] font-medium tracking-[0.16em] text-ink transition-colors hover:border-ink"
          >
            Browse Full Archive (/shop)
            <ArrowUpRight className="size-4" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </div>
  );
}
