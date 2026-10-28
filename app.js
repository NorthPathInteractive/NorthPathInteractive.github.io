const projects = [{"id":"basement-tv","name":"Basement TV","group":"completed","cat":"experiments","type":"Film & television","description":"Turn the dial. Old movies, creature features, cartoons and late-night discoveries.","url":"https://northpathinteractive.github.io/basement-tv/","action":"Watch Basement TV"},{"id":"chroma","name":"Chroma","group":"development","cat":"experiments","type":"Colour & sound","description":"A tactile playground where colour, sound and haptic feedback meet.","url":"https://northpathinteractive.github.io/dev/chroma/","action":"Play with Chroma"},{"id":"map-goblin","name":"Map Goblin","group":"development","cat":"experiments","type":"Dungeon mapping","description":"Map the unknown. A browser companion for dungeon crawlers and adventures.","url":"https://northpathinteractive.github.io/mapper/","action":"Open Map Goblin"},{"id":"headspace","name":"Headspace","group":"development","cat":"music","type":"Music & audio","description":"A late-night listening room. Explore the recordings in the audio archive.","url":"https://northpathinteractive.github.io/headspace/","action":"Explore Headspace"},{"id":"frequency-lab","name":"Frequency Lab","group":"completed","cat":"music","type":"Browser synthesizer","description":"Explore frequency, chords, panning, vibrato and sequencing. Make a little noise.","url":"https://northpathinteractive.github.io/dev/frequency-lab/","action":"Open Frequency Lab"},{"id":"wanderers-path","name":"Wanderer’s Path","group":"development","cat":"games","type":"Exploration RPG","description":"An evolving sandbox RPG about taking the long way and seeing what turns up.","url":"https://northpathinteractive.github.io/WanderersPath/","action":"Play Wanderer’s Path"},{"id":"midnight-crawl","name":"Midnight Crawl","group":"development","cat":"games","type":"Dungeon crawler · On hold","description":"Old-school dungeon crawling, after dark. Currently on hold, with a build to explore.","url":"https://northpathinteractive.github.io/dev/midnight-crawl/","action":"Explore Midnight Crawl"},{"id":"audible-rpgs","name":"Audible RPGs","group":"development","cat":"games","type":"Audio adventure","description":"A headphone-first dungeon crawler built around sound, touch and imagination.","url":"https://northpathinteractive.github.io/dev/audible-rpg/","action":"Try Audible RPGs"},{"id":"parsec-flux","name":"Parsec Flux","group":"development","cat":"games","type":"Game experiment","description":"An evolving game experiment from North Path Interactive.","url":"https://northpathinteractive.github.io/dev/parsec-flux/","action":"Try Parsec Flux"},{"id":"minstrel","name":"The Minstrel","group":"completed","cat":"comics","type":"Ongoing comic","description":"A weary professional musician keeps getting dragged into sword-and-sorcery adventures.","url":"https://minstrelgigs.substack.com","action":"Read The Minstrel"},{"id":"emberquest","name":"EmberQuest","group":"ideas","cat":"games","type":"Early game concept","description":"An early game idea, still waiting to take shape.","url":"https://northpathinteractive.github.io/projects/emberquest/","action":"Explore EmberQuest"},{"id":"wavy-gravy","name":"Wavy Gravy","group":"ideas","cat":"comics","type":"Comic concept · Coming Christmas 2026","description":"On the rain-soaked streets of New York, a clown robs Wall Street’s wealthy to support his daughter. As a detective’s obsession spirals, the supposed villain may be the only one left with a moral code. A planned 24-page comic. Coming Christmas 2026.","url":"https://northpathinteractive.github.io/projects/wavy-gravy/","action":"Explore Wavy Gravy"},{"id":"galaxy-fm","name":"GalaxyFM","group":"completed","cat":"music","type":"DJ mixes & musical exploration","description":"Browse a galaxy of DJ mixes. Every solar system is a session; every planet and moon is a track.","url":"https://galaxyfmradio.github.io/","action":"Listen to GalaxyFM"}];
const cards = [...document.querySelectorAll('.card')];
const stages = {completed: 'Completed project', development: 'In development', ideas: 'Idea yet to come'};
const dialog = document.querySelector('#details');
let opener;
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
document.querySelectorAll('[data-details]').forEach(button => {
  button.addEventListener('click', () => {
    const project = projects.find(item => item.id === button.dataset.details);
    opener = button;
    dialog.classList.toggle('comic-preview', project.id === 'wavy-gravy');
    document.querySelector('#detail-art').src = `assets/icons/${project.id}.svg`;
    document.querySelector('#detail-art').style.objectFit = project.id === 'wavy-gravy' ? 'contain' : '';
    document.querySelector('#detail-art').alt = project.id === 'wavy-gravy' ? 'Wavy Gravy on a rainy New York street — comic teaser artwork.' : '';
    document.querySelector('#detail-title').textContent = project.name;
    document.querySelector('#detail-stage').textContent = stages[project.group];
    document.querySelector('#detail-type').textContent = project.type;
    document.querySelector('#detail-description').textContent = project.description;
    const link = document.querySelector('#detail-link');
    link.hidden = !project.url;
    if (project.url) { link.href = project.url; link.textContent = project.action + ' ↗'; }
    else { link.removeAttribute('href'); link.textContent = ''; }
    document.querySelector('#idea-note').hidden = Boolean(project.url);
    dialog.showModal();
  });
});
document.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => opener?.focus());
