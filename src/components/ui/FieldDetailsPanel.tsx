import { useState } from 'react';
import {
  ArrowRight,
  ChartSpline,
  Map,
  Pencil,
  ScanLine,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router';
import { Button } from '@/components/ui/Button';
import { FieldPhotosPanel } from '@/components/ui/FieldPhotosPanel';
import { Input } from '@/components/ui/Input';
import { DynamicLinks } from '@/config/DynamicLinks';
import { fieldNameSchema } from '@/config/fieldValidation';
import type { Field, FieldPhoto } from '@/types/field';

type FieldDetailsPanelProps = {
  fieldsCount: number;
  field?: Field;
  detailView: 'field' | 'images';
  onDetailViewChange: (view: 'field' | 'images') => void;
  onClearField: () => void;
  onStartDrawing: () => void;
  onStartEditing: () => void;
  photos: FieldPhoto[];
  availablePhotos: FieldPhoto[];
  loading: boolean;
  mutating: boolean;
  onRenameField: (fieldId: string, name: string) => Promise<void>;
  onSyncPhotos: () => Promise<number>;
  onAssignPhotos: (photoIds: number[]) => Promise<number>;
};

export const FieldDetailsPanel = ({
  fieldsCount,
  field,
  detailView,
  onDetailViewChange,
  onClearField,
  onStartDrawing,
  onStartEditing,
  photos,
  availablePhotos,
  loading,
  mutating,
  onRenameField,
  onSyncPhotos,
  onAssignPhotos,
}: FieldDetailsPanelProps) => {
  const [editingName, setEditingName] = useState(false);
  const [nextName, setNextName] = useState(field?.name ?? '');
  const [nameError, setNameError] = useState<string>();

  return (
    <section
      aria-label="Информация о поле"
      className="min-h-0 rounded-lg border border-slate-200 bg-white lg:col-start-1 lg:overflow-y-auto"
    >
      {field ? (
        <>
          <div className="px-4 pt-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="min-w-0 truncate text-sm font-medium">
                {field.name}
              </h2>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  aria-label="Переименовать поле"
                  className="px-2"
                  onClick={() => setEditingName((current) => !current)}
                >
                  <Pencil aria-hidden="true" className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  aria-label="Снять выбор поля"
                  className="px-2"
                  onClick={onClearField}
                >
                  <X aria-hidden="true" className="size-4" />
                </Button>
              </div>
            </div>
            {editingName && (
              <form
                className="mt-3 space-y-2 border-t border-slate-100 py-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const result = fieldNameSchema.safeParse(nextName);
                  if (!result.success) {
                    setNameError(result.error.issues[0]?.message);
                    return;
                  }
                  void onRenameField(field.id, result.data)
                    .then(() => setEditingName(false))
                    .catch(() => undefined);
                }}
              >
                <Input
                  label="Название поля"
                  value={nextName}
                  error={nameError}
                  onChange={(event) => {
                    setNextName(event.target.value);
                    setNameError(undefined);
                  }}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full"
                    loading={mutating}
                  >
                    Сохранить
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setEditingName(false)}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            )}
          </div>
          <div
            className="flex gap-1 border-b border-slate-200 px-3 pb-2"
            aria-label="Информация и снимки"
          >
            <Button
              size="sm"
              variant={detailView === 'field' ? 'secondary' : 'ghost'}
              aria-pressed={detailView === 'field'}
              onClick={() => onDetailViewChange('field')}
            >
              О поле
            </Button>
            <Button
              size="sm"
              variant={detailView === 'images' ? 'secondary' : 'ghost'}
              aria-pressed={detailView === 'images'}
              onClick={() => onDetailViewChange('images')}
            >
              Снимки
            </Button>
          </div>
          {detailView === 'field' ? (
            <div className="p-4">
              <div className="grid gap-2">
                <NavLink
                  to={DynamicLinks.analytics(field.id)}
                  className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-green-800 bg-green-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
                >
                  <ChartSpline aria-hidden="true" className="size-4" />
                  Открыть аналитику
                </NavLink>
                <Button variant="secondary" onClick={onStartEditing}>
                  <ScanLine aria-hidden="true" className="size-4" />
                  Редактировать контур
                </Button>
              </div>
              {field.boundary.length ? (
                <details className="mt-4 text-sm" open>
                  <summary className="cursor-pointer py-2 font-medium focus-visible:outline-2 focus-visible:outline-green-700">
                    Координаты контура · {field.boundary.length} точек
                  </summary>
                  <table className="mt-2 w-full table-fixed text-left text-xs tabular-nums">
                    <colgroup>
                      <col className="w-8" />
                      <col />
                      <col />
                    </colgroup>
                    <thead className="text-slate-500">
                      <tr>
                        <th scope="col" className="py-2 pr-2 font-normal">
                          №
                        </th>
                        <th scope="col" className="py-2 pr-2 font-normal">
                          Широта
                        </th>
                        <th scope="col" className="py-2 font-normal">
                          Долгота
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {field.boundary.map(({ latitude, longitude }, index) => (
                        <tr key={index} className="border-t border-slate-100">
                          <td className="py-2 pr-2">{index + 1}</td>
                          <td className="pr-2">{latitude.toFixed(6)}</td>
                          <td>{longitude.toFixed(6)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              ) : (
                <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                  У поля не заданы границы. Автоматическая привязка снимков по
                  GPS недоступна.
                </p>
              )}
            </div>
          ) : (
            <FieldPhotosPanel
              photos={photos}
              availablePhotos={availablePhotos}
              loading={loading}
              mutating={mutating}
              onSync={onSyncPhotos}
              onAssign={onAssignPhotos}
            />
          )}
        </>
      ) : (
        <div className="px-4 py-5">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-green-800">
            {fieldsCount ? 'Просмотр поля' : 'Начало работы'}
          </p>
          <h2 className="text-base font-semibold text-slate-900">
            {fieldsCount ? 'Выберите поле' : 'Полей пока нет'}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            {fieldsCount
              ? 'Нажмите на контур на карте или на поле в списке, чтобы открыть информацию.'
              : 'Создайте первое поле, чтобы работать с его контуром, снимками и результатами анализа.'}
          </p>
          {!fieldsCount && (
            <>
              <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                <span className="flex size-6 items-center justify-center rounded-full bg-white font-semibold text-green-800 shadow-sm">
                  1
                </span>
                <span className="self-center">Отметьте контур на карте</span>
                <span className="flex size-6 items-center justify-center rounded-full bg-white font-semibold text-green-800 shadow-sm">
                  2
                </span>
                <span className="self-center">
                  Сохраните поле и добавьте снимки
                </span>
              </div>
              <Button className="mt-4 w-full" onClick={onStartDrawing}>
                <Map aria-hidden="true" className="size-4" />
                Добавить первое поле
                <ArrowRight aria-hidden="true" className="ml-auto size-4" />
              </Button>
            </>
          )}
        </div>
      )}
    </section>
  );
};
