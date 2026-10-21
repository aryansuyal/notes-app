"use strict"
const STORAGE_KEY = "minimal-notes-v1";


let notes = loadNotes();
let activeNoteId = notes[0]?.id ?? null;
let toastTimer;

const elements = {
    newNote : document.getElementById('new-note-button'),
    headerNew : document.getElementById('header-new-button'),
    emptyNew : document.querySelector('#empty-new-button'),
    delNote : document.getElementById('delete-note-button'),
    searchInput: document.querySelector("#search-input"),
    notesList: document.querySelector("#notes-list"),
    emptyList: document.querySelector("#empty-list"),
    noResults: document.querySelector("#no-results"),
    allCount: document.querySelector("#all-count"),
    visibleCount: document.querySelector("#visible-count"),
    listHeading: document.querySelector("#list-heading"),
    editorEmpty: document.querySelector("#editor-empty"),
    form: document.querySelector("#note-form"),
    title: document.querySelector("#note-title"),
    content: document.querySelector("#note-content"),
    meta: document.querySelector("#note-meta"),
    wordCount: document.querySelector("#word-count"),
    saveStatus: document.querySelector("#save-status"),
    toast: document.querySelector("#toast")
};

function loadNotes(){
    try{
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    }
    catch(e){
        console.error("Could not read saved files "+e);
        return [];
    }
};

function saveNotes(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function makeID(){
    //app built for modern browsers only
    return crypto.randomUUID();
}

// displaying the date on notes
function dateFormat(dateString){
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Recent";
    return new Intl.DateTimeFormat(undefined, {
        month:"short",
        day:"numeric"
    }).format(date);
}

function getActiveNote(){
    return notes.find( note => note.id === activeNoteId) ?? null ;
}

function getFilteredNotes(){
    const query = elements.searchInput.value.trim().toLowerCase();

    return [...notes]
    .filter(
        note => `${note.title} ${note.content}`.toLowerCase().includes(query)
    );
}

function renderNotesList(){
    const filteredNotes = getFilteredNotes();
    elements.notesList.replaceChildren();

    elements.allCount.textContent = String( notes.length );
    elements.visibleCount.textContent  = 
        `${filteredNotes.length} notes`;

    elements.listHeading.textContent = elements.searchInput.value.trim() ? "Search Results" : "All Notes" ;


    for (const note of filteredNotes){
        const button = document.createElement("button");
        button.type = "button";
        button.className = `note-cards${note.id === activeNoteId ? "selected" : ""}`;


        const title = document.createElement("span");
        title.className = "note-card-title";
        title.textContent = note.title.trim() || "Untitled Note";

        const preview = document.createElement("span");
        preview.className = "note-card-preview";
        preview.textContent = note.content.trim() || "No additional text";


        const date = document.createElement("span");
        date.className = "note-card-date";
        date.textContent =`Edited ${dateFormat(note.updatedAt)}`;

        button.append(title, preview, date);

        button.addEventListener( 'click', () =>{
            activeNoteId = note.id;
            render();

        });
        elements.notesList.append(button);
        }
    
    const hasQuery = Boolean(elements.searchInput.value.trim());
    elements.emptyList.classList.toggle(
        "hidden",
        filteredNotes.length > 0 || hasQuery
    );

    elements.noResults.classList.toggle(
        "hidden",
        filteredNotes.length > 0 || !hasQuery
    );
};

function renderEditor(){
    const note = getActiveNote();
    const isOpen = Boolean(note);

    elements.editorEmpty.classList.toggle("hidden", isOpen);
    elements.form.classList.toggle("hidden", !isOpen);

    if (!note) return;

    if(
        document.activeElement !== elements.title
        &&
        document.title.value !== note.title
    ){
        elements.title.value = note.title;
    }

    if(
        document.activeElement !== elements.content
        &&
        elements.content.value !== note.content
    ){
        elements.content.value = note.content;
    }


    elements.meta.textContent =  `Created ${new Date(note.createdAt)}`;
}


function render(){
    renderNotesList();
    renderEditor();
}

function createNote(){
    const now = new Date().toISOString();

    const note = {
        id : makeID(),
        title: "",
        content: "",
        createdAt: now,
        updatedAt: now,
    };


    notes.unshift(note);
    activeNoteId = note.id;
    persistAndRender();
    elements.title.focus();
    showToast("New Note Created");
}


function updateActiveNote(field, value){
    const note = getActiveNote();

    if (!note) return;

    note[field] = value;
    note.updatedAt = new Date().toISOString;


    elements.saveStatus.innerHTML = `<span class="status-dot"></span> Saving...`;

    saveNotes();
    renderNotesList();

    //debouncing the function calls to trigger only when 250 ms gap occurs
    window.clearTimeout('toastTimer');


    toastTimer = window.setTimeout( () => {
        elements.saveStatus.innerHTML = `<span class="status-dot"></span> Saved`
    }, 250);
}

function deleteActiveNote(){
    const note = getActiveNote();

    if (!note) return;

    const title = note.title.trim() || "Untitled Note";

    if ( !window.confirm(`Delete ${title} ? This action cannot be undone.`)) return;

    notes = notes.filter(item => item.id !== note.id);

    activeNoteId = notes[0] ?.id ?? null ;

    persistAndRender();
    showToast("Note Deleted");

}


function persistAndRender(){
    saveNotes();
    render();
}

function showToast(message){
    elements.toast.textContent = message;
    elements.toast.classList.add("show");

    window.clearTimeout(toastTimer);

    toastTimer = window.setTimeout( () => {
        elements.toast.classList.remove("show");
    }, 1800 
    );
}


elements.newNote.addEventListener("click", createNote);
elements.headerNew.addEventListener("click", createNote);
elements.emptyNew.addEventListener("click", createNote);

elements.title.addEventListener("input", event => updateActiveNote("title", event.target.value));

elements.content.addEventListener("input", event => updateActiveNote("content", event.target.value));

elements.delNote.addEventListener("click", deleteActiveNote);

elements.searchInput.addEventListener("input", renderNotesList);

render();


//adding shortcuts

// document.addEventListener("keydown", event => {
//     const isMac = navigator.platform.toUpperCase().includes("MAC");
//     const modifier = isMac ? event.metaKey : event.ctrlKey;
//     const alt = isMac ? event.optionKey : event.altKey;

//     if (modifier &&
//         alt &&
//         event.key.toLowerCase() === "n") {
//         event.preventDefault();
//         createNote();
//     }
// })


// in mac meta key is cmd

document.addEventListener("keydown", event => {
    // console.log({
    //     key: event.key,
    //     code: event.code,
    //     metaKey: event.metaKey,
    //     ctrlKey: event.ctrlKey,
    //     altKey: event.altKey
    // });

    if (
        event.metaKey &&
        event.altKey &&
        event.code === "KeyN"
    ) {
        event.preventDefault();
        createNote();
    }
});
