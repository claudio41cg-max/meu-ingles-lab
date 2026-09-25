export const module1Lessons=[
{id:'hello-1',title:'Hello / Hi',icon:'👋',steps:[
{type:'teach',en:'Hello!',pt:'Olá!',note:'Ouça primeiro. Depois repita em voz alta.'},
{type:'teach',en:'Hi!',pt:'Oi!',note:'Uma forma curta e informal de cumprimentar.'},
{type:'listen-choice',prompt:'Qual expressão você ouviu?',audio:'Hello!',answer:'Hello!',options:['Hello!','Goodbye!','Thank you.']},
{type:'meaning-choice',prompt:'“Hi!” significa:',answer:'Oi!',options:['Oi!','Obrigado.','Até logo.']},
{type:'speak',prompt:'Agora fale em voz alta:',target:'Hello!'},
{type:'mini-dialogue',prompt:'O robô disse “Hello!”. O que combina como resposta?',answer:'Hi!',options:['Hi!','Goodbye!','No, thank you.']}
]},
{id:'hello-2',title:'Bom dia, boa tarde e boa noite',icon:'🌅',steps:[
{type:'teach',en:'Good morning!',pt:'Bom dia!'},{type:'teach',en:'Good afternoon!',pt:'Boa tarde!'},{type:'teach',en:'Good evening!',pt:'Boa noite!'},
{type:'context-choice',prompt:'08:00 ☀️ — qual cumprimento combina?',answer:'Good morning!',options:['Good morning!','Good afternoon!','Good evening!']},
{type:'context-choice',prompt:'19:30 🌙 — qual cumprimento combina?',answer:'Good evening!',options:['Good morning!','Good afternoon!','Good evening!']},
{type:'speak',prompt:'Fale o cumprimento da manhã:',target:'Good morning!'}
]},
{id:'hello-3',title:'How are you?',icon:'💬',steps:[
{type:'teach',en:'How are you?',pt:'Como você está?'},{type:'listen-choice',prompt:'Qual pergunta você ouviu?',audio:'How are you?',answer:'How are you?',options:['How are you?','What’s your name?','Goodbye!']},{type:'speak',prompt:'Pergunte em inglês:',target:'How are you?'}
]},
{id:'hello-4',title:'Como responder',icon:'🙂',steps:[
{type:'teach',en:"I'm good.",pt:'Estou bem.'},{type:'teach',en:"I'm fine.",pt:'Estou bem.'},{type:'teach',en:"I'm okay.",pt:'Estou bem / estou legal.'},{type:'mini-dialogue',prompt:'How are you?',answer:"I'm good.",options:["I'm good.",'Goodbye!','My name is…']},{type:'speak',prompt:'Responda em voz alta:',target:"I'm fine."}
]},
{id:'hello-5',title:'Thank you / And you?',icon:'🙏',steps:[
{type:'teach',en:'Thank you.',pt:'Obrigado.'},{type:'teach',en:'And you?',pt:'E você?'},{type:'teach',en:"I'm fine, thank you. And you?",pt:'Estou bem, obrigado. E você?'},{type:'meaning-choice',prompt:'“And you?” significa:',answer:'E você?',options:['E você?','Qual é seu nome?','Até logo.']}
]},
{id:'hello-6',title:'Goodbye!',icon:'👋',steps:[
{type:'teach',en:'Goodbye!',pt:'Adeus / até logo!'},{type:'teach',en:'Bye!',pt:'Tchau!'},{type:'teach',en:'See you!',pt:'Até mais!'},{type:'context-choice',prompt:'Você está indo embora. Qual expressão combina?',answer:'See you!',options:['Hello!','See you!','Good morning!']}
]},
{id:'hello-7',title:'Desafio Hello!',icon:'🎮',steps:[
{type:'listen-choice',prompt:'Escute e escolha.',audio:'Good evening!',answer:'Good evening!',options:['Good morning!','Good evening!','Goodbye!']},{type:'meaning-choice',prompt:'How are you?',answer:'Como você está?',options:['Como você está?','Qual é seu nome?','Onde fica?']},{type:'mini-dialogue',prompt:'How are you?',answer:"I'm fine.",options:["I'm fine.",'Goodbye!','Thank you.']}
]},
{id:'hello-8',title:'Minha primeira conversa',icon:'✨',steps:[
{type:'mission',title:'Sua primeira missão',body:'Cumprimente, responda como está e se despeça usando o que aprendeu.'},{type:'mini-dialogue',prompt:'Hello!',answer:'Hi!',options:['Hi!','Goodbye!','No.']},{type:'mini-dialogue',prompt:'How are you?',answer:"I'm good.",options:["I'm good.",'Hello!','Goodbye!']},{type:'mini-dialogue',prompt:'Goodbye!',answer:'See you!',options:['See you!','How are you?','Thank you.']}
]}
];
