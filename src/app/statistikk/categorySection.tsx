"use client";

import { useState } from "react";
import { BarChartIcon, MagnifyingGlassIcon } from "@navikt/aksel-icons";
import { UNSAFE_Combobox } from "@navikt/ds-react";
import { CategoryStat } from "@/service/statsActions";
import CategoryModal from "./categoryModal";

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
        <h2 className="text-2xl font-semibold mb-4">
          Arrangementer per kategori
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Categories */}
          {categoryStats.map((cat) => {
            return (
              <button
                key={cat.category}
                onClick={() => handleCardClick(cat)}
                className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors text-left cursor-pointer"
              >
                <div className="text-blue-600 mb-3">
                  <BarChartIcon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  {cat.category}
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {cat.count.toLocaleString("nb-NO")}
                  <span className="text-lg font-medium text-gray-600 ml-1">arrangementer</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {cat.totalParticipants.toLocaleString("nb-NO")} deltakere totalt, {cat.uniqueParticipants.toLocaleString("nb-NO")} unike
                </p>
                <p className="text-xs text-blue-600 mt-2">Klikk for detaljer</p>
              </button>
            );
          })}

          {/* Fagtorsdag */}
          {fagtorsdagStat && (() => {
            return (
              <button
                onClick={() => handleCardClick(fagtorsdagStat)}
                className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors text-left cursor-pointer"
              >
                <div className="text-blue-600 mb-3">
                  <BarChartIcon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  {fagtorsdagStat.category}
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {fagtorsdagStat.count.toLocaleString("nb-NO")}
                  <span className="text-lg font-medium text-gray-600 ml-1">arrangementer</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {fagtorsdagStat.totalParticipants.toLocaleString("nb-NO")} deltakere totalt, {fagtorsdagStat.uniqueParticipants.toLocaleString("nb-NO")} unike
                </p>
                <p className="text-xs text-blue-600 mt-2">Klikk for detaljer</p>
              </button>
            );
          })()}

          {/* Custom Category Selector */}
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200 flex flex-col">
            <div className="text-blue-600 mb-3">
              <MagnifyingGlassIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Velg kategori
            </h3>
            <UNSAFE_Combobox
              label="Velg kategori"
              hideLabel
              size="small"
              options={categoryOptions}
              selectedOptions={customCategoryName ? [customCategoryName] : []}
              onToggleSelected={handleCategorySelect}
              className="mb-3"
            />

            {customCategoryStat ? (() => {
              return (
                <div
                  className="cursor-pointer group"
                  onClick={() => handleCardClick(customCategoryStat)}
                >
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {customCategoryStat.count.toLocaleString("nb-NO")}
                    <span className="text-lg font-medium text-gray-600 ml-1 group-hover:text-blue-600">arrangementer</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {customCategoryStat.totalParticipants.toLocaleString("nb-NO")} deltakere totalt, {customCategoryStat.uniqueParticipants.toLocaleString("nb-NO")} unike
                  </p>
                  <p className="text-xs text-blue-600 mt-2 group-hover:underline">
                    Klikk for detaljer
                  </p>
                </div>
              );
            })() : (
              <p className="text-sm text-gray-500 italic mt-auto">
                Velg en kategori for å se statistikk
              </p>
            )}
          </div>
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
