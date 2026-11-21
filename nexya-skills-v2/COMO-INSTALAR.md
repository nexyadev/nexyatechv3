# Skills NEXYA TECH v2 — como instalar no VS Code

Estas versões SUBSTITUEM as skills nexya-tech-design e nexya-tech-engineering anteriores (mesmo nome).

1. Descompacte o zip.
2. Copie a pasta `.claude` para a raiz do projeto do site (onde fica o package.json), aceitando substituir os arquivos.
   Resultado:
   - .claude/skills/nexya-tech-design/SKILL.md (+ references/motion-3d.md)
   - .claude/skills/nexya-tech-engineering/SKILL.md (+ references/privacidade-cookies.md)
3. Extensão Claude Code: as skills são detectadas sozinhas. Para valer em todos os projetos, copie as duas pastas para ~/.claude/skills/.
4. GitHub Copilot (modo Agent): também lê .claude/skills/. Se não aparecer, copie para .github/skills/.
5. Apague pastas de skills antigas soltas na raiz do projeto (ex.: nexya-elite-design/, nexya-software-engineer/) para não confundir.
6. Teste: "revisa o banner de cookies" ou "cria o fundo animado da home".
