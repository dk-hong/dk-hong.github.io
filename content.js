'use strict';

// Edit research and publication content here. Unverified details stay as prompts.
const scholarBase = 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=gZaHHFUAAAAJ&citation_for_view=gZaHHFUAAAAJ:';
const publications = [
  { id:'mixup', year:2025, category:'quantization', title:'Enhancing Generalization in Data-Free Quantization via Mixup-Class Prompting', authors:'J. Park, C. Lee, Y. Choi, S. Park, D. Hong, J. Choi', venue:'IEEE/CVF International Conference on Computer Vision Workshops (ICCVW)', citation:'zYLM7Y9cAGgC' },
  { id:'dance-plus', year:2025, category:'codesign', title:'DANCE++: Differentiable Accelerator/Network Co-Exploration With Hard Constraints and Data-Free Training for Real-World Scenarios', authors:'K. Choi, D. Hong, H. Lee, J. Yu, N. Park, Y. Kim, J. Lee', venue:'IEEE Transactions on Computer-Aided Design of Integrated Circuits and Systems (TCAD)', citation:'UeHWp8X0CEIC' },
  { id:'continual', year:2023, category:'continual', title:'Online Boundary-Free Continual Learning by Scheduled Data Prior', authors:'H. Koh, M. Seo, J. Bang, H. Song, D. Hong, S. Park, J. W. Ha, J. Choi', venue:'International Conference on Learning Representations (ICLR)', citation:'qjMakFHDy7sC' },
  { id:'hdx', year:2022, category:'codesign', title:'Enabling Hard Constraints in Differentiable Neural Network and Accelerator Co-Exploration', authors:'D. Hong, K. Choi, H. Y. Lee, J. Yu, N. Park, Y. Kim, J. Lee', venue:'ACM/IEEE Design Automation Conference (DAC)', citation:'d1gkVwhDpl0C' },
  { id:'teacher', year:2022, category:'quantization', title:"It’s All In the Teacher: Zero-Shot Quantization Brought Closer to the Teacher", authors:'K. Choi, H. Y. Lee, D. Hong, J. Yu, N. Park, Y. Kim, J. Lee', venue:'IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)', citation:'9yKSN-GCB0IC' },
  { id:'dance', year:2021, category:'codesign', title:'DANCE: Differentiable Accelerator/Network Co-Exploration', authors:'K. Choi*, D. Hong*, H. Yoon*, J. Yu, Y. Kim, J. Lee', venue:'ACM/IEEE Design Automation Conference (DAC)', citation:'2osOgNQ5qMEC' },
  { id:'qimera', year:2021, category:'quantization', title:'Qimera: Data-Free Quantization With Synthetic Boundary Supporting Samples', authors:'K. Choi, D. Hong, N. Park, Y. Kim, J. Lee', venue:'Advances in Neural Information Processing Systems (NeurIPS)', citation:'u5HHmVD_uO8C' },
];

