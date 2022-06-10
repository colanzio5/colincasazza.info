/// <reference types="vite/client" />

import { Emitter, EventType } from "mitt";
import { DefineComponent } from "vue";
import { Router, LocationAsPath } from "vue-router";

declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module "*.vue" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<
    {
      $eventBus: Emitter<Record<EventType, unknown>>;
    },
    // eslint-disable-next-line @typescript-eslint/ban-types
    {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >;
  export default component;
}

declare module "vue/types/vue" {
  // Augment component instance type
  interface Vue {
    beforeRouteEnter?(
      to: Router,
      from: Router,
      next: (to?: LocationAsPath | false | ((vm: Vue) => void)) => void
    ): void;

    beforeRouterLeave?(
      to: Router,
      from: Router,
      next: (to?: LocationAsPath | false | ((vm: Vue) => void)) => void
    ): void;

    beforeRouterUpdate?(
      to: Router,
      from: Router,
      next: (to?: LocationAsPath | false | ((vm: Vue) => void)) => void
    ): void;
  }
}
