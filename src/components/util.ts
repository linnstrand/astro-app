import * as d3 from "d3";

export interface BaseData {
  name: string;
  value?: any;
  children?: BaseData[];
}

export interface Data extends BaseData {
  color: string;
  target?: RectanglePoints;
  current: d3.HierarchyRectangularNode<Data>;
}

export interface RectanglePoints {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export const setColor = (
  node: d3.HierarchyNode<Data>,
  colorSetter: d3.ScaleOrdinal<string, string, never>
) => {
  const setBranchColor = (
    d: d3.HierarchyNode<Data>,
    branchColor: string,
    index: number
  ) => {
    // We increase brightness for items with children
    const { l, c, h } = d3.lch(branchColor);
    if (!d.children) {
      d.data.color = d3.lch(l + 15, c, h + index * 1 - 5).toString();
      return;
    }
    // some color tweaking
    d.data.color = d3.lch(l, c, h + index * 2).toString();

    d.children.forEach((c, i) => setBranchColor(c, branchColor, i * index));
  };
  node.children?.forEach((d, i) =>
    setBranchColor(d, colorSetter(d.data.name), i + 1)
  );
};

export const processData = ({
  children,
  value = 0,
  ...rest
}: BaseData): Data => {
  return {
    children: children?.map((c) => processData(c)),
    value,
    color: "#eee",
    ...rest,
  } as Data;
};

// height is the node distance from root
export const sortByHeight = (root: d3.HierarchyNode<Data>) =>
  root.sort((a, b) => d3.descending(a.height, b.height));

// COLOR!
// ordinal scales have a discrete domain and range
// quantize: Quantize scales are similar to linear scales, except they use a discrete rather than continuous range. Returns uniformly-spaced samples from the specified interpolator

// interpolateRainbow: Cyclical. (interpolateSinebow is an alternative)
// Given a number t in the range [0,1], returns the corresponding color from d3.interpolateWarm scale from [0.0, 0.5] followed by the d3.interpolateCool scale from [0.5, 1.0],
// thus implementing the cyclical less-angry rainbow color scheme.

/**
 *
 * @param branches The number of colors for the rainbow
 * @returns
 */
export const getDiscreteColors = (branches: number) =>
  d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, branches));