const selectedResearch = [
  { id:'hdx', short:'HDX', badge:'DAC 2022', role:'First author', description:'Differentiable co-exploration of neural network architectures and hardware accelerators under hard constraints.', contribution:'As first author, I carried out the overall implementation and experiments. I implemented the method’s core gradient manipulation, using gradients of hardware metrics to adjust network architecture gradients in neural architecture search (NAS). These metrics include latency, energy consumption, and area, and can be optimized jointly. This connects hardware constraints directly to the architecture optimization process.' },
  { id:'dance', short:'DANCE', badge:'DAC 2021', role:'Co-first author', description:'Joint exploration of neural network architectures and hardware accelerator designs through differentiable optimization.', contribution:'As co-first author, I trained the differentiable Evaluator Network using a latency, energy consumption, and area dataset generated with Timeloop [1] and Accelergy [2]. I conducted the associated experiments, evaluating the trained network as part of the differentiable co-exploration framework.', references:[{title:'Timeloop: A Systematic Approach to DNN Accelerator Evaluation',authors:'Angshuman Parashar et al.',venue:'ISPASS 2019',url:'https://accelergy.mit.edu/timeloop.pdf'},{title:'Accelergy: An Architecture-Level Energy Estimation Methodology for Accelerator Designs',authors:'Yannan Nellie Wu, Joel S. Emer, and Vivienne Sze',venue:'ICCAD 2019',url:'https://accelergy.mit.edu/paper.pdf'}] },
  { id:'qimera', short:'Qimera', badge:'NeurIPS 2021', role:'Co-author', description:'Data-free model quantization using synthetic boundary-supporting samples.', contribution:'I conducted controlled experiments comparing how samples with different confidence levels affect quantized-model accuracy, providing empirical support for the paper’s motivation to generate boundary-supporting samples. I also conducted additional experiments to support the paper’s claims.' },
];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function externalLink(label, url, className) {
  const link = element('a', className, label);
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

// These original, schematic diagrams explain paper concepts, not measured results.
function conceptFigure(id) {
  // Conventional axes: hardware cost increases rightward, accuracy increases upward.
  const constraint = 136;
  const paretoPoints = [50, 74, 98, 122, 130, 146, 170, 190, 214, 238, 262]
    .map(value => ({ x: value, y: 28 + 105 * Math.exp(-(value - 50) / 74) }));
  const feasiblePoints = paretoPoints.filter(point => point.x < constraint).sort((a, b) => a.x - b.x);
  const selectedPoint = feasiblePoints[feasiblePoints.length - 1];
  const searchPoints = paretoPoints.filter(point => point.x >= selectedPoint.x).sort((a, b) => b.x - a.x);
  const pathFor = points => points.map((point, index) => `${index ? 'L' : 'M'}${point.x} ${point.y.toFixed(2)}`).join(' ');
  const figures = {
    hdx: {
      title: 'Find the closest feasible Pareto design',
      caption: 'Search along the Pareto frontier toward a candidate that satisfies the hardware constraint.',
      source: 'https://arxiv.org/abs/2301.09312',
      drawing: `<rect class="feasible-region" x="35" y="15" width="${constraint - 35}" height="129" rx="2" fill="#edf4ff"/>
        <path class="plot-axis" d="M35 15V144H277"/><path class="constraint-line" d="M${constraint} 15V144"/>
        <text x="45" y="125" class="diagram-muted">Feasible</text><text x="45" y="136" class="diagram-muted">region</text>
        <g class="constraint-annotation"><rect x="146" y="13" width="63" height="15" rx="3" fill="#e8f0fe"/><text x="153" y="23" class="constraint-label">Constraint</text><path d="M146 24L${constraint} 31" stroke="#5275b8" stroke-width="1"/></g>
        <path class="pareto-frontier" d="${pathFor(paretoPoints)}"/>
        <path class="concept-trace" d="${pathFor(searchPoints)}"/>
        <g class="candidate-points">${paretoPoints.map(point => `<circle cx="${point.x}" cy="${point.y.toFixed(2)}" r="3" class="${point.x < constraint ? 'feasible-candidate' : 'infeasible-candidate'}"/>`).join('')}</g>
        <circle cx="${selectedPoint.x}" cy="${selectedPoint.y.toFixed(2)}" r="8" class="concept-halo"/>
        <circle class="search-marker" r="4" transform="translate(${selectedPoint.x} ${selectedPoint.y.toFixed(2)})" fill="#527bd5"/>
        <g class="selected-annotation"><path d="M148 83L133 69" stroke="#98b2db" stroke-width=".7"/><text x="146" y="96" class="diagram-label">Selected</text></g>
        <path d="M240 43L247 69" stroke="#b9c9df" stroke-width=".7"/><text x="213" y="82" class="diagram-muted">Pareto frontier</text>
        <text x="277" y="161" text-anchor="end" class="diagram-muted">Hardware metric</text><text x="37" y="9" class="diagram-muted">Accuracy</text>`,
    },
    dance: {
      title: 'Optimize the model and its hardware together',
      caption: 'A differentiable evaluator connects network and accelerator design.',
      source: 'https://arxiv.org/abs/2009.06237',
      drawing: `<path class="flow-trace concept-trace" d="M143 116V104H76V68M157 116V104H224V68"/>
        <path class="flow-feedback concept-trace" d="M76 26V13H13V174H135V156M224 26V13H287V174H165V156"/>
        <rect class="design-box network-box" x="27" y="26" width="98" height="42" rx="6"/>
        <rect class="design-box accelerator-box" x="175" y="26" width="98" height="42" rx="6"/>
        <rect class="evaluator-box" x="83" y="116" width="134" height="40" rx="6"/>
        <text x="76" y="44" class="diagram-label centered">Network</text><text x="76" y="56" class="diagram-label centered">architecture</text>
        <text x="224" y="44" class="diagram-label centered">Accelerator</text><text x="224" y="56" class="diagram-label centered">architecture</text>
        <text x="150" y="134" class="diagram-label centered">Differentiable</text><text x="150" y="146" class="diagram-label centered">evaluator</text>
        <text x="150" y="93" class="diagram-muted centered">Joint design updates</text>
        <text x="150" y="194" class="diagram-label centered">Chosen architectures</text>`,
    },
    qimera: {
      title: 'Recover the decision boundary',
      caption: 'Synthetic boundary-supporting samples help the quantized model recover the full-precision decision boundary.',
      source: 'https://papers.nips.cc/paper_files/paper/2021/hash/7cc234202e98d2722580858573fd0817-Abstract.html',
      drawing: `<defs><pattern id="qimera-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r=".6" fill="#dce6f5"/></pattern></defs>
        <rect x="12" y="12" width="276" height="146" rx="8" fill="#f3f7fe"/>
        <rect x="12" y="12" width="276" height="146" rx="8" fill="url(#qimera-grid)"/>
        <text x="27" y="29" class="qimera-class-label">CLASS A</text><text x="231" y="145" class="qimera-class-label">CLASS B</text>
        <g class="qimera-cluster" fill="#7f9ed9">
          <ellipse cx="102" cy="45" rx="43" ry="19" fill="#e8effc" stroke="#d0def5" stroke-width=".7"/>
          <circle cx="76" cy="43" r="2.8"/><circle cx="91" cy="33" r="2.8"/><circle cx="102" cy="47" r="3.4"/><circle cx="115" cy="36" r="2.8"/><circle cx="128" cy="46" r="2.8"/><circle cx="91" cy="56" r="2.8"/><circle cx="116" cy="56" r="2.8"/>
        </g>
        <g class="qimera-cluster" fill="#79b6c6">
          <ellipse cx="215" cy="124" rx="39" ry="19" fill="#e9f5f7" stroke="#c8e3e9" stroke-width=".7"/>
          <circle cx="191" cy="122" r="2.8"/><circle cx="207" cy="112" r="2.8"/><circle cx="219" cy="127" r="3.4"/><circle cx="229" cy="115" r="2.8"/><circle cx="240" cy="126" r="2.8"/><circle cx="202" cy="136" r="2.8"/><circle cx="230" cy="135" r="2.8"/>
        </g>
        <path d="M24 93 C65 97 90 66 126 76 C167 91 188 107 223 93 C244 86 258 88 277 82" fill="none" stroke="#e5edf9" stroke-width="14" stroke-linecap="round"/>
        <path class="qimera-full-boundary" d="M24 93 C65 97 90 66 126 76 C167 91 188 107 223 93 C244 86 258 88 277 82"/>
        <path class="qimera-quantized-boundary" d="M24 97 C65 101 90 70 126 80 C167 95 188 111 223 97 C244 90 258 92 277 86"/>
        <g class="qimera-support">
          <g fill="#f8fbff" stroke="#aec3e6" stroke-width=".7"><circle cx="103" cy="70" r="7"/><circle cx="127" cy="86" r="7"/><circle cx="152" cy="80" r="7"/><circle cx="177" cy="105" r="7"/><circle cx="201" cy="90" r="7"/><circle cx="225" cy="103" r="7"/></g>
          <g fill="#e5edfc" stroke="#638ad0" stroke-width="1.2"><circle cx="103" cy="70" r="3.2"/><circle cx="152" cy="80" r="3.2"/><circle cx="201" cy="90" r="3.2"/></g>
          <g fill="#e4f1f5" stroke="#6fa6ba" stroke-width="1.2"><circle cx="127" cy="86" r="3.2"/><circle cx="177" cy="105" r="3.2"/><circle cx="225" cy="103" r="3.2"/></g>
        </g>
        <g class="qimera-support-label"><path d="M171 110L151 137H126" fill="none" stroke="#acbfda" stroke-width=".7"/><text x="27" y="140" class="diagram-muted">Synthetic support</text></g>`,
    },
  };
  const config = figures[id];
  const figure = element('figure', 'concept-figure');
  figure.dataset.concept = id;
  const heading = element('div', 'concept-heading');
  const title = element('span', 'concept-title', config.title);
  const replay = element('button', 'concept-replay', 'Replay ↺');
  replay.type = 'button';
  replay.setAttribute('aria-label', `Replay ${id === 'dance' ? 'DANCE' : id === 'hdx' ? 'HDX' : 'Qimera'} concept animation`);
  heading.append(title, replay);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', id === 'dance' ? '0 0 300 205' : '0 0 300 175');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = config.drawing;
  const caption = element('figcaption', '', config.caption);
  const note = element('div', 'concept-note', 'Concept illustration · not experimental data');
  note.append(externalLink('Source ↗', config.source));
  figure.append(heading, svg);
  if (id === 'qimera') {
    const legend = element('div', 'qimera-legend');
    legend.append(element('span', 'full-precision-key', 'Full-precision model'), element('span', 'quantized-key', 'Quantized model'));
    figure.append(legend);
  } else if (id === 'hdx') {
    const legend = element('div', 'hdx-legend');
    legend.append(element('span', 'constraint-key', 'Constraint'), element('span', 'feasible-key', 'Feasible region'));
    figure.append(legend);
    const goal = element('div', 'optimization-goal');
    goal.append(element('p', '', 'Accuracy — the higher, the better'), element('p', '', 'Hardware metric — the lower, the better'));
    figure.append(goal);
  }
  figure.append(caption, note);
  return figure;
}

const selectedRoot = document.querySelector('#selected-research');
selectedResearch.forEach((research, index) => {
  const paper = publications.find(p => p.id === research.id);
  const article = element('article', 'research-item');
  article.dataset.research = research.id;
  article.id = research.id;
  const top = element('div', 'research-top');
  top.append(element('span', 'research-index', String(index + 1).padStart(2, '0')));
  const body = element('div', 'research-body');
  const meta = element('div', 'research-meta');
  meta.append(element('span', 'venue', research.badge), element('span', 'authorship', research.role));
  const title = element('h3');
  title.append(externalLink(`${research.short} — ${paper.title.replace(new RegExp(`^${research.short}: `, 'i'), '')}`, scholarBase + paper.citation));
  const contribution = element('div', 'contribution');
  contribution.append(element('span', 'contribution-label', 'MY CONTRIBUTION'), element('p', '', research.contribution));
  if (research.detail) {
    const details = element('details');
    details.append(element('summary', '', research.detailTitle), element('p', 'contribution-extra', research.detail));
    contribution.append(details);
  }
  if (research.prompts) {
  const details = element('details');
  const summary = element('summary', '', 'Detailed contribution · To be added');
  const promptList = element('ul');
  research.prompts.forEach(prompt => promptList.append(element('li', '', prompt)));
  const extra = element('div', 'contribution-extra');
  extra.append(element('span', 'placeholder-label', 'WRITING PROMPTS · NOT YET PART OF THE CONTRIBUTION'), promptList);
  details.append(summary, extra);
  contribution.append(details);
  }
  if (research.references) {
    const references = element('details', 'research-references');
    references.append(element('summary', '', 'Tools & references'));
    const referenceList = element('ol', 'reference-list');
    research.references.forEach((reference, referenceIndex) => {
      const item = element('li');
      const referenceText = element('span');
      referenceText.append(document.createTextNode(`${reference.authors} `), externalLink(reference.title, reference.url), document.createTextNode(`. ${reference.venue}.`));
      item.append(element('span', 'reference-number', `[${referenceIndex + 1}]`), referenceText);
      referenceList.append(item);
    });
    references.append(referenceList);
    contribution.append(references);
  }
  const researchDetail = element('div', 'research-detail');
  researchDetail.append(contribution, conceptFigure(research.id));
  body.append(meta, title, element('p', 'research-description', research.description), researchDetail);
  top.append(body);
  article.append(top);
  selectedRoot.append(article);
});

function renderPublications(filter = 'all') {
  const root = document.querySelector('#publication-list');
  root.replaceChildren();
  const filtered = publications.filter(p => filter === 'all' || p.category === filter);
  const years = [...new Set(filtered.map(p => p.year))];
  years.forEach(year => {
    const group = element('div', 'publication-group');
    const yearHeading = element('h3', 'publication-year', String(year));
    const entries = element('div');
    filtered.filter(p => p.year === year).forEach(paper => {
      const article = element('article', 'publication-entry');
      article.append(externalLink(paper.title, scholarBase + paper.citation, 'publication-title'));
      const authors = element('p', 'publication-authors');
      const parts = paper.authors.split(/(D\. Hong\*?)/);
      parts.forEach(part => authors.append(/^D\. Hong/.test(part) ? element('strong', '', part) : document.createTextNode(part)));
      const venue = element('p', 'publication-venue', paper.venue);
      venue.append(externalLink('Paper ↗', scholarBase + paper.citation));
      article.append(authors, venue);
      entries.append(article);
    });
    group.append(yearHeading, entries);
    root.append(group);
  });
  document.querySelector('#filter-status').textContent = `Showing ${filtered.length} ${filter === 'all' ? '' : filter + ' '}publications.`;
  document.dispatchEvent(new CustomEvent('publications:updated'));
}
renderPublications();
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(other => {
    const active = other === button;
    other.classList.toggle('active', active);
    other.setAttribute('aria-pressed', String(active));
  });
  renderPublications(button.dataset.filter);
}));

const menuButton = document.querySelector('#menu-toggle');
const sidebar = document.querySelector('#sidebar');
function closeMenu() { sidebar.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); }
menuButton.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
document.addEventListener('keydown', event => { if(event.key === 'Escape' && sidebar.classList.contains('open')) { closeMenu(); menuButton.focus(); } });
document.querySelectorAll('.sidebar a').forEach(link => link.addEventListener('click', closeMenu));
const navLinks = [...document.querySelectorAll('nav a')];
const observer = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);
  if (!visible.length) return;
  const current = visible[0].target.id;
  navLinks.forEach(link => {
    const active = link.hash === '#' + current;
    link.classList.toggle('active', active);
    if(active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
  });
}, {rootMargin:'-10% 0px -55% 0px', threshold:0});
document.querySelectorAll('main > section').forEach(section => observer.observe(section));
document.querySelector('#copyright-year').textContent = new Date().getFullYear();
