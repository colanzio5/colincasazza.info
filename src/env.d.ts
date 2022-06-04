/// <reference types="vite/client" />

import { Emitter, EventType } from 'mitt';
import { DefineComponent } from 'vue'
import { Router, LocationAsPath } from 'vue-router'

declare module '*.vue' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{
    $eventBus: Emitter<Record<EventType, unknown>>
  }, {}, any>
  export default component
}

declare module 'vue/types/vue' {
  // Augment component instance type
  interface Vue {
    beforeRouteEnter?(
      to: Router,
      from: Router,
      next: (to?: LocationAsPath | false | ((vm: Vue) => void)) => void
    ): void

    beforeRouterLeave?(
      to: Router,
      from: Router,
      next: (to?: LocationAsPath | false | ((vm: Vue) => void)) => void
    ): void

    beforeRouterUpdate?(
      to: Router,
      from: Router,
      next: (to?: LocationAsPath | false | ((vm: Vue) => void)) => void
    ): void
  }
}

declare module '*themeColors.js' {
  const themeColors: {
    primary: {
      "50": number,
      "100": number,
      "200": number, 
      "300": number,
      "400": number,
      "500": number,
      "600": number,
      "700": number,
      "800": number,
      "900": number,
    },
    highlight: {
      "50": number,
      "100": number,
      "200": number, 
      "300": number,
      "400": number,
      "500": number,
      "600": number,
      "700": number,
      "800": number,
      "900": number,
    },
    secondary: {
      "50": number,
      "100": number,
      "200": number, 
      "300": number,
      "400": number,
      "500": number,
      "600": number,
      "700": number,
      "800": number,
      "900": number,
    },
    compliment: {
      "50": number,
      "100": number,
      "200": number, 
      "300": number,
      "400": number,
      "500": number,
      "600": number,
      "700": number,
      "800": number,
      "900": number,
    }
  }
  export default themeColors;
}
