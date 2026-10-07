export type Question =
	| { title: string; prompt: string; type: 'text'; placeholder: string }
	| { title: string; prompt: string; type: 'options'; options: string[] };

export const questions: Question[] = [
	{ title: 'O CONVITE', prompt: 'Se pudesse levar UMA coisa para colocar sobre a mesa no retiro, o que levaria?', type: 'text', placeholder: 'Pode ser qualquer coisa...' },
	{ title: 'QUEM É VOCÊ?', prompt: 'Qual dessas frases mais combina com você hoje?', type: 'options', options: ['Eu estou precisando de um recomeço.', 'Eu só quero viver algo diferente com Deus.', 'Ainda não sei exatamente o que esperar.', 'Eu estou pronto para o que vier.'] },
	{ title: 'TESTE DE SOBREVIVÊNCIA', prompt: 'São 02:17 da manhã. Alguém grita: “GALERA, TODO MUNDO PRA FORA!” Qual é sua reação?', type: 'options', options: ['Levanto na hora.', 'Pergunto “é sério?” umas 15 vezes.', 'Finjo que não ouvi.', 'Continuo dormindo.'] },
	{ title: 'UMA PALAVRA', prompt: 'Em UMA palavra, diga o que você espera encontrar nesse retiro.', type: 'text', placeholder: 'Uma palavra...' },
	{ title: 'A ESCOLHA', prompt: 'O que você mais espera viver nesse retiro?', type: 'options', options: ['Me aproximar mais de Deus', 'Viver algo novo', 'Fortalecer amizades', 'Sair da rotina'] },
	{ title: 'A PERGUNTA', prompt: 'Se você pudesse conversar com Deus sobre UMA coisa nesses dias, sobre o que seria?', type: 'text', placeholder: 'Escreva aqui. Ninguém precisa ver.' },
	{ title: 'A MESA', prompt: 'Qual palavra você quer levar com você para esses dias?', type: 'text', placeholder: 'Uma palavra' },
];