import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export const ExamsBanner = () => {
  const { t } = useTranslation("dashboard");

  return (
    <div className="bg-turquoise rounded-2xl p-8 shadow-md relative overflow-hidden">
      <div className="flex items-center justify-between relative z-10">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold text-white mb-4">
            {t("examsBanner.titleStrong")} <span className="font-normal">{t("examsBanner.titleLight")}</span>
          </h2>
          <p className="text-white/90 mb-2">
            {t("examsBanner.body")}
          </p>
          <p className="text-sm text-white/70 italic mb-6">
            {t("examsBanner.quote")}
          </p>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg shadow-lg"
          >
            {t("examsBanner.button")}
          </Button>
        </div>
        
      </div>
    </div>
  );
};
