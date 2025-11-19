import { Button } from "@/components/ui/button";
import studyIllustration from "@/assets/study-illustration.png";

export const ExamsBanner = () => {
  return (
    <div className="bg-turquoise rounded-2xl p-8 shadow-md relative overflow-hidden">
      <div className="flex items-center justify-between relative z-10">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold text-white mb-4">
            EXAMS <span className="font-normal">TIME</span>
          </h2>
          <p className="text-white/90 mb-2">
            Here we are, Are you ready to fight? Don't worry, we prepared some tips to
            be ready for your exams.
          </p>
          <p className="text-sm text-white/70 italic mb-6">
            "Nothing happens until something moves" - Albert Einstein
          </p>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg shadow-lg"
          >
            View exams tips
          </Button>
        </div>
        

      </div>
    </div>
  );
};
