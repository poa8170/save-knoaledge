(function () {
  "use strict";

  const notes = Array.isArray(window.KNOWLEDGE_ENTRIES) ? window.KNOWLEDGE_ENTRIES : [];
  const grid = document.querySelector("#notes-grid");
  const emptyState = document.querySelector("#empty-state");
  const searchInput = document.querySelector("#search-input");
  const resultsCount = document.querySelector("#results-count");
  const clearFilters = document.querySelector("#clear-filters");
  const noteCount = document.querySelector("#note-count");
  const dialog = document.querySelector("#note-dialog");
  const dialogClose = document.querySelector("#dialog-close");
  let activeCategory = "all";
  let activeQuery = "";

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const formatDate = (date) => {
    const parsed = new Date(`${date}T00:00:00`);
    return new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "short", day: "numeric" }).format(parsed);
  };

  const noteMatches = (note) => {
    const searchable = [note.title, note.summary, note.category, ...note.tags].join(" ").toLowerCase();
    const matchesQuery = !activeQuery || searchable.includes(activeQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || note.category === activeCategory;
    return matchesQuery && matchesCategory;
  };

  const renderCard = (note, index) => `
    <article class="note-card ${note.featured ? "is-featured" : ""}" style="--card-index: ${index}">
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

  const render = () => {
    const visibleNotes = notes.filter(noteMatches);
    grid.innerHTML = visibleNotes.map(renderCard).join("");
    emptyState.hidden = visibleNotes.length !== 0;
    resultsCount.textContent = `顯示 ${visibleNotes.length} / ${notes.length} 則筆記`;
    clearFilters.hidden = !activeQuery && activeCategory === "all";
    grid.querySelectorAll("[data-note-id]").forEach((button) => {
      button.addEventListener("click", () => openNote(button.dataset.noteId));
    });
  };

  const syncFilterButtons = () => {
    document.querySelectorAll("[data-category]").forEach((button) => {
      const isActive = button.dataset.category === activeCategory;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const openNote = (id, updateHash = true) => {
    const note = notes.find((item) => item.id === id);
    if (!note) return;
    document.querySelector("#dialog-category").textContent = note.category;
    document.querySelector("#dialog-title").textContent = note.title;
    document.querySelector("#dialog-meta").textContent = `${formatDate(note.date)}  ·  ${note.readTime}`;
    document.querySelector("#dialog-body").innerHTML = note.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
    document.querySelector("#dialog-tags").innerHTML = note.tags.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("");
    if (updateHash) history.replaceState(null, "", `#note/${note.id}`);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    dialogClose.focus();
  };

  const closeNote = () => {
    if (dialog.open) dialog.close();
    if (location.hash.startsWith("#note/")) history.replaceState(null, "", `${location.pathname}${location.search}`);
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

  dialogClose.addEventListener("click", closeNote);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeNote();
  });
  dialog.addEventListener("close", () => {
    if (location.hash.startsWith("#note/")) history.replaceState(null, "", `${location.pathname}${location.search}`);
  });

  window.addEventListener("hashchange", () => {
    const id = location.hash.startsWith("#note/") ? location.hash.slice(6) : "";
    if (id) openNote(id, false);
    else if (dialog.open) dialog.close();
  });

  noteCount.textContent = String(notes.length).padStart(2, "0");
  document.querySelector("#current-year").textContent = String(new Date().getFullYear());
  render();

  const initialId = location.hash.startsWith("#note/") ? location.hash.slice(6) : "";
  if (initialId) openNote(initialId, false);
})();
