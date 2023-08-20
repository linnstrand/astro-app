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
    <div class="main-grid mb-2">
      <h4 class="col-start-3 relative">{props.skill.name}</h4>
      {props.skill?.children && (
        <For each={props.skill.children}>
          {(item, index) => {
            const isLeft = index() % 2 === 0;
            const colnr = isLeft ? 1 : 5;
            const rownr = Math.ceil((index() + 1) / 2);

            if (!Array.isArray(item.children)) {
              return (
                <div class={`place- col-start-${colnr} row-start-${rownr}`}>
                  {item.name}
                </div>
              );
            }
            return (
              <div
                class={` text-center group grid cursor-pointer relative col-start-${colnr} row-start-${rownr}`}
              >
                <h5 class={`group-hover text-red-900 row-start-${rownr}`}>
                  {item.name}
                </h5>
                <div
                  class={`child-list transition-opacity duration-500 ease-out opacity-0 group-hover:opacity-100 absolute bg-red-200  ${
                    isLeft ? "before:left-full" : "before:right-full"
                  } ${
                    isLeft ? "-left-32" : "-right-32"
                  } top-1 border-2 border-white w-28`}
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
