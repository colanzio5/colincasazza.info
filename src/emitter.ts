import { getCurrentInstance } from 'vue'

export default function useEmitter() {
    const internalInstance = getCurrentInstance();
    if(!internalInstance) throw new Error("global event emitter could not be created.")
    const emitter = internalInstance.appContext.config.globalProperties.emitter;
    return emitter;
}