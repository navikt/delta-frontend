"use client";

import { useState } from "react";
import { BarChartIcon } from "@navikt/aksel-icons";
import { CategoryStat } from "@/service/statsActions";
import CategoryModal from "./categoryModal";

export default function CategorySection({
  categoryStats,
}: {
  categoryStats: CategoryStat[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryStat | null>(
    null
  );

  const handleCardClick = (category: CategoryStat) => {
    setSelectedCategory(category);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
  };

  return (
    <>
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Arrangementer per kategori
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryStats.map((cat) => (
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
              </p>
              <p className="text-xs text-blue-600 mt-2">Klikk for detaljer</p>
            </button>
          ))}
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
