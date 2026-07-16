import { useEffect, useRef } from 'react';

export function useOutsideClick(ref, onOutsideClick) {
  const handlerRef = useRef(onOutsideClick);

  useEffect(() => {
    handlerRef.current = onOutsideClick;
  });

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) handlerRef.current();
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref]);
}
