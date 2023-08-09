import * as d3 from "d3";

export const MyVector = () => {
  const radius = size / 6;

  const arc = d3
    .arc()
    .innerRadius(radius * 0.67)
    .outerRadius(radius - 1);

  const pie = d3
    .pie()
    .padAngle(1 / radius)
    .sort(null)
    .value((d) => d.value);

  return (
    <>
      <div className="container" style={{ margin: "10px" }}>
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
