import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  // El manual se lee de docs/ en tiempo de ejecución: asegúrate de que viaja con el despliegue.
  outputFileTracingIncludes: { "/[...path]": ["./docs/MANUAL_USUARIO.md"] },
};
export default config;
