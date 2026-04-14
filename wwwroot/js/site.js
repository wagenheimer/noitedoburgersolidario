// Scripts JS do site
document.addEventListener('DOMContentLoaded', function () {
    function extractErrorMessage(result, fallbackMessage) {
        if (result && typeof result === 'object') {
            if (typeof result.message === 'string' && result.message.trim()) {
                return result.message.trim();
            }

            if (typeof result.detail === 'string' && result.detail.trim()) {
                return result.detail.trim();
            }

            if (typeof result.title === 'string' && result.title.trim()) {
                return result.title.trim();
            }
        }

        return fallbackMessage;
    }

    function closeModalElement(modalElement) {
        if (!modalElement) {
            return;
        }

        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // ===== SCROLL REVEAL =====
    const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
    if (revealEls.length) {
        if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.10, rootMargin: '0px 0px -32px 0px' });
            revealEls.forEach(function (el) { revealObserver.observe(el); });
        } else {
            revealEls.forEach(function (el) { el.classList.add('is-visible'); });
        }
    }

    // ===== MENU MOBILE =====
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            menuToggle.classList.toggle('is-active');
            mobileNav.classList.toggle('is-active');
        });
    }

    // ===== SPOTLIGHT DAS INSTITUIÇÕES (TOPO) =====
    (function initInstitutionsSpotlight() {
        const spotlightRoot = document.querySelector('[data-institutions-rotator]');
        const cards = Array.from(document.querySelectorAll('.opening-institution-card[data-inst]'));

        if (!spotlightRoot || !cards.length) {
            return;
        }

        const panels = Array.from(spotlightRoot.querySelectorAll('.spotlight-panel[data-spotlight]'));
        const dots = Array.from(spotlightRoot.querySelectorAll('.spotlight-dot[data-inst]'));
        const prevButton = spotlightRoot.querySelector('[data-spotlight-prev]');
        const nextButton = spotlightRoot.querySelector('[data-spotlight-next]');
        const progressBars = Array.from(spotlightRoot.querySelectorAll('[data-spotlight-progress]'));

        if (!panels.length) {
            return;
        }

        const ids = cards.map(function (card) {
            return card.dataset.inst;
        });

        let activeIndex = 0;
        let rotationTimer = null;
        let progressFrame = null;
        let rotationStartTime = 0;
        const intervalMs = 5200;

        function setActive(institutionId) {
            const nextIndex = ids.indexOf(institutionId);
            if (nextIndex === -1) {
                return;
            }

            activeIndex = nextIndex;

            cards.forEach(function (card) {
                const isActive = card.dataset.inst === institutionId;
                card.classList.toggle('is-active', isActive);
                card.setAttribute('aria-pressed', String(isActive));
            });

            panels.forEach(function (panel) {
                const isActive = panel.dataset.spotlight === institutionId;
                panel.classList.toggle('is-active', isActive);
            });

            dots.forEach(function (dot) {
                const isActive = dot.dataset.inst === institutionId;
                dot.classList.toggle('is-active', isActive);
                dot.setAttribute('aria-selected', String(isActive));
                dot.setAttribute('tabindex', isActive ? '0' : '-1');
            });

            progressBars.forEach(function (bar) {
                const isActive = bar.dataset.instProgress === institutionId;
                bar.classList.toggle('is-active', isActive);
                if (!isActive) {
                    bar.style.width = '0%';
                }
            });
        }

        function goToStep(step) {
            activeIndex = (step + ids.length) % ids.length;
            setActive(ids[activeIndex]);
        }

        function setProgressState(elapsedMs) {
            const clampedElapsed = Math.max(0, Math.min(elapsedMs, intervalMs));
            const percent = (clampedElapsed / intervalMs) * 100;

            progressBars.forEach(function (bar) {
                if (bar.classList.contains('is-active')) {
                    bar.style.width = String(percent) + '%';
                }
            });
        }

        function stopProgressAnimation() {
            if (progressFrame) {
                window.cancelAnimationFrame(progressFrame);
                progressFrame = null;
            }
        }

        function animateProgress() {
            if (!rotationTimer) {
                return;
            }

            const elapsed = Date.now() - rotationStartTime;
            setProgressState(elapsed);
            progressFrame = window.requestAnimationFrame(animateProgress);
        }

        function stopRotation() {
            if (rotationTimer) {
                window.clearInterval(rotationTimer);
                rotationTimer = null;
            }

            stopProgressAnimation();
        }

        function startRotation() {
            stopRotation();

            rotationStartTime = Date.now();
            setProgressState(0);

            rotationTimer = window.setInterval(function () {
                activeIndex = (activeIndex + 1) % ids.length;
                setActive(ids[activeIndex]);

                rotationStartTime = Date.now();
                setProgressState(0);
            }, intervalMs);

            animateProgress();
        }

        cards.forEach(function (card) {
            card.addEventListener('click', function () {
                setActive(card.dataset.inst);
                startRotation();
            });
        });

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setActive(dot.dataset.inst);
                startRotation();
            });
        });

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                goToStep(activeIndex - 1);
                startRotation();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                goToStep(activeIndex + 1);
                startRotation();
            });
        }

        spotlightRoot.addEventListener('mouseenter', stopRotation);
        spotlightRoot.addEventListener('mouseleave', startRotation);
        spotlightRoot.addEventListener('focusin', stopRotation);
        spotlightRoot.addEventListener('focusout', startRotation);

        setActive(ids[0]);
        startRotation();
    })();

    // ===== DUPLICAR CONTEÚDO DA BARRA DE PATROCINADORES =====
    const track = document.querySelector('.sponsor-track');
    if (track) {
        const content = track.innerHTML;
        track.innerHTML += content;
    }

    // ===== GARANTIR DESTINOS REAIS NOS CARDS CLICÁVEIS =====
    document.querySelectorAll('.sponsors-grid .sponsor-card').forEach(function (card) {
        const targetHref = (card.dataset.link || card.dataset.full || '').trim();

        if (!targetHref) {
            return;
        }

        card.setAttribute('href', targetHref);

        if (/^(https?:)?\/\//i.test(targetHref) || /^https:/i.test(targetHref)) {
            card.setAttribute('target', '_blank');
            card.setAttribute('rel', 'noopener noreferrer');
        }
    });

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
        if (!modalAll || !gridAll) {
            return;
        }

        const logos = Array.from(document.querySelectorAll('.sponsors-grid .sponsor-card'));
        gridAll.innerHTML = '';

        logos.forEach(function (card) {
            const img = card.querySelector('img');
            if (!img) {
                return;
            }

            const wrap = document.createElement('div');
            wrap.dataset.full = card.dataset.full || img.getAttribute('src') || '';
            wrap.dataset.link = (card.dataset.link || '').trim();
            wrap.title = card.title;
            wrap.tabIndex = 0;
            wrap.setAttribute('role', 'button');
            wrap.setAttribute('aria-label', card.title || img.alt || 'Abrir patrocinador');
            wrap.classList.add('sponsor-card-ref');

            card.classList.forEach(function (className) {
                if (className !== 'sponsor-card') {
                    wrap.classList.add(className);
                }
            });

            const imageContainer = card.querySelector('.sponsor-image-container');
            if (imageContainer) {
                wrap.appendChild(imageContainer.cloneNode(true));
            } else {
                wrap.appendChild(img.cloneNode(true));
            }

            gridAll.appendChild(wrap);
        });

        modalAll.style.display = 'flex';
        modalAll.scrollTop = 0;
        document.body.style.overflow = 'hidden';
        modalAll.setAttribute('aria-hidden', 'false');
    }

    if (btnAll) {
        btnAll.addEventListener('click', openAllSponsorsModal);
    }

    if (btnSticky) {
        btnSticky.addEventListener('click', openAllSponsorsModal);
    }

    if (modalAll) {
        modalAll.style.overflowY = 'auto';

        modalAll.addEventListener('click', function (e) {
            if (e.target.id === 'allSponsorsModal' || e.target.classList.contains('img-modal-close')) {
                closeModalElement(modalAll);
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modalAll.style.display === 'flex') {
                closeModalElement(modalAll);
            }
        });
    }

    if (gridAll) {
        gridAll.addEventListener('click', function (e) {
            const cardRef = e.target.closest('.sponsor-card-ref');
            if (!cardRef) {
                return;
            }

            closeModalElement(modalAll);
            openSponsorModal(e, cardRef);
        });

        gridAll.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter' && e.key !== ' ') {
                return;
            }

            const cardRef = e.target.closest('.sponsor-card-ref');
            if (!cardRef) {
                return;
            }

            e.preventDefault();
            closeModalElement(modalAll);
            openSponsorModal(e, cardRef);
        });
    }

    const contactForm = document.getElementById('contact-form');
    const contactStatus = document.getElementById('contact-form-status');

    if (contactForm && contactStatus) {
        contactForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const formData = new FormData(contactForm);
            const payload = {
                name: String(formData.get('name') || '').trim(),
                email: String(formData.get('email') || '').trim(),
                phone: String(formData.get('phone') || '').trim(),
                message: String(formData.get('message') || '').trim()
            };

            if (!payload.name || !payload.email || !payload.phone || !payload.message) {
                contactStatus.textContent = 'Preencha nome, email, telefone e mensagem.';
                contactStatus.dataset.state = 'error';
                return;
            }

            if (submitButton) {
                submitButton.disabled = true;
            }

            contactStatus.textContent = 'Enviando mensagem...';
            contactStatus.dataset.state = 'loading';

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const responseText = await response.text();
                let result = null;

                if (responseText) {
                    try {
                        result = JSON.parse(responseText);
                    } catch (parseError) {
                        if (response.ok) {
                            throw new SyntaxError('O servidor respondeu de forma inválida.');
                        }

                        throw new Error('O servidor não conseguiu processar sua mensagem agora. Tente novamente em instantes ou fale conosco no WhatsApp.');
                    }
                }

                if (!response.ok) {
                    throw new Error(extractErrorMessage(result, 'Não foi possível enviar sua mensagem agora.'));
                }

                contactForm.reset();
                contactStatus.textContent = extractErrorMessage(result, 'Mensagem enviada com sucesso. Em breve entraremos em contato.');
                contactStatus.dataset.state = 'success';
            } catch (error) {
                const errorMessage = error instanceof SyntaxError
                    ? 'O servidor respondeu de forma inválida. Tente novamente em instantes ou fale conosco no WhatsApp.'
                    : error instanceof TypeError
                        ? 'Não foi possível conectar ao servidor agora. Tente novamente em instantes ou fale conosco no WhatsApp.'
                        : error instanceof Error && error.message
                            ? error.message
                            : 'Não foi possível enviar sua mensagem agora.';

                contactStatus.textContent = errorMessage;
                contactStatus.dataset.state = 'error';
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                }
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
    // O modal permanece apenas para visualização dedicada; os cards principais seguem seus links reais.
    document.body.addEventListener('click', function(e) {
        const sponsorCard = e.target.closest('.sponsor-track .sponsor-card');
        if (sponsorCard && !e.target.closest('.all-sponsors-grid')) {
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
