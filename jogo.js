const canvas = document.getElementById('JogoCanvas');
const ctx = canvas.getContext('2d');

class Entidade {
    constructor(x, y, largura, altura, cor) {
        this.x = x;
        this.y = y;
        this.largura = largura;
        this.altura = altura;
        this.cor = cor;
    }

    desenhar() {
        ctx.fillStyle = this.cor;
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
    }

    colidiuCom(outro) {
        return (
            this.x < outro.x + outro.largura &&
            this.x + this.largura > outro.x &&
            this.y < outro.y + outro.altura &&
            this.y + this.altura > outro.y
        );
    }
}

class Jogador extends Entidade {
    constructor() {
        super(canvas.width / 2 - 25, canvas.height - 60, 50, 50, 'blue');
        this.velocidade = 5;
    }

    mover(direcao) {
        if (direcao === 'esquerda' && this.x > 0) this.x -= this.velocidade;
        if (direcao === 'direita' && this.x + this.largura < canvas.width) this.x += this.velocidade;
    }

    atirar() {
        return new Projetil(this.x + this.largura / 2 - 2.5, this.y, 5, 15, 'yellow', -7);
    }
}

class Projetil extends Entidade {
    constructor(x, y, largura, altura, cor, velocidade) {
        super(x, y, largura, altura, cor);
        this.velocidade = velocidade;
    }

    atualizar() {
        this.y += this.velocidade;
    }
}

class Alien extends Entidade {
    constructor(x, y) {
        super(x, y, 40, 40, 'green');
        this.velocidade = 1.5;
    }

    atualizar() {
        this.y += this.velocidade;
    }
}


const jogador = new Jogador();
let projeteis = [];
let aliens = [];
let teclas = {};
let gameOver = false;
let pontuacao = 0;


document.addEventListener('keydown', (e) => {
    teclas[e.key.toLowerCase()] = true;
    if (e.code === 'Space') {
        projeteis.push(jogador.atirar());
    }
});

document.addEventListener('keyup', (e) => {
    teclas[e.key.toLowerCase()] = false;
});


function atualizar() {
    
    if (teclas['a']) jogador.mover('esquerda');
    if (teclas['d']) jogador.mover('direita');

    
    projeteis.forEach((p, i) => {
        p.atualizar();
        if (p.y + p.altura < 0) projeteis.splice(i, 1);
    });

    
    aliens.forEach((alien, ai) => {
        alien.atualizar();

        
        if (alien.colidiuCom(jogador) || alien.y + alien.altura >= canvas.height) {
            gameOver = true;
        }

        
        projeteis.forEach((proj, pi) => {
            if (proj.colidiuCom(alien)) {
                aliens.splice(ai, 1);
                projeteis.splice(pi, 1);
                pontuacao += 10;
            }
        });
    });

    
    if (Math.random() < 0.02) {
        let x = Math.random() * (canvas.width - 40);
        aliens.push(new Alien(x, -40));
    }
}

function desenharPontuacao() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Pontuação: ${pontuacao}`, 10, 30);
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    jogador.desenhar();
    projeteis.forEach(p => p.desenhar());
    aliens.forEach(a => a.desenhar());
    desenharPontuacao();
}

function loop() {
    if (!gameOver) {
        atualizar();
        desenhar();
        requestAnimationFrame(loop);
    } else {
        ctx.fillStyle = 'red';
        ctx.font = '50px Arial';
        ctx.fillText("GAME OVER", canvas.width / 2 - 150, canvas.height / 2);
    }
}

loop();
