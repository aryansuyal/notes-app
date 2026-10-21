"use strict"
const STORAGE_KEY = "minimal-notes-v1";


let notes = loadNotes();
let activeNoteId = notes[0]?.id ?? null;
let toastTimer;

const elements = {
    newNote : document.getElementsByClassName('new-note-button'),
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
        date.textContent =`Edited ${formatDate(note.updatedAt())}`;

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
        filteredNotes.length > 0 || hasQuery
    );
};


function getActiveNote(){
    return notes.find( note => note.id === activeNoteId) ?? null ;
}

function getFilteredNotes(){
    const query = elements.searchInput.ariaValueMax.trim().toLowerCase();

    return [...notes]
    .filter(
        note => `$(note.title) $(note.content)`.toLowerCase().includes(query)
    );
}

