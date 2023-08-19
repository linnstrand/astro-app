/** @jsx preserve */
/** @jsxImportSource solid-js */
import { For, Index } from "solid-js";

interface Props {
  name: string;
  items: Array<string | string[]>;
  class?: string;
}

export const FlowChartSegment = (props: Props) => {
  console.log(props);

  return (
    <div class="main-grid mb-2">
      <h4 class="col-start-3 relative">{props.name}</h4>
      <For each={props.items}>
        {(item, index) => {
          const colnr = index() % 2 === 0 ? 1 : 5;
          const rownr = Math.ceil((index() + 1) / 2);

          if (!Array.isArray(item)) {
            return (
              <div class={`col-start-${colnr} row-start-${rownr}`}>{item}</div>
            );
          }
          return (
            <div class={`grid relative col-start-${colnr} row-start-${rownr}`}>
              <h5>{props.name}</h5>
              <div class="absolute bg-red-200 -left-24 top-1 border-2 border-white">
                <For each={item}>{(item) => <div class="p-1">{item}</div>}</For>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
};
