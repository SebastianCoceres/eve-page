import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  { ignores: [".claude/**", ".impeccable/**", ".atl/**"] },
  ...nextCoreWebVitals,
];

export default eslintConfig;
