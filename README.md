# ODA – Ciclo da Água (PhaserJS)

### Jogo web com duas fases: Drag-and-Drop e Quiz, com conteúdo carregado de jogo.json. Foco em separar dados (JSON), regras do jogo e interface.


● **Como rodar:**

VS Code Live Server: botão direito no index.html - Open with Live Server.


● **Por que PhaserJS?**

Leve e web-first, com cenas, input, tweens e áudio prontos. Facilita separar UI (Scenes) de regras puras e consumir conteúdo externo (JSON) — requisito do teste.

● **Onde editar o conteúdo**

jogo.json.

  drag: sprites/posições de targets e itens.

  phaseintros: textos de instrução.

  quiz: perguntas, alternativas (1 correta por questão), e sprites das caixas.

● **Como jogar**

1) Capa - Iniciar.

2) Drag-and-Drop: arraste as palavras para os alvos; HUD de acertos e contador de tentativas; modal final mostra o resultado.

3) Quiz: 5 questões, alternativas embaralhadas, feedback imediato (verde/vermelho); modal final consolida Drag + Quiz e permite Reiniciar.


### Histórico de commits
Commits incrementais e descritivos estão no GitHub:
https://github.com/LuizDonin/ODA-CicloAgua/commits/main
