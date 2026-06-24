// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  /* theme: {
    extend: {
      colors: {
        primary: '#1677ff', // 和 Ant Design 主色完全一致
      },
    },
  }, */
  important: true, // 所有工具类自动加 !important
  corePlugins: {
    preflight: false, // 保留这个，解决 Ant Design 冲突
  }
}