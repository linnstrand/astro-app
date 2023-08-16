import * as d3 from "d3";
import { useLayoutEffect, useRef, useState } from "react";
import { Data, getDiscreteColors, sortByHeight } from "./util";

type PointNode = d3.HierarchyPointNode<Data>;

interface LayoutT {
  type: "tidy" | "radial";
  cluster: boolean;
}

interface GraphLayout {
  transform: (d: PointNode) => string;
  link:
    | d3.Link<unknown, unknown, PointNode>
    | d3.LinkRadial<unknown, unknown, PointNode>;
}

const MARGIN = 11;
const CIRCLE_RADIUS = 3;
const FONTSIZE = 10;
const FONTCOLOR = "#eee";
const ANIMATION_TIMER = 1000;
const size = 1000;

export const Tree = ({ data }: any) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodesRef = useRef<SVGSVGElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);

  const colorSetter = getDiscreteColors(data.children?.length || 0 + 1);

  const [layout, setLayout] = useState<LayoutT | null>(null);
  const [labelLength, setLabelLength] = useState(60);

  useLayoutEffect(() => {
    setTreeLayout();
  }, []);

  const createNodes = (hierarchy: PointNode): number => {
    // we want to set start position, same as nodes
    if (!nodesRef.current) {
      return labelLength;
    }
    d3.select(linesRef.current)
      .selectAll("path")
      .data(() => hierarchy.links())
      .join("path")
      .attr(
        "d",
        d3
          .linkHorizontal<unknown, unknown>()
          .x(() => 0)
          .y(() => size / 2)
      );

    // prevent appending duplicates, since useLayoutEffect runs twice
    nodesRef.current.innerHTML = "";

    // Start nodes invisible for nice fade in
    const nodes = d3
      .select(nodesRef.current)
      .selectAll<SVGAElement, PointNode>("g")
      .data(() => hierarchy.descendants())
      .join("g")
      .attr("transform", `translate(0, ${size / 2})`)
      .attr("opacity", 0);

    // Maybe I should look att enter/exit/update nodes here
    nodes.append("circle").attr("r", CIRCLE_RADIUS);

    nodes
      .append("text")
      .attr("x", (d) => (d.children ? -6 : 6))
      .attr("text-anchor", (d) => (d.children ? "end" : "start"))
      .attr("paint-order", "stroke")
      .attr("fill", FONTCOLOR)
      .attr("font-size", FONTSIZE)
      .attr("stroke", "none")
      .text((d) => d.data.name);

    // make sure the labels are not pushed outside view
    const longestLabel = nodes.nodes().map((a) => {
      return Math.ceil(a?.getBBox().width);
    });
    return longestLabel.reduce((a, b) => Math.max(a, b));
  };

  const setTreeNodes = (root: PointNode) => {
    if (!linesRef.current || !nodesRef.current) return;

    const hoverEffect = (a: PointNode[], type: string) => {
      if (type === "mouseenter") {
        const activeNodes = nodes.filter((n) => a.indexOf(n) > -1);
        activeNodes
          .attr("fill", (d) => brighter(d.data.color))
          .attr("stroke", (d) => brighter(d.data.color));
        activeNodes
          .selectChild("text")
          .attr("stroke", (d) => brighter(d.data.color));
        links
          .filter((n) => a.indexOf(n.target) > -1)
          .attr("stroke", (d) => brighter(d.target.data.color));
      } else {
        nodes
          .transition()
          .duration(150)
          .attr("fill", (d: PointNode) => d.data.color)
          .attr("stroke", (d: PointNode) => d.data.color);
        nodes.selectChild("text").attr("stroke", "none");
        links
          .transition()
          .duration(150)
          .attr("stroke", (d) => d.target.data.color);
      }
    };

    // when we change these, we want to move from current to new.
    const links = d3
      .select(linesRef.current)
      .selectAll("path")
      .data(() => root.links())
      .join("path")
      .attr("stroke", (d: d3.HierarchyPointLink<Data>) => d.target.data.color);

    links
      .transition()
      .duration(ANIMATION_TIMER)
      .attr(
        "d",
        d3
          .link<unknown, PointNode>(d3.curveBumpX)
          .x((d) => d.y)
          .y((d) => d.x)
      );

    const nodes = d3
      .select(nodesRef.current)
      .selectAll<SVGSVGElement, PointNode>("g")
      .data(() => root.descendants())
      .join("g")
      .attr("fill", (d) => d.data.color)
      .attr("stroke", (d) => d.data.color);

    nodes
      .selectAll<SVGSVGElement, PointNode>("circle")
      .attr("fill", (d) => (d.children ? "inherit" : "none"));

    nodes
      .transition()
      .duration(ANIMATION_TIMER)
      .attr("opacity", 1)
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    links.on("mouseenter mouseout", (e, d) => {
      const a = d.target.ancestors();
      return hoverEffect(a, e.type);
    });

    nodes.on("mouseenter mouseout", (e, d) => {
      const a = d.ancestors();
      return hoverEffect(a, e.type);
    });
  };

  const setStartPosition = (transform: string) => {
    d3.select(nodesRef.current)
      .transition()
      .duration(ANIMATION_TIMER)
      .attr("transform", transform);
    d3.select(linesRef.current)
      .transition()
      .duration(ANIMATION_TIMER)
      .attr("transform", transform);
  };

  const centerTree = (
    treeLayout: d3.TreeLayout<Data> | d3.ClusterLayout<Data>,
    isCluster: boolean
  ) => {
    const hierarchy = createColorfulHierarchy(treeLayout, data, colorSetter);
    treeLayout.size([size, size]);

    let nodeLength = labelLength;
    if (!layout) {
      // Height is number of nodes with root at the top, leaves at the bottom.
      // Every node get's a padding for the circle
      // the node height =  MARGIN. For length, we want to compensate for label
      treeLayout.nodeSize([MARGIN, size / hierarchy.height - labelLength]);
      nodeLength = createNodes(hierarchy);
      setLabelLength(nodeLength);
    }
    // recalculating nodeSize so that the nodes are not pushed outside view
    treeLayout.nodeSize([MARGIN, size / hierarchy.height - nodeLength / 2]);
    treeLayout(hierarchy);

    let right = size;
    let left = -size;
    hierarchy.each((d) => {
      if (d.x > left) left = d.x;
      if (d.x < right) right = d.x;
    });

    const rootElement = d3
      .select(nodesRef.current)
      .selectChild()
      .node() as SVGGraphicsElement;
    // its better to adjust position with translate then changing the viewport
    setStartPosition(
      `translate(${Math.ceil(
        rootElement?.getBBox()?.width ?? nodeLength + MARGIN
      )},${-right + MARGIN})`
    );

    // We let tree height be dynamic to keep the margins and size
    const height = left - right + MARGIN * 2;
    const svg = d3.select(svgRef.current);
    svg.attr("height", () => height);
    svg.attr("viewBox", () => [0, 0, size, height]);

    setTreeNodes(hierarchy);
    setLayout({ type: "tidy", cluster: isCluster });
  };

  const setTreeLayout = () => {
    // d3.tree returns a layout function that sets the x and y coordinates for each node in the hierarchy in a manner that keeps nodes that are at the same depth aligned vertically
    // root height is the greatest distance from any descendant leaf.
    // node size here is distance between depths
    const treeLayout = d3.tree<Data>();
    centerTree(treeLayout, false);
  };

  return (
    <>
      <div className="settings"></div>
      <div className="tree-container">
        <div className="container">
          <svg
            ref={svgRef}
            width={`${size}px`}
            height={`${size}px`}
            viewBox={`0 0 ${size} ${size}`}
          >
            <g className="lines" ref={linesRef}></g>
            <g className="nodes" ref={nodesRef}></g>
          </svg>
        </div>
      </div>
    </>
  );
};

const brighter = (color: string) => d3.rgb(color).brighter(2).formatRgb();

const createColorfulHierarchy = (
  treeLayout: d3.TreeLayout<Data> | d3.ClusterLayout<Data>,
  data: Data,
  colorSetter: d3.ScaleOrdinal<string, string, never>
) => {
  const hierarchy = treeLayout(d3.hierarchy(data));
  sortByHeight(hierarchy);

  const setBranchColor = (
    d: d3.HierarchyPointNode<Data>,
    branchColor: string
  ) => {
    d.data.color = branchColor;
    if (!d.children) return;
    d.children.forEach((c) => setBranchColor(c, branchColor));
  };

  hierarchy.children?.forEach((d) =>
    setBranchColor(d, colorSetter(d.data.name))
  );
  return hierarchy;
};
