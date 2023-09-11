import { useMemo, useRef, useLayoutEffect } from "react";
import * as d3 from "d3";
import {
  type RectanglePoints,
  type Data,
  setColor,
  processData,
} from "../util";
import frontend from "../../data/frontend.json";
import backend from "../../data/backend.json";
import ops from "../../data/operations.json";

interface GraphParams {
  size: number;
}
const joined = {
  name: "skills",
  children: [
    { name: "frontend", children: frontend },
    { name: "backend", children: backend },
    { name: "operations", children: ops },
  ],
};

const rings = 4;

export const SkillGraph = ({ size }: GraphParams) => {
  const colorSetter = d3.scaleOrdinal(
    d3.quantize(
      d3.piecewise(d3.interpolateHsl, ["#3b82f6", "#10b98199", "#f9a8d4"]),
      3
    )
  );
  const data = processData(joined);
  const ref = useRef<SVGSVGElement>(null);
  const radius = size / (rings * 2);

  const rootNode: d3.HierarchyRectangularNode<Data> = useMemo(() => {
    const hirarchy = d3.hierarchy(data);
    hirarchy.count();

    const partition = d3
      .partition<Data>()
      .size([2 * Math.PI, hirarchy.height + 1])(
      hirarchy
    ) as d3.HierarchyRectangularNode<Data>;

    setColor(partition, colorSetter);

    return partition.each((d) => (d.data.current = d));
  }, [data, size]);

  // for every datum, add a slice to the arc
  const setArc = d3
    .arc<d3.HierarchyRectangularNode<Data>>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005)) // space between slices
    .padRadius(radius * 1.5)
    .innerRadius((d) => d.y0 * radius) // radius for the inside of the circle
    .outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 1)); // radius for outside

  // We only want to show 3 rings
  const arcVisible = (d: RectanglePoints) =>
    d ? d.y1 <= rings && d.y0 >= 1 && d.x1 > d.x0 : false;

  // Hide labels that doesn't fit
  const labelVisible = (d: RectanglePoints) =>
    d.y1 <= rings && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;

  // center label text
  const labelTransform = (d: d3.HierarchyRectangularNode<Data>) => {
    const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI; // 180
    const y = ((d.y0 + d.y1) / 2) * radius; // translate 80, rotate 180

    // clockwise, distance, spin
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  };

  useLayoutEffect(() => {
    if (!ref.current) return;

    const container = d3
      .select<d3.BaseType, unknown>(ref.current)
      .attr("transform", `translate(${size / 2},${size / 2})`);

    const slices = container
      .append("g")
      .selectAll<SVGPathElement, d3.HierarchyRectangularNode<Data>>("path")
      .data(rootNode.descendants().slice(1))
      .join("path")
      .attr("fill", (d) => d.data.color)
      .attr("fill-opacity", (d) => (arcVisible(d.data.current) ? 1 : 0))
      .attr("pointer-events", (d) =>
        arcVisible(d.data.current) ? "auto" : "none"
      )
      .attr("d", (d) => setArc(d.data.current));

    slices
      .filter((d) => Boolean(d.children))
      .style("cursor", "pointer")
      .on("click", (_, s) => clicked(s, center, container, slices, labels));

    const labels = container
      .append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .style("user-select", "none")
      .selectAll<SVGTextElement, d3.HierarchyRectangularNode<Data>>("text")
      .data(rootNode.descendants().slice(1))
      .join("text")
      .attr("font-size", (d) => {
        return `${Math.min(Math.floor((d.x1 - d.x0) * radius + 2), 14)}px`;
      })
      .attr("fill-opacity", (d) => +labelVisible(d.data.current))
      .attr("transform", (d) => labelTransform(d.data.current))
      .text((d) =>
        d.data.name.length >= 15
          ? `${d.data.name.substring(0, 14)}...`
          : d.data.name
      );

    container
      .append("text")
      .text(rootNode.data.name)
      .attr("text-anchor", "middle")
      .attr("font-size", "1.3rem")
      .attr("fill", "#ccc");

    const center = container
      .append<SVGCircleElement>("circle")
      .datum<d3.HierarchyRectangularNode<Data>>(rootNode);

    center
      .attr("r", radius)
      .attr("class", "parent")
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", (_, c) => clicked(c, center, container, slices, labels));

    return () => {
      if (!ref.current) return;
      ref.current.innerHTML = "";
    };
  }, []);

  /**
   *
   * @param active The clicked element
   * @param center Center circle
   * @param container To update the animations
   * @param slices Change the position of slices, their visibility and animate them
   * @param labels  Change the position of labels, their visibility and animate them
   */
  function clicked(
    active: d3.HierarchyRectangularNode<Data>,
    center: d3.Selection<
      SVGCircleElement,
      d3.HierarchyRectangularNode<Data>,
      null,
      undefined
    >,
    container: d3.Selection<d3.BaseType, unknown, null, unknown>,
    slices: d3.Selection<
      SVGPathElement,
      d3.HierarchyRectangularNode<Data>,
      SVGGElement,
      d3.HierarchyRectangularNode<Data>
    >,
    labels: d3.Selection<
      SVGTextElement,
      d3.HierarchyRectangularNode<Data>,
      SVGGElement,
      d3.HierarchyRectangularNode<Data>
    >
  ) {
    center
      .datum(active?.parent || rootNode)
      .attr("cursor", (d) => (d.depth > 0 ? "pointer" : "default"));
    const text = container.selectChild("text").attr("opacity", 0);

    text.text(active.data.name).transition().duration(750);
    text.transition().duration(750).attr("opacity", 1);

    // for x: we are building left and right curve from the clicked element.
    // It needs to grow to fill the same percantage of the parent.
    // multiply by 2 to get diameter instead of .
    // for y:we need to substract the depth of the clicked element for new y.
    rootNode.each(
      (d) =>
        (d.data.target = {
          ...d.data.target,
          x0:
            Math.max(
              0,
              Math.min(1, (d.x0 - active.x0) / (active.x1 - active.x0))
            ) *
            2 *
            Math.PI,
          x1:
            Math.max(
              0,
              Math.min(1, (d.x1 - active.x0) / (active.x1 - active.x0))
            ) *
            2 *
            Math.PI,
          y0: Math.max(0, d.y0 - active.depth),
          y1: Math.max(0, d.y1 - active.depth),
        })
    );

    const t = container.transition().duration(750);
    slices
      .transition(t)
      .tween("animated-slices", (d) => {
        const i = d3.interpolate(d.data.current, d.data.target!);
        return (time) =>
          (d.data.current = { ...d.data.current, ...i(time) } as any);
      })
      .attr("fill-opacity", (d) => (arcVisible(d.data.target!) ? 1 : 0))
      .attr("pointer-events", (d) =>
        arcVisible(d.data.target!) ? "auto" : "none"
      )
      .attrTween("d", (d) => () => setArc(d.data.current) || "");

    labels
      .transition(t)
      .attr(
        "font-size",
        (d) =>
          `${Math.min(
            Math.floor((d.data.target!.x1 - d.data.target!.x0) * radius + 2),
            14
          )}px`
      )
      .attr("fill-opacity", (d) => +labelVisible(d.data.target!))
      .attrTween("transform", (d) => () => labelTransform(d.data.current));
  }

  return (
    <>
      <div className="flex items-center justify-center h-full">
        <svg
          width={`${size}px`}
          height={`${size}px`}
          viewBox={`0 0 ${size} ${size}`}
        >
          <g ref={ref}></g>
        </svg>
      </div>
    </>
  );
};
