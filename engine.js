const compCard = (a, b) => {
  let trump = game.trump;
  if (a.isBower(trump) === 'rb') return -1;
  else if (b.isBower(trump) === 'rb') return 1;
  if (a.isBower(trump) === 'lb') return -1;
  else if (b.isBower(trump) === 'lb') return 1;
  if (a.tSuit(trump) === trump.Suit() && b.tSuit(trump) !== trump.Suit()) return -1;
  else if (b.tSuit(trump) === trump.Suit() && a.tSuit(trump) !== trump.Suit()) return 1;
  return b.Rank() - a.Rank();
}

//Card-------------------------------------------
//Rank 9 = 9, 10 = 10, 11 = Jack, 12 = Queen, 13 = King, 14 = Ace
//Suit 'H' = hearts, 'S' = spades, 'D' = diamonds, 'C' = clubs
class Card {
  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit;
  }
  Color = () => {
    if (this.suit === 'H' || this.suit === 'D') return 'red';
    return 'black';
  }
  Rank = () => {
    return this.rank;
  }
  Suit = () => {
    return this.suit;
  }
  tSuit = (trump) => {
    if (this.rank === 11 && this.Color() === trump.Color()) return trump.Suit();
    else if (this.Suit() === trump.Suit()) return trump.Suit();
    else return null;
  }
  isBower = (trump) => {
    if (this.rank === 11 && this.suit === trump.Suit()) return 'rb';
    else if (this.rank === 11 && this.Color() === trump.Color()) return 'lb';
    return 'no';
  }
}

class Deck {
  constructor() {
    this.cards = [];
    for (let r = 9; r < 15; r++) {
      this.cards.push(new Card(r, 'H'));
      this.cards.push(new Card(r, 'S'));
      this.cards.push(new Card(r, 'D'));
      this.cards.push(new Card(r, 'C'));
    }
    this.Shuffle();
  }
  Shuffle = () => {
    let cIndex = this.cards.length, temp, rand;
    while (0 !== cIndex) {
      rand = Math.floor(Math.random() * cIndex);
      cIndex -= 1;

      temp = this.cards[cIndex];
      this.cards[cIndex] = this.cards[rand];
      this.cards[rand] = temp;
    }
  }
  Draw = () => {
    return this.cards.pop();
  }
  Deal = (dealer, players) => {
      for (let i = (dealer + 1); i < dealer + 9; i+=2) {
        let a = i % 4;
        let b = (i + 1) % 4;
        if (i < 5) {
          players[a].addCard(this.Draw());
          players[a].addCard(this.Draw());
          players[b].addCard(this.Draw());
          players[b].addCard(this.Draw());
          players[b].addCard(this.Draw());
        }
        else {
          players[a].addCard(this.Draw());
          players[a].addCard(this.Draw());
          players[a].addCard(this.Draw());
          players[b].addCard(this.Draw());
          players[b].addCard(this.Draw());
        }
      }
  }
}

class Game {
  constructor(numHumans = 1, names = ['You']) {
    this.players = [];
    this.round = 0;
    this.dealer = 0;
    this.trump;
    let i = 0;
    for (; i < numHumans; i++) {
      this.players.push(new Human(i, names[i]));
    }
    while (i < 4) {
      this.players.push(new CPU(i));
      i++;
    }
    this.deck = new Deck();
    this.deck.Deal(this.dealer, this.players);
  }
  Making = () => {
    let upcard = this.deck.Draw();
    let picked = false;
    for (let i = this.dealer + 1; i < this.dealer + 5; i++) {
      if (this.players[i % 4].Take(upcard)) {
        picked = true;
        this.trump = upcard;
        break;
      }
    }
    if (!picked) {
      let c = 0;
      for (let i = this.dealer + 1; i < this.dealer + 5; i++) {
        if (this.players[i % 4].Call(c, upcard)) {
          this.trump = this.players[i % 4].Call(c, upcard);
          break;
        }
        c++;
      }
    }
    this.Sort();
  }
  Sort = () => {
    for (let i = 0; i < 4; i++) {
      this.players[i].hand.sort(compCard);
    }
  }
}
class Player {
  constructor(id) {
    this.hand = [];
    this.ID = id;
  }
  addCard = (card) => {
    this.hand.push(card);
  }
  DiscardLow = () => {
    this.hand.pop(); 
  }
  handSize = () => {
    return this.hand.length;
  }
}

class Human extends Player {
  constructor(id, name) {
    super(id);
    this.name = name;
  }
  isRobot = () => false;
  Take = (trump) => {

  }
  Call = (c, upcard) => {

  }
}

class CPU extends Player {
  constructor(id) {
    super(id);
  }
  isRobot = () => true;
  Take = (upcard) => {
    let min_face = 2;
    let min_gen = 3;
    let ct_face = 0;
    let ct_gen = 0;
    for (let i = 0; i < this.hand.length; i++) {
      if (this.hand[i].Suit() === upcard.Suit()) {
        ct_gen++;
        if (this.hand[i].Rank() > 10) ct_face++;
      }
    }
    if (ct_face >= min_face || ct_gen >= min_gen) {
      game.trump = upcard;
      this.hand.sort(compCard);
      this.DiscardLow();
      this.addCard(upcard);
      return true;
    }
    return false;
  }
  Call = (c, upcard) => {
    
  }
}
let game = new Game();
game.Making();
console.log(game);

//GUI ---------------------------------------------------

//PLAYERS
var col_order = ['bk', 'rd', 'bk', 'rd'];
for (let i = 0; i < 4; i++) {
  var p = document.getElementById('p' + i);
  p.getElementsByClassName('p-num-cds')[0].innerHTML
  = game.players[i].handSize();

  p.getElementsByClassName('p-img')[0].src
  ="./Icons/" + col_order[i] + (game.players[i].isRobot() ? "CPU" : "Plr")+ ".svg";

  p.getElementsByClassName('p-name')[0].innerHTML
  = game.players[i].isRobot() ? "CPU" : game.players[i].name;
}