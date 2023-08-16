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

export const Forcegraph = ({ data }: { data: Data }) => {
  const ref = useRef<SVGSVGElement>(null);
  const color = getDiscreteColors((data.children?.length || 0) + 1);

  const rootNode: any = useMemo(() => d3.hierarchy(data), [data]);
  useLayoutEffect(() => {
    const links = rootNode.links();
    const nodes = rootNode.descendants();
    console.log(links);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.data.name)
          .distance(100)
          .strength(1.6)
      )
      .force("charge", d3.forceManyBody().strength(-200));

    const container = d3.select<d3.BaseType, unknown>(ref.current);

    // Append links.

    const link = container
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line");

    const node = container.selectAll("g").data(nodes).join("g");
    node
      .append("circle")
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .attr("r", 10);

    node
      .append("text")
      .attr("x", 6)
      .attr("text-anchor", (d) => (d.children ? "end" : "start"))
      .attr("paint-order", "stroke")
      .attr("fill", "#eee")
      .attr("font-size", 12)
      .text((d) => d.data.name)
      .attr("stroke-width", 3);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      if (!ref.current) return;
      ref.current.innerHTML = "";
    };
  }, []);

  return (
    <>
      <div className="container" style={{ margin: "10px" }}>
        <svg
          width={`${width}px`}
          height={`${height}px`}
          viewBox={`-${width / 2} -${height / 2} ${width} ${height}`}
        >
          <g ref={ref}></g>
        </svg>
      </div>
    </>
  );
};
