export function splitFilePath(path: string) {
  const slash = path.lastIndexOf("/");
  if (slash === -1) return { name: path, dir: "" };
  return { name: path.slice(slash + 1), dir: path.slice(0, slash) };
}
