import { Checkbox } from "./Checkbox";

type FieldDisplaySettingsProps = {
  showBoundary: boolean;
  onShowBoundaryChange: (show: boolean) => void;
};

export const FieldDisplaySettings = ({
  showBoundary,
  onShowBoundaryChange,
}: FieldDisplaySettingsProps) => (
  <div className="border-t border-slate-200 px-4 py-3">
    <Checkbox
      label="Показывать контур поля"
      checked={showBoundary}
      onChange={(event) => onShowBoundaryChange(event.target.checked)}
    />
  </div>
);
