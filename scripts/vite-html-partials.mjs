import { readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const includePattern = /<!--\s*@include\s+([^\s]+)\s*-->/g;

export function htmlPartials(options = {}) {
  const projectRoot = resolve(options.root || process.cwd());
  const partialsRoot = resolve(projectRoot, options.partialsDir || "src/partials");

  const expand = (html, importer, stack = []) =>
    html.replace(includePattern, (_match, request) => {
      const partialPath = request.startsWith("/")
        ? resolve(projectRoot, `.${request}`)
        : resolve(dirname(importer), request);

      if (!partialPath.startsWith(`${partialsRoot}/`)) {
        throw new Error(
          `[html-partials] Include must point inside ${relative(projectRoot, partialsRoot)}: ${request}`,
        );
      }

      if (stack.includes(partialPath)) {
        const chain = [...stack, partialPath]
          .map((file) => relative(projectRoot, file))
          .join(" -> ");
        throw new Error(`[html-partials] Circular include: ${chain}`);
      }

      let partial;
      try {
        partial = readFileSync(partialPath, "utf8");
      } catch {
        throw new Error(
          `[html-partials] Cannot read ${request} from ${relative(projectRoot, importer)}`,
        );
      }

      return expand(partial, partialPath, [...stack, partialPath]);
    });

  return {
    name: "trialli-html-partials",
    enforce: "pre",
    transformIndexHtml: {
      order: "pre",
      handler(html, context) {
        const importer = context?.filename || resolve(projectRoot, "index.html");
        return expand(html, importer);
      },
    },
    configureServer(server) {
      server.watcher.add(partialsRoot);
    },
    handleHotUpdate(context) {
      if (!context.file.startsWith(`${partialsRoot}/`)) return;
      context.server.ws.send({ type: "full-reload" });
      return [];
    },
  };
}
