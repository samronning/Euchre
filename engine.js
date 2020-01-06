//UPDATE HISTORY
let actions = ['', '', '', ''];
init = document.getElementsByClassName("history");
init[3].setAttribute("style", "font-size: 1.5rem;")
const addAction = (string) => {
  if (actions.length > 3) {
    actions.shift();
  }
  actions.push(string)
  old = document.getElementsByClassName("history");
  for (let i = 0; i < 4; i++) {
    old[i].innerHTML = actions[i];
  }
}

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
  rank;
  suit;
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
  namedSuit = () => {
    switch (this.Suit()) {
      case 'D':
        return "diamond";
      case 'S':
        return "spade";
      case 'C':
        return "club";
      case 'H':
        return "heart";
    }
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
    //Player Image
    for (let j = 0; j < 4; j++) {
      var p = document.getElementById('p' + j);
      var col_order = ['bk', 'rd', 'bk', 'rd'];
      p.getElementsByClassName('p-img')[0].src
      ="./Icons/" + col_order[j] + (this.players[j].isRobot() ? "CPU" : "Plr")+ ".svg";
    }
    this.deck = new Deck();
    this.deck.Deal(this.dealer, this.players);
  }
  Making = () => {
    let upcard = this.deck.Draw();
    var new_card = document.createElement("img");
    new_card.src = "./Cards/" + upcard.Rank() + upcard.Suit().toLowerCase() + ".svg";
    document.getElementById('cards').appendChild(new_card);
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
    this.trick_count = 0;
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
  numTricks = () => {
    return this.trick_count;
  }
}

class Human extends Player {
  constructor(id, name) {
    super(id);
    this.name = name;
    var p = document.getElementById('p' + id);
    p.getElementsByClassName('p-name')[0].innerHTML
    = this.name;
  }
  addCard = (card) => {
    this.hand.push(card);
    var new_card = document.createElement("img");
    new_card.src = "./Cards/" + card.Rank() + card.Suit().toLowerCase() + ".svg";
    document.getElementById('hand').appendChild(new_card);
  }
  isRobot = () => false;
  Take = (trump) => {
    let makeClick = document.getElementById('b_make');
    let passClick = document.getElementById('b_click');
  }
  Call = (c, upcard) => {

  }
}

class CPU extends Player {
  constructor(id) {
    super(id);
    let rand = Math.floor(Math.random()*cpu_names.length);
    while (cpu_names[rand] === '') {
      rand = Math.floor(Math.random()*cpu_names.length);
    }
    this.name = cpu_names[rand];
    cpu_names[rand] = '';
    var p = document.getElementById('p' + id);
    p.getElementsByClassName('p-name')[0].innerHTML
    = this.name;
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
      addAction(this.name + " decided to make " + upcard.namedSuit()
      + "s trump and the upcard has been given to the dealer ("
      + game.players[game.dealer].name + ").");
      return true;
    }
    addAction(this.name + " has passed.")
    return false;
  }
  Call = (c, upcard) => {
    
  }
}
cpu_names = ['Michael', 'Kevin', 'Stanley', 'Dwight',
    'Karen', 'Pam', 'Jim', 'Kelly', 'Erin', 'Oscar', 'Angela', 'Mose',
    'Ryan', 'Andy', 'Robert', 'Meredith', 'Creed', 'Phyllis', 'Roy',
    'Jan', 'Toby', 'Darryl', 'Gabe', 'Holly', 'Nellie', 'Clark', 'Pete', 'Lonny'];
let game = new Game();
game.Making();
console.log(game);

//GUI ---------------------------------------------------

//UPDATE PLAYERS
for (let i = 0; i < 4; i++) {
  var p = document.getElementById('p' + i);
  p.getElementsByClassName('p-num-cds')[0].innerHTML
  = game.players[i].handSize();

  p.getElementsByClassName('p-num-tr')[0].innerHTML
  = game.players[i].numTricks();
}

//CARDS