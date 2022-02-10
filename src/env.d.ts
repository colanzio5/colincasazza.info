/// <reference types="vite/client" />

import { Emitter, EventType } from 'mitt';
import { DefineComponent } from 'vue'

declare module '*.vue' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{
    $eventBus: Emitter<Record<EventType, unknown>>
  }, {}, any>
  export default component
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