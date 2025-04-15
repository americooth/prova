class Entidade {
    constructor(x, y, largura, altura, cor) {
        this.x = x;
        this.y = y;
        this.largura = largura;
        this.altura = altura;
        this.cor = cor;
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
    constructor(canvas) {
        super(canvas.width / 2 - 25, canvas.height - 60, 50, 50, 'white');
        this.canvas = canvas;
        this.velocidade = 5;
    }

    mover(direcao) {
        if (direcao === 'esquerda' && this.x > 0) this.x -= this.velocidade;
        if (direcao === 'direita' && this.x + this.largura < this.canvas.width) this.x += this.velocidade;
    }

    atirar() {
        return new Projetil(this.x + this.largura / 2 - 2.5, this.y, 5, 15, 'red', -7);
    }

    desenhar(ctx) {
        ctx.fillStyle = this.cor;
        ctx.beginPath();
        ctx.moveTo(this.x + this.largura / 2, this.y);
        ctx.lineTo(this.x, this.y + this.altura);
        ctx.lineTo(this.x + this.largura, this.y + this.altura);
        ctx.closePath();
        ctx.fill();
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

    desenhar(ctx) {
        ctx.fillStyle = this.cor;
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
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

    desenhar(ctx) {
        ctx.fillStyle = this.cor;
        ctx.beginPath();
        ctx.arc(this.x + this.largura / 2, this.y + this.altura / 2, this.largura / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Jogo {
    constructor(canvasId, imagemFundoSrc) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.imagemFundo = new Image();
        this.imagemFundo.src = imagemFundoSrc;

        this.jogador = new Jogador(this.canvas);
        this.projeteis = [];
        this.aliens = [];
        this.teclas = {};
        this.pontuacao = 0;
        this.gameOver = false;

        this.adicionarEventos();
        this.imagemFundo.onload = () => this.loop();
    }

    adicionarEventos() {
        document.addEventListener('keydown', (e) => {
            this.teclas[e.key.toLowerCase()] = true;
            if (e.code === 'Space') {
                this.projeteis.push(this.jogador.atirar());
            }
        });

        document.addEventListener('keyup', (e) => {
            this.teclas[e.key.toLowerCase()] = false;
        });
    }

    atualizar() {
        if (this.teclas['a']) this.jogador.mover('esquerda');
        if (this.teclas['d']) this.jogador.mover('direita');

        this.projeteis.forEach((p, i) => {
            p.atualizar();
            if (p.y + p.altura < 0) this.projeteis.splice(i, 1);
        });

        this.aliens.forEach((alien, ai) => {
            alien.atualizar();

            if (alien.colidiuCom(this.jogador) || alien.y + alien.altura >= this.canvas.height) {
                this.gameOver = true;
            }

            this.projeteis.forEach((proj, pi) => {
                if (proj.colidiuCom(alien)) {
                    this.aliens.splice(ai, 1);
                    this.projeteis.splice(pi, 1);
                    this.pontuacao += 10;
                }
            });
        });

        if (Math.random() < 0.02) {
            let x = Math.random() * (this.canvas.width - 40);
            this.aliens.push(new Alien(x, -40));
        }
    }

    desenharPontuacao() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Pontuação: ${this.pontuacao}`, 10, 30);
    }

    desenhar() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.imagemFundo, 0, 0, this.canvas.width, this.canvas.height);

        this.jogador.desenhar(this.ctx);
        this.projeteis.forEach(p => p.desenhar(this.ctx));
        this.aliens.forEach(a => a.desenhar(this.ctx));
        this.desenharPontuacao();
    }

    loop() {
        if (!this.gameOver) {
            this.atualizar();
            this.desenhar();
            requestAnimationFrame(() => this.loop());
        } else {
            this.ctx.fillStyle = 'red';
            this.ctx.font = '50px Arial';
            this.ctx.fillText("GAME OVER", this.canvas.width / 2 - 150, this.canvas.height / 2);
        }
    }
}


new Jogo('JogoCanvas', 'fundo.jpg');
