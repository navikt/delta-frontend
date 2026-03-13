"use client"
import { useRef } from "react";
import { BodyLong, Button, Modal } from "@navikt/ds-react";
import {PencilIcon} from "@navikt/aksel-icons";
import Link from "next/link";

// @ts-ignore
function EditArticleModal({ articlepath }) {
    const ref = useRef<HTMLDialogElement>(null);

    return (
        <div>
            <Button className="mx-4 mt-8 mb-10" variant="secondary"  size="small" onClick={() => ref.current?.showModal()}><PencilIcon className="inline " title="rediger" fontSize="1.2rem" /> Rediger</Button>

            <Modal ref={ref} header={{ heading: "Rediger faggruppe" }}>
                <Modal.Body>
                        <div className="my-1">
                            <h2 className="text-2xl  font-ax-bold text-ax-brand-blue-600 mb-4">A) Vi gjør det sammen 😃</h2>
                            <Link target="_blank" href="https://forms.office.com/e/LyKPTdaRw5"
                                  className="text-ax-brand-blue-600 underline hover:no-underline">
                                Skjema for å redigere faggruppe.
                            </Link>

                            <p className="mt-5">
                                Fyll inn skjemaet med følgende informasjon:
                            </p>
                            <ul className="list-disc list-inside mt-4">
                                <li>Navn på faggruppe</li>
                                <li className="pt-1">Ønsket endring</li>
                            </ul>

                            <h2 className="text-2xl  mt-8 mb-4 font-ax-bold text-ax-brand-blue-600">B) Gjør det selv 🛠️</h2>
                            <Link href={`https://github.com/navikt/delta-frontend/tree/main/public/faggrupper/${articlepath}.md`}
                                  className="text-ax-brand-blue-600 underline hover:no-underline">
                                Rediger på Github.
                            </Link>
                        </div>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default EditArticleModal;