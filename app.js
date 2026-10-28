const cards = [...document.querySelectorAll('.card')];
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    cards.forEach(card => { card.hidden = category !== 'all' && card.dataset.category !== category; });
    document.querySelectorAll('.project-section').forEach(section => {
      const visible = [...section.querySelectorAll('.card')].filter(card => !card.hidden).length;
      section.querySelector('.count').textContent = String(visible).padStart(2, '0');
      section.querySelector('.count').setAttribute('aria-label', `${visible} ${visible === 1 ? 'project' : 'projects'}`);
      section.querySelector('.empty').hidden = visible > 0;
    });
    document.querySelector('#filter-status').textContent = `${cards.filter(card => !card.hidden).length} projects shown`;
  });
});
