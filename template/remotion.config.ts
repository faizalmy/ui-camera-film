import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// "@/..." resolves to src/ (handy when a React subject is installed with the shadcn CLI).
Config.overrideWebpackConfig((c) => ({ ...c, resolve: { ...c.resolve, alias: { ...(c.resolve?.alias as object), "@": path.resolve(process.cwd(), "src") } } }));
