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

    // ===== ANEXAR EVENT LISTENERS PARA MODAL DE INFO =====
    attachSponsorListeners();

    // ===== BOTÃO EXPANDIR INSTITUIÇÕES =====
    const expandAllBtn = document.getElementById('expandAllBtn');
    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', function () {
            const details = document.querySelectorAll('.institution-details');
            const btn = this;
            const expanded = btn.classList.contains('expanded');
            details.forEach(function (el) {
                el.classList.toggle('show', !expanded);
            });
            btn.classList.toggle('expanded');
            if (expanded) {
                btn.innerHTML = '<span class="expand-text">Saiba mais</span> ▼';
            } else {
                btn.innerHTML = '<span class="expand-text">Recolher</span> ▲';
                details[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    // ===== MODAL DE TODAS AS LOGOS (LÓGICA UNIFICADA) =====
    const btnAll = document.getElementById('openAllSponsors');
    const btnSticky = document.getElementById('openAllSponsorsSticky');
    const modalAll = document.getElementById('allSponsorsModal');
    const gridAll = document.getElementById('allSponsorsGrid');

    function openAllSponsorsModal() {
        if (!modalAll || !gridAll) return;
        
        const logos = Array.from(document.querySelectorAll('.sponsors-grid .sponsor-card'));
        gridAll.innerHTML = '';
        logos.forEach(card => {
            const img = card.querySelector('img');
            if (img) {
                const clone = img.cloneNode(true);
                const wrap = document.createElement('div');
                // Copia os atributos do card original para o wrapper da logo
                wrap.dataset.full = card.dataset.full;
                wrap.dataset.link = card.dataset.link;
                wrap.title = card.title;
                wrap.classList.add('sponsor-card-ref'); // Classe para identificar
                wrap.appendChild(clone);
                gridAll.appendChild(wrap);
            }
        });

        modalAll.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        modalAll.setAttribute('aria-hidden', 'false');
    }

    if (btnAll) btnAll.addEventListener('click', openAllSponsorsModal);
    if (btnSticky) btnSticky.addEventListener('click', openAllSponsorsModal);

    if (modalAll) {
        modalAll.style.overflowY = 'auto'; // Permitir scroll no modal

        // Fechar modal
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
    }

    // Abrir popup de informações ao clicar na logo dentro do modal "Todos"
    if (gridAll) {
        gridAll.addEventListener('click', function(e) {
            const cardRef = e.target.closest('.sponsor-card-ref');
            if (cardRef) {
                // Fecha o modal de todas as logos antes de abrir o de informações
                if (modalAll) {
                    modalAll.style.display = 'none';
                    modalAll.setAttribute('aria-hidden', 'true');
                }
                // Abre o modal de info usando os dados do card de referência
                openSponsorModal(e, cardRef);
            }
        });
    }
});

// ===== FUNÇÕES DE MODAL DE PATROCINADOR (INFO) =====
function openSponsorModal(e, el) {
    const src = el.dataset.full || el.querySelector('img')?.src;
    const link = el.dataset.link || null;
    const title = el.title || 'Patrocinador';
    
    const modal = document.getElementById('imgModal');
    const img = document.getElementById('imgModalContent');
    const modalTitle = document.getElementById('imgModalTitle');
    const modalLink = document.getElementById('imgModalLink');

    if (!modal || !img || !modalTitle || !modalLink) return;

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
    // Clicar nos cards da grade principal e do carrossel
    document.body.addEventListener('click', function(e) {
        const sponsorCard = e.target.closest('.sponsors-grid .sponsor-card, .sponsor-track .sponsor-card');
        if (sponsorCard && !e.target.closest('.all-sponsors-grid')) { // Evita conflito com o modal "Todos"
            e.preventDefault();
            openSponsorModal(e, sponsorCard);
        }
    });
}

// ===== FECHAR MODAL DE INFO =====
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
