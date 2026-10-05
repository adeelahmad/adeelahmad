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
      return h('section',{className:'hero hero-plain container','aria-labelledby':'page-title'},
        h('h1',{id:'page-title'},'Adeel Ahmad'),
        h('p',{className:'intro'},D.intro),
        h('p',{className:'hero-sub'},'Most of it comes from one habit: when something I depend on doesn\u2019t make sense to me, I go and learn the layer underneath it.'));
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
          h('details',{className:'event-context'},h('summary',null,'Notes & links'),h('div',{className:'context-content'},h('p',{className:'evidence-label'},e.evidence),e.note?h('p',null,e.note):null,h('div',{className:'source-links'},e.links.map(sourceLink),h('a',{href:'#event='+e.id,className:'permalink'},'Link to this entry ',icon('arrow')))))),
        h('div',{className:'event-skills'},h('span',{className:'tiny-label'},e.kind==='Writing'?'TOPICS':'SKILLS INVOLVED'),h('div',{className:'skill-chips'},e.skills.map(s=>this.chip(s)))));
    }
    timeline() {
      const s=this.state, es=this.events(), ps=s.order==='oldest'?D.periods:D.periods.slice().reverse();
      const filtered=s.q||s.skill||s.selected.length||s.period!=='All periods'||s.track!=='All work'||s.kind!=='All types'||s.featured;
      return h('section',{'aria-labelledby':'timeline-title'},
        h('div',{className:'section-heading'},h('div',null,h('h2',{id:'timeline-title'},'Timeline')),button('Print timeline',()=>this.setState(Object.assign(this.defaults(),{view:'timeline'}),()=>setTimeout(()=>window.print(),150)),'subtle-button')),
        h('p',{className:'section-intro'},'What I worked on and when, with the skills each piece involved. Jobs are only part of it; a lot of the learning happened in side projects.'),
        this.toolbar(),h('div',{className:'track-filters','aria-label':'Filter by workstream'},['All work',...tracks].map(t=>button(t,()=>this.setState({track:t,selected:[]}),s.track===t?'filter-pill active':'filter-pill',{key:t,'aria-pressed':s.track===t}))),
        h('div',{className:'results-bar'},h('div',{'aria-live':'polite'},h('strong',null,es.length),' of ',D.events.length,' entries',s.skill?h('span',{className:'active-skill'},' / '+s.skill):null),h('div',{className:'results-actions'},h('label',{className:'check-label'},h('input',{type:'checkbox',checked:s.featured,onChange:e=>this.setState({featured:e.target.checked}),id:'highlights-only'}),'Key entries only'),filtered?button('Clear filters',()=>this.clear(),'text-button'):null)),
        h('div',{className:'timeline-body'},h('aside',{className:'period-rail','aria-label':'Timeline periods'},h('p',{className:'tiny-label'},'JUMP TO PERIOD'),ps.filter(p=>es.some(e=>e.period===p)).map(p=>h('a',{key:p,href:'#period-'+D.periods.indexOf(p)},h('span',null,p),h('small',null,es.filter(e=>e.period===p).length))),h('div',{className:'rail-note'},'Skill tags show what the work involved, not a rating.')),
          h('div',{className:'events'},!es.length?h('div',{className:'empty-state'},h('h3',null,'Nothing matches'),h('p',null,s.skill?'This skill may appear in the broader experience inventory without a separately dated public milestone.':'Try another technology or clear a filter.'),button('Show everything',()=>this.clear())):ps.map(p=>{
            let entries=es.filter(e=>e.period===p);if(!entries.length)return null;if(s.order==='newest')entries=entries.slice().reverse();
            return h('section',{className:'period-section',key:p,id:'period-'+D.periods.indexOf(p),'aria-label':p},h('div',{className:'period-heading'},h('h3',null,p),h('span',null,entries.length+' entries')),entries.map(e=>this.row(e)));
          }))));
    }
    skills() {
      const q=norm(this.state.skillQ), skills=Array.from(skillMap.keys()).sort((a,b)=>a.localeCompare(b)).filter(s=>!q||norm(s).includes(q));
      return h('section',{'aria-labelledby':'skills-title'},h('div',{className:'section-heading'},h('div',null,h('h2',{id:'skills-title'},'Skills'))),h('p',{className:'section-intro'},'Pick a skill to see where it came up.'),
        h('label',{className:'search-label skill-search'},h('span',{className:'sr-only'},'Search skills'),icon('search'),h('input',{type:'search',placeholder:'Search skills and technologies…',value:this.state.skillQ,onChange:e=>this.setState({skillQ:e.target.value}),id:'skills-search'})),
        h('div',{className:'view-switch'},button('By entry',()=>this.setState({inventory:false}),!this.state.inventory?'filter-pill active':'filter-pill',{'aria-pressed':!this.state.inventory}),button('Everything I\u2019ve used',()=>this.setState({inventory:true}),this.state.inventory?'filter-pill active':'filter-pill',{'aria-pressed':this.state.inventory})),
        this.state.inventory?h('div',{className:'inventory'},h('p',{className:'inventory-note'},'Self-reported experience across projects and periods. Some of these I used deeply, some briefly.'),Object.entries(D.domains).map(([name,values])=>{
          const list=values.filter(v=>!q||norm(v).includes(q));if(!list.length)return null;
          return h('section',{className:'domain-block',key:name},h('h3',null,name),h('div',{className:'inventory-chips'},list.map(v=>{const n=skillMap.get(v);return n?this.chip(v):h('span',{className:'inventory-chip',key:v,title:'Self-reported inventory; no separately mapped public milestone'},v)})));
        })):h('div',null,h('p',{className:'small-muted'},skills.length+' skills. The count is how many entries mention it.'),h('div',{className:'skills-grid'},skills.map(s=>{
          const es=skillMap.get(s);return button(h(Fragment,null,h('span',{className:'skill-name'},s),h('span',{className:'skill-count'},es.length+' '+(es.length===1?'entry':'entries')),h('span',{className:'skill-types'},uniq(es.map(e=>e.kind)).join(' · ')),icon('right')),()=>this.showSkills(s),'skill-card',{key:s});
        }))));
    }
    projects() {
      return h('section',{'aria-labelledby':'projects-title'},h('div',{className:'section-heading'},h('div',null,h('h2',{id:'projects-title'},'Projects'))),h('p',{className:'section-intro'},'Personal projects, separate from my employer. Many are experiments or still in progress.'),
        h('div',{className:'project-grid'},D.projects.map((p,i)=>h('article',{className:'project-card',key:p.name},h('div',{className:'project-card-top'},h('span',{className:'project-number'},String(i+1).padStart(2,'0')),h('span',{className:'project-status'},p.status)),h('h3',null,p.name),h('p',null,p.description),h('div',{className:'skill-chips'},p.skills.slice(0,5).map(s=>this.chip(s))),h('div',{className:'project-links'},button('Dated entries '+String.fromCharCode(8594),()=>this.showProject(p.eventIds),'text-button'),p.links.slice(0,1).map(sourceLink))))));
    }
    journey() {
      return h('section',{'aria-labelledby':'journey-title'},h('div',{className:'section-heading'},h('div',null,h('h2',{id:'journey-title'},'How it fits together'))),h('p',{className:'section-intro'},X.journey.intro),
        h('div',{className:'chapters'},X.journey.chapters.map((c,i)=>h('article',{className:'chapter',key:c.id,id:c.id},
          h('div',{className:'chapter-when'},h('span',{className:'chapter-number'},String(i+1).padStart(2,'0')),h('span',null,c.when)),
          h('div',{className:'chapter-main'},h('h3',null,c.title),h('p',null,c.story),h('p',{className:'chapter-learned'},h('span',{className:'tiny-label'},'WHAT CARRIED FORWARD'),c.learned),
            h('div',{className:'skill-chips'},c.skills.map(s=>skillMap.has(s)?this.chip(s,c.id+s):h('span',{className:'inventory-chip',key:s},s))),
            h('div',{className:'project-links'},button('Dated entries '+String.fromCharCode(8594),()=>this.showProject(c.eventIds),'text-button')))))));
    }
    writing() {
      return h('section',{'aria-labelledby':'writing-title'},h('div',{className:'section-heading'},h('div',null,h('h2',{id:'writing-title'},'Writing')),X.links.blog?h('a',{href:X.links.blog,target:'_blank',rel:'noopener noreferrer',className:'subtle-button'},'All posts on Medium ',icon('arrow')):null),
        h('p',{className:'section-intro'},'Things I\u2019ve written on Medium, newest first.'),
        h('div',{className:'post-grid'},X.writing.map(p=>h('article',{className:'post-card',key:p.id},
          h('span',{className:'post-date'},shortDate(p.date)),h('h3',null,h('a',{href:p.url,target:'_blank',rel:'noopener noreferrer'},p.title)),p.excerpt?h('p',null,p.excerpt):null,
          h('div',{className:'skill-chips'},p.topics.slice(0,4).map(t=>h('span',{className:'inventory-chip',key:t},t.replace(/-/g,' ')))),
          h('div',{className:'project-links'},h('a',{href:p.url,target:'_blank',rel:'noopener noreferrer',className:'source-link'},'Read on Medium ',icon('arrow')),p.eventIds.length?button('Related entry '+String.fromCharCode(8594),()=>this.showProject(p.eventIds),'text-button'):null)))));
    }
    about() {
      return h('section',{className:'about-record','aria-labelledby':'about-title'},h('h2',{id:'about-title'},'About this page'),Object.entries(D.method).map(([key,text])=>h('div',{className:'method-item',key},h('h3',null,({scope:'What is here',evidence:'Sources',dates:'Dates',skills:'Skill tags',research:'Experiments',personal:'Views'})[key]),h('p',null,text))),h('div',{className:'downloads'},button('Export public timeline JSON',()=>saveFile('adeel-ahmad-public-timeline.json',JSON.stringify(D,null,2),'application/json'),'button'),h('p',{className:'small-muted'},'The export contains only the public data shown in this edition.')));
    }
    footer() {
      return h('footer',{className:'footer container'},h('div',null,h('strong',null,'Adeel Ahmad'),h('p',null,'Melbourne, Australia.')),h('div',{className:'footer-links'},button('About this record',()=>this.view('about'),'text-button'),h('a',{href:D.github,target:'_blank',rel:'noopener noreferrer'},'GitHub ',icon('arrow')),X.links.linkedin?h('a',{href:X.links.linkedin,target:'_blank',rel:'noopener noreferrer'},'LinkedIn ',icon('arrow')):null,X.links.blog?h('a',{href:X.links.blog,target:'_blank',rel:'noopener noreferrer'},'Medium ',icon('arrow')):null,h('a',{href:'#top'},'Back to top ↑')),h('p',{className:'footer-note'},'Last updated October 2026. My own views, not my employer\u2019s.'));
    }
    render() {
      return h(Fragment,null,h('a',{className:'skip-link',href:'#workspace'},'Skip to content'),this.header(),this.hero(),h('main',{id:'workspace',className:'container workspace',tabIndex:-1},this.state.view==='journey'?this.journey():this.state.view==='writing'?this.writing():this.state.view==='timeline'?this.timeline():this.state.view==='skills'?this.skills():this.state.view==='projects'?this.projects():this.about()),this.footer());
    }
  }
  // The static page remains readable without JavaScript. React adds the filters.
  ReactDOM.render(h(Portfolio),document.getElementById('root'));
})();
