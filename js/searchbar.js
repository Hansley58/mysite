  (function() {
            'use strict';

            const searchInput = document.getElementById('webcupSearchInput');
            const searchBtn = document.getElementById('webcupSearchBtn');
            const searchResults = document.getElementById('webcupSearchResults');
            const searchCount = document.getElementById('webcupSearchCount');
            const prevBtn = document.getElementById('webcupSearchPrev');
            const nextBtn = document.getElementById('webcupSearchNext');
            const clearBtn = document.getElementById('webcupSearchClear');

            let currentQuery = '';
            let matches = [];
            let activeIndex = -1;
            let noResultsTimer = null;
            let noResultsEl = null;

            const EXCLUDE_SELECTORS = [
                '.navbar', '.webcup-search-wrapper', '.webcup-search-container',
                '.webcup-search-input', '.webcup-search-btn', '.webcup-search-results',
                '.webcup-search-count', '.webcup-search-nav-btn', '.webcup-search-clear-btn',
                '.webcup-no-results', '#spinner', '.back-to-top', '.modal', '.modal-backdrop',
                '.skip-link', '.accessibility-badge', '#google_translate_element',
                '.goog-te-combo', '.goog-te-gadget', '.lang-selector', '.lang-dropdown'
            ];

            function isExcluded(el) {
                if (!el || el.nodeType !== 1) return true;
                let node = el;
                while (node && node.nodeType === 1) {
                    for (let sel of EXCLUDE_SELECTORS) {
                        if (node.matches && node.matches(sel)) return true;
                    }
                    node = node.parentElement;
                }
                return false;
            }

            function getTextNodesIn(node) {
                const textNodes = [];
                const walker = document.createTreeWalker(
                    node,
                    NodeFilter.SHOW_TEXT, {
                        acceptNode: function(n) {
                            if (!n.textContent.trim()) return NodeFilter.FILTER_REJECT;
                            let parent = n.parentElement;
                            while (parent) {
                                if (isExcluded(parent)) return NodeFilter.FILTER_REJECT;
                                parent = parent.parentElement;
                            }
                            return NodeFilter.FILTER_ACCEPT;
                        }
                    },
                    false
                );
                let n;
                while ((n = walker.nextNode())) {
                    textNodes.push(n);
                }
                return textNodes;
            }

            function escapeRegex(str) {
                return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            }

            function performSearch(query) {
                clearHighlights();
                if (!query || query.trim().length === 0) {
                    resetUI();
                    return;
                }

                const trimmed = query.trim();
                currentQuery = trimmed;
                const regex = new RegExp(escapeRegex(trimmed), 'gi');

                const textNodes = getTextNodesIn(document.body);
                const newMatches = [];
                let globalIndex = 0;

                for (let node of textNodes) {
                    const text = node.textContent;
                    let match;
                    let lastIndex = 0;
                    const parts = [];
                    let found = false;

                    regex.lastIndex = 0;
                    while ((match = regex.exec(text)) !== null) {
                        found = true;
                        const matchStart = match.index;
                        const matchEnd = matchStart + match[0].length;

                        if (matchStart > lastIndex) {
                            parts.push({ type: 'text', content: text.substring(lastIndex, matchStart) });
                        }
                        parts.push({ type: 'highlight', content: match[0], index: globalIndex++ });
                        lastIndex = matchEnd;

                        newMatches.push({
                            text: match[0],
                            fullText: text,
                            node: node,
                            startIndex: matchStart,
                            endIndex: matchEnd
                        });
                    }

                    if (lastIndex < text.length) {
                        parts.push({ type: 'text', content: text.substring(lastIndex) });
                    }

                    if (found) {
                        const fragment = document.createDocumentFragment();
                        for (let part of parts) {
                            if (part.type === 'text') {
                                if (part.content) {
                                    fragment.appendChild(document.createTextNode(part.content));
                                }
                            } else {
                                const span = document.createElement('span');
                                span.className = 'webcup-search-highlight';
                                span.textContent = part.content;
                                span.dataset.matchIndex = part.index;
                                fragment.appendChild(span);
                            }
                        }
                        node.parentNode.replaceChild(fragment, node);
                    }
                }

                if (newMatches.length === 0) {
                    showNoResults(trimmed);
                    resetUI();
                    return;
                }

                matches = newMatches;
                const highlightSpans = document.querySelectorAll('.webcup-search-highlight');
                const matchElements = [];
                for (let span of highlightSpans) {
                    const idx = parseInt(span.dataset.matchIndex, 10);
                    if (!isNaN(idx) && idx >= 0 && idx < matches.length) {
                        matchElements[idx] = span;
                    }
                }

                for (let i = 0; i < matches.length; i++) {
                    matches[i].element = matchElements[i] || null;
                }
                matches = matches.filter(m => m.element !== null);

                if (matches.length === 0) {
                    showNoResults(trimmed);
                    resetUI();
                    return;
                }

                activeIndex = 0;
                updateUI();
                scrollToMatch(0);
                searchResults.classList.add('active');
            }

            function clearHighlights() {
                const highlights = document.querySelectorAll('.webcup-search-highlight');
                for (let span of highlights) {
                    const parent = span.parentNode;
                    const text = span.textContent;
                    const textNode = document.createTextNode(text);
                    parent.replaceChild(textNode, span);
                    parent.normalize();
                }
                matches = [];
                activeIndex = -1;
                removeNoResults();
            }

            function updateUI() {
                if (matches.length === 0) {
                    resetUI();
                    return;
                }
                searchCount.textContent = `${activeIndex + 1} / ${matches.length}`;
                document.querySelectorAll('.webcup-search-highlight').forEach(el => {
                    el.classList.remove('active');
                });
                const activeEl = matches[activeIndex]?.element;
                if (activeEl) {
                    activeEl.classList.add('active');
                }
                prevBtn.disabled = activeIndex <= 0;
                nextBtn.disabled = activeIndex >= matches.length - 1;
                searchResults.classList.add('active');
            }

            function resetUI() {
                searchResults.classList.remove('active');
                searchCount.textContent = '0';
                prevBtn.disabled = true;
                nextBtn.disabled = true;
                matches = [];
                activeIndex = -1;
            }

            function navigateTo(direction) {
                if (matches.length === 0) return;
                let newIndex = activeIndex + direction;
                if (newIndex < 0) newIndex = 0;
                if (newIndex >= matches.length) newIndex = matches.length - 1;
                if (newIndex === activeIndex) return;
                activeIndex = newIndex;
                updateUI();
                scrollToMatch(activeIndex);
            }

            function scrollToMatch(index) {
                const match = matches[index];
                if (!match || !match.element) return;
                const el = match.element;
                const rect = el.getBoundingClientRect();
                const offset = 100;
                const targetY = window.scrollY + rect.top - offset;
                window.scrollTo({ top: targetY, behavior: 'smooth' });
                el.style.transition = 'box-shadow 0.15s';
                el.style.boxShadow = '0 0 0 4px var(--gold, #C9A96E), 0 0 30px rgba(201,169,110,0.5)';
                setTimeout(() => { el.style.boxShadow = ''; }, 400);
            }

            function showNoResults(query) {
                removeNoResults();
                const el = document.createElement('div');
                el.className = 'webcup-no-results';
                el.innerHTML = `
                        <i class="fas fa-search"></i>
                        <h4>No results for "${query}"</h4>
                        <p>Try a different word or check your spelling</p>
                    `;
                document.body.appendChild(el);
                noResultsEl = el;
                noResultsTimer = setTimeout(() => { removeNoResults(); }, 3500);
            }

            function removeNoResults() {
                if (noResultsTimer) { clearTimeout(noResultsTimer);
                    noResultsTimer = null; }
                if (noResultsEl) {
                    noResultsEl.classList.add('fade-out');
                    setTimeout(() => {
                        if (noResultsEl && noResultsEl.parentNode) {
                            noResultsEl.parentNode.removeChild(noResultsEl);
                        }
                        noResultsEl = null;
                    }, 350);
                }
            }

            function clearSearch() {
                searchInput.value = '';
                clearHighlights();
                resetUI();
                removeNoResults();
                searchResults.classList.remove('active');
                searchInput.focus();
                currentQuery = '';
            }

            function handleSearch() {
                const query = searchInput.value.trim();
                if (!query) { clearSearch(); return; }
                performSearch(query);
            }

            function handleKeydown(e) {
                if (e.key === 'Escape') { clearSearch();
                    e.preventDefault(); return; }
                if (e.key === 'Enter') { e.preventDefault();
                    handleSearch(); return; }
                if (e.key === 'ArrowUp' && matches.length > 0) { e.preventDefault();
                    navigateTo(-1); return; }
                if (e.key === 'ArrowDown' && matches.length > 0) { e.preventDefault();
                    navigateTo(1); return; }
            }

            function init() {
                searchBtn.addEventListener('click', handleSearch);
                searchInput.addEventListener('keydown', handleKeydown);
                prevBtn.addEventListener('click', function() { navigateTo(-1); });
                nextBtn.addEventListener('click', function() { navigateTo(1); });
                clearBtn.addEventListener('click', clearSearch);
                window.__webcupSearch = {
                    performSearch,
                    clearSearch,
                    clearHighlights,
                    matches: () => matches,
                    activeIndex: () => activeIndex
                };
                console.log('🔍 WebCup Search initialized.');
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
            } else {
                init();
            }
        })();