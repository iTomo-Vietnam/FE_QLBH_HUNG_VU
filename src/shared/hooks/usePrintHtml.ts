import { useCallback, useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

/** Keeps the print target mounted until react-to-print has captured it. */
// export const usePrintHtml = <T,>() => {
//   const [printData, setPrintData] = useState<T | null>(null);
//   const [shouldPrint, setShouldPrint] = useState(false);
//   const contentRef = useRef<HTMLDivElement>(null);
//   useEffect(() => {
//     if (!shouldPrint || printData === null || !contentRef.current) return;

//     const timer = window.setTimeout(() => {
//       const popup = window.open("", "_blank", "width=900,height=700");
//       if (!popup) return;
//       popup.document.write(`<!doctype html><html><head><title>In hóa đơn</title></head><body>${contentRef.current?.innerHTML || ""}</body></html>`);
//       popup.document.close();
//       popup.focus();
//       popup.print();
//       popup.close();
//       setShouldPrint(false);
//     }, 100);

//     return () => window.clearTimeout(timer);
//   }, [printData, shouldPrint]);

//   const handlePrint = useCallback((data: T) => {
//     setPrintData(data);
//     setShouldPrint(true);
//   }, []);

//   return { contentRef, printData, handlePrint } as const;
// };
export function usePrintHtml<T>() {
  const [printData, setPrintData] = useState<T | null>(null);
  const [shouldPrint, setShouldPrint] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const reactToPrintFn = useReactToPrint({ contentRef });

  // When data is set and we should print, trigger it after DOM update
  useEffect(() => {
    if (shouldPrint && printData !== null && contentRef.current) {
      // Small delay to ensure React has rendered the new data
      const timer = setTimeout(() => {
        reactToPrintFn();
        setShouldPrint(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [shouldPrint, printData, reactToPrintFn]);

  const handlePrint = useCallback((data: T) => {
    setPrintData(data);
    setShouldPrint(true);
  }, []);

  return { contentRef, printData, handlePrint } as const;
}
