(function () {
  "use strict";

  const sourceNotes = Array.isArray(window.KNOWLEDGE_ENTRIES) ? window.KNOWLEDGE_ENTRIES : [];
  const STORAGE_KEY = "glow-knowledge-base:notes:v1";
  const storage = (() => {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  })();
  const grid = document.querySelector("#notes-grid");
  const emptyState = document.querySelector("#empty-state");
  const searchInput = document.querySelector("#search-input");
  const resultsCount = document.querySelector("#results-count");
  const clearFilters = document.querySelector("#clear-filters");
  const exportButton = document.querySelector("#export-notes");
  const storageStatus = document.querySelector("#storage-status");
  const noteCount = document.querySelector("#note-count");
  const dialog = document.querySelector("#note-dialog");
  const dialogClose = document.querySelector("#dialog-close");
  const editNoteButton = document.querySelector("#edit-note");
  const deleteNoteButton = document.querySelector("#delete-note");
  const editorDialog = document.querySelector("#editor-dialog");
  const editorForm = document.querySelector("#note-form");
  const editorClose = document.querySelector("#editor-close");
  const editorCancel = document.querySelector("#editor-cancel");
  const editorTitle = document.querySelector("#editor-title");
  const titleInput = document.querySelector("#note-title");
  const categoryInput = document.querySelector("#note-category");
  const summaryInput = document.querySelector("#note-summary");
  const bodyInput = document.querySelector("#note-body");
  const tagsInput = document.querySelector("#note-tags");
  const readTimeInput = document.querySelector("#note-read-time");
  let activeCategory = "all";
  let activeQuery = "";
  let currentNoteId = null;
  let editingNoteId = null;

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const todayIso = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
  };

  const cloneNote = (note) => ({
    id: String(note.id || ""),
    title: String(note.title || "未命名筆記"),
    category: String(note.category || "學習方法"),
    summary: String(note.summary || ""),
    body: Array.isArray(note.body) ? note.body.map(String).filter(Boolean) : [],
    tags: Array.isArray(note.tags) ? note.tags.map(String).filter(Boolean) : [],
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(note.date || "")) ? String(note.date) : todayIso(),
    readTime: String(note.readTime || "3 分鐘"),
    featured: Boolean(note.featured)
  });

  const validSourceNotes = sourceNotes.map(cloneNote).filter((note) => note.id && note.title);

  const loadNotes = () => {
    if (!storage) return validSourceNotes;
    try {
      const saved = storage.getItem(STORAGE_KEY);
      if (!saved) return validSourceNotes;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return validSourceNotes;
      return parsed.map(cloneNote).filter((note) => note.id && note.title);
    } catch {
      return validSourceNotes;
    }
  };

  let notes = loadNotes();

  const setStorageStatus = (message, state = "") => {
    storageStatus.textContent = message;
    storageStatus.dataset.state = state;
  };

  const saveNotes = () => {
    if (!storage) {
      setStorageStatus("僅保留在本次開啟", "warning");
      return false;
    }
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(notes));
      setStorageStatus("已保存到本機", "saved");
      return true;
    } catch {
      setStorageStatus("無法保存，請匯出 JSON", "warning");
      return false;
    }
  };

  const formatDate = (date) => {
    const parsed = new Date(`${date}T00:00:00`);
    return new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "short", day: "numeric" }).format(parsed);
  };

  const makeId = (title) => {
    const base = title.toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "note";
    let candidate = base;
    let suffix = 2;
    while (notes.some((note) => note.id === candidate)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
    return candidate;
  };

  const noteMatches = (note) => {
    const searchable = [note.title, note.summary, note.category, ...note.tags].join(" ").toLowerCase();
    const matchesQuery = !activeQuery || searchable.includes(activeQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || note.category === activeCategory;
    return matchesQuery && matchesCategory;
  };

  const renderCard = (note, index) => `
    <article class="note-card" data-note-card-id="${escapeHtml(note.id)}" style="--card-index: ${index}">
      <div class="card-topline"><span>${escapeHtml(note.category)}</span><span>${escapeHtml(note.readTime)}</span></div>
      <div class="card-content">
        <h3>${escapeHtml(note.title)}</h3>
        <p>${escapeHtml(note.summary)}</p>
      </div>
      <div class="card-bottomline">
        <div class="tag-list">${note.tags.slice(0, 2).map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("")}</div>
        <button class="read-button" type="button" data-note-id="${escapeHtml(note.id)}">閱讀筆記 <span aria-hidden="true">↗</span></button>
      </div>
    </article>`;

  const renderAddCard = (index) => `
    <button class="note-card add-note-card" style="--card-index: ${index}" type="button" data-action="add-note" aria-label="新增一則筆記">
      <div class="add-note-symbol" aria-hidden="true">＋</div>
      <div class="card-content">
        <h3>新增一則筆記</h3>
        <p>開啟編輯器，寫下下一個值得保留的想法。</p>
      </div>
      <div class="card-bottomline">
        <span class="add-note-hint">開始編輯</span>
        <span class="read-button" aria-hidden="true">↗</span>
      </div>
    </button>`;

  const render = () => {
    const visibleNotes = notes.filter(noteMatches);
    grid.innerHTML = `${visibleNotes.map(renderCard).join("")}${renderAddCard(visibleNotes.length)}`;
    emptyState.hidden = visibleNotes.length !== 0;
    resultsCount.textContent = `顯示 ${visibleNotes.length} / ${notes.length} 則筆記`;
    noteCount.textContent = String(notes.length).padStart(2, "0");
    clearFilters.hidden = !activeQuery && activeCategory === "all";
    grid.querySelectorAll("[data-note-id]").forEach((button) => {
      button.addEventListener("click", () => openNote(button.dataset.noteId));
    });
    grid.querySelectorAll("[data-note-card-id]").forEach((card) => {
      card.addEventListener("click", (event) => {
        if (event.target.closest("button")) return;
        openNote(card.dataset.noteCardId);
      });
    });
    grid.querySelector("[data-action='add-note']").addEventListener("click", () => openEditor());
  };

  const syncFilterButtons = () => {
    document.querySelectorAll("[data-category]").forEach((button) => {
      const isActive = button.dataset.category === activeCategory;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const showDialog = (element) => {
    if (typeof element.showModal === "function") element.showModal();
    else element.setAttribute("open", "");
  };

  const hideDialog = (element) => {
    if (element.open && typeof element.close === "function") element.close();
    else element.removeAttribute("open");
  };

  const openNote = (id, updateHash = true) => {
    const note = notes.find((item) => item.id === id);
    if (!note) return;
    currentNoteId = id;
    document.querySelector("#dialog-category").textContent = note.category;
    document.querySelector("#dialog-title").textContent = note.title;
    document.querySelector("#dialog-meta").textContent = `${formatDate(note.date)}  ·  ${note.readTime}`;
    document.querySelector("#dialog-body").innerHTML = note.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
    document.querySelector("#dialog-tags").innerHTML = note.tags.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("");
    if (updateHash) history.replaceState(null, "", `#note/${note.id}`);
    showDialog(dialog);
    dialogClose.focus();
  };

  const closeNote = () => {
    hideDialog(dialog);
    currentNoteId = null;
    if (location.hash.startsWith("#note/")) history.replaceState(null, "", `${location.pathname}${location.search}`);
  };

  const openEditor = (id = null) => {
    const note = id ? notes.find((item) => item.id === id) : null;
    editingNoteId = note ? note.id : null;
    editorTitle.textContent = note ? "編輯筆記" : "新增一則筆記";
    titleInput.value = note ? note.title : "";
    categoryInput.value = note ? note.category : "學習方法";
    summaryInput.value = note ? note.summary : "";
    bodyInput.value = note ? note.body.join("\n\n") : "";
    tagsInput.value = note ? note.tags.join(", ") : "";
    readTimeInput.value = note ? note.readTime : "";
    hideDialog(dialog);
    showDialog(editorDialog);
    titleInput.focus();
  };

  const closeEditor = () => {
    hideDialog(editorDialog);
    editingNoteId = null;
  };

  const saveFromForm = (event) => {
    event.preventDefault();
    if (!editorForm.reportValidity()) return;
    const title = titleInput.value.trim();
    const body = bodyInput.value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
    if (!body.length) {
      bodyInput.setCustomValidity("請至少輸入一個段落。");
      bodyInput.reportValidity();
      bodyInput.setCustomValidity("");
      return;
    }
    const tags = tagsInput.value.split(",").map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean).slice(0, 4);
    const readTime = readTimeInput.value.trim() || `${Math.max(1, Math.ceil(body.join(" ").length / 280))} 分鐘`;
    const id = editingNoteId || makeId(title);
    const previous = editingNoteId ? notes.find((note) => note.id === editingNoteId) : null;
    const updatedNote = {
      id,
      title,
      category: categoryInput.value,
      summary: summaryInput.value.trim(),
      body,
      tags,
      date: todayIso(),
      readTime,
      featured: previous ? Boolean(previous.featured) : false
    };
    if (editingNoteId) {
      const noteIndex = notes.findIndex((note) => note.id === editingNoteId);
      if (noteIndex !== -1) notes[noteIndex] = updatedNote;
    } else {
      notes.unshift(updatedNote);
    }
    saveNotes();
    closeEditor();
    render();
    openNote(id);
  };

  const deleteCurrentNote = () => {
    const note = notes.find((item) => item.id === currentNoteId);
    if (!note) return;
    if (!window.confirm(`確定要刪除「${note.title}」嗎？此動作會從本機筆記清單移除。`)) return;
    notes = notes.filter((item) => item.id !== currentNoteId);
    saveNotes();
    closeNote();
    render();
  };

  const exportNotes = () => {
    const payload = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), notes }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `glow-knowledge-base-notes-${todayIso()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStorageStatus("已匯出 JSON", "saved");
  };

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      syncFilterButtons();
      render();
    });
  });

  searchInput.addEventListener("input", (event) => {
    activeQuery = event.target.value.trim();
    render();
  });

  clearFilters.addEventListener("click", () => {
    activeQuery = "";
    activeCategory = "all";
    searchInput.value = "";
    syncFilterButtons();
    render();
    searchInput.focus();
  });

  exportButton.addEventListener("click", exportNotes);
  dialogClose.addEventListener("click", closeNote);
  editNoteButton.addEventListener("click", () => {
    if (currentNoteId) openEditor(currentNoteId);
  });
  deleteNoteButton.addEventListener("click", deleteCurrentNote);
  editorForm.addEventListener("submit", saveFromForm);
  editorClose.addEventListener("click", closeEditor);
  editorCancel.addEventListener("click", closeEditor);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeNote();
  });
  editorDialog.addEventListener("click", (event) => {
    if (event.target === editorDialog) closeEditor();
  });
  dialog.addEventListener("close", () => {
    currentNoteId = null;
    if (location.hash.startsWith("#note/")) history.replaceState(null, "", `${location.pathname}${location.search}`);
  });
  editorDialog.addEventListener("close", () => {
    editingNoteId = null;
  });

  window.addEventListener("hashchange", () => {
    const id = location.hash.startsWith("#note/") ? location.hash.slice(6) : "";
    if (id) openNote(id, false);
    else if (dialog.open) hideDialog(dialog);
  });

  let hasSavedNotes = false;
  try {
    hasSavedNotes = Boolean(storage && storage.getItem(STORAGE_KEY));
  } catch {
    hasSavedNotes = false;
  }
  setStorageStatus(hasSavedNotes ? "已載入本機版本" : "預設筆記", "");
  document.querySelector("#current-year").textContent = String(new Date().getFullYear());
  syncFilterButtons();
  render();

  const initialId = location.hash.startsWith("#note/") ? location.hash.slice(6) : "";
  if (initialId) openNote(initialId, false);
})();
