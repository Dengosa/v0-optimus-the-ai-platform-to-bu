"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer, ShieldCheck } from "lucide-react";

export type ApplicationRecord = {
  type: string; // e.g. "Section 22 Renewal", "NSFAS Application"
  appliedOn: string; // ISO date, e.g. "2026-03-14"
  status: "Submitted" | "Pending" | "Under Review" | "Approved" | "Denied";
  reference?: string;
};

interface ProofOfApplicationProps {
  holderName: string;
  records: ApplicationRecord[];
}

/**
 * Encodes application history directly into the QR code itself (no live
 * server lookup at scan time). This is intentional: the proof needs to be
 * readable even if Kommune's backend is down, the holder has no data, or
 * the scanning party has no internet access — common realities for this
 * audience. Anyone with a QR scanner can read it offline.
 *
 * Tradeoff: because there's no live link, this CANNOT be "verified" by a
 * third party as authentic or current — it's a self-reported snapshot at
 * generation time, not a live-validated credential. The card makes this
 * explicit so it isn't mistaken for an official document.
 */
function encodeProof(holderName: string, records: ApplicationRecord[]): string {
  const lines = [
    `KOMMUNE PROOF OF APPLICATION — SELF-REPORTED, NOT OFFICIAL`,
    `Holder: ${holderName}`,
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    `---`,
    ...records.map(
      (r) =>
        `${r.type} | Applied: ${r.appliedOn} | Status: ${r.status}${r.reference ? ` | Ref: ${r.reference}` : ""}`
    ),
  ];
  return lines.join("\n");
}

export function ProofOfApplicationQR({ holderName, records }: ProofOfApplicationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const payload = encodeProof(holderName, records);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, payload, { width: 220, margin: 1 }, (err) => {
      if (err) setError("Too much data for one QR code — trim older entries.");
      else setError(null);
    });
  }, [payload]);

  function handleDownload() {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `kommune-proof-${holderName.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  }

  function handlePrint() {
    if (!canvasRef.current) return;
    const qrDataUrl = canvasRef.current.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;

    const rows = records
      .map(
        (r) => `
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #ddd;">${r.type}</td>
          <td style="padding:8px 12px; border-bottom:1px solid #ddd;">${r.appliedOn}</td>
          <td style="padding:8px 12px; border-bottom:1px solid #ddd;">${r.status}</td>
          <td style="padding:8px 12px; border-bottom:1px solid #ddd;">${r.reference ?? "—"}</td>
        </tr>`
      )
      .join("");

    win.document.write(`
      <html>
        <head>
          <title>Kommune Proof of Application — ${holderName}</title>
          <style>
            body { font-family: -apple-system, sans-serif; padding: 32px; color: #0f0f0f; max-width: 700px; margin: 0 auto; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            .meta { font-size: 13px; color: #555; margin-bottom: 20px; }
            .notice { font-size: 12px; background: #fff8e1; border: 1px solid #f0c14b; border-radius: 8px; padding: 12px 16px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px; }
            th { text-align: left; padding: 8px 12px; border-bottom: 2px solid #0f0f0f; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #666; }
            .qr-block { text-align: center; margin-top: 28px; }
            .qr-block img { width: 180px; height: 180px; }
            .qr-caption { font-size: 11px; color: #666; margin-top: 8px; }
            @media print { body { padding: 0.5in; } }
          </style>
        </head>
        <body>
          <h1>Kommune Proof of Application</h1>
          <div class="meta">Holder: ${holderName} &nbsp;|&nbsp; Generated: ${new Date().toISOString().slice(0, 10)}</div>
          <div class="notice">
            This is a self-reported summary, not an official government record. It cannot be
            independently verified by whoever reads it — treat it as supporting evidence of
            engagement with a process, not proof of legal status.
          </div>
          <table>
            <thead><tr><th>Application</th><th>Date Applied</th><th>Status</th><th>Reference</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="qr-block">
            <img src="${qrDataUrl}" />
            <div class="qr-caption">Scan to read this same record offline, no internet required.</div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-1">
        <ShieldCheck className="w-5 h-5 text-foreground" />
        <h2 className="text-xl font-display">Proof of Application</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        A scannable record of everything you've applied for, and when — useful to show a
        landlord, employer, or official that you have an active case. Works offline once
        downloaded; no internet needed to scan it.
      </p>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="rounded-xl border border-foreground/10 bg-secondary/20 p-4 shrink-0">
          <canvas ref={canvasRef} />
          {error && <p className="mt-2 text-xs text-red-600 max-w-[220px]">{error}</p>}
        </div>

        <div className="flex-1 w-full">
          <div className="space-y-2 mb-4">
            {records.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-foreground/10 bg-secondary/20 px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium">{r.type}</div>
                  <div className="text-xs text-muted-foreground">Applied {r.appliedOn}</div>
                </div>
                <span
                  className={`font-mono text-xs px-2.5 py-1 rounded-full border ${
                    r.status === "Approved"
                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                      : r.status === "Denied"
                      ? "bg-red-500/10 text-red-600 border-red-500/20"
                      : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-foreground/90"
            >
              <Download className="w-4 h-4" />
              Download QR
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-4 py-2 text-sm font-medium hover:bg-foreground/5"
            >
              <Printer className="w-4 h-4" />
              Print copy
            </button>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            This is a self-reported snapshot, not an official government record. It cannot be
            independently verified by whoever scans it — treat it as supporting evidence, not proof
            of legal status.
          </p>
        </div>
      </div>
    </div>
  );
}
