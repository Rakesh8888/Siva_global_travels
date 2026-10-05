document.addEventListener("DOMContentLoaded", () => {

    const cards = document.querySelectorAll(".service-card");

    cards.forEach((card, index) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(30px)";

        setTimeout(() => {
            card.style.transition = "0.7s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, index * 150);
    });

    const hero = document.querySelector(".hero");

    if (hero) {
        hero.addEventListener("mousemove", (event) => {

            const x = (window.innerWidth / 2 - event.clientX) / 40;
            const y = (window.innerHeight / 2 - event.clientY) / 40;

            hero.style.backgroundPosition =
                `${50 + x}% ${50 + y}%`;
        });
    }

});
