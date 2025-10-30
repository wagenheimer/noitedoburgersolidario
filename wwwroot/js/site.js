// Scripts JS do site
document.addEventListener('DOMContentLoaded', function () {
    // ===== MENU MOBILE =====
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            menuToggle.classList.toggle('is-active');
            mobileNav.classList.toggle('is-active');
        });
    }

    // ===== DUPLICAR CONTEÚDO DA BARRA DE PATROCINADORES =====
    const track = document.querySelector('.sponsor-track');
    if (track) {
        const content = track.innerHTML;
        track.innerHTML += content;
    }

    // ===== ANEXAR EVENT LISTENERS (APÓS DUPLICAÇÃO) =====
    attachSponsorListeners();

    // ===== BOTÃO EXPANDIR INSTITUIÇÕES =====
    const expandAllBtn = document.getElementById('expandAllBtn');
    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', function () {
            var details = document.querySelectorAll('.institution-details');
            var btn = this;
            var expanded = btn.classList.contains('expanded');
            details.forEach(function (el) {
                if (expanded) {
                    el.classList.remove('show');
                } else {
                    el.classList.add('show');
                }
            });
            if (expanded) {
                btn.classList.remove('expanded');
                btn.innerHTML = '<span class="expand-text">Saiba mais</span> ▼';
            } else {
                btn.classList.add('expanded');
                btn.innerHTML = '<span class="expand-text">Recolher</span> ▲';
                details[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    // ===== BOTÃO VER TODOS DA BARRA INFERIOR =====
    const btnSticky = document.getElementById('openAllSponsorsSticky');
    const modalAll = document.getElementById('allSponsorsModal');
    const gridAll = document.getElementById('allSponsorsGrid');
    if (btnSticky && modalAll && gridAll) {
        btnSticky.addEventListener('click', function () {
            // Coleta todas as imagens dos patrocinadores existentes na grade principal
            const logos = Array.from(document.querySelectorAll('.sponsors-grid img'));
            gridAll.innerHTML = '';
            logos.forEach(img => {
                const clone = img.cloneNode(true);
                const wrap = document.createElement('div');
                wrap.appendChild(clone);
                gridAll.appendChild(wrap);
            });

            modalAll.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            modalAll.setAttribute('aria-hidden', 'false');
        });
    }
});

// ===== FUNÇÕES DE MODAL DE PATROCINADOR =====
function openSponsorModal(e, el) {
    const imgElement = el.querySelector('img');
    const src = imgElement ? imgElement.src : el.getAttribute('data-full') || el.getAttribute('href');
    const link = el.getAttribute('data-link') || null;
    const title = el.getAttribute('title') || 'Patrocinador';
    const modal = document.getElementById('imgModal');
    const img = document.getElementById('imgModalContent');
    const modalTitle = document.getElementById('imgModalTitle');
    const modalLink = document.getElementById('imgModalLink');

    img.src = src;
    modalTitle.textContent = title;

    if (link) {
        modalLink.style.display = 'inline-flex';
        modalLink.href = link;
    } else {
        modalLink.style.display = 'none';
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.setAttribute('aria-hidden', 'false');
}

function attachSponsorListeners() {
    const stickySponsors = document.querySelector('.sticky-sponsors');
    if (stickySponsors) {
        stickySponsors.addEventListener('click', function(e) {
            const sponsorCard = e.target.closest('.sponsor-card');
            if (sponsorCard) {
                e.preventDefault();
                openSponsorModal(e, sponsorCard);
            }
        });
    }

    const sponsorsGrid = document.querySelector('.sponsors-grid');
    if (sponsorsGrid) {
        sponsorsGrid.addEventListener('click', function(e) {
            const sponsorCard = e.target.closest('.sponsor-card');
            if (sponsorCard) {
                e.preventDefault();
                openSponsorModal(e, sponsorCard);
            }
        });
    }
}

// ===== FECHAR MODAL =====
(function () {
    const modal = document.getElementById('imgModal');

    if (modal) {
        function closeModal() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            modal.setAttribute('aria-hidden', 'true');
        }

        modal.addEventListener('click', function (e) {
            if (e.target.id === 'imgModal' || e.target.classList.contains('img-modal-close')) {
                closeModal();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeModal();
            }
        });
    }
})();

document.getElementById('openAllSponsorsSticky')?.addEventListener('click', function () {
    const modalAll = document.getElementById('allSponsorsModal');
    const gridAll = document.getElementById('allSponsorsGrid');
    if (!modalAll || !gridAll) return;

    // Coleta todas as imagens dos patrocinadores existentes na grade principal
    const logos = Array.from(document.querySelectorAll('.sponsors-grid img'));
    gridAll.innerHTML = '';
    logos.forEach(img => {
        const clone = img.cloneNode(true);
        const wrap = document.createElement('div');
        wrap.appendChild(clone);
        gridAll.appendChild(wrap);
    });

    modalAll.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modalAll.setAttribute('aria-hidden', 'false');
});

// ===== MODAL DE TODAS AS LOGOS =====
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const btnAll = document.getElementById('openAllSponsors');
        const modalAll = document.getElementById('allSponsorsModal');
        const gridAll = document.getElementById('allSponsorsGrid');

        if (!btnAll || !modalAll || !gridAll) return;

        btnAll.addEventListener('click', function() {
            // Coleta todas as imagens dos patrocinadores existentes na grade principal
            const logos = Array.from(document.querySelectorAll('.sponsors-grid img'));
            gridAll.innerHTML = '';
            logos.forEach(img => {
                const clone = img.cloneNode(true);
                const wrap = document.createElement('div');
                wrap.appendChild(clone);
                gridAll.appendChild(wrap);
            });

            modalAll.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            modalAll.setAttribute('aria-hidden', 'false');
        });

        // Fechar clicando fora ou no X
        modalAll.addEventListener('click', function(e) {
            if (e.target.id === 'allSponsorsModal' || e.target.classList.contains('img-modal-close')) {
                modalAll.style.display = 'none';
                document.body.style.overflow = '';
                modalAll.setAttribute('aria-hidden', 'true');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modalAll.style.display === 'flex') {
                modalAll.style.display = 'none';
                document.body.style.overflow = '';
                modalAll.setAttribute('aria-hidden', 'true');
            }
        });
    });
})();
