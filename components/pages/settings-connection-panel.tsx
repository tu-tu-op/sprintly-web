"use client";

import { useEffect, useState } from "react";
import { Download, HeartPulse, Radar, RefreshCw } from "lucide-react";

import { useSprintly } from "@/components/sprintly-provider";
import { downloadTextFile } from "@/lib/sprintly/storage";

function Pill({ children, tone = "gray" }: { children: React.ReactNode; tone?: "green" | "gray" }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${tone === "green" ? "border-[#d0d0d0]/25 bg-[#d0d0d0]/[.08] text-[#e0e0e0]" : "border-white/10 bg-white/[.035] text-[#9c9c9c]"}`}>{children}</span>;
}

export function SettingsConnectionPanel() {
  const { repositoryMode, syncLoading, syncError, lastSyncAt, listExtensionDevices, createPairingCode, revokeExtensionDevice, testConnection, exportSynchronizedData } = useSprintly();
  const [devices, setDevices] = useState<Awaited<ReturnType<typeof listExtensionDevices>>>([]);
  const [pairing, setPairing] = useState<Awaited<ReturnType<typeof createPairingCode>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const refreshDevices = async () => {
    if (repositoryMode === "local") return;
    try { setDevices(await listExtensionDevices()); } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to load devices"); }
  };
  useEffect(() => { void refreshDevices(); }, [repositoryMode]);

  const startPairing = async () => { setBusy(true); setStatus(null); try { setPairing(await createPairingCode()); } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to create pairing code"); } finally { setBusy(false); } };
  const test = async () => { setBusy(true); try { const result = await testConnection(); setStatus(result.ok ? "Connection test passed" : "Connection is unavailable"); } catch (error) { setStatus(error instanceof Error ? error.message : "Connection test failed"); } finally { setBusy(false); } };
  const revoke = async (deviceId: string) => { if (!window.confirm("Revoke this extension device?")) return; setBusy(true); try { await revokeExtensionDevice(deviceId); await refreshDevices(); setStatus("Device revoked"); } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to revoke device"); } finally { setBusy(false); } };
  const exportRemote = async () => { try { downloadTextFile("sprintly-synchronized-sessions.json", await exportSynchronizedData()); setStatus("Synchronized export prepared"); } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to export synchronized data"); } };

  return <section className="panel p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="mono text-[10px] uppercase tracking-[.16em] text-[#bdbdbd]">Extension bridge</p><h2 className="mt-2 text-base font-semibold">Connect VS Code</h2><p className="mt-2 max-w-xl text-xs leading-5 text-[#858585]">Synced does not mean public. Only validated aggregate activity is stored. Source code, keystrokes, secrets, prompt contents, and full terminal output are never stored.</p></div><Pill tone={repositoryMode === "remote" ? "green" : "gray"}>{repositoryMode === "remote" ? "Supabase connected" : "Local-only mode"}</Pill></div><div className="mt-5 flex flex-wrap gap-2"><button onClick={() => void startPairing()} disabled={busy || repositoryMode === "local"} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#f2f2f2] px-3 text-xs font-semibold text-[#0b0b0b] disabled:opacity-40"><Radar className="size-4" /> Connect extension</button><button onClick={() => void test()} disabled={busy || repositoryMode === "local"} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/[.1] px-3 text-xs disabled:opacity-40"><HeartPulse className="size-4" /> Test connection</button><button onClick={() => void exportRemote()} disabled={busy || repositoryMode === "local"} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/[.1] px-3 text-xs disabled:opacity-40"><Download className="size-4" /> Export synced data</button></div>{pairing && <div className="mt-4 rounded-xl border border-[#d0d0d0]/25 p-4"><p className="text-xs font-medium">Enter this code in the Sprintly extension</p><p className="mono mt-2 text-2xl tracking-[.22em]">{pairing.code}</p><p className="mt-2 text-[11px] text-[#8b8b8b]">Expires in {pairing.expiresInSeconds}s. The device token is returned only after the one-time exchange.</p></div>}{(status || syncError) && <p className="mt-3 text-xs text-[#bdbdbd]">{status || syncError}</p>}<div className="mt-5 rounded-xl border border-white/[.07] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-medium">Connection status</p><p className="mt-1 text-[11px] text-[#7d7d7d]">{syncLoading ? "Refreshing synchronized history..." : lastSyncAt ? `Last sync ${new Date(lastSyncAt).toLocaleString()}` : "No synchronized session received yet"}</p></div><button onClick={() => void refreshDevices()} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/[.09] px-3 text-[11px]"><RefreshCw className="size-3.5" /> Refresh</button></div>{devices.length ? <div className="mt-4 space-y-2">{devices.map((device) => <div key={device.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[.06] px-3 py-3"><div><p className="text-xs font-medium">{device.device_name}</p><p className="mt-1 text-[10px] text-[#777777]">{device.device_type} - {device.last_seen_at ? new Date(device.last_seen_at).toLocaleString() : "Not seen yet"}{device.revoked_at ? " - Revoked" : ""}</p></div>{!device.revoked_at && <button onClick={() => void revoke(device.id)} className="min-h-9 rounded-lg border border-[#b7b7b7]/25 px-3 text-[11px]">Revoke</button>}</div>)}</div> : <p className="mt-4 text-xs text-[#777777]">No paired devices.</p>}</div></section>;
}

