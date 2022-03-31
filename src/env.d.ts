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

declare module '*theme.colors.js' {
  const themeColors: {
    primary: {
      "100": number,
      "200": number, 
      "300": number,
      "400": number,
      "500": number
    },
    highlight: {
      "100": number,
      "200": number, 
      "300": number,
      "400": number,
      "500": number
    },
    secondary: {
      "100": number,
      "200": number, 
      "300": number,
      "400": number,
      "500": number
    },
    compliment: {
      "100": number,
      "200": number, 
      "300": number,
      "400": number,
      "500": number
    }
  }
  export default themeColors;
}
