export type HorizontalIndicatorMetrics = {
  x: number;
  y: 0;
  width: number;
};

type LeftRect = {
  left: number;
};

type ItemRect = LeftRect & {
  width: number;
};

export function resolveHorizontalIndicatorMetrics(
  containerRect: LeftRect,
  itemRect: ItemRect,
): HorizontalIndicatorMetrics {
  const width = Number.isFinite(itemRect.width) && itemRect.width > 0 ? itemRect.width : 1;
  return {
    x: itemRect.left - containerRect.left,
    y: 0,
    width,
  };
}
