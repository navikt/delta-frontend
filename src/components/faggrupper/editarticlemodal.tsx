"use client"
import { useRef } from "react";
import { BodyLong, Button, Heading, Link, Modal } from "@navikt/ds-react";
import {PencilIcon} from "@navikt/aksel-icons";

function EditArticleModal({ articlepath }: { articlepath: string }) {
    const ref = useRef<HTMLDialogElement>(null);

    return (
        <div>
            <Button className="mx-4 mt-8 mb-10" variant="secondary"  size="small" onClick={() => ref.current?.showModal()}><PencilIcon className="inline " title="rediger" fontSize="1.2rem" /> Rediger</Button>

            <Modal ref={ref} header={{ heading: "Rediger faggruppe" }}>
                <Modal.Body>
                        <div className="my-1">
                            <Heading level="2" size="medium" spacing>A) Vi gjør det sammen 😃</Heading>
                            <Link target="_blank" href="https://forms.office.com/e/LyKPTdaRw5">
                                Skjema for å redigere faggruppe.
                            </Link>

                            <p className="mt-5">
                                Fyll inn skjemaet med følgende informasjon:
                            </p>
                            <ul className="list-disc list-inside mt-4">
                                <li>Navn på faggruppe</li>
                                <li className="pt-1">Ønsket endring</li>
                            </ul>

                            <Heading level="2" size="medium" spacing className="mt-8">B) Gjør det selv 🛠️</Heading>
                            <Link href={`https://github.com/navikt/delta-frontend/tree/main/public/faggrupper/${articlepath}.md`}>
                                Rediger på Github.
                            </Link>
                        </div>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default EditArticleModal;