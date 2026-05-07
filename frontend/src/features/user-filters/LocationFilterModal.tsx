import { CheckCircle, X } from 'lucide-react';
import type { ProvinceCityItem } from '@/lib/api/public';

interface LocationFilterModalProps {
  open: boolean;
  provinceCities: ProvinceCityItem[];
  activeProvince: string;
  selectedCities: string[];
  title?: string;
  onClose: () => void;
  onApply: () => void;
  onSelectProvince: (province: string) => void;
  onToggleCity: (city: string) => void;
  onRemoveSelected: (city: string) => void;
  onClearSelected?: () => void;
}

export function LocationFilterModal({
  open,
  provinceCities,
  activeProvince,
  selectedCities,
  title = '选择工作地点',
  onClose,
  onApply,
  onSelectProvince,
  onToggleCity,
  onRemoveSelected,
  onClearSelected,
}: LocationFilterModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/45 flex items-center justify-center p-4">
      <div data-testid="location-modal" className="w-full max-w-4xl rounded-2xl bg-surface-lowest text-on-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-mid text-lg font-bold">{title}</div>
        <div className="px-6 py-3 border-b border-surface-mid bg-primary/5 text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-primary">已选（{selectedCities.length}）：</span>
            <div data-testid="city-selected-tags" className="flex items-center gap-2 flex-wrap">
              {selectedCities.length === 0 ? (
                <span className="text-on-surface-variant">暂无</span>
              ) : (
                selectedCities.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => onRemoveSelected(name)}
                    className="inline-flex h-7 items-center gap-1 rounded-full border border-primary/30 bg-surface-lowest px-3 text-xs text-primary hover:bg-primary/10"
                  >
                    <span>{name}</span>
                    <X size={12} />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 h-[380px]">
          <div data-testid="location-province-list" className="border-r border-surface-mid overflow-y-auto filter-modal-scroll p-3">
            {provinceCities.map((item) => (
              <button
                key={item.province}
                onClick={() => onSelectProvince(item.province)}
                className={`flex h-10 w-full items-center rounded-lg border px-3 mb-1 transition-colors ${
                  activeProvince === item.province
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-transparent text-on-surface hover:border-primary/20 hover:bg-primary/5'
                }`}
              >
                {item.province}
              </button>
            ))}
          </div>
          <div data-testid="location-city-list" className="overflow-y-auto filter-modal-scroll p-3">
            {(provinceCities.find((item) => item.province === activeProvince)?.cities ?? []).map((city) => {
              const active = selectedCities.includes(city);
              return (
                <button
                  key={city}
                  aria-pressed={active}
                  onClick={() => onToggleCity(city)}
                  className={`inline-flex mr-2 mb-2 px-3 h-9 items-center justify-between min-w-[92px] rounded-lg border text-sm transition-colors ${
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-surface-mid text-on-surface hover:border-primary/20 hover:bg-primary/5'
                  }`}
                >
                  <span>{city}</span>
                  {active && <CheckCircle size={13} className="ml-1 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="px-6 py-3 border-t border-surface-mid flex justify-end gap-2">
          <button onClick={() => onClearSelected?.()} className="px-5 h-10 rounded-full border border-surface-mid text-on-surface">清空筛选</button>
          <button onClick={onClose} className="px-5 h-10 rounded-full border border-surface-mid text-on-surface">取消</button>
          <button onClick={onApply} className="px-5 h-10 rounded-full bg-primary text-white hover:bg-primary-container transition-colors">确定</button>
        </div>
      </div>
    </div>
  );
}
