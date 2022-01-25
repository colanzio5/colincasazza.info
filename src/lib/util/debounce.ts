// export const debounce = (
//   n: number,
//   fn: (...params: any[]) => any,
//   immed = false
// ): ((...args: any[]) => any) => {
//   let timer: number | undefined = undefined;
//   return function (this: any, ...args: any[]) {
//     if (timer === undefined && immed) {
//       fn.apply(this, args);
//     }
//     clearTimeout(timer);
//     timer = setTimeout(() => fn.apply(this, args), n);
//     return timer;
//   };
// };

// export const debounce = <T extends (...args: any[]) => any>(
//   callback: T,
//   waitFor: number
// ) => {
//   let timeout: ReturnType<typeof setTimeout>;
//   return (...args: Parameters<T>): ReturnType<T> => {
//     let result: any;
//     timeout && clearTimeout(timeout);
//     timeout = setTimeout(() => {
//       result = callback(...args);
//     }, waitFor);
//     return result;
//   };
// };

export function debounce<T> (fn: T, wait: number) {
  let timer: ReturnType<typeof setTimeout>
  return (event: Event) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      if (typeof fn === 'function') {
        fn(event)
      }
    }, wait)
  }
}