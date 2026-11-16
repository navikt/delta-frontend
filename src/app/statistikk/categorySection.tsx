"use client";

import { useState } from "react";
import { BarChartIcon, MagnifyingGlassIcon } from "@navikt/aksel-icons";
import { BodyShort, Box, Heading, UNSAFE_Combobox } from "@navikt/ds-react";
import type { CategoryStat } from "@/service/statsActions";
import CategoryModal from "./categoryModal";
import { ClickableStatCard, StatValue } from "./statCard";

export default function CategorySection({
  categoryStats,
  fagtorsdagStat,
  allCategoryStats,
}: {
  categoryStats: CategoryStat[];
  fagtorsdagStat?: CategoryStat;
  allCategoryStats: CategoryStat[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryStat | null>(
    null
  );
  const [customCategoryName, setCustomCategoryName] = useState<string>("");

  const handleCardClick = (category: CategoryStat) => {
    setSelectedCategory(category);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
  };

  const customCategoryStat = allCategoryStats.find(
    (c) => c.category === customCategoryName
  );

  const categoryOptions = allCategoryStats.map((cat) => cat.category);

  const handleCategorySelect = (option: string, isSelected: boolean) => {
    if (isSelected) {
      setCustomCategoryName(option);
    } else {
      setCustomCategoryName("");
    }
  };

  return (
    <>
      <section>
        <Heading level="2" size="medium" spacing>
          Arrangementer per kategori
        </Heading>
        <div className="grid grid-cols-1 ax-md:grid-cols-3 gap-4">
          {/* Main Categories */}
          {categoryStats.map((cat) => (
            <ClickableStatCard
              key={cat.category}
              onClick={() => handleCardClick(cat)}
              icon={<BarChartIcon className="w-6 h-6" />}
              title={cat.category}
              value={cat.count}
              suffix="arrangementer"
              subtitle={`${cat.uniqueParticipants.toLocaleString("nb-NO")} unike deltakere, ${cat.totalParticipants.toLocaleString("nb-NO")} deltakelser totalt`}
            />
          ))}

          {/* Fagtorsdag */}
          {fagtorsdagStat && (
            <ClickableStatCard
              onClick={() => handleCardClick(fagtorsdagStat)}
              icon={<BarChartIcon className="w-6 h-6" />}
              title={fagtorsdagStat.category}
              value={fagtorsdagStat.count}
              suffix="arrangementer"
              subtitle={`${fagtorsdagStat.uniqueParticipants.toLocaleString("nb-NO")} unike deltakere, ${fagtorsdagStat.totalParticipants.toLocaleString("nb-NO")} deltakelser totalt`}
            />
          )}

          {/* Custom Category Selector */}
          <Box background="raised" borderColor="neutral-subtle" borderWidth="1" borderRadius="12" padding="space-24" className="flex flex-col">
            <span aria-hidden className="mb-3 flex text-ax-text-accent">
              <MagnifyingGlassIcon className="w-6 h-6" />
            </span>
            <BodyShort as="h3" size="small" weight="semibold" textColor="subtle" className="mb-3">
              Velg kategori
            </BodyShort>
            <UNSAFE_Combobox
              label="Velg kategori"
              hideLabel
              size="small"
              options={categoryOptions}
              selectedOptions={customCategoryName ? [customCategoryName] : []}
              onToggleSelected={handleCategorySelect}
              className="mb-3"
            />

            {customCategoryStat ? (
              <button
                type="button"
                className="group -m-2 cursor-pointer rounded-ax-8 p-2 text-left transition-colors hover:bg-ax-bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ax-border-focus"
                onClick={() => handleCardClick(customCategoryStat)}
              >
                <StatValue value={customCategoryStat.count} suffix="arrangementer" />
                <BodyShort as="span" size="small" textColor="subtle" className="mt-1 block">
                  {customCategoryStat.uniqueParticipants.toLocaleString("nb-NO")} unike deltakere, {customCategoryStat.totalParticipants.toLocaleString("nb-NO")} deltakelser totalt
                </BodyShort>
                <BodyShort as="span" size="small" className="mt-2 block text-ax-text-accent group-hover:underline">
                  Klikk for detaljer
                </BodyShort>
              </button>
            ) : (
              <BodyShort size="small" textColor="subtle" className="italic mt-auto">
                Velg en kategori for å se statistikk
              </BodyShort>
            )}
          </Box>
        </div>
      </section>

      {selectedCategory && (
        <CategoryModal
          isOpen={true}
          onClose={handleCloseModal}
          categoryName={selectedCategory.category}
          events={selectedCategory.events}
        />
      )}
    </>
  );
}
