'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import type { PublicTreeNode } from '@/lib/api/public';

type PositionTypePickerModalProps = {
  open: boolean;
  tree: PublicTreeNode[];
  value: string[];
  onClose: () => void;
  onConfirm: (selectedNames: string[]) => void;
  title?: string;
  selectedLabel?: string;
  containerTestId?: string;
  selectedTagsTestId?: string;
  clearButtonText?: string;
};

function treeChildrenById(tree: PublicTreeNode[], id: number | null): PublicTreeNode[] {
  if (id == null) return [];
  const stack = [...tree];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.id === id) return node.children ?? [];
    stack.push(...(node.children ?? []));
  }
  return [];
}

export default function PositionTypePickerModal({
  open,
  tree,
  value,
  onClose,
  onConfirm,
  title = '选择职能',
  selectedLabel = '已选',
  containerTestId = 'category-modal',
  selectedTagsTestId = 'category-selected-tags',
  clearButtonText = '清空筛选',
}: PositionTypePickerModalProps) {
  const [draftNames, setDraftNames] = useState<string[]>(value);
  const [activeRootId, setActiveRootId] = useState<number | null>(tree[0]?.id ?? null);
  const [activeMidId, setActiveMidId] = useState<number | null>(tree[0]?.children?.[0]?.id ?? null);

  useEffect(() => {
    setDraftNames(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    setActiveRootId(tree[0]?.id ?? null);
    setActiveMidId(tree[0]?.children?.[0]?.id ?? null);
  }, [open, tree]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/45 flex items-center justify-center p-4">
      <div data-testid={containerTestId} className="w-full max-w-5xl rounded-2xl bg-surface-lowest text-on-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-mid text-lg font-bold">{title}</div>
        <div className="px-6 py-3 border-b border-surface-mid bg-primary/5 text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-primary">{selectedLabel}（{draftNames.length}）：</span>
            <div data-testid={selectedTagsTestId} className="flex items-center gap-2 flex-wrap">
              {draftNames.length === 0 ? (
                <span className="text-on-surface-variant">暂无</span>
              ) : (
                draftNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setDraftNames((prev) => prev.filter((item) => item !== name))}
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
        <div className="grid grid-cols-3 h-[420px]">
          <div className="border-r border-surface-mid overflow-y-auto filter-modal-scroll p-3">
            {tree.map((root) => (
              <button
                key={root.id}
                onClick={() => {
                  setActiveRootId(root.id);
                  setActiveMidId(root.children?.[0]?.id ?? null);
                }}
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
          <div className="border-r border-surface-mid overflow-y-auto filter-modal-scroll p-3">
            {treeChildrenById(tree, activeRootId).map((mid) => {
              const isLeafMid = !mid.children || mid.children.length === 0;
              const active = draftNames.includes(mid.name);
              return (
                <button
                  key={mid.id}
                  onClick={() => {
                    setActiveMidId(mid.id);
                    if (isLeafMid) {
                      setDraftNames((prev) => (active ? prev.filter((item) => item !== mid.name) : [...prev, mid.name]));
                    }
                  }}
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
          <div className="overflow-y-auto filter-modal-scroll p-3">
            {treeChildrenById(tree, activeMidId).map((leaf) => {
              const active = draftNames.includes(leaf.name);
              return (
                <button
                  key={leaf.id}
                  aria-pressed={active}
                  onClick={() => setDraftNames((prev) => (active ? prev.filter((item) => item !== leaf.name) : [...prev, leaf.name]))}
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
            })}
          </div>
        </div>
        <div className="px-6 py-3 border-t border-surface-mid flex justify-end gap-2">
          <button onClick={() => setDraftNames([])} className="px-5 h-10 rounded-full border border-surface-mid text-on-surface">
            {clearButtonText}
          </button>
          <button onClick={onClose} className="px-5 h-10 rounded-full border border-surface-mid text-on-surface">
            取消
          </button>
          <button
            onClick={() => onConfirm(draftNames)}
            className="px-5 h-10 rounded-full bg-primary text-white hover:bg-primary-container transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
