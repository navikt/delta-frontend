"use client";

import { Category } from "@/types/event";
import { FunnelIcon } from "@navikt/aksel-icons";
import { UNSAFE_Combobox, debounce } from "@navikt/ds-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useState, useTransition } from "react";

type Props = {
  allCategories: Category[];
};

export function CategoryFilter({ allCategories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categories = searchParams.get("categories");
  // TODO prefill selected categories
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [isPending, startTransition] = useTransition();

  const debouncedUpdateUrl = (categories: Category[]) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (!categories || categories.length === 0) {
      current.delete("categories");
    } else {
      current.set(
        "categories",
        categories.map((category) => category.id).join(","),
      );
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    startTransition(() => {
      router.replace(`${pathname}${query}`);
    });
  };

  const handleToggleSelected = (categoryName: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedCategories((categories) => {
        const newCategories = [
          ...categories,
          allCategories.find((category) => category.name === categoryName)!,
        ];

        debouncedUpdateUrl(newCategories);
        return newCategories;
      });
    } else {
      setSelectedCategories((categories) => {
        const newCategories = categories.filter(
          (category) => category.name !== categoryName,
        );

        debouncedUpdateUrl(newCategories);
        return newCategories;
      });
    }
  };

  return (
    <div className="w-full md:w-fit flex items-center flex-wrap flex-row-reverse md:flex-row gap-2">
      <span className="gap-2 items-center hidden md:flex">
        <FunnelIcon />
        <label className="font-bold">Filtrer på kategori</label>
      </span>
      <UNSAFE_Combobox
        className="w-full md:w-fit"
        size="small"
        label="Filtrer på kategori"
        // hideLabel={!isMobile}
        hideLabel
        options={allCategories.map((category) => category.name)}
        selectedOptions={selectedCategories.map((category) => category.name)}
        onToggleSelected={handleToggleSelected}
        isMultiSelect
        shouldAutocomplete
      />
    </div>
  );
}
