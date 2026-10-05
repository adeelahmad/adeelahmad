/* Public portfolio UI. The data object contains publication copy only. */
'use strict';
(function () {
  const h = React.createElement;
  const Fragment = React.Fragment || function Fragment(props) { return props.children; };
  const D = window.PUBLIC_TIMELINE;
  if (!D || !Array.isArray(D.events)) throw new Error('Public timeline data is unavailable.');
  const uniq = values => Array.from(new Set(values));
  const norm = value => String(value || '').normalize('NFKD').toLowerCase();
  const X = window.SITE_EXTRAS || {journey:{intro:'',chapters:[]}, writing:[], links:{}};
  const VIEWS = ['journey','timeline','skills','projects','writing'];
  const byId = new Map(D.events.map(e => [e.id, e]));
  const shortDate = iso => new Date(iso+'T00:00:00Z').toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  const skillMap = new Map();
  D.events.forEach(e => e.skills.forEach(s => {
    if (!skillMap.has(s)) skillMap.set(s, []);
    skillMap.get(s).push(e);
  }));
  const tracks = ['AI & agents', 'Research', 'Systems', 'Security', 'Developer tools', 'Cloud', 'Products', 'Leadership', 'Career'];
  const kinds = uniq(D.events.map(e => e.kind)).sort();
  const icon = name => h('span', {className: 'symbol', 'aria-hidden': 'true'}, ({arrow:'↗', right:'→', close:'×', plus:'+', search:'⌕', back:'←'})[name] || '');
  const button = (label, click, cls = 'button', props = {}) => h('button', Object.assign({type:'button', className:cls, onClick:click}, props), label);
  const sourceLink = (l, i) => h('a', {key:l.url+i, href:l.url, target:'_blank', rel:'noopener noreferrer', className:'source-link'},l.label,' ',icon('arrow'));
  const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function emphasized(text, query) {
    if (!query || query.length < 2) return text;
    const pieces = String(text).split(new RegExp('('+escapeRegExp(query)+')', 'gi'));
    return pieces.map((part, i) => norm(part) === norm(query) ? h('mark', {key:i}, part) : part);
  }
  function saveFile(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], {type:type+';charset=utf-8'}));
    const a = document.createElement('a'); a.href=url; a.download=name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  class Portfolio extends React.Component {
    constructor(props) {
      super(props);
      this.state = {view:'journey', q:'', period:'All periods', track:'All work', kind:'All types', skill:'', selected:[], featured:false, order:'oldest', skillQ:'', inventory:false};
      this.onHash = this.onHash.bind(this);
    }
    componentDidMount() {
      window.addEventListener('hashchange',this.onHash);
      this.onHash();
      window.__PUBLIC_TIMELINE_READY__ = true;
    }
    componentWillUnmount() { window.removeEventListener('hashchange',this.onHash); }
    defaults() { return {q:'',period:'All periods',track:'All work',kind:'All types',skill:'',selected:[],featured:false}; }
    onHash() {
      const hash = location.hash.slice(1);
      if (hash.startsWith('event=')) {
        const id = decodeURIComponent(hash.slice(6));
        if (byId.has(id)) this.setState(Object.assign(this.defaults(),{view:'timeline',selected:[id]}),()=>this.scroll());
      } else if ([...VIEWS,'about'].includes(hash)) this.setState({view:hash},()=>this.scroll());
    }
    scroll() { const el=document.getElementById('workspace'); if(el) el.scrollIntoView({block:'start'}); }
    view(view) {
      if (location.hash !== '#'+view) location.hash=view;
      this.setState(Object.assign(this.defaults(),{view,skillQ:''}),()=>this.scroll());
    }
    showEvent(id) {
      if(location.hash !== '#event='+id) location.hash='event='+id;
      this.setState(Object.assign(this.defaults(),{view:'timeline',selected:[id]}),()=>this.scroll());
    }
    showSkills(skill) {
      this.setState(Object.assign(this.defaults(),{view:'timeline',skill}),()=>this.scroll());
    }
    showProject(ids) { this.setState(Object.assign(this.defaults(),{view:'timeline',selected:ids}),()=>this.scroll()); }
    clear() {
      this.setState(this.defaults());
      if(location.hash.startsWith('#event=')) {
        try { history.replaceState(null,'',location.pathname+location.search+'#timeline'); } catch (_) { /* file: URLs may restrict history changes. */ }
      }
    }
    events() {
      const s=this.state;
      return D.events.filter(e =>
        (s.period==='All periods'||e.period===s.period) &&
        (s.track==='All work'||e.track===s.track) &&
        (s.kind==='All types'||e.kind===s.kind) &&
        (!s.skill||e.skills.includes(s.skill)) &&
        (!s.selected.length||s.selected.includes(e.id)) &&
        (!s.featured||e.featured) &&
        (!s.q||norm([e.date,e.title,e.body,e.track,e.kind,...e.skills].join(' ')).includes(norm(s.q)))
      );
    }
    chip(s, key) { return button(s,()=>this.showSkills(s),'skill-chip',{key:key||s,title:'Find milestones using '+s}); }
    header() {
      return h('header',{className:'topbar'},h('div',{className:'container topbar-inner'},
        h('a',{href:'#top',className:'wordmark','aria-label':'Adeel Ahmad, back to top'},h('span',{className:'monogram','aria-hidden':'true'},'aa'),h('span',null,'Adeel Ahmad')),
        h('nav',{'aria-label':'Portfolio sections'},VIEWS.map(v=>button(v[0].toUpperCase()+v.slice(1),()=>this.view(v),'nav-link',{key:v,'aria-current':this.state.view===v?'page':undefined}))),
        h('a',{href:D.github,target:'_blank',rel:'noopener noreferrer',className:'github-link'},'GitHub ',icon('arrow'))));
    }
    hero() {
      const headings = ['Before ChatGPT','An AI delivery workflow','A multi-agent prototype','Early voice-AI testing','Declared agent boundaries'];
      const dates = ['JUN 2021','JUN 2023','OCT 2023','2024','JUL 2026'];
      return h('section',{className:'hero container','aria-labelledby':'page-title'},
        h('div',{className:'hero-top'},h('p',{className:'eyebrow'},'PERSONAL ENGINEERING PORTFOLIO'),h('p',{className:'location'},D.location)),
        h('div',{className:'hero-copy'},h('div',null,h('h1',{id:'page-title'},'Systems.',h('br'),'AI. ',h('span',null,'Security.')),
          h('p',{className:'intro'},D.intro),h('div',{className:'hero-meta'},h('span',null,'Early foundations — October 2026'),h('span',{className:'edition'},D.edition))),
          h('aside',{className:'hero-note'},h('span',{className:'tiny-label'},'THE CONNECTING IDEA'),h('p',null,'Understand the system.',h('br'),'Build the missing piece.'),h('div',{className:'hero-stat'},h('strong',null,D.events.length),h('span',null,'milestones, from experiments to delivery')),h('div',{className:'hero-stat'},h('strong',null,D.projects.length),h('span',null,'selected projects and contributions')))),
        h('div',{className:'milestone-strip','aria-label':'Key milestones'},D.highlights.map((id,i)=>{
          const e=byId.get(id);return button(h(Fragment,null,h('span',{className:'highlight-date'},dates[i]),h('span',{className:'highlight-title'},headings[i]),h('span',{className:'highlight-type'},e.kind,' ',icon('right'))),()=>this.showEvent(id),'highlight-card',{key:id,'aria-label':dates[i]+': '+headings[i]});
        })));
    }
    toolbar() {
      const s=this.state;
      return h('div',{className:'toolbar'},
        h('label',{className:'search-label'},h('span',{className:'sr-only'},'Search the timeline'),icon('search'),h('input',{type:'search',placeholder:'Search a project, technology or idea…',value:s.q,onChange:e=>this.setState({q:e.target.value,selected:[]}),id:'timeline-search'})),
        h('label',{className:'select-label'},h('span',{className:'sr-only'},'Filter by period'),h('select',{value:s.period,onChange:e=>this.setState({period:e.target.value,selected:[]}),id:'period-filter'},['All periods',...D.periods].map(p=>h('option',{key:p},p)))),
        h('label',{className:'select-label'},h('span',{className:'sr-only'},'Filter by milestone type'),h('select',{value:s.kind,onChange:e=>this.setState({kind:e.target.value,selected:[]}),id:'kind-filter'},['All types',...kinds].map(p=>h('option',{key:p},p)))),
        button(s.order==='oldest'?'Oldest first ↓':'Newest first ↑',()=>this.setState({order:s.order==='oldest'?'newest':'oldest'}),'sort-button',{'aria-label':'Reverse timeline order'}));
    }
    row(e) {
      return h('article',{className:'event-row'+(e.featured?' is-featured':''),key:e.id,id:e.id,'data-event-id':e.id},
        h('div',{className:'event-date'},h('span',{className:'timeline-dot','aria-hidden':'true'}),h('span',null,e.date)),
        h('div',{className:'event-main'},h('div',{className:'event-kicker'},h('span',{className:'track-label'},e.track),h('span',{className:'type-badge type-'+e.kind.toLowerCase()},e.kind)),h('h3',null,emphasized(e.title,this.state.q)),h('p',null,emphasized(e.body,this.state.q)),
          h('details',{className:'event-context'},h('summary',null,'Context & references'),h('div',{className:'context-content'},h('p',{className:'evidence-label'},e.evidence),e.note?h('p',null,e.note):null,h('div',{className:'source-links'},e.links.map(sourceLink),h('a',{href:'#event='+e.id,className:'permalink'},'Link to milestone ',icon('arrow')))))),
        h('div',{className:'event-skills'},h('span',{className:'tiny-label'},e.kind==='Proposed'?'DESIGN / RELEVANT SKILLS':e.kind==='Access'?'ACCESS / INTEREST':e.kind==='Writing'?'TOPICS DISCUSSED':'TECHNOLOGIES / SKILLS'),h('div',{className:'skill-chips'},e.skills.map(s=>this.chip(s)))));
    }
    timeline() {
      const s=this.state, es=this.events(), ps=s.order==='oldest'?D.periods:D.periods.slice().reverse();
      const filtered=s.q||s.skill||s.selected.length||s.period!=='All periods'||s.track!=='All work'||s.kind!=='All types'||s.featured;
      return h('section',{'aria-labelledby':'timeline-title'},
        h('div',{className:'section-heading'},h('div',null,h('p',{className:'eyebrow'},'THE WORK, IN CONTEXT'),h('h2',{id:'timeline-title'},'Technology timeline')),button('Print timeline',()=>this.setState(Object.assign(this.defaults(),{view:'timeline'}),()=>setTimeout(()=>window.print(),150)),'subtle-button')),
        h('p',{className:'section-intro'},'A start-to-end view of things built, ideas explored and lessons carried forward. Employment is one part of the record.'),
        this.toolbar(),h('div',{className:'track-filters','aria-label':'Filter by workstream'},['All work',...tracks].map(t=>button(t,()=>this.setState({track:t,selected:[]}),s.track===t?'filter-pill active':'filter-pill',{key:t,'aria-pressed':s.track===t}))),
        h('div',{className:'results-bar'},h('div',{'aria-live':'polite'},h('strong',null,es.length),' of ',D.events.length,' milestones',s.skill?h('span',{className:'active-skill'},' / '+s.skill):null),h('div',{className:'results-actions'},h('label',{className:'check-label'},h('input',{type:'checkbox',checked:s.featured,onChange:e=>this.setState({featured:e.target.checked}),id:'highlights-only'}),'Highlights only'),filtered?button('Clear filters',()=>this.clear(),'text-button'):null)),
        h('div',{className:'timeline-body'},h('aside',{className:'period-rail','aria-label':'Timeline periods'},h('p',{className:'tiny-label'},'JUMP TO PERIOD'),ps.filter(p=>es.some(e=>e.period===p)).map(p=>h('a',{key:p,href:'#period-'+D.periods.indexOf(p)},h('span',null,p),h('small',null,es.filter(e=>e.period===p).length))),h('div',{className:'rail-note'},'Tags link the technology to the work—not to a proficiency score.')),
          h('div',{className:'events'},!es.length?h('div',{className:'empty-state'},h('h3',null,'No matching milestones'),h('p',null,s.skill?'This skill may appear in the broader experience inventory without a separately dated public milestone.':'Try another technology or clear a filter.'),button('Show all milestones',()=>this.clear())):ps.map(p=>{
            let entries=es.filter(e=>e.period===p);if(!entries.length)return null;if(s.order==='newest')entries=entries.slice().reverse();
            return h('section',{className:'period-section',key:p,id:'period-'+D.periods.indexOf(p),'aria-label':p},h('div',{className:'period-heading'},h('h3',null,p),h('span',null,entries.length+' milestones')),entries.map(e=>this.row(e)));
          }))));
    }
    skills() {
      const q=norm(this.state.skillQ), skills=Array.from(skillMap.keys()).sort((a,b)=>a.localeCompare(b)).filter(s=>!q||norm(s).includes(q));
      return h('section',{'aria-labelledby':'skills-title'},h('div',{className:'section-heading'},h('div',null,h('p',{className:'eyebrow'},'FOLLOW THE EVIDENCE'),h('h2',{id:'skills-title'},'Skills, connected to work'))),h('p',{className:'section-intro'},'Choose a skill to see its associated milestones. Built work, experiments, proposals and access milestones stay distinguishable.'),
        h('label',{className:'search-label skill-search'},h('span',{className:'sr-only'},'Search skills'),icon('search'),h('input',{type:'search',placeholder:'Search skills and technologies…',value:this.state.skillQ,onChange:e=>this.setState({skillQ:e.target.value}),id:'skills-search'})),
        h('div',{className:'view-switch'},button('Milestone map',()=>this.setState({inventory:false}),!this.state.inventory?'filter-pill active':'filter-pill',{'aria-pressed':!this.state.inventory}),button('Broader experience inventory',()=>this.setState({inventory:true}),this.state.inventory?'filter-pill active':'filter-pill',{'aria-pressed':this.state.inventory})),
        this.state.inventory?h('div',{className:'inventory'},h('p',{className:'inventory-note'},'Self-reported experience across projects and periods. Inclusion is not a claim of equal depth, current mastery or a dated public example for every item.'),Object.entries(D.domains).map(([name,values])=>{
          const list=values.filter(v=>!q||norm(v).includes(q));if(!list.length)return null;
          return h('section',{className:'domain-block',key:name},h('h3',null,name),h('div',{className:'inventory-chips'},list.map(v=>{const n=skillMap.get(v);return n?this.chip(v):h('span',{className:'inventory-chip',key:v,title:'Self-reported inventory; no separately mapped public milestone'},v)})));
        })):h('div',null,h('p',{className:'small-muted'},skills.length+' skill labels. Counts represent related records, not years of experience or a rating.'),h('div',{className:'skills-grid'},skills.map(s=>{
          const es=skillMap.get(s);return button(h(Fragment,null,h('span',{className:'skill-name'},s),h('span',{className:'skill-count'},es.length+' '+(es.length===1?'milestone':'milestones')),h('span',{className:'skill-types'},uniq(es.map(e=>e.kind)).join(' · ')),icon('right')),()=>this.showSkills(s),'skill-card',{key:s});
        }))));
    }
    projects() {
      return h('section',{'aria-labelledby':'projects-title'},h('div',{className:'section-heading'},h('div',null,h('p',{className:'eyebrow'},'TOOLS, SYSTEMS & EXPERIMENTS'),h('h2',{id:'projects-title'},'Selected project work'))),h('p',{className:'section-intro'},'A project index for the public timeline. Working drafts, prototypes, fork development and merged contributions are labelled separately.'),
        h('div',{className:'project-grid'},D.projects.map((p,i)=>h('article',{className:'project-card',key:p.name},h('div',{className:'project-card-top'},h('span',{className:'project-number'},String(i+1).padStart(2,'0')),h('span',{className:'project-status'},p.status)),h('h3',null,p.name),h('p',null,p.description),h('div',{className:'skill-chips'},p.skills.slice(0,5).map(s=>this.chip(s))),h('div',{className:'project-links'},button('View milestones '+String.fromCharCode(8594),()=>this.showProject(p.eventIds),'text-button'),p.links.slice(0,1).map(sourceLink))))));
    }
    journey() {
      return h('section',{'aria-labelledby':'journey-title'},h('div',{className:'section-heading'},h('div',null,h('p',{className:'eyebrow'},'HOW I GOT HERE'),h('h2',{id:'journey-title'},'The journey'))),h('p',{className:'section-intro'},X.journey.intro),
        h('div',{className:'chapters'},X.journey.chapters.map((c,i)=>h('article',{className:'chapter',key:c.id,id:c.id},
          h('div',{className:'chapter-when'},h('span',{className:'chapter-number'},String(i+1).padStart(2,'0')),h('span',null,c.when)),
          h('div',{className:'chapter-main'},h('h3',null,c.title),h('p',null,c.story),h('p',{className:'chapter-learned'},h('span',{className:'tiny-label'},'WHAT I TOOK FROM IT'),c.learned),
            h('div',{className:'skill-chips'},c.skills.map(s=>skillMap.has(s)?this.chip(s,c.id+s):h('span',{className:'inventory-chip',key:s},s))),
            h('div',{className:'project-links'},button('See the '+c.eventIds.length+' milestones '+String.fromCharCode(8594),()=>this.showProject(c.eventIds),'text-button')))))));
    }
    writing() {
      return h('section',{'aria-labelledby':'writing-title'},h('div',{className:'section-heading'},h('div',null,h('p',{className:'eyebrow'},'NOTES ALONG THE WAY'),h('h2',{id:'writing-title'},'Writing')),X.links.blog?h('a',{href:X.links.blog,target:'_blank',rel:'noopener noreferrer',className:'subtle-button'},'All posts on Medium ',icon('arrow')):null),
        h('p',{className:'section-intro'},'Posts from my blog on Medium, newest first. Where a post belongs to a milestone, it links back to the timeline.'),
        h('div',{className:'post-grid'},X.writing.map(p=>h('article',{className:'post-card',key:p.id},
          h('span',{className:'post-date'},shortDate(p.date)),h('h3',null,h('a',{href:p.url,target:'_blank',rel:'noopener noreferrer'},p.title)),p.excerpt?h('p',null,p.excerpt):null,
          h('div',{className:'skill-chips'},p.topics.slice(0,4).map(t=>h('span',{className:'inventory-chip',key:t},t.replace(/-/g,' ')))),
          h('div',{className:'project-links'},h('a',{href:p.url,target:'_blank',rel:'noopener noreferrer',className:'source-link'},'Read on Medium ',icon('arrow')),p.eventIds.length?button('Related milestone '+String.fromCharCode(8594),()=>this.showProject(p.eventIds),'text-button'):null)))));
    }
    about() {
      return h('section',{className:'about-record','aria-labelledby':'about-title'},h('p',{className:'eyebrow'},'HOW TO READ THIS RECORD'),h('h2',{id:'about-title'},'Dates, evidence and scope'),Object.entries(D.method).map(([key,text])=>h('div',{className:'method-item',key},h('h3',null,({scope:'What is included',evidence:'What supports an entry',dates:'How dates work',skills:'How skill tags work',research:'Research and prototypes',personal:'Personal authorship'})[key]),h('p',null,text))),h('div',{className:'downloads'},button('Export public timeline JSON',()=>saveFile('adeel-ahmad-public-timeline.json',JSON.stringify(D,null,2),'application/json'),'button'),h('p',{className:'small-muted'},'The export contains only the public data shown in this edition.')));
    }
    footer() {
      return h('footer',{className:'footer container'},h('div',null,h('strong',null,'Adeel Ahmad'),h('p',null,'Systems, applied AI and security.')),h('div',{className:'footer-links'},button('About this record',()=>this.view('about'),'text-button'),h('a',{href:D.github,target:'_blank',rel:'noopener noreferrer'},'GitHub ',icon('arrow')),X.links.linkedin?h('a',{href:X.links.linkedin,target:'_blank',rel:'noopener noreferrer'},'LinkedIn ',icon('arrow')):null,X.links.blog?h('a',{href:X.links.blog,target:'_blank',rel:'noopener noreferrer'},'Medium ',icon('arrow')):null,h('a',{href:'#top'},'Back to top ↑')),h('p',{className:'footer-note'},'Public edition · Record through 5 October 2026. Personal views and work; no employer endorsement is implied.'));
    }
    render() {
      return h(Fragment,null,h('a',{className:'skip-link',href:'#workspace'},'Skip to content'),this.header(),this.hero(),h('main',{id:'workspace',className:'container workspace',tabIndex:-1},this.state.view==='journey'?this.journey():this.state.view==='writing'?this.writing():this.state.view==='timeline'?this.timeline():this.state.view==='skills'?this.skills():this.state.view==='projects'?this.projects():this.about()),this.footer());
    }
  }
  // The static page remains readable without JavaScript. React adds the filters.
  ReactDOM.render(h(Portfolio),document.getElementById('root'));
})();
