import React from "react";

// Official Phosphor Icons (Regular weight, 256x256 viewBox)
// Clean outlines, matched optical sizing and stroke weights for premium luxury tailoring

export function ListIcon({ size = 22, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
    </svg>
  );
}

export function XIcon({ size = 20, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
    </svg>
  );
}

export function SunIcon({ size = 20, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM40,120H16a8,8,0,0,0,0,16H40a8,8,0,0,0,0-16Zm200,0H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16ZM120,216v24a8,8,0,0,0,16,0V216a8,8,0,0,0-16,0Z" />
    </svg>
  );
}

export function MoonIcon({ size = 20, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM136,208A88,88,0,0,1,54.61,84.18,88.78,88.78,0,0,1,85.34,57.3,104.07,104.07,0,0,0,198.7,170.66,88.78,88.78,0,0,1,136,208Z" />
    </svg>
  );
}

export function CaretRightIcon({ size = 16, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
    </svg>
  );
}

export function CaretLeftIcon({ size = 16, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
    </svg>
  );
}

// Exact Concrete.store 3D Shopping Bag Icon requested by user
export function ConcreteShoppingBagIcon({ size = 22, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const width = size;
  const height = (size * 33.787) / 30.029;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 30.029 33.787"
      fill="currentColor"
      aria-hidden="true"
      style={{ display: "block" }}
      {...props}
    >
      <path
        d="M41.278,15.255H35.97A5.688,5.688,0,0,0,30.017,10a7.35,7.35,0,0,0-.968.06.758.758,0,1,0,.21,1.5,5.562,5.562,0,0,1,.758-.06,4.151,4.151,0,0,1,4.437,3.754h-4.5A5.688,5.688,0,0,0,24,10a5.688,5.688,0,0,0-5.953,5.255H12.751a.751.751,0,0,0-.751.751V43.031a.751.751,0,0,0,.751.751H35.272a.751.751,0,0,0,.173,0h.068a.923.923,0,0,0,.188-.105.18.18,0,0,0,.06-.045.435.435,0,0,0,.12-.143.255.255,0,0,0,.06-.068,2.537,2.537,0,0,1,2.335-1.141,2.56,2.56,0,0,1,2.335,1.089.751.751,0,0,0,.668.413.683.683,0,0,0,.173,0,.751.751,0,0,0,.578-.751V16.006A.751.751,0,0,0,41.278,15.255Zm-12.011,4.5a.751.751,0,1,1-.751.751A.751.751,0,0,1,29.266,19.759ZM24.011,11.5a4.151,4.151,0,0,1,4.437,3.754H25.6a5.51,5.51,0,0,1,.586-1.712.76.76,0,0,0-1.321-.751,7.027,7.027,0,0,0-.751,2.432H19.6A4.151,4.151,0,0,1,24.011,11.5Zm-5.255,8.258a.751.751,0,1,1-.751.751A.751.751,0,0,1,18.756,19.759ZM34.521,42.28H13.5V16.756h4.5v1.637a2.252,2.252,0,1,0,1.5,0V16.756h9.009v1.637a2.252,2.252,0,1,0,1.5,0V16.756h4.5Zm6.006-.961a4.564,4.564,0,0,0-2.252-.541,4.647,4.647,0,0,0-2.252.541V16.756h4.5Z"
        transform="translate(-12 -10)"
      />
    </svg>
  );
}

export function ShoppingBagIcon({ size = 22, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M216,40H176V32a24,24,0,0,0-24-24H104A24,24,0,0,0,80,32v8H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM96,32a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM216,200H40V56H80V72a8,8,0,0,0,16,0V56h64V72a8,8,0,0,0,16,0V56h40V200Z" />
    </svg>
  );
}
