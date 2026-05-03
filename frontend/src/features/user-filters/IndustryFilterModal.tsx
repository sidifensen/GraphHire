import { CheckCircle, X } from 'lucide-react';
import type { PublicTreeNode } from '@/lib/api/public';
import { treeChildrenById, treeNodeById } from './tree';

interface IndustryFilterModalProps {
  open: boolean;
  tree: PublicTreeNode[];
  selectedNames: string[];
  activeRootId: number | null;
  activeMidId: number | null;
  title?: string;
  onClose: () => void;
  onApply: () => void;
  onSelectRoot: (id: number, defaultMidId: number | null) => void;
  onSelectMid: (id: number, isLeaf: boolean, name: string) => void;
  onToggleLeaf: (name: string) => void;
  onRemoveSelected: (name: string) => void;
  onClearSelected?: () => void;
}

export function IndustryFilterModal({
  open,
  tree,
  selectedNames,
  activeRootId,
  activeMidId,
  title = '选择公司行业',
  onClose,
  onApply,
  onSelectRoot,
  onSelectMid,
  onToggleLeaf,
  onRemoveSelected,
  onClearSelected,
}: IndustryFilterModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/45 flex items-center justify-center p-4">
      <div data-testid="industry-modal" className="w-full max-w-5xl rounded-2xl bg-white overflow-hidden">
        <div className="px-6 py-4 border-b text-lg font-bold">{title}</div>
        <div className="px-6 py-3 border-b bg-primary/5 text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-primary">已选（{selectedNames.length}）：</span>
            <div data-testid="industry-selected-tags" className="flex items-center gap-2 flex-wrap">
              {selectedNames.length === 0 ? (
                <span className="text-on-surface-variant">暂无</span>
              ) : (
                selectedNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => onRemoveSelected(name)}
                    className="inline-flex h-7 items-center gap-1 rounded-full border border-primary/30 bg-white px-3 text-xs text-primary hover:bg-primary/10"
                  >
                    <span>{name}</span>
                    <X size={12} />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 h-[420px]">
          <div className="border-r overflow-y-auto p-3">
            {tree.map((root) => (
              <button
                key={root.id}
                onClick={() => onSelectRoot(root.id, root.children?.[0]?.id ?? null)}
                className={`flex h-10 w-full items-center rounded-lg border px-3 mb-1 transition-colors ${
                  activeRootId === root.id
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-transparent text-on-surface hover:border-primary/20 hover:bg-primary/5'
                }`}
              >
                {root.name}
              </button>
            ))}
          </div>
          <div className="border-r overflow-y-auto p-3">
            {treeChildrenById(tree, activeRootId).map((mid) => {
              const isLeafMid = !mid.children || mid.children.length === 0;
              const active = selectedNames.includes(mid.name);
              return (
                <button
                  key={mid.id}
                  onClick={() => onSelectMid(mid.id, isLeafMid, mid.name)}
                  className={`flex h-10 w-full items-center rounded-lg border px-3 mb-1 transition-colors ${
                    activeMidId === mid.id || (isLeafMid && active)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-transparent text-on-surface hover:border-primary/20 hover:bg-primary/5'
                  }`}
                >
                  {mid.name}
                </button>
              );
            })}
          </div>
          <div className="overflow-y-auto p-3">
            {(() => {
              const activeMidNode = treeNodeById(tree, activeMidId);
              const leaves = treeChildrenById(tree, activeMidId);
              if (leaves.length === 0 && activeMidNode) return null;
              return leaves.map((leaf) => {
                const active = selectedNames.includes(leaf.name);
                return (
                  <button
                    key={leaf.id}
                    aria-pressed={active}
                    onClick={() => onToggleLeaf(leaf.name)}
                    className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 mb-1 transition-colors ${
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-transparent text-on-surface hover:border-primary/20 hover:bg-primary/5'
                    }`}
                  >
                    <span>{leaf.name}</span>
                    {active && <CheckCircle size={14} className="text-primary" />}
                  </button>
                );
              });
            })()}
          </div>
        </div>
        <div className="px-6 py-3 border-t flex justify-end gap-2">
          <button onClick={() => onClearSelected?.()} className="px-5 h-10 rounded-full border border-surface-mid text-on-surface">清空筛选</button>
          <button onClick={onClose} className="px-5 h-10 rounded-full border border-surface-mid text-on-surface">取消</button>
          <button onClick={onApply} className="px-5 h-10 rounded-full bg-primary text-white hover:bg-primary-container transition-colors">确定</button>
        </div>
      </div>
    </div>
  );
}
