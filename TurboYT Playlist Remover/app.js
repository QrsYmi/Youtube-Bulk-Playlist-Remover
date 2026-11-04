// Turbo Playlist Remover: injected into youtube.com (MAIN world).
(() => {
  "use strict";
  const HOST_ID = "tpr-host";
  document.getElementById(HOST_ID)?.remove();

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const h = (tag, props = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (k === "class") el.className = v;
      else if (k === "icon") el.append(icon(v));
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) el.setAttribute(k, v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    return el;
  };

  // ---------------------------------------------------------------- icons
  // Built with createElementNS (no innerHTML): YouTube enforces Trusted Types.
  const SVGNS = "http://www.w3.org/2000/svg";
  const ICONS = {
    check:  { s: 14, sw: 3.4, c: "#fff", p: ["M5 12.5l4.5 4.5L19 7.5"] },
    x:      { s: 14, sw: 2.6, c: "currentColor", p: ["M6 6l12 12M18 6L6 18"] },
    search: { s: 15, sw: 2.4, c: "currentColor", p: ["M20 20l-4.2-4.2"], circle: [11, 11, 6.5] },
    trash:  { s: 30, sw: 2.2, c: "#fff", p: ["M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3"] },
    bang:   { s: 14, sw: 3.2, c: "#fff", p: ["M12 6v7M12 18v.01"] },
    logo:   { s: 20, sw: 2.2, c: "#fff", p: ["M4 7h12M4 12h12M4 17h7"], fill: "M17 14l5 3-5 3z" },
  };
  function icon(name) {
    const d = ICONS[name];
    const svg = document.createElementNS(SVGNS, "svg");
    const set = (el, o) => { for (const k in o) el.setAttribute(k, o[k]); return el; };
    set(svg, { viewBox: "0 0 24 24", width: d.s, height: d.s, fill: "none", stroke: d.c, "stroke-width": d.sw, "stroke-linecap": "round", "stroke-linejoin": "round" });
    if (d.circle) svg.append(set(document.createElementNS(SVGNS, "circle"), { cx: d.circle[0], cy: d.circle[1], r: d.circle[2] }));
    for (const p of d.p) svg.append(set(document.createElementNS(SVGNS, "path"), { d: p }));
    if (d.fill) svg.append(set(document.createElementNS(SVGNS, "path"), { d: d.fill, fill: "#fff", stroke: "none" }));
    return svg;
  }

  // ---------------------------------------------------------------- styles
  const CSS = `
  *{box-sizing:border-box}
  .scrim{--bg:rgba(250,250,252,.86);--label:#1d1d1f;--sec:#6e6e73;--sep:rgba(60,60,67,.14);--fill:rgba(118,118,128,.12);--fill2:rgba(118,118,128,.2);--blue:#0a84ff;--red:#ff3b30;--green:#30d158;
    position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.34);
    -webkit-backdrop-filter:blur(16px) saturate(1.2);backdrop-filter:blur(16px) saturate(1.2);
    font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Helvetica Neue",Arial,sans-serif;
    -webkit-font-smoothing:antialiased;color:var(--label);font-size:14px;animation:fade .2s ease}
  .scrim.dark{--bg:rgba(30,30,32,.82);--label:#f5f5f7;--sec:#98989d;--sep:rgba(255,255,255,.12);--fill:rgba(118,118,128,.24);--fill2:rgba(118,118,128,.36)}
  @keyframes fade{from{opacity:0}to{opacity:1}}
  @keyframes pop{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:none}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes ring{from{transform:scale(.6);opacity:0}to{transform:none;opacity:1}}
  .sheet{width:min(620px,94vw);height:min(760px,88vh);display:flex;flex-direction:column;background:var(--bg);
    -webkit-backdrop-filter:blur(40px) saturate(1.8);backdrop-filter:blur(40px) saturate(1.8);border-radius:22px;overflow:hidden;
    box-shadow:0 30px 80px rgba(0,0,0,.38),0 0 0 .5px rgba(0,0,0,.18);animation:pop .3s cubic-bezier(.2,.9,.3,1.15)}
  .view{display:flex;flex-direction:column;flex:1;min-height:0;animation:fade .25s ease}
  .head{display:flex;align-items:center;gap:12px;padding:20px 22px 12px}
  .logo{width:38px;height:38px;border-radius:10px;background:linear-gradient(160deg,#ff6a5f,#ff2d55);display:grid;place-items:center;flex:none;box-shadow:0 4px 12px rgba(255,45,85,.35)}
  .ttl{flex:1;min-width:0}
  .ttl b{display:block;font-size:19px;font-weight:700;letter-spacing:-.02em}
  .ttl span{font-size:12.5px;color:var(--sec)}
  .close{width:28px;height:28px;border-radius:50%;border:0;background:var(--fill);color:var(--sec);display:grid;place-items:center;cursor:pointer;flex:none}
  .close:hover{background:var(--fill2)}
  .tools{display:flex;align-items:center;gap:10px;padding:2px 22px 10px}
  .search{flex:1;display:flex;align-items:center;gap:8px;background:var(--fill);border-radius:10px;padding:0 10px;height:34px;color:var(--sec)}
  .search input{flex:1;border:0;outline:0;background:transparent;font:inherit;color:var(--label);min-width:0}
  .link{border:0;background:transparent;color:var(--blue);font:inherit;font-weight:500;cursor:pointer;padding:6px 4px;white-space:nowrap}
  .link:hover{opacity:.75}
  .list{flex:1;min-height:0;overflow:auto;padding:4px 12px 8px;border-top:.5px solid var(--sep)}
  .list::-webkit-scrollbar{width:10px}.list::-webkit-scrollbar-thumb{background:var(--fill2);border-radius:6px;border:3px solid transparent;background-clip:content-box}
  .row{display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:12px;cursor:pointer;user-select:none;content-visibility:auto;contain-intrinsic-size:auto 54px}
  .row:hover{background:var(--fill)}
  .chk{width:22px;height:22px;border-radius:50%;border:1.6px solid var(--fill2);display:grid;place-items:center;flex:none;transition:all .15s;color:transparent}
  .chk svg{opacity:0;transform:scale(.6);transition:all .15s}
  .row.on .chk{background:var(--blue);border-color:var(--blue)}
  .row.on .chk svg{opacity:1;transform:none}
  .thumb{width:64px;height:36px;border-radius:7px;background:var(--fill);object-fit:cover;flex:none}
  .info{flex:1;min-width:0}
  .info b{display:block;font-weight:500;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .info span{display:block;font-size:12px;color:var(--sec);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .foot{display:flex;align-items:center;gap:12px;padding:14px 22px;border-top:.5px solid var(--sep)}
  .foot .cnt{flex:1;color:var(--sec);font-size:13px}
  .btn{border:0;border-radius:12px;padding:10px 18px;font:inherit;font-weight:600;cursor:pointer;transition:transform .1s,opacity .2s,background .2s}
  .btn:active{transform:scale(.97)}.btn:disabled{opacity:.4;cursor:default;transform:none}
  .btn.red{background:var(--red);color:#fff}.btn.blue{background:var(--blue);color:#fff}
  .btn.gray{background:var(--fill);color:var(--label)}.btn.gray:hover{background:var(--fill2)}
  .center{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px 40px;gap:8px}
  .center h2{margin:8px 0 0;font-size:22px;font-weight:700;letter-spacing:-.02em}
  .center p{margin:0;color:var(--sec);max-width:380px;line-height:1.45}
  .spin{width:20px;height:20px;border-radius:50%;border:2.4px solid var(--fill2);border-top-color:var(--blue);animation:spin .8s linear infinite;flex:none}
  .spin.big{width:34px;height:34px;border-width:3.4px}
  .badge{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;animation:ring .35s cubic-bezier(.2,.9,.3,1.3)}
  .badge.red{background:var(--red);box-shadow:0 8px 22px rgba(255,59,48,.4)}
  .badge.green{background:var(--green);box-shadow:0 8px 22px rgba(48,209,88,.4)}
  .badge svg{width:30px;height:30px}
  .actions{display:flex;gap:10px;margin-top:18px}
  .prog{padding:4px 22px 14px}
  .bar{height:8px;border-radius:5px;background:var(--fill);overflow:hidden}
  .bar i{display:block;height:100%;width:0;border-radius:5px;background:linear-gradient(90deg,#0a84ff,#64d2ff);transition:width .35s ease}
  .stats{display:flex;justify-content:space-between;margin-top:8px;font-size:12.5px;color:var(--sec);font-variant-numeric:tabular-nums}
  .now{display:flex;align-items:center;gap:10px;padding:0 22px 12px;min-height:30px}
  .now b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .now small{color:var(--sec);font-size:12px}
  .st{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--fill)}
  .st.done{background:var(--green)}.st.fail{background:var(--red)}
  .st .spin{width:16px;height:16px;border-width:2.2px}
  .row.static{cursor:default}.row.static:hover{background:transparent}
  .row.failed .info span{color:var(--red)}
  .row.done .info b{color:var(--sec)}
  .pct{font-size:44px;font-weight:700;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
  `;

  // ---------------------------------------------------------------- shell
  const host = document.createElement("div");
  host.id = HOST_ID;
  host.style.cssText = "all:initial;position:fixed;inset:0;z-index:2147483647";
  const root = host.attachShadow({ mode: "open" });
  const dark = document.documentElement.hasAttribute("dark") || matchMedia("(prefers-color-scheme: dark)").matches;
  const scrim = h("div", { class: "scrim" + (dark ? " dark" : "") });
  const sheet = h("div", { class: "sheet" });
  scrim.append(sheet);
  root.append(h("style", {}, CSS), scrim);
  document.documentElement.append(host);

  let running = false;
  const closeApp = (reload) => { host.remove(); document.removeEventListener("keydown", onKey, true); if (reload) location.reload(); };
  const onKey = (e) => { if (e.key === "Escape" && !running) closeApp(false); };
  document.addEventListener("keydown", onKey, true);
  scrim.addEventListener("mousedown", (e) => { if (e.target === scrim && !running) closeApp(false); });
  const setView = (...nodes) => sheet.replaceChildren(h("div", { class: "view" }, ...nodes));
  const header = (sub, withClose = true) =>
    h("div", { class: "head" },
      h("div", { class: "logo", icon: "logo" }),
      h("div", { class: "ttl" }, h("b", {}, "Turbo Playlist Remover"), h("span", {}, sub)),
      withClose ? h("button", { class: "close", title: "Close", icon: "x", onclick: () => closeApp(false) }) : null);

  // ---------------------------------------------------------------- YouTube API
  const cfg = (k) => (window.ytcfg && window.ytcfg.get ? window.ytcfg.get(k) : undefined);
  const origin = "https://www.youtube.com";
  const key = cfg("INNERTUBE_API_KEY");
  const context = cfg("INNERTUBE_CONTEXT");
  const cookies = Object.fromEntries(document.cookie.split("; ").map((c) => { const i = c.indexOf("="); return [c.slice(0, i), c.slice(i + 1)]; }));

  async function sha1(s) {
    const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(s));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  async function authHeader() {
    const ts = Math.floor(Date.now() / 1000);
    const parts = [];
    for (const [name, label] of [["SAPISID", "SAPISIDHASH"], ["__Secure-1PAPISID", "SAPISID1PHASH"], ["__Secure-3PAPISID", "SAPISID3PHASH"]]) {
      if (cookies[name]) parts.push(`${label} ${ts}_${await sha1(`${ts} ${cookies[name]} ${origin}`)}`);
    }
    return parts.join(" ");
  }
  async function api(path, body) {
    const res = await fetch(`/youtubei/v1/${path}?prettyPrint=false` + (key ? `&key=${key}` : ""), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: await authHeader(),
        "X-Origin": origin,
        "X-Goog-AuthUser": String(cfg("SESSION_INDEX") ?? 0),
        "X-Youtube-Client-Name": String(cfg("INNERTUBE_CONTEXT_CLIENT_NAME") ?? 1),
        "X-Youtube-Client-Version": String(cfg("INNERTUBE_CLIENT_VERSION") ?? context.client.clientVersion),
        ...(context.client.visitorData ? { "X-Goog-Visitor-Id": context.client.visitorData } : {}),
      },
      body: JSON.stringify({ context, ...body }),
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (_) {}
    const msg = json && json.error ? (json.error.message || "Request rejected") : `HTTP ${res.status}`;
    return { ok: res.ok && !(json && json.error), status: res.status, json, msg };
  }

  // ---------------------------------------------------------------- loading all playlists
  const SKIP = (id) => !id || id === "WL" || id === "LL" || id.startsWith("RD");
  const txt = (t) => (!t ? "" : t.simpleText || (t.runs ? t.runs.map((r) => r.text).join("") : "") || t.content || "");
  function deepFind(node, pred, out = [], depth = 0) {
    if (!node || typeof node !== "object" || depth > 45) return out;
    if (pred(node)) out.push(node);
    if (Array.isArray(node)) for (const x of node) deepFind(x, pred, out, depth + 1);
    else for (const k in node) deepFind(node[k], pred, out, depth + 1);
    return out;
  }
  function firstThumb(n) {
    const f = deepFind(n, (x) => (Array.isArray(x.sources) && x.sources.length > 0) || (Array.isArray(x.thumbnails) && x.thumbnails.length > 0), [], 0);
    if (!f.length) return "";
    const a = f[0].sources || f[0].thumbnails;
    const u = (a[0] && a[0].url) || "";
    return u.startsWith("//") ? "https:" + u : u;
  }
  function addItem(map, id, title, meta, thumb) {
    if (SKIP(id)) return;
    const old = map.get(id);
    if (old) { if (!old.title || old.title === id) old.title = title || old.title; return; }
    map.set(id, { id, title: title || id, meta: meta || "", thumb: thumb || "", selected: false, state: "pending", err: "" });
  }
  function harvest(node, map, depth = 0) {
    if (!node || typeof node !== "object" || depth > 60) return;
    if (Array.isArray(node)) { for (const x of node) harvest(x, map, depth + 1); return; }
    const lv = node.lockupViewModel;
    if (lv && lv.contentId && /PLAYLIST/.test(lv.contentType || "")) {
      const lm = lv.metadata && lv.metadata.lockupMetadataViewModel;
      const rows = deepFind(lv.metadata, (x) => Array.isArray(x.metadataParts)).flatMap((r) => r.metadataParts.map((p) => txt(p.text)));
      const badges = deepFind(lv.contentImage, (x) => !!x.thumbnailBadgeViewModel).map((x) => txt(x.thumbnailBadgeViewModel.text));
      const meta = [...new Set([...rows, ...badges].filter(Boolean))].join(" · ");
      addItem(map, lv.contentId, lm ? txt(lm.title) : "", meta, firstThumb(lv.contentImage));
    } else if (typeof node.playlistId === "string" && node.title && (node.thumbnail || node.thumbnailRenderer || node.videoCountText || node.videoCount)) {
      const meta = [txt(node.videoCountText) || (node.videoCount ? node.videoCount + " videos" : ""), txt(node.publishedTimeText)].filter(Boolean).join(" · ");
      addItem(map, node.playlistId, txt(node.title), meta, firstThumb(node.thumbnail || node.thumbnailRenderer));
    }
    for (const k in node) harvest(node[k], map, depth + 1);
  }
  function lastToken(json) {
    const found = deepFind(json, (x) => x.continuationCommand && x.continuationCommand.token);
    return found.length ? found[found.length - 1].continuationCommand.token : null;
  }
  function scrapeDom(map) {
    const root = document.querySelector("ytd-browse");
    if (!root || location.pathname !== "/feed/playlists") return;
    root.querySelectorAll('a[href*="/playlist?list="]').forEach((a) => {
      const m = a.href.match(/[?&]list=([\w-]+)/);
      if (m) addItem(map, m[1], (a.getAttribute("title") || a.textContent || "").trim(), "", "");
    });
  }

  async function loadAll(onCount) {
    const map = new Map();
    let warn = "";
    let r = await api("browse", { browseId: "FEplaylist_aggregation" });
    if (!r.ok) warn = `YouTube said: ${r.msg}`;
    let pages = 0;
    while (r.ok && pages < 2000) {
      harvest(r.json, map);
      onCount(map.size);
      const token = lastToken(r.json);
      if (!token) break;
      await sleep(150);
      r = await api("browse", { continuation: token });
      pages++;
      if (!r.ok) { warn = `Stopped loading early (${r.msg}).`; break; }
    }
    if (map.size === 0) scrapeDom(map);
    onCount(map.size);
    return { items: [...map.values()], warn };
  }

  // ---------------------------------------------------------------- views
  let items = [];

  function viewLoading(count) {
    setView(header("Loading your playlists…"),
      h("div", { class: "center" }, h("div", { class: "spin big" }), h("h2", { id: "lc" }, count ? `${count} found` : "Fetching…"), h("p", {}, "Loading every page of your library. Large libraries can take a moment.")));
  }

  function viewList(warn) {
    const rows = items.map((it) => {
      const row = h("div", { class: "row", role: "checkbox" },
        h("div", { class: "chk", icon: "check" }),
        it.thumb ? h("img", { class: "thumb", src: it.thumb, loading: "lazy", alt: "" }) : h("div", { class: "thumb" }),
        h("div", { class: "info" }, h("b", {}, it.title), h("span", {}, it.meta || it.id)));
      row.addEventListener("click", () => { it.selected = !it.selected; row.classList.toggle("on", it.selected); refresh(); });
      it._row = row;
      return row;
    });
    const list = h("div", { class: "list" }, rows.length ? rows : h("div", { class: "center" }, h("h2", {}, "No playlists found"), h("p", {}, warn || "Your library has no deletable playlists, or YouTube returned nothing. Try reloading the page.")));
    const cnt = h("div", { class: "cnt" });
    const del = h("button", { class: "btn red", onclick: () => viewConfirm() }, "Delete");
    const q = h("input", { type: "text", placeholder: "Search playlists", spellcheck: "false" });
    const toggle = h("button", { class: "link" }, "Select all");
    let filter = "";
    const visible = () => items.filter((it) => !filter || it.title.toLowerCase().includes(filter));
    function refresh() {
      const n = items.filter((i) => i.selected).length;
      cnt.textContent = n ? `${n} of ${items.length} selected` : `${items.length} playlists`;
      del.textContent = n ? `Delete ${n} playlist${n > 1 ? "s" : ""}` : "Delete";
      del.disabled = n === 0;
      const v = visible();
      toggle.textContent = v.length && v.every((i) => i.selected) ? "Select none" : "Select all";
    }
    q.addEventListener("input", () => {
      filter = q.value.trim().toLowerCase();
      for (const it of items) it._row.style.display = !filter || it.title.toLowerCase().includes(filter) ? "" : "none";
      refresh();
    });
    toggle.addEventListener("click", () => {
      const v = visible();
      const all = v.length && v.every((i) => i.selected);
      for (const it of v) { it.selected = !all; it._row.classList.toggle("on", it.selected); }
      refresh();
    });
    setView(
      header(warn ? `${items.length} playlists · ${warn}` : `${items.length} playlists in your library`),
      h("div", { class: "tools" }, h("div", { class: "search", icon: "search" }, q), toggle),
      list,
      h("div", { class: "foot" }, cnt, del));
    q.parentElement.append(q);
    refresh();
  }

  function viewConfirm() {
    const sel = items.filter((i) => i.selected);
    setView(header("Review", false),
      h("div", { class: "center" },
        h("div", { class: "badge red", icon: "trash" }),
        h("h2", {}, `Delete ${sel.length} playlist${sel.length > 1 ? "s" : ""}?`),
        h("p", {}, "These playlists will be permanently deleted from YouTube. This can't be undone."),
        h("div", { class: "actions" },
          h("button", { class: "btn gray", onclick: () => viewList() }, "Cancel"),
          h("button", { class: "btn red", onclick: () => runDelete(sel) }, "Delete permanently"))));
  }

  async function deleteOne(id) {
    let r;
    for (let attempt = 0; attempt < 4; attempt++) {
      try { r = await api("playlist/delete", { playlistId: id }); }
      catch (e) { r = { ok: false, status: 0, msg: String(e.message || e) }; }
      if (r.ok || !(r.status === 429 || r.status >= 500 || r.status === 0)) break;
      await sleep(3000 * (attempt + 1));
    }
    return r;
  }

  async function runDelete(sel) {
    running = true;
    let stop = false, done = 0, ok = 0, bad = 0;
    for (const it of sel) { it.state = "pending"; it.err = ""; }
    const bar = h("i");
    const pct = h("div", { class: "pct" }, "0%");
    const nowName = h("b", {}, "Starting…");
    const nowSpin = h("div", { class: "spin" });
    const sOk = h("span", {}, "0 deleted");
    const sLeft = h("span", {}, `${sel.length} remaining`);
    const stopBtn = h("button", { class: "btn gray", onclick: () => { stop = true; stopBtn.disabled = true; stopBtn.textContent = "Stopping…"; } }, "Stop");
    const rowFor = new Map();
    const list = h("div", { class: "list" }, sel.map((it) => {
      const st = h("div", { class: "st" });
      const row = h("div", { class: "row static" }, st,
        it.thumb ? h("img", { class: "thumb", src: it.thumb, alt: "" }) : h("div", { class: "thumb" }),
        h("div", { class: "info" }, h("b", {}, it.title), h("span", {}, it.meta || it.id)));
      rowFor.set(it, { row, st, sub: row.querySelector(".info span") });
      return row;
    }));
    setView(header("Deleting playlists…", false),
      h("div", { class: "prog" }, h("div", { style: "text-align:center;margin:2px 0 12px" }, pct), h("div", { class: "bar" }, bar), h("div", { class: "stats" }, sOk, sLeft)),
      h("div", { class: "now" }, nowSpin, nowName),
      list,
      h("div", { class: "foot" }, h("div", { class: "cnt" }, "Keep this tab open until it finishes."), stopBtn));

    let streak = 0;
    for (const it of sel) {
      if (stop) break;
      const ui = rowFor.get(it);
      ui.st.replaceChildren(h("div", { class: "spin" }));
      nowName.textContent = it.title;
      ui.row.scrollIntoView({ block: "center", behavior: "smooth" });
      const r = await deleteOne(it.id);
      done++;
      if (r.ok) {
        ok++; streak = 0; it.state = "done";
        ui.row.classList.add("done");
        ui.st.className = "st done"; ui.st.replaceChildren(icon("check"));
      } else {
        bad++; streak++; it.state = "failed"; it.err = r.msg;
        ui.row.classList.add("failed");
        ui.st.className = "st fail"; ui.st.replaceChildren(icon("bang"));
        ui.sub.textContent = r.msg + " (saved from another channel?)";
      }
      const p = Math.round((done / sel.length) * 100);
      bar.style.width = p + "%"; pct.textContent = p + "%";
      sOk.textContent = `${ok} deleted${bad ? ` · ${bad} failed` : ""}`;
      sLeft.textContent = `${sel.length - done} remaining`;
      if (streak >= 8) { stop = true; nowName.textContent = "Stopped after repeated failures"; break; }
      await sleep(300);
    }
    running = false;
    viewDone(sel, ok, bad, stop && done < sel.length);
  }

  function viewDone(sel, ok, bad, stopped) {
    const failed = sel.filter((i) => i.state === "failed");
    const left = sel.filter((i) => i.state === "pending").length;
    items = items.filter((i) => i.state !== "done");
    for (const it of items) it.selected = false;
    setView(header(stopped ? "Stopped" : "Finished", false),
      h("div", { class: "center" },
        h("div", { class: "badge green", icon: "check" }),
        h("h2", {}, stopped ? "Stopped" : "All done"),
        h("p", {}, `${ok} playlist${ok === 1 ? "" : "s"} deleted` + (bad ? ` · ${bad} failed` : "") + (left ? ` · ${left} not processed` : "") + "."),
        failed.length ? h("p", {}, "Failures are usually playlists saved from other channels, which can't be deleted here.") : null,
        h("div", { class: "actions" },
          items.length ? h("button", { class: "btn gray", onclick: () => viewList() }, "Back to list") : null,
          h("button", { class: "btn blue", onclick: () => closeApp(ok > 0) }, ok > 0 ? "Done & refresh" : "Done"))));
  }

  // ---------------------------------------------------------------- start
  (async () => {
    if (!context || !(cookies["SAPISID"] || cookies["__Secure-3PAPISID"])) {
      setView(header("Not ready"), h("div", { class: "center" }, h("h2", {}, "Sign in to YouTube"), h("p", {}, "Couldn't read your YouTube session. Make sure you're signed in, reload the page and try again.")));
      return;
    }
    try {
      viewLoading(0);
      const { items: got, warn } = await loadAll((n) => {
        const el = root.getElementById("lc");
        if (el) el.textContent = `${n} found`;
      });
      items = got;
      viewList(warn);
    } catch (e) {
      setView(header("Error"), h("div", { class: "center" }, h("h2", {}, "Couldn't load playlists"), h("p", {}, String(e && e.message || e))));
    }
  })();
})();
