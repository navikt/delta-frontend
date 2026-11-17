"use client";
import { DeltaParticipant, SignupOption } from "@/types/event";
import { optionById } from "@/service/signupOptions";
import { ChevronDownIcon, EnvelopeClosedIcon, FileExcelIcon } from "@navikt/aksel-icons";
import { Button, CopyButton, Dropdown, Link } from "@navikt/ds-react";
import ExcelJS from "exceljs";

type ExportParticipantsProps = { participants: DeltaParticipant[]; signupOptions?: SignupOption[] };

export default function ExportParticipants(
  participants: ExportParticipantsProps,
) {
  const copyEmails = participants.participants.map((p) => p.email).join(";");
  const sendEmails = participants.participants.map((p) => p.email).join(", ");

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Participants");

    const options = participants.signupOptions ?? [];
    worksheet.columns = [
      { header: "Email", key: "email", width: 30 },
      ...(options.length ? [{ header: "Deltar som", key: "option", width: 30 }] : []),
    ];

    participants.participants.forEach((p) => {
      worksheet.addRow({ email: p.email, option: optionById(options, p.signupOptionId)?.label ?? "" });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "participants.xlsx";
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dropdown>
      <Button as={Dropdown.Toggle} variant="secondary" className="w-full">
        <span className="flex flex-row gap-1 whitespace-nowrap items-center">
          Eksporter <ChevronDownIcon aria-hidden className="h-6 w-6" />
        </span>
      </Button>
      <Dropdown.Menu>
        <Dropdown.Menu.List>
          <CopyButton
            className="w-full justify-start px-2"
            size="small"
            copyText={copyEmails}
            text="Kopier alle e-postadresser"
          />
          <Dropdown.Menu.List.Item
            className={`
              aksel-copybutton--small aksel-copybutton--neutral
              no-underline text-ax-text-neutral-subtle hover:text-ax-text-neutral
              hover:bg-ax-bg-neutral-moderate-hoverA w-full justify-start px-2
            `}
            as={Link}
            href={`mailto:${sendEmails}`}
          >
            <span className="aksel-copybutton__content">
              <EnvelopeClosedIcon aria-hidden className="aksel-copybutton__icon" />
              <span className="aksel-label aksel-label--small ml-1">
                Send e-post til deltakere
              </span>
            </span>
          </Dropdown.Menu.List.Item>
          <Dropdown.Menu.List.Item
            className=" aksel-copybutton--small aksel-copybutton--neutral
              no-underline text-ax-text-neutral-subtle hover:text-ax-text-neutral
              hover:bg-ax-bg-neutral-moderate-hoverA w-full justify-start px-2"
            onClick={exportToExcel}
          >
            <span className="aksel-copybutton__content">
              <FileExcelIcon aria-hidden />
              <span className="aksel-label aksel-label--small">
                Eksporter til Excel
              </span>
            </span>
          </Dropdown.Menu.List.Item>
        </Dropdown.Menu.List>
      </Dropdown.Menu>
    </Dropdown>
  );
}