# Quem Vamos? — origem estática derivada

Este repositório é uma **nova origem editável estática derivada**, não a recuperação do código-fonte histórico. Destino: `Snerolino/qv-landing-page`; publicação somente de `site/` no Pages `quemvamos`, domínio canônico `https://www.quemvamos.com.br/`.

## Proveniência

A candidata visual aprovada foi derivada do HTML/CSS/JS/assets capturados da landing anterior e refinada localmente. Ponto de partida: prévia `landing-derivada-preview-20261106/site`, 37 arquivos, manifesto `revision-manifesto-20261107/site-manifest.json` SHA256 `4bc453be17475aa0e8e0709d524995c54d4b7998b26ebfb3569e8dba7317e89e`. Não há cadeia comprovada até uma fonte histórica React/Vite. Não foi feita troca de framework. Assets e fonte Nunito local foram preservados byte a byte; este trabalho não atesta licença de terceiros além da proveniência herdada. Evidências e fontes documentais ficam fora do repositório.

Adaptações de produção: remoção do aviso local e robots noindex, retirada dos estilos exclusivos do aviso, referências editoriais a “esta página” em vez de “esta prévia”, canonical/OG estáticos e robots/sitemap com somente a URL real da landing. Nomes `preview.css`/`preview.js` são mantidos por estabilidade das referências; contêm ajustes de layout e acessibilidade usados na página de produção, não um guard de ambiente. Comentários históricos em outros estilos descrevem a origem, não o estado publicado.

A landing não consulta programação real, não coleta nem persiste dados e não contém formulários, analytics ou serviços externos. CSP mantém `connect-src 'none'`, `form-action 'none'` e recursos locais. As cenas são ilustrações conceituais; não são eventos reais nem prova dos fluxos do app. Manifesto e compromissos econômicos/jurídicos continuam propostas em revisão, não políticas formalizadas. Aprovação visual humana não substitui revisão técnica.

## Editar e validar

Sem gerenciador de pacotes ou dependências novas. Python 3.12+ (stdlib) e Node.js 22+ para o parser de sintaxe JavaScript:

```sh
python3 -B tools/validate.py
```

O comando verifica HTML, referências, IDs/âncoras, URLs canônicas, CSP, ausência de coleta/persistência/formulários, SVG/XML estáticos e sintaxe dos três scripts. JSON no stdout e exit não zero em falha. XML é lido somente de arquivos locais versionados, sem entrada de rede ou conteúdo não confiável. Para inspecionar localmente, servir `site/` em loopback; QA de navegador requer perfis descartáveis e evidências separadas. Não usar o servidor do app.

`.github/workflows/static-validation.yml` propõe validação estática em push/PR. Não faz deploy, não requer secrets e não certifica browser, Auth, banco/RLS ou CI antes do primeiro push. Na admissão, GitHub estava vazio, sem branches/rulesets/workflows. O publicador deve revalidar essa condição, registrar `FIRST_COMMIT_BOOTSTRAP` se ainda aplicável e aguardar os checks do SHA real antes de Direct Upload. Nunca inventar PR contra base inexistente.

## Limites de publicação

Somente `site/` vai ao Pages, sem Functions, workers, bindings, secrets, DNS ou configuração do app. Cada publicação exige hash revisado, checks do commit exato e readback público/API separado. Não publicar automaticamente nem usar SHA do app. Rollback não ensaiado. QA local não certifica deploy, Auth, social, onboarding ou fluxos end-to-end. Revisão estética posterior das imagens é um arco separado: não modificar a candidata congelada sem novo hash e revisão.
