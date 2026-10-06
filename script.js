const CONTACT_CONFIG = {
    // Add the real business details here when ready. Empty values stay hidden.
    whatsappNumber: "9182641172",
    email: "",
    instagram: "",
    facebook: ""
};

function buildWhatsAppUrl(message = "Hello Siva Global Travels, I would like to make an enquiry.") {
    const number = CONTACT_CONFIG.whatsappNumber.replace(/\D/g, "");
    return number
        ? "https://wa.me/" + number + "?text=" + encodeURIComponent(message)
        : "https://wa.me/?text=" + encodeURIComponent(message);
}

document.addEventListener("DOMContentLoaded", () => {
    const hero = document.querySelector(".hero-3d");
    const scene = document.querySelector(".earth-scene");
    const cards = document.querySelectorAll(".service-card");

    cards.forEach((card, index) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(24px)";
        const reveal = () => {
            card.style.transition = "opacity .7s ease, transform .7s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        };
        setTimeout(reveal, 250 + index * 120);
    });

    if (hero && scene && window.matchMedia("(pointer:fine)").matches) {
        hero.addEventListener("mousemove", (event) => {
            const x = (window.innerWidth / 2 - event.clientX) / 55;
            const y = (window.innerHeight / 2 - event.clientY) / 55;
            scene.style.transform = `translateY(-50%) translate(${x}px,${y}px)`;
        });
        hero.addEventListener("mouseleave", () => {
            scene.style.transform = "translateY(-50%)";
        });
    }

    const whatsappContact = document.querySelector("#whatsappContact");
    if (whatsappContact) {
        whatsappContact.href = buildWhatsAppUrl();
    }

    const channels = [
        ["#emailContact", CONTACT_CONFIG.email, value => "mailto:" + value],
        ["#instagramContact", CONTACT_CONFIG.instagram, value => value],
        ["#facebookContact", CONTACT_CONFIG.facebook, value => value]
    ];
    channels.forEach(([selector, value, makeUrl]) => {
        const link = document.querySelector(selector);
        if (link && value) {
            link.href = makeUrl(value);
            link.hidden = false;
            link.target = value.startsWith("http") ? "_blank" : "";
            link.rel = "noopener";
        }
    });

    const enquiryForm = document.querySelector("#enquiryForm");
    if (enquiryForm) {
        enquiryForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const name = document.querySelector("#enquiryName").value.trim();
            const service = document.querySelector("#enquiryService").value;
            const goal = document.querySelector("#enquiryGoal").value.trim();
            const message = document.querySelector("#enquiryMessage").value.trim();
            const note = document.querySelector("#formNote");

            const text = [
                "Hello Siva Global Travels,",
                "",
                `Name: ${name}`,
                `Service: ${service}`,
                `Destination / Goal: ${goal || "Not specified"}`,
                `Message: ${message || "Please contact me regarding this enquiry."}`
            ].join("\\n");

            window.open(buildWhatsAppUrl(text), "_blank", "noopener");
            note.textContent = CONTACT_CONFIG.whatsappNumber
                ? "WhatsApp opened for Siva Global Travels."
                : "WhatsApp opened. The business number will be connected when the official number is added.";
            if (window.innerWidth < 700) {
                note.scrollIntoView({behavior:"smooth", block:"nearest"});
            }
        });
    }
});
