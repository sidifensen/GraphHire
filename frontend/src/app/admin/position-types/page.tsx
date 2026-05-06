'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { adminApi, type AdminPositionTypeItem } from '@/lib/api/admin';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ViewMode = 'split' | 'cascade';
const ALL_FILTER_VALUE = '__ALL__';

export default function AdminPositionTypesPage() {
  const [tree, setTree] = useState<AdminPositionTypeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createStatus, setCreateStatus] = useState('1');
  const [createParentId, setCreateParentId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const status = statusFilter ? Number(statusFilter) : undefined;
      const level = levelFilter ? Number(levelFilter) : undefined;
      const data = await adminApi.getPositionTypeTree({
        keyword: keyword || undefined,
        status,
        level,
      });
      setTree(data);
      const expandableIds = collectExpandableIds(data);
      setExpandedIds((prev) => (prev.length === 0 ? expandableIds : prev));
      if (selectedId == null && data.length > 0) {
        const first = data[0];
        setSelectedId(first.id);
        setEditingName(first.name);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [keyword, statusFilter, levelFilter]);

  const selectedNode = useMemo(() => findById(tree, selectedId), [tree, selectedId]);
  const selectedPath = useMemo(() => findPath(tree, selectedId), [tree, selectedId]);

  useEffect(() => {
    if (selectedNode) {
      setEditingName(selectedNode.name);
    }
  }, [selectedNode?.id]);

  const cascadeRoot = useMemo(() => {
    if (selectedPath.length > 0) {
      return selectedPath[0];
    }
    return tree[0] ?? null;
  }, [selectedPath, tree]);

  const cascadeSecondNodes = cascadeRoot?.children ?? [];

  const cascadeSecond = useMemo(() => {
    if (!cascadeRoot) {
      return null;
    }
    if (selectedPath.length > 1 && selectedPath[0]?.id === cascadeRoot.id) {
      return selectedPath[1];
    }
    return cascadeSecondNodes[0] ?? null;
  }, [cascadeRoot, selectedPath, cascadeSecondNodes]);

  const cascadeThirdNodes = cascadeSecond?.children ?? [];

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const selectNode = (node: AdminPositionTypeItem) => {
    setSelectedId(node.id);
    setEditingName(node.name);
  };

  const openCreate = (parentId: number | null) => {
    setCreateParentId(parentId);
    setCreateName('');
    setCreateStatus('1');
    setShowCreate(true);
  };

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!createName.trim()) {
      return;
    }
    await adminApi.createPositionType({
      name: createName.trim(),
      parentId: createParentId,
      status: Number(createStatus),
    });
    setShowCreate(false);
    await load();
  };

  const saveName = async () => {
    if (!selectedNode || !editingName.trim()) {
      return;
    }
    await adminApi.updatePositionType(selectedNode.id, { name: editingName.trim() });
    await load();
  };

  const toggleStatus = async () => {
    if (!selectedNode) {
      return;
    }
    await adminApi.updatePositionTypeStatus(selectedNode.id, selectedNode.status === 1 ? 0 : 1);
    await load();
  };

  const moveNode = async (direction: 'UP' | 'DOWN') => {
    if (!selectedNode) {
      return;
    }
    await adminApi.movePositionType(selectedNode.id, direction);
    await load();
  };

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden p-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface">职位类型管理</h2>
          <p className="mt-1 text-sm text-outline">维护三层职位类型树，支持新增、启停与同级排序。</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90"
          onClick={() => openCreate(null)}
        >
          <Plus size={18} />新增一级
        </button>
      </div>

      <div className="rounded-xl border border-outline-variant/30 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索职位类型"
            className="rounded-lg border border-outline-variant/30 bg-slate-50 px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <span className="shrink-0 whitespace-nowrap text-outline">状态</span>
            <Select
              value={statusFilter === '' ? ALL_FILTER_VALUE : statusFilter}
              onValueChange={(value) => setStatusFilter(value === ALL_FILTER_VALUE ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>全部</SelectItem>
                <SelectItem value="1">启用</SelectItem>
                <SelectItem value="0">停用</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="shrink-0 whitespace-nowrap text-outline">层级</span>
            <Select
              value={levelFilter === '' ? ALL_FILTER_VALUE : levelFilter}
              onValueChange={(value) => setLevelFilter(value === ALL_FILTER_VALUE ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择层级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>全部</SelectItem>
                <SelectItem value="1">一级</SelectItem>
                <SelectItem value="2">二级</SelectItem>
                <SelectItem value="3">三级</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${viewMode === 'split' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
          onClick={() => setViewMode('split')}
        >
          树+详情
        </button>
        <button
          type="button"
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${viewMode === 'cascade' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
          onClick={() => setViewMode('cascade')}
        >
          分栏级联视图
        </button>
      </div>

      {viewMode === 'split' ? (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[360px_1fr]">
          <section className="flex h-full min-h-0 flex-col rounded-xl border border-outline-variant/40 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-base font-bold">职位树</h3>
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
              {tree.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  depth={0}
                  expandedIds={expandedIds}
                  onToggle={toggleExpanded}
                  onSelect={selectNode}
                  selectedId={selectedId}
                />
              ))}
            </div>
          </section>

          <NodeDetailPanel
            selectedNode={selectedNode}
            editingName={editingName}
            setEditingName={setEditingName}
            onSaveName={saveName}
            onMove={moveNode}
            onToggleStatus={toggleStatus}
            onCreateChild={openCreate}
          />
        </div>
      ) : null}

      {viewMode === 'cascade' ? (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden xl:grid-cols-[1.4fr_1fr]">
          <section className="grid min-h-0 grid-cols-1 gap-3 rounded-xl border border-outline-variant/40 bg-white p-4 shadow-sm md:grid-cols-3">
            <CascadeColumn
              title="一级"
              nodes={tree}
              selectedId={cascadeRoot?.id ?? null}
              onSelect={selectNode}
            />
            <CascadeColumn
              title="二级"
              nodes={cascadeSecondNodes}
              selectedId={cascadeSecond?.id ?? null}
              onSelect={selectNode}
            />
            <CascadeColumn
              title="三级"
              nodes={cascadeThirdNodes}
              selectedId={selectedPath[2]?.id ?? null}
              onSelect={selectNode}
            />
          </section>

          <NodeDetailPanel
            selectedNode={selectedNode}
            editingName={editingName}
            setEditingName={setEditingName}
            onSaveName={saveName}
            onMove={moveNode}
            onToggleStatus={toggleStatus}
            onCreateChild={openCreate}
          />
        </div>
      ) : null}

      {loading ? <p className="text-xs text-outline">加载中...</p> : null}

      {showCreate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={(e) => void onCreate(e)} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold">{createParentId == null ? '新增一级节点' : '新增子节点'}</h3>
            <label className="mb-2 block text-sm">名称</label>
            <input value={createName} onChange={(e) => setCreateName(e.target.value)} className="mb-4 w-full rounded border px-3 py-2" />
            <label className="mb-2 block text-sm">状态</label>
            <div className="mb-6">
              <Select value={createStatus} onValueChange={setCreateStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">启用</SelectItem>
                  <SelectItem value="0">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="rounded border px-4 py-2" onClick={() => setShowCreate(false)}>取消</button>
              <button type="submit" className="rounded bg-primary px-4 py-2 text-white">保存</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function NodeDetailPanel({
  selectedNode,
  editingName,
  setEditingName,
  onSaveName,
  onMove,
  onToggleStatus,
  onCreateChild,
}: {
  selectedNode: AdminPositionTypeItem | null;
  editingName: string;
  setEditingName: (value: string) => void;
  onSaveName: () => Promise<void>;
  onMove: (direction: 'UP' | 'DOWN') => Promise<void>;
  onToggleStatus: () => Promise<void>;
  onCreateChild: (parentId: number | null) => void;
}) {
  return (
    <section className="h-full min-h-0 overflow-hidden rounded-xl border border-outline-variant/40 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-base font-bold">节点详情</h3>
      {selectedNode ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <label className="text-sm">
              <span className="mb-1 block text-outline">名称</span>
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="w-full rounded-lg border border-outline-variant/30 px-3 py-2"
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold" onClick={() => void onSaveName()}>保存名称</button>
            <button type="button" className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700" onClick={() => void onMove('UP')}>上移</button>
            <button type="button" className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700" onClick={() => void onMove('DOWN')}>下移</button>
            <button type="button" className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700" onClick={() => void onToggleStatus()}>
              {selectedNode.status === 1 ? '停用' : '启用'}
            </button>
            {selectedNode.level < 3 ? (
              <button type="button" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700" onClick={() => onCreateChild(selectedNode.id)}>
                新增子类
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="text-sm text-outline">请选择左侧节点。</p>
      )}
    </section>
  );
}

function CascadeColumn({
  title,
  nodes,
  selectedId,
  onSelect,
}: {
  title: string;
  nodes: AdminPositionTypeItem[];
  selectedId: number | null;
  onSelect: (node: AdminPositionTypeItem) => void;
}) {
  return (
    <div className="flex min-h-0 flex-col rounded-lg border border-outline-variant/30 bg-slate-50/60 p-3">
      <h3 className="mb-2 text-sm font-bold text-slate-700">{title}</h3>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            className={`w-full rounded-md px-3 py-2 text-left text-sm ${selectedId === node.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
            onClick={() => onSelect(node)}
          >
            {node.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function TreeNode({
  node,
  depth,
  expandedIds,
  onToggle,
  onSelect,
  selectedId,
}: {
  node: AdminPositionTypeItem;
  depth: number;
  expandedIds: number[];
  onToggle: (id: number) => void;
  onSelect: (node: AdminPositionTypeItem) => void;
  selectedId: number | null;
}) {
  const expanded = expandedIds.includes(node.id);
  const hasChildren = node.children.length > 0;
  return (
    <div>
      <div className="flex items-center gap-1">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            className="flex h-7 w-7 items-center justify-center rounded text-base font-bold text-slate-600 hover:bg-slate-100"
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="inline-block h-7 w-7" />
        )}
        <button
          type="button"
          onClick={() => onSelect(node)}
          className={`rounded px-2 py-1 text-sm ${selectedId === node.id ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
          style={{ marginLeft: `${depth * 8}px` }}
        >
          {node.name}
        </button>
      </div>
      {expanded && hasChildren ? (
        <div className="ml-2 space-y-1">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function findById(tree: AdminPositionTypeItem[], targetId: number | null): AdminPositionTypeItem | null {
  if (targetId == null) {
    return null;
  }
  for (const node of tree) {
    if (node.id === targetId) {
      return node;
    }
    const child = findById(node.children, targetId);
    if (child) {
      return child;
    }
  }
  return null;
}

function findPath(tree: AdminPositionTypeItem[], targetId: number | null, trail: AdminPositionTypeItem[] = []): AdminPositionTypeItem[] {
  if (targetId == null) {
    return [];
  }
  for (const node of tree) {
    const nextTrail = [...trail, node];
    if (node.id === targetId) {
      return nextTrail;
    }
    const childPath = findPath(node.children, targetId, nextTrail);
    if (childPath.length > 0) {
      return childPath;
    }
  }
  return [];
}

function collectExpandableIds(tree: AdminPositionTypeItem[]): number[] {
  const ids: number[] = [];
  for (const node of tree) {
    if (node.children.length > 0) {
      ids.push(node.id);
      ids.push(...collectExpandableIds(node.children));
    }
  }
  return ids;
}
