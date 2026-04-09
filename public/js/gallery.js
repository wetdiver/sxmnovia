// Global state
let allMembers = [];
let currentMember = null;
let currentStep = 0;
let selectedDate = null;
let useASAP = false;
let alternativeMembers = [];
let originalMember = null;
let selectedAlternativeId = null;

// DOM elements
const profileModalEl = document.getElementById('profileModal');
const profileModal = new bootstrap.Modal(profileModalEl);
const chatbotModalEl = document.getElementById('chatbotModal');
const chatbotModal = new bootstrap.Modal(chatbotModalEl);
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotControls = document.getElementById('chatbotControls');

// Get WhatsApp number from meta tag (set in gallery.ejs from .env)
const whatsappNumber = document.querySelector('meta[name="whatsapp-number"]')?.content || '15265574';

// Load all members on page load
fetch('/api/members')
    .then(res => res.json())
    .then(data => {
        allMembers = data;
    });

// View profile button handler
document.querySelectorAll('.view-profile').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        currentMember = allMembers.find(m => m.id === id);
        showProfileModal(currentMember);
    });
});

function showProfileModal(member) {
    const body = document.getElementById('profileModalBody');
    body.innerHTML = `
        <img src="${member.image || '/uploads/default-avatar.png'}" class="img-fluid rounded-circle mb-3" style="width:150px;height:150px;object-fit:cover;">
        <h3>${member.name}</h3>
        <p>${member.bio || 'No bio provided.'}</p>
        <div class="d-flex justify-content-between mt-3">
            <button class="btn btn-secondary" id="prevMember">◀ Previous</button>
            <button class="btn btn-primary" id="contactMember">Contact Member</button>
            <button class="btn btn-secondary" id="nextMember">Next ▶</button>
        </div>
    `;
    profileModal.show();

    // Navigation
    const currentIndex = allMembers.findIndex(m => m.id === member.id);
    document.getElementById('prevMember').onclick = () => {
        const newIndex = (currentIndex - 1 + allMembers.length) % allMembers.length;
        currentMember = allMembers[newIndex];
        showProfileModal(currentMember);
    };
    document.getElementById('nextMember').onclick = () => {
        const newIndex = (currentIndex + 1) % allMembers.length;
        currentMember = allMembers[newIndex];
        showProfileModal(currentMember);
    };
    document.getElementById('contactMember').onclick = () => {
        profileModal.hide();
        startChatbot(currentMember);
    };
}

function startChatbot(member) {
    // Reset state
    currentStep = 0;
    selectedDate = null;
    useASAP = false;
    alternativeMembers = [];
    originalMember = member;
    selectedAlternativeId = null;

    chatbotMessages.innerHTML = '';
    chatbotControls.innerHTML = '';

    chatbotModal.show();
    botSay(`Would you like to arrange a meeting with ${member.name}?`);
    addYesNoButtons(() => proceedToStep1(true), () => {
        botSay("No problem. Feel free to browse other members.");
        setTimeout(() => chatbotModal.hide(), 2000);
    });
}

function proceedToStep1(agreed) {
    if (!agreed) return;
    currentStep = 1;
    botSay("You must be 18 or older. Are you 18+?");
    addYesNoButtons(() => {
        // Age verification (session)
        fetch('/api/verify-age', { method: 'POST' }).then(() => {
            currentStep = 2;
            botSay("When would you like to schedule the meeting?");
            addDatePickerButtons();
        });
    }, () => {
        botSay("Sorry, you must be 18 or older to use this service.");
        setTimeout(() => chatbotModal.hide(), 2000);
    });
}

function addDatePickerButtons() {
    const container = chatbotControls;
    container.innerHTML = `
        <button class="btn btn-primary me-2" id="asapBtn">ASAP</button>
        <input type="date" id="datePicker" class="form-control d-inline-block w-auto">
        <button class="btn btn-success ms-2" id="confirmDateBtn">Confirm</button>
    `;
    document.getElementById('asapBtn').onclick = () => {
        useASAP = true;
        selectedDate = null;
        botSay("We might not be able to guarantee " + originalMember.name + " within 60 minutes. Would you like us to suggest someone else?");
        addYesNoButtons(() => showAlternatives(), () => continueWithOriginal());
    };
    document.getElementById('confirmDateBtn').onclick = () => {
        const date = document.getElementById('datePicker').value;
        if (!date) {
            botSay("Please select a date first.");
            return;
        }
        useASAP = false;
        selectedDate = date;
        botSay(`Great! We'll arrange a meeting on ${date}.`);
        setTimeout(() => askWhatsApp(), 1000);
    };
}

function showAlternatives() {
    fetch(`/api/members/alternatives/${originalMember.id}`)
        .then(res => res.json())
        .then(alts => {
            alternativeMembers = alts;
            let html = "Choose an alternative:<br><div class='d-flex justify-content-center mt-2'>";
            alts.forEach(alt => {
                html += `<div class='text-center me-3' style='cursor:pointer' data-id='${alt.id}'>
                            <img src='${alt.image || '/uploads/default-avatar.png'}' width='80' height='80' class='rounded-circle'>
                            <div>${alt.name}</div>
                         </div>`;
            });
            html += "</div>";
            botSay(html);
            document.querySelectorAll('[data-id]').forEach(el => {
                el.onclick = () => {
                    const newId = parseInt(el.dataset.id);
                    const newMember = alternativeMembers.find(a => a.id === newId);
                    originalMember = newMember;
                    selectedAlternativeId = newId;
                    botSay(`You selected ${newMember.name}. Ready to connect via WhatsApp?`);
                    addYesNoButtons(() => finalWhatsApp(), () => chatbotModal.hide());
                };
            });
        });
}

function continueWithOriginal() {
    botSay(`OK, we'll proceed with ${originalMember.name}. Ready to connect via WhatsApp?`);
    addYesNoButtons(() => finalWhatsApp(), () => chatbotModal.hide());
}

function askWhatsApp() {
    botSay("Ready to connect via WhatsApp?");
    addYesNoButtons(() => finalWhatsApp(), () => chatbotModal.hide());
}

function finalWhatsApp() {
    const scheduleText = useASAP ? "ASAP" : (selectedDate || "date not specified");
    const message = `Meeting request with ${originalMember.name}. Schedule: ${scheduleText}. User is 18+.`;
    const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
    chatbotModal.hide();
}

// Helper functions
function botSay(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'bot-message alert alert-secondary';
    msgDiv.innerHTML = text;
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function addYesNoButtons(yesCallback, noCallback) {
    chatbotControls.innerHTML = `
        <button class="btn btn-success me-2" id="botYes">Yes</button>
        <button class="btn btn-danger" id="botNo">No</button>
    `;
    document.getElementById('botYes').onclick = yesCallback;
    document.getElementById('botNo').onclick = noCallback;
}