import { supabase } from "./supabaseClient";
import { getCurrentProfile, type Profile } from "./profileService";

interface ConsumptionRecord {
  id: string;
  drink_id: string;
  drink_name: string;
  quantity: number;
  units: number;
  timestamp: string;
}

interface ExportData {
  profile: Profile;
  consumption: ConsumptionRecord[];
  exportDate: string;
  version: string;
}

/**
 * Fetches all user data for export
 */
export async function exportUserData(): Promise<ExportData | null> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return null;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    return null;
  }

  // Fetch consumption records with drink names
  const { data: consumption, error } = await supabase
    .from("consumption")
    .select("id, drink_id, quantity, units, timestamp, drinks(name)")
    .eq("user_id", session.user.id)
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Error fetching consumption data:", error);
    return null;
  }

  const consumptionRecords: ConsumptionRecord[] = (consumption || []).map((c) => {
    // Handle drinks relation - can be object or null depending on Supabase query
    const drinks = c.drinks as unknown as { name: string } | null;
    return {
      id: c.id,
      drink_id: c.drink_id,
      drink_name: drinks?.name || "Unknown",
      quantity: c.quantity,
      units: c.units,
      timestamp: c.timestamp,
    };
  });

  return {
    profile,
    consumption: consumptionRecords,
    exportDate: new Date().toISOString(),
    version: "1.0",
  };
}

/**
 * Downloads data as JSON file
 */
export function downloadAsJSON(data: ExportData): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `birrino-export-${data.profile.display_name}-${formatDateForFilename(data.exportDate)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads data as CSV file
 */
export function downloadAsCSV(data: ExportData): void {
  const headers = ["Data", "Bevanda", "Quantità", "Unità"];
  const rows = data.consumption.map((c) => [
    formatDateForCSV(c.timestamp),
    c.drink_name,
    c.quantity.toString(),
    c.units.toFixed(2),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCSVField).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `birrino-export-${data.profile.display_name}-${formatDateForFilename(data.exportDate)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escapes a field for CSV format
 */
function escapeCSVField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Formats date for filename (YYYY-MM-DD)
 */
function formatDateForFilename(isoString: string): string {
  const date = new Date(isoString);
  return date.toISOString().split("T")[0];
}

/**
 * Formats date for CSV display
 */
function formatDateForCSV(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("it-IT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
