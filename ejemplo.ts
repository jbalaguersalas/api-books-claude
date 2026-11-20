// 1. El contrato: "algo que sabe enviar un mensaje"
interface Sender {
  send(to: string, text: string): void;
}

interface Dice {
  roll(): number 
}
interface Language {
  hello(name: string): string
}

function greet(name: string, language: Language): string {
  return language.hello(name);
}

class RandomDice implements Dice {
  roll() {
    return Math.floor(Math.random()* 6)+1;
  }
}

class LoadedDice implements Dice {
  roll() {
  return 6 ;
}
}

function play(player: string, dice: Dice) {
  console.log(`${player} saca un  ${dice.roll()}`);
}
// 2. Dos formas de cumplir el contrato
class EmailSender implements Sender {
  send(to: string, text: string) {
    console.log(`Email para ${to}: ${text}`);
  }
}

class SmsSender implements Sender {
  send(to: string, text: string) {
    console.log(`SMS para ${to}: ${text}`);
  }
}

class WhatsAppSender implements Sender {
   send(to: string, text: string) {
    console.log(`WhatsApp para ${to}: ${text}`)
   }
}



welcome("Marta", new WhatsAppSender());


play("Ana", new RandomDice());
play("Luis", new LoadedDice());

// 3. welcome ya no elige: recibe el sender por parámetro
function welcome(name: string, sender: Sender) {
  sender.send(name, "¡Bienvenido!");
}

welcome("Ana", new EmailSender());
welcome("Luis", new SmsSender());