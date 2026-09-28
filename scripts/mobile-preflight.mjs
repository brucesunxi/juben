import { access, constants } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import process from "node:process";

const root = new URL("..", import.meta.url);
const rootPath = root.pathname.replace(/\/$/, "");

function commandVersion(command, args = ["--version"]) {
  try {
    return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().split("\n")[0];
  } catch {
    return "not found";
  }
}

async function exists(relativePath) {
  try {
    await access(new URL(relativePath, root), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

const checks = [
  ["Node.js", commandVersion(process.execPath)],
  ["Capacitor CLI", commandVersion("npx", ["cap", "--version"])],
  ["Java", commandVersion("java")],
  ["Xcode command line tools", commandVersion("xcodebuild", ["-version"])],
];

console.log("Nocturne mobile release preflight");
console.log("---------------------------------");
for (const [label, value] of checks) {
  const state = value === "not found" ? "MISSING" : "READY";
  console.log(`${state.padEnd(8)} ${label}: ${value}`);
}

const paths = [
  ["Android project", "android/gradlew"],
  ["iOS project", "ios/App/App.xcodeproj/project.pbxproj"],
  ["Production runtime config", "public/runtime-config.js"],
  ["Privacy policy page", "public/privacy.html"],
  ["Terms page", "public/terms.html"],
];

console.log("\nProject files");
console.log("-------------");
for (const [label, path] of paths) {
  console.log(`${(await exists(path) ? "READY" : "MISSING").padEnd(8)} ${label}: ${path}`);
}

const javaReady = checks.find(([label]) => label === "Java")?.[1] !== "not found";
const xcodeReady = checks.find(([label]) => label === "Xcode command line tools")?.[1] !== "not found";
const signingKeys = ["ANDROID_KEYSTORE_PATH", "ANDROID_KEYSTORE_PASSWORD", "ANDROID_KEY_ALIAS", "ANDROID_KEY_PASSWORD"];
const androidSigningReady = signingKeys.every((key) => String(process.env[key] || "").trim());
console.log("\nBuild commands");
console.log("--------------");
console.log(javaReady ? "Android: ./android/gradlew :app:bundleRelease" : "Android: install a JDK and set JAVA_HOME before building the signed AAB");
console.log(xcodeReady ? "iOS: open ios/App/App.xcodeproj in Xcode and Archive" : "iOS: install Xcode command line tools before archiving");
console.log(`${androidSigningReady ? "READY" : "MISSING"}   Android release signing: ${androidSigningReady ? "environment variables configured" : "set ANDROID_KEYSTORE_PATH, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS and ANDROID_KEY_PASSWORD"}`);
console.log("The final store build still requires real signing credentials, store metadata, screenshots, privacy URL and review notes.");
