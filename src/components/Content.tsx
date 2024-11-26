import { JSXElement, Match, Switch } from "solid-js";
import Issues from "./Issues.tsx";
import Details from "./Details.tsx";
import { useApi } from "@/Api.tsx";

export default function Content() {
 const [$store] = useApi();

 return (
  <section id="content" class="bg-background h-full">
   <Switch>
    <Match when={!$store.selectedRepo}>
     <span class="h-full grid place-content-center">no repo selected</span>
    </Match>
    <Match when={!!$store.selectedRepo && !$store.selectedIssue}>
     <ListPanel>
      <Issues />
     </ListPanel>
    </Match>
    <Match when={!!$store.selectedIssue}>
     <DetailPanel>
      <Details />
     </DetailPanel>
    </Match>
   </Switch>
  </section>
 );
}

function ListPanel(props: { children: JSXElement }) {
 return (
  <div id="list-panel" class="bg-background text-foreground h-full w-full">
   {props.children}
  </div>
 );
}

function DetailPanel(props: { children: JSXElement }) {
 return (
  <div id="detail-panel" class="bg-background text-foreground h-full w-full">
   {props.children}
  </div>
 );
}
