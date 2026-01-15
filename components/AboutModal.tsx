"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resetApp } from "@/lib/resetApp";
import { getCurrentProfile, type Profile } from "@/lib/profileService";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { exportUserData, downloadAsJSON, downloadAsCSV } from "@/lib/exportService";
import toast from "react-hot-toast";

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "json" | "csv") => {
    setIsExporting(true);
    try {
      const data = await exportUserData();
      if (!data) {
        toast.error("Errore durante l'esportazione");
        return;
      }
      if (format === "json") {
        downloadAsJSON(data);
      } else {
        downloadAsCSV(data);
      }
      toast.success("Dati esportati con successo!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Errore durante l'esportazione");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (open) {
      getCurrentProfile().then(setProfile);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg mx-auto max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold">
            Unità alcoliche?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 text-sm sm:text-base leading-relaxed">
          <p className="text-gray-700 text-balance">
            Tra aperitivi improvvisati, brindisi seriali e serate infinite, è
            facile perdere il conto. Ma il tuo fegato lo sa benissimo. La
            domanda vera è: quante unità alcoliche ci sono in quello che hai nel
            bicchiere?
          </p>

          <p className="font-medium text-gray-800">Facciamo chiarezza:</p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Cos&apos;è un&apos;unità alcolica?
              </h3>
              <p className="text-gray-700 ">
                È un modo easy per calcolare quanto alcol puro stai assumendo.
                <br />
                <strong>1 unità = 10ml o 8g di alcol puro</strong> – la quantità
                che il corpo medio smaltisce in circa un&apos;ora (Chiaro che
                ogni corpo è diverso eh, che non mi si venga a dire).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Quante unità ci sono nel tuo drink?
              </h3>
              <p className="text-gray-700 mb-2 text-balance">
                Dipende da quanto bevi e da quanto è forte.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                <li>Una birra media strong = 3 unità</li>
                <li>Un gin tonico = poco più di 2 unità</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Obiettivo: bere con testa, non a caso.
              </h3>
              <p className="text-gray-700 mb-2 text-balance">
                Se bevi spesso, ecco le dritte per restare nei limiti:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                <li>
                  Non superare le <strong>14 unità a settimana</strong> (uomini
                  &amp; donne)
                </li>
                <li>
                  Distribuisci su almeno <strong>3 giorni</strong>
                </li>
                <li>
                  Prova a concederti giorni <strong>100% alcol-free</strong>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-center font-medium">
                💡 Per capirci: 14 unità = 5 birre medie chiare <br /> o 10
                bicchieri piccoli di vino light
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                🕒 Timer guida: prendilo con le pinze
              </h3>
              <p className="text-yellow-800 text-sm leading-relaxed">
                Il timer ti dà <strong>un&apos;idea di massima</strong> su
                quando potresti essere ok per guidare, ma è solo una{" "}
                <strong>stima</strong>, eh. Si basa su 1 unità smaltita ogni
                ora, ma <strong>ogni corpo è diverso</strong>: peso, sesso, cosa
                hai mangiato, e pure la genetica contano.
                <br />
                <br />
                <strong>
                  👉 Morale: <br /> Non usare l&apos;app per decidere se puoi
                  guidare davvero.
                </strong>{" "}
                <br />
                Se hai anche solo un dubbio, lascia stare: prendi un taxi, fai
                due passi, o aspetta un po’ di più. Meglio sicuri che pentiti.
              </p>
            </div>
          </div>

          {/* Profile Section */}
          {profile && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </span>
                  {profile.display_name}
                </h3>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500">
                  Per accedere da un altro dispositivo, usa il tuo username e PIN.
                </p>

                {/* Export buttons */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Esporta i tuoi dati:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport("csv")}
                      disabled={isExporting}
                      className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExporting ? "Esportazione..." : "Esporta CSV"}
                    </button>
                    <button
                      onClick={() => handleExport("json")}
                      disabled={isExporting}
                      className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExporting ? "Esportazione..." : "Esporta JSON"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-balance text-xs text-gray-500 text-center">
              Informazioni basate sulle linee guida <br /> del{" "}
              <span className="font-bold">
                <a
                  href="https://www.epicentro.iss.it/alcol/docitalia#:~:text=Linee%20guida%20Trattamento%20del%20Disturbo,pdf%203%2C5%20Mb)."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  Servizio Sanitario Nazionale
                </a>
              </span>
            </p>
            <p
              className="text-center text-xs text-red-600 underline mt-4 cursor-pointer"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Elimina account
            </p>
          </div>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Elimina account"
        description="Confermando eliminerai l'account e tutti i dati collegati. Questa azione non può essere annullata."
        confirmText="Elimina"
        cancelText="Annulla"
        variant="danger"
        onConfirm={resetApp}
      />
    </Dialog>
  );
}
