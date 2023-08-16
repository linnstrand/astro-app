import { useMemo, useRef, useLayoutEffect } from "react";
import * as d3 from "d3";
import {
  sortByHeight,
  RectanglePoints,
  Data,
  getDiscreteColors,
  setBranchColor,
} from "./util";

const width = 1200;
const height = 900;

export const Treemap = ({ data }: { data: Data }) => {
  const ref = useRef<SVGSVGElement>(null);
  const color = getDiscreteColors((data.children?.length || 0) + 1);

  const rootNode: d3.HierarchyRectangularNode<Data> = useMemo(() => {
    return d3.treemap<Data>().size([1200, 600]).padding(1).round(true)(
      d3.hierarchy(data).count()
    );
  }, [data]);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const container = d3.select<d3.BaseType, unknown>(ref.current);

    const leaf = container
      .selectAll("g")
      .data(rootNode.leaves())
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    // Append a color rectangle.
    leaf
      .append("rect")
      .attr("fill", (d) => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .attr("fill-opacity", 0.6)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0);

    // Append a clipPath to ensure text does not overflow.
    leaf.append("clipPath").append("use");

    // Append multiline text. The last line shows the value and has a specific formatting.
    leaf
      .append("text")
      .selectAll("tspan")
      .data((d) => d.data.name.split(/(?=[A-Z][a-z])|\s+/g))
      .join("tspan")
      .attr("x", 3)
      .attr(
        "y",
        (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`
      )
      .attr("fill-opacity", (d, i, nodes) =>
        i === nodes.length - 1 ? 0.7 : null
      )
      .text((d) => d);

    return () => {
      if (!ref.current) return;
      ref.current.innerHTML = "";
    };
  }, []);

  return (
    <>
      <div className="container" style={{ margin: "10px" }}>
        <svg
          width={`${1200}px`}
          height={`${900}px`}
          viewBox={`0 0 ${1200} ${900}`}
        >
          <g ref={ref}></g>
        </svg>
      </div>
    </>
  );
};
