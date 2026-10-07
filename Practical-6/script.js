// Global variables
let students = [];
let currentPage = 1;
const itemsPerPage = 6;

// DOM Elements
const status = document.getElementById("status");
const searchInput = document.getElementById("searchInput");
const yearFilter = document.getElementById("yearFilter");
const sortSelect = document.getElementById("sortSelect");
const studentCount = document.getElementById("studentCount");
const studentsContainer = document.getElementById("studentsContainer");
const pagination = document.getElementById("pagination");
const eventsContainer = document.getElementById("eventsContainer");
const faqsContainer = document.getElementById("faqsContainer");

// Fetch all JSON files
async function fetchData() {
    status.innerHTML = "Loading data...";
    try {
        const studentResponse = await fetch("students.json");
        const eventResponse = await fetch("events.json");
        const faqResponse = await fetch("faqs.json");
        if (!studentResponse.ok || !eventResponse.ok || !faqResponse.ok) {
            throw new Error("JSON file could not be loaded");
        }
        students = await studentResponse.json();
        const events = await eventResponse.json();
        const faqs = await faqResponse.json();
        displayStudents();
        displayEvents(events);
        displayFAQs(faqs);
        status.innerHTML = "Data loaded successfully ✓";
    } catch (error) {
        status.innerHTML = "Unable to load data. Check JSON files.";
        console.log(error);
    }
}

// Display Student Profiles with Search, Filter, Sort and Pagination
function displayStudents() {
    if (!students || students.length === 0) return;

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const selectedYear = yearFilter ? yearFilter.value : "all";
    const selectedSort = sortSelect ? sortSelect.value : "name";

    // 1. Search and Filter
    let filtered = students.filter(student => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm) ||
            student.course.toLowerCase().includes(searchTerm);

        const matchesYear =
            selectedYear === "all" || student.year.toString() === selectedYear;

        return matchesSearch && matchesYear;
    });

    // 2. Sort
    if (selectedSort === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (selectedSort === "cgpa-desc") {
        filtered.sort((a, b) => b.cgpa - a.cgpa);
    } else if (selectedSort === "cgpa-asc") {
        filtered.sort((a, b) => a.cgpa - b.cgpa);
    }

    // 3. Update count badge
    if (studentCount) {
        studentCount.textContent = `${filtered.length} Students`;
    }

    // 4. Pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    if (currentPage > totalPages) {
        currentPage = 1;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStudents = filtered.slice(startIndex, startIndex + itemsPerPage);

    // 5. Render Student Cards
    if (paginatedStudents.length === 0) {
        studentsContainer.innerHTML = `
            <div class="no-records">
                <p>No student records found matching your criteria.</p>
            </div>
        `;
    } else {
        studentsContainer.innerHTML = paginatedStudents.map(student => `
            <div class="student-card">
                <div class="student-header">
                    <div class="avatar">${student.name.charAt(0).toUpperCase()}</div>
                    <div class="student-identity">
                        <h3>${student.name}</h3>
                        <p class="email">${student.email}</p>
                    </div>
                </div>
                <div class="student-details">
                    <p>Course: <span>${student.course}</span></p>
                    <p>Year: <span>${student.year}</span></p>
                </div>
                <div class="student-badges">
                    <span class="badge badge-course">${student.course}</span>
                    <span class="badge badge-cgpa">CGPA ${student.cgpa}</span>
                </div>
            </div>
        `).join("");
    }

    // 6. Render Pagination controls
    renderPagination(totalPages);
}

// Render pagination buttons
function renderPagination(totalPages) {
    if (!pagination) return;
    let buttonsHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        buttonsHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    pagination.innerHTML = buttonsHTML;
}

// Change page handler
function changePage(page) {
    currentPage = page;
    displayStudents();
}

// Display Upcoming Events
function displayEvents(events) {
    if (!eventsContainer || !events) return;
    eventsContainer.innerHTML = events.map(event => `
        <div class="event-card">
            <span class="event-date">${event.date}</span>
            <h3 class="event-title">${event.title}</h3>
            <p class="event-description">${event.description}</p>
            <div class="event-meta">
                <span class="badge badge-category">${event.category}</span>
            </div>
        </div>
    `).join("");
}

// Display FAQs
function displayFAQs(faqs) {
    if (!faqsContainer || !faqs) return;
    faqsContainer.innerHTML = faqs.map(faq => `
        <div class="faq-card">
            <h4 class="faq-question">${faq.question}</h4>
            <p class="faq-answer">${faq.answer}</p>
        </div>
    `).join("");
}

// Event Listeners for Search & Filter inputs
if (searchInput) {
    searchInput.addEventListener("input", () => {
        currentPage = 1;
        displayStudents();
    });
}

if (yearFilter) {
    yearFilter.addEventListener("change", () => {
        currentPage = 1;
        displayStudents();
    });
}

if (sortSelect) {
    sortSelect.addEventListener("change", () => {
        currentPage = 1;
        displayStudents();
    });
}

// Automatically fetch data on page load
window.addEventListener("DOMContentLoaded", fetchData);
