const fs = require("fs/promises");
const path = require("path");
const http = require("http");
const { URL } = require("url");

const rootDir = path.resolve(__dirname, "..", "..");
const postsDir = path.join(rootDir, "source", "_posts");
const publicDir = path.join(__dirname, "public");
const env = loadEnv(path.join(rootDir, ".env"));

const host = env.EDITOR_HOST || "127.0.0.1";
const port = Number(env.EDITOR_PORT || 4100);
const token = env.EDITOR_TOKEN || "";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = decodeURIComponent(requestUrl.pathname);

    if (pathname === "/api/config") {
      return sendJson(res, 200, {
        host,
        port,
        requireToken: Boolean(token)
      });
    }

    if (pathname.startsWith("/api/")) {
      authorize(req);
      return handleApi(req, res, pathname);
    }

    return serveStatic(res, pathname);
  } catch (error) {
    const status = error.statusCode || 500;
    return sendJson(res, status, {
      error: error.message || "Unexpected error"
    });
  }
});

server.listen(port, host, () => {
  console.log(`Local editor running at http://${host}:${port}`);
});

async function handleApi(req, res, pathname) {
  if (pathname === "/api/posts" && req.method === "GET") {
    const posts = await listPosts();
    return sendJson(res, 200, { posts });
  }

  if (pathname === "/api/posts" && req.method === "POST") {
    const payload = await readJsonBody(req);
    const created = await createPost(payload);
    return sendJson(res, 201, created);
  }

  if (pathname.startsWith("/api/posts/")) {
    const fileName = pathname.slice("/api/posts/".length);

    if (req.method === "GET") {
      const post = await getPost(fileName);
      return sendJson(res, 200, post);
    }

    if (req.method === "PUT") {
      const payload = await readJsonBody(req);
      const updated = await updatePost(fileName, payload);
      return sendJson(res, 200, updated);
    }
  }

  return sendJson(res, 404, { error: "Not found" });
}

async function serveStatic(res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.join(publicDir, safePath);
  const normalized = path.normalize(filePath);

  if (!normalized.startsWith(publicDir)) {
    throw createError(403, "Forbidden");
  }

  let data;

  try {
    data = await fs.readFile(normalized);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw createError(404, "Static file not found");
    }

    throw error;
  }

  const extension = path.extname(normalized);
  res.writeHead(200, {
    "Content-Type": contentTypes[extension] || "application/octet-stream",
    "Cache-Control": "no-store"
  });
  res.end(data);
}

async function listPosts() {
  const entries = await fs.readdir(postsDir, { withFileTypes: true });
  const posts = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map(async (entry) => {
        const filePath = path.join(postsDir, entry.name);
        const raw = await fs.readFile(filePath, "utf8");
        const { meta, content } = parseFrontMatter(raw);
        const stats = await fs.stat(filePath);

        return {
          fileName: entry.name,
          title: meta.title || entry.name.replace(/\.md$/, ""),
          date: meta.date || "",
          updatedAt: stats.mtime.toISOString(),
          excerpt: meta.excerpt || meta.description || content.slice(0, 120),
          featured: Boolean(meta.featured)
        };
      })
  );

  posts.sort((left, right) => {
    const leftValue = Date.parse(left.date || left.updatedAt) || 0;
    const rightValue = Date.parse(right.date || right.updatedAt) || 0;
    return rightValue - leftValue;
  });

  return posts;
}

async function getPost(fileName) {
  const filePath = resolvePostPath(fileName);
  const raw = await fs.readFile(filePath, "utf8");
  const { meta, content } = parseFrontMatter(raw);

  return {
    fileName: path.basename(filePath),
    title: meta.title || "",
    date: meta.date || "",
    description: meta.description || "",
    tags: ensureArray(meta.tags),
    categories: ensureArray(meta.categories),
    cover: meta.cover || "",
    excerpt: meta.excerpt || "",
    readingTime: meta.reading_time || "",
    featured: Boolean(meta.featured),
    content,
    extraMeta: omitKnownMeta(meta)
  };
}

