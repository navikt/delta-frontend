"use client";
import { ArrowUpIcon } from "@navikt/aksel-icons";
import { Button } from "@navikt/ds-react";
import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 300;

function ScrollToTop() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowButton(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!showButton) return null;

  return (
    <Button
      variant="primary"
      size="small"
      icon={<ArrowUpIcon aria-hidden />}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 shadow-ax-dialog"
    >
      Til toppen
    </Button>
  );
}

export default ScrollToTop;
