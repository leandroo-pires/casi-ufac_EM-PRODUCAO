// Normalização de identificadores de redes sociais.
// Aceita @user, user, ou URL completa. Retorna apenas o handle/path canônico.

const stripAt = (s: string) => s.replace(/^@+/, "");
const lastSeg = (s: string) => s.split("/").filter(Boolean).pop() ?? "";

export const normalizeInstagram = (raw: string) => {
  const v = raw.trim();
  if (!v) return "";
  if (v.includes("instagram.com")) return stripAt(lastSeg(v.replace(/\?.*$/, "")));
  return stripAt(v);
};

export const normalizeTwitter = (raw: string) => {
  const v = raw.trim();
  if (!v) return "";
  if (/(twitter|x)\.com/i.test(v)) return stripAt(lastSeg(v.replace(/\?.*$/, "")));
  return stripAt(v);
};

export const normalizeGithub = (raw: string) => {
  const v = raw.trim();
  if (!v) return "";
  if (v.includes("github.com")) return lastSeg(v.replace(/\?.*$/, ""));
  return stripAt(v);
};

export const normalizeLinkedin = (raw: string) => {
  const v = raw.trim();
  if (!v) return "";
  if (v.includes("linkedin.com")) {
    // mantém formato in/usuario ou company/usuario
    const m = v.match(/linkedin\.com\/(in|company)\/([^/?#]+)/i);
    if (m) return `${m[1]}/${m[2]}`;
    return lastSeg(v.replace(/\?.*$/, ""));
  }
  if (v.startsWith("in/") || v.startsWith("company/")) return v;
  return `in/${stripAt(v)}`;
};

export const socialUrl = {
  instagram: (h: string) => h ? `https://instagram.com/${stripAt(h)}` : "",
  twitter:   (h: string) => h ? `https://x.com/${stripAt(h)}` : "",
  github:    (h: string) => h ? `https://github.com/${stripAt(h)}` : "",
  linkedin:  (h: string) => h ? `https://linkedin.com/${h.startsWith("in/") || h.startsWith("company/") ? h : `in/${stripAt(h)}`}` : "",
};

const HANDLE = /^[A-Za-z0-9._-]{1,40}$/;
const LINKEDIN_PATH = /^(in|company)\/[A-Za-z0-9._-]{1,80}$/;

export const validators = {
  handle: (v: string) => !v || HANDLE.test(v),
  linkedin: (v: string) => !v || LINKEDIN_PATH.test(v),
};
