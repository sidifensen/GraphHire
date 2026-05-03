import type { PublicTreeNode } from '@/lib/api/public';

export function flattenLeafNameMap(tree: PublicTreeNode[]) {
  const map = new Map<string, number>();
  const stack = [...tree];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (!node.children || node.children.length === 0) {
      map.set(node.name, node.id);
      continue;
    }
    stack.push(...node.children);
  }
  return map;
}

export function treeChildrenById(tree: PublicTreeNode[], id: number | null): PublicTreeNode[] {
  if (id == null) return [];
  const stack = [...tree];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.id === id) return node.children ?? [];
    stack.push(...(node.children ?? []));
  }
  return [];
}

export function treeNodeById(tree: PublicTreeNode[], id: number | null): PublicTreeNode | null {
  if (id == null) return null;
  const stack = [...tree];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.id === id) return node;
    stack.push(...(node.children ?? []));
  }
  return null;
}

export function collectLeafNameSet(tree: PublicTreeNode[]) {
  const names = new Set<string>();
  const stack = [...tree];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (!node.children || node.children.length === 0) {
      names.add(node.name);
      continue;
    }
    stack.push(...node.children);
  }
  return names;
}

