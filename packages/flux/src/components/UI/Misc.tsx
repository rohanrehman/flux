/** @jsxImportSource @madenowhere/phaze */
// Misc-the-old-file is now just a re-export of Overlay for back-compat.
// Portal moved out to `./Portal.tsx` so `@madenowhere/phaze/portal` is
// only imported when color/joystick/image plugins actually pull it in,
// rather than via the UI barrel.
export { Overlay } from './StyledUI'
