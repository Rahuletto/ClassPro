import React, {
  useRef,
  useEffect,
  useState,
  Dispatch,
  FC,
  SetStateAction,
} from "react";
import { FaCheck } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";
import Refresh from "@/components/Refresh";
import DatePickerComponent from "./Predict/DatePicker";
import PredictResetButtons from "./Predict/ResetButtons";
import InfoPopup from "./InfoPopup";
import { DateRange } from "@/types/Attendance";
import { DateObject } from "react-multi-date-picker";
import { useData } from "@/provider/DataProvider";
import ODMLDatePicker from "./OD/ODMLDatePicker";
import ODMLResetButtons from "./OD/ResetButtons";
import Predictor from "./Predictor";
import { createPortal } from "react-dom";
import { CategorizedDateRange } from "../../../../../types/Attendance";

interface AttendanceHeaderProps {
  categorizedDateRanges: CategorizedDateRange[];
  setCategorizedDateRanges: Dispatch<SetStateAction<CategorizedDateRange[]>>;
}

export const AttendanceHeader: FC<AttendanceHeaderProps> = ({
  categorizedDateRanges,
  setCategorizedDateRanges,
}) => {
  const [showInfoPopup, setShowInfoPopup] = useState<boolean>(false);
  const infoIconRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(false);

  const [dialogRoot, setDialogRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setDialogRoot(document.getElementById("dialog-root"));

    return () => {
      setDialogRoot(null);
    };
  }, []);

  const { error, attendance } = useData();
  const isOld = false;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        infoIconRef.current &&
        !infoIconRef.current.contains(event.target as Node)
      ) {
        setShowInfoPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleInfoPopup = () => setShowInfoPopup((prev) => !prev);

  return (
    <>
      <div className="mb-0 flex items-center justify-between md:mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Attendance</h1>

          {attendance && attendance.length > 0 && (
            <>
              <button
                className="flex w-fit scale-100 items-center justify-center rounded-xl bg-light-button px-5 py-1 text-sm font-medium text-light-accent opacity-100 transition-all duration-300 after:absolute after:-right-5 after:-top-3 after:rounded-md after:bg-[#0E100E] after:p-0.5 after:px-1 after:text-xs after:text-light-accent after:content-['NEW'] dark:bg-dark-button dark:text-dark-accent dark:after:text-dark-accent"
                onClick={() => setOpen(true)}
              >
                Predict
              </button>

              {dialogRoot &&
                open &&
                createPortal(
                  <Predictor
                    categorizedDateRanges={categorizedDateRanges}
                    setCategorizedDateRanges={setCategorizedDateRanges}
                    onClose={() => setOpen(false)}
                  />,
                  dialogRoot,
                )}
              <div className="relative" ref={infoIconRef}>
                <FiInfo
                  className="cursor-help opacity-40"
                  onClick={toggleInfoPopup}
                  onMouseEnter={toggleInfoPopup}
                  onMouseLeave={() => setShowInfoPopup(false)}
                />
                {showInfoPopup && (
                  <InfoPopup
                    warn
                    text="Enter the dates you'll be absent to see a predicted attendance percentage and margin."
                    onClose={() => setShowInfoPopup(false)}
                  />
                )}
              </div>
            </>
          )}
        </div>
        {!error && <Refresh type={{ mutateAttendance: true }} isOld={isOld} />}
      </div>
    </>
  );
};
