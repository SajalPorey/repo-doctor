import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

try {
  console.log("Extending next/core-web-vitals...");
  const configs = compat.extends("next/core-web-vitals");
  console.log("Successfully loaded config objects. Count:", configs.length);
  
  for (let i = 0; i < configs.length; i++) {
    console.log(`Config [${i}]:`, Object.keys(configs[i]));
    if (configs[i].plugins) {
      console.log(`  Plugins:`, Object.keys(configs[i].plugins));
    }
  }
} catch (err) {
  console.error("Error loading config:", err);
}
