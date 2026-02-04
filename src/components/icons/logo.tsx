import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={props.width || 40}
      height={props.height || 40}
      {...props}
    >
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill="currentColor"
        d="M168 40.7a96 96 0 0 0-80 0V88h80V40.7zM80 104v18.1a52 52 0 0 0 24 43.1V224h48v-58.8a52 52 0 0 0 24-43.1V104zm0 0"
        opacity={0.2}
      />
      <path
        fill="currentColor"
        d="M224 88h-48V40a8 8 0 0 0-8-8h-16a8 8 0 0 0-8 8v48h-32V40a8 8 0 0 0-8-8H88a8 8 0 0 0-8 8v48H32a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h16.2a59.9 59.9 0 0 1 29.8 49.3V224a8 8 0 0 0 8 8h64a8 8 0 0 0 8-8v-22.7a59.9 59.9 0 0 1 29.8-49.3H224a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8zM96 48h48v40H96zm-41.8 96a44.2 44.2 0 0 0-14.1-32h175.8a44.2 44.2 0 0 0-14.1 32 43.9 43.9 0 0 0-29.9 41.3V216h-48v-30.7a59.9 59.9 0 0 1-29.8-49.3A59.9 59.9 0 0 1 84.1 128H40.1a43.9 43.9 0 0 0-29.9-41.3H16v-32h48v40a8 8 0 0 0 8 8h64a8 8 0 0 0 8-8V96h48v32h24v32z"
      />
    </svg>
  );
}
