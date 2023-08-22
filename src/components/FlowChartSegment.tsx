/** @jsx preserve */
/** @jsxImportSource solid-js */
import { For, Index } from "solid-js";

interface Skill {
  name: string;
  children?: Skill[];
}
interface Props {
  skill: Skill;
}

export const FlowChartSegment = (props: Props) => {
  return (
    <div class="main-grid my-4">
      <h4 class="lines lines-before lines-after after:w-7 before:w-7 before:top-1/2 after:left-full before:right-full grid p-1 col-start-3 relative w-full">
        {props.skill.name}
      </h4>
      {props.skill?.children && (
        <For each={props.skill.children}>
          {(item, index) => {
            const isLeft = index() % 2 === 0;
            const colnr = isLeft ? "col-start-1" : "col-start-5";

            if (!Array.isArray(item.children)) {
              return (
                <div
                  class={`lines grid p-1 w-full border-2 bg-gray-700 border-gray-500  ${colnr} `}
                >
                  {item.name}
                </div>
              );
            }

            return (
              <div
                class={`lines w-full p-1 text-center group grid cursor-pointer relative ${colnr} `}
              >
                <h5 class={`p-1 group-hover text-gray-100 `}>{item.name}</h5>
                <div
                  class={`lines lines-before before:w-5 -m-1 transition-opacity duration-500 ease-out opacity-0 group-hover:opacity-100 absolute ${
                    isLeft ? "before:left-full" : "before:right-full"
                  } ${isLeft ? "-left-32" : "-right-32"} top-1 w-28`}
                >
                  <For each={item.children}>
                    {(c) => <div class=" p-1">{c.name}</div>}
                  </For>
                </div>
              </div>
            );
          }}
        </For>
      )}
    </div>
  );
};
