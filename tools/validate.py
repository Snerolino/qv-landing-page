"""Offline validation of the derived static landing. Python stdlib only."""
# XML input is limited to local versioned SVG/sitemap files, never network/user input.
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json, re, subprocess, sys, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]; SITE=ROOT/'site'
class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.tags=[]; self.ids=[]; self.refs=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs); self.tags.append((tag,a))
        if 'id' in a:self.ids.append(a['id'])
        for key in ('src','href','poster'):
            if key in a:self.refs.append((tag,key,a[key]))
    handle_startendtag=handle_starttag

def validate():
    checks=[]
    def check(name,ok,detail=None):checks.append({'name':name,'pass':bool(ok),'detail':detail})
    html=(SITE/'index.html').read_text();p=Parser();p.feed(html)
    tags=p.tags
    check('one Portuguese document',sum(t=='html' and a.get('lang')=='pt-BR' for t,a in tags)==1)
    check('unique IDs',len(p.ids)==len(set(p.ids)))
    check('no forms, embedded applications or base URL',not any(t in ('form','input','textarea','iframe','object','embed','base') for t,a in tags))
    check('no preview banner or noindex',not re.search(r'noindex|nofollow|noarchive|PRÉVIA LOCAL|qv-preview-notice|localhost|127\.0\.0\.1',html,re.I))
    csp=next(a.get('content','') for t,a in tags if a.get('http-equiv','').lower()=='content-security-policy')
    check('restrictive self-contained CSP',all(s in csp for s in ["connect-src 'none'","form-action 'none'","script-src 'self'","font-src 'self'","base-uri 'none'","object-src 'none'"]))
    check('canonical www',[(a.get('href')) for t,a in tags if a.get('rel')=='canonical']==['https://www.quemvamos.com.br/'])
    check('OG URL consistent',any(a.get('property')=='og:url' and a.get('content')=='https://www.quemvamos.com.br/' for t,a in tags))
    check('proposal and conceptual notices retained',all(s in html for s in ['proposta editorial em revisão','não formaliza políticas econômicas','não uma política definitiva','Artes conceituais ilustrativas. Não representam eventos reais.']))
    check('no fabricated event schema',not re.search(r'application/ld\+json|schema.org/Event',html))
    for tag,key,url in p.refs:
        u=urlsplit(url)
        if url.startswith('#'):check('anchor '+url,unquote(url[1:]) in p.ids)
        elif u.scheme or u.netloc:
            if tag=='a':check('app destination '+url,url in ['https://app.quemvamos.com.br/','https://app.quemvamos.com.br/cadastrar'])
            else:check('metadata-only remote URL '+url,tag=='link' and key=='href' and url=='https://www.quemvamos.com.br/')
        else:check('local reference '+url,(SITE/unquote(u.path)).is_file())
    for f in sorted(SITE.rglob('*')):
        if not f.is_file():continue
        check('safe publication path '+str(f.relative_to(SITE)),not f.is_symlink() and f.suffix in ['.html','.css','.js','.svg','.webp','.woff2','.txt','.xml'])
        if f.suffix in ['.html','.css','.svg']:
            s=f.read_text()
            for url in re.findall(r'url\([\s\"\']*([^\)\"\']+)',s):
                if url.startswith(('data:','#')):continue
                check('CSS local URL '+url,not urlsplit(url).scheme and (f.parent/unquote(url)).is_file())
            if f.suffix=='.svg':
                ET.fromstring(s)
                check('SVG no active or remote content '+f.name,not re.search(r'<script|<foreignObject|(?:href|src)=[\"\'](?:https?:|//)|\bon\w+\s*=',s,re.I))
        if f.suffix=='.js':
            s=f.read_text()
            check('no collection or persistence APIs '+f.name,not re.search(r'\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|localStorage|sessionStorage|indexedDB|serviceWorker|caches)\b|document\.cookie',re.sub(r'/\*.*?\*/|//[^\n]*','',s,flags=re.S)))
            run=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
            check('node --check '+f.name,run.returncode==0,{'command':['node','--check',str(f)],'exit':run.returncode,'output':run.stderr})
    tree=ET.parse(SITE/'sitemap.xml');locs=[e.text for e in tree.iter() if e.tag.endswith('}loc')]
    check('sitemap only real landing',locs==['https://www.quemvamos.com.br/'])
    check('robots consistent',(SITE/'robots.txt').read_text()=='User-agent: *\nAllow: /\nSitemap: https://www.quemvamos.com.br/sitemap.xml\n')
    return {'kind':'LANDING_STATIC_OFFLINE_ONLY','passed':sum(c['pass'] for c in checks),'total':len(checks),'checks':checks}
if __name__=='__main__':
    result=validate();print(json.dumps(result,ensure_ascii=False,indent=2));sys.exit(0 if result['passed']==result['total'] else 1)
