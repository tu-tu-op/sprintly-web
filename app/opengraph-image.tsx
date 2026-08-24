import { ImageResponse } from "next/og";

export const alt = "Sprintly — Make progress visible";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(145deg, #181818 0%, #101012 65%)",
          padding: "72px",
          color: "#f2f2f2",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f2f2f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#0b0b0b", fontSize: 26, fontWeight: 700 }}>S</div>
            <div style={{ fontSize: 28, letterSpacing: 6, fontWeight: 600 }}>SPRINTLY</div>
          </div>
          <div style={{ fontSize: 22, color: "#8b8b8b" }}>#Sprintly</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -4, lineHeight: 1.05 }}>Make progress visible.</div>
          <div style={{ marginTop: 24, fontSize: 32, color: "#a3a3a3", maxWidth: 900 }}>
            Private, local-first coding activity and developer progress.
          </div>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[["Streaks", "consistency you can see"], ["Focus", "deep-work signals"], ["Dev Score v1", "versioned & reproducible"]].map(([value, label]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", border: "1px solid #333333", borderRadius: 20, padding: "24px 32px", minWidth: 300 }}>
              <div style={{ fontSize: 34, fontWeight: 700 }}>{value}</div>
              <div style={{ marginTop: 8, fontSize: 20, color: "#8b8b8b" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
