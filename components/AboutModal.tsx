"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resetApp } from "@/lib/resetApp";

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
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
                ogni corpo è diverso, eh, che non mi si venga a dire).
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
              onClick={() => {
                if (
                  confirm(
                    "Confermando eliminerai l'account e tutti i dati collegati. Procedere?"
                  )
                ) {
                  resetApp();
                }
              }}
            >
              Elimina account
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