async function createPost(payload) {
  const requestedName = sanitizeFileName(payload.fileName || payload.title || "");
  const fileName = `${requestedName || fallbackFileName()}.md`;
  const filePath = resolvePostPath(fileName);

  try {
    await fs.access(filePath);
    throw createError(409, "A post with this file name already exists");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  await writePost(filePath, payload);
  return getPost(fileName);
}

async function updatePost(currentFileName, payload) {
  const currentPath = resolvePostPath(currentFileName);
  const requestedName = sanitizeFileName(payload.fileName || currentFileName.replace(/\.md$/, ""));
  const nextFileName = `${requestedName || fallbackFileName()}.md`;
  const nextPath = resolvePostPath(nextFileName);

  if (nextPath !== currentPath) {
    try {
      await fs.access(nextPath);
      throw createError(409, "Target file name already exists");
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    await fs.rename(currentPath, nextPath);
  }

  await writePost(nextPath, payload);
  return getPost(nextFileName);
}

async function writePost(filePath, payload) {
  const dateValue = payload.date && String(payload.date).trim() ? String(payload.date).trim() : formatDate(new Date());
  const meta = {
    title: String(payload.title || "").trim() || filePathToTitle(filePath),
    date: dateValue,
    description: String(payload.description || "").trim(),
    tags: splitList(payload.tags),
    categories: splitList(payload.categories),
    cover: String(payload.cover || "").trim(),
    excerpt: String(payload.excerpt || "").trim(),
    reading_time: String(payload.readingTime || "").trim(),
    featured: Boolean(payload.featured),
    ...(isObject(payload.extraMeta) ? payload.extraMeta : {})
  };

  const frontMatter = serializeFrontMatter(meta);
  const content = String(payload.content || "").replace(/\r\n/g, "\n").trimEnd();
  const body = `${frontMatter}\n${content ? `${content}\n` : ""}`;
  await fs.writeFile(filePath, body, "utf8");
}

function parseFrontMatter(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");

  if (!normalized.startsWith("---\n")) {
    return { meta: {}, content: normalized };
  }

  const endIndex = normalized.indexOf("\n---\n", 4);

  if (endIndex === -1) {
    return { meta: {}, content: normalized };
  }

  const header = normalized.slice(4, endIndex);
  const content = normalized.slice(endIndex + 5).replace(/^\n+/, "");
  const lines = header.split("\n");
  const meta = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line.trim()) {
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_]+):(?:\s(.*))?$/);

    if (!match) {
      continue;
    }

    const key = match[1];
    const inlineValue = match[2];

    if (inlineValue !== undefined && inlineValue !== "") {
      meta[key] = parseScalar(inlineValue.trim());
      continue;
    }

    const values = [];
    let cursor = index + 1;

    while (cursor < lines.length) {
      const itemMatch = lines[cursor].match(/^\s*-\s+(.*)$/);

      if (!itemMatch) {
        break;
      }

      values.push(parseScalar(itemMatch[1].trim()));
      cursor += 1;
    }

    if (values.length > 0) {
      meta[key] = values;
      index = cursor - 1;
    } else {
      meta[key] = "";
    }
  }

  return { meta, content };
}

function serializeFrontMatter(meta) {
  const orderedKeys = [
    "title",
    "date",
    "description",
    "tags",
    "categories",
    "cover",
    "excerpt",
    "reading_time",
    "featured"
  ];
  const extraKeys = Object.keys(meta).filter((key) => !orderedKeys.includes(key));
  const lines = ["---"];

  for (const key of [...orderedKeys, ...extraKeys]) {
    if (!(key in meta)) {
      continue;
    }

    const value = meta[key];

    if (value === "" || value === null || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        continue;
      }

      lines.push(`${key}:`);

      for (const item of value) {
        lines.push(`  - ${formatScalar(item)}`);
      }

      continue;
    }

    lines.push(`${key}: ${formatScalar(value)}`);
  }

  lines.push("---");
  return lines.join("\n");
}

function parseScalar(value) {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => parseScalar(item));
  }

  return value;
}

function formatScalar(value) {
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }

  const stringValue = String(value);

  if (!stringValue) {
    return '""';
  }

  if (/^[\p{L}\p{N}_./ -]+$/u.test(stringValue) && !/: /.test(stringValue) && !stringValue.startsWith("-")) {
    return stringValue;
  }

  return JSON.stringify(stringValue);
}

function splitList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function ensureArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === undefined || value === null || value === "") {
    return [];
  }

  return [value];
}

function omitKnownMeta(meta) {
  const knownKeys = new Set([
    "title",
    "date",
    "description",
    "tags",
    "categories",
    "cover",
    "excerpt",
    "reading_time",
    "featured"
  ]);

  return Object.fromEntries(Object.entries(meta).filter(([key]) => !knownKeys.has(key)));
}

function resolvePostPath(fileName) {
  const safeName = sanitizeFileName(fileName.replace(/\.md$/, ""));

  if (!safeName) {
    throw createError(400, "Invalid file name");
  }

  const filePath = path.join(postsDir, `${safeName}.md`);
  const normalized = path.normalize(filePath);

  if (!normalized.startsWith(postsDir)) {
    throw createError(400, "Invalid file path");
  }

  return normalized;
}

function sanitizeFileName(input) {
  return String(input || "")
    .trim()
    .replace(/\.md$/i, "")
    .replace(/[\\/]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^0-9A-Za-z\p{Script=Han}_-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "")
    .slice(0, 80);
}

function fallbackFileName() {
  return `post-${formatCompactDate(new Date())}`;
}

function filePathToTitle(filePath) {
  return path.basename(filePath, ".md").replace(/-/g, " ");
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;

      if (body.length > 1_000_000) {
        reject(createError(413, "Payload too large"));
      }
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(createError(400, "Invalid JSON body"));
      }
    });

    req.on("error", (error) => reject(error));
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function authorize(req) {
  if (!token) {
    return;
  }

  if (req.headers["x-editor-token"] !== token) {
    throw createError(401, "Missing or invalid editor token");
  }
}

function loadEnv(filePath) {
  try {
    const raw = require("fs").readFileSync(filePath, "utf8");
    const values = {};

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      values[key] = value;
    }

    return values;
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatCompactDate(date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
