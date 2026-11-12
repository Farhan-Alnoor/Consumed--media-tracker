import { useLayoutEffect } from "react";

export default function useMediaTheme(type) {
  useLayoutEffect(() => {
    if (type) document.documentElement.dataset.media = type;
    return () => {
      delete document.documentElement.dataset.media;
    };
  }, [type]);
}
