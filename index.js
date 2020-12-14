#!/usr/bin/env node

const readline = require('readline');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs');
const path = require('path');

const argv = yargs(hideBin(process.argv))
  .locale('ru')
  .usage('Использование: $0 --file <название файла>')
  .example([
    ['$0 --start "log.json"', 'Начать игру и сохранять прогресс в файл log.json'],
    ['$0 --total "log.json"', 'Получить результаты игры, сохраненной в файл log.json']
  ])
  .option('start', {
    describe: 'Начать игру и сохранять прогресс в указанный JSON-файл',
    type: 'string'
  })
  .option('total', {
    describe: 'Получить результаты игры, сохраненной в указанный JSON-файл',
    type: 'string'
  })
  .conflicts('start', 'total')
  .check((argv, options) => {
    if (argv.start && /^.*\.json$/g.test(argv.start)) {
      return true;
    } else if (argv.total && /^.*\.json$/g.test(argv.total)) {
      return true;
    } else {
      throw new Error('Некорректная команда');
    }
  })
  .version(false)
  .help()
  .argv

if (argv.start) {
  startGame();
} else if (argv.total) {
  getTotal();
}

function startGame() {
  const input = readline.createInterface(process.stdin);
  const rounds = [];
  let hiddenNumber = startRound();
  input.on('line', number => {
    if (+number !== 1 && +number !== 2) {
      console.log('Введите корректное значение (1 или 2)!');
      return;
    } else if (+number === hiddenNumber) {
      console.log('Победа ваша!');
      endRound(rounds, true);
      showTotal(rounds);
      hiddenNumber = startRound();
    } else {
      console.log('Вы проиграли, в следующей раз вам обязательно повезет!');
      endRound(rounds, false);
      showTotal(rounds);
      hiddenNumber = startRound();
    }
  });
}

function getTotal() {
  const filePath = path.join(__dirname, 'logs', argv.total);
  fs.readFile(filePath, (error, roundsJson) => {
    if (error) {
      console.log('Указанный файл не найден');
      return;
    }
    const rounds = parseRoundsJson(roundsJson);
    showTotal(rounds);
  });
}

function parseRoundsJson(roundsJson) {
  try {
    return JSON.parse(roundsJson);
  } catch (error) {
    return [];
  }
}

function startRound() {
  console.log('---');
  console.log('Новый раунд, введите число:');
  return getRandomNumber(1, 3);
}

function endRound(rounds, win) {
  rounds.push({ number: rounds.length + 1, win });
  const filePath = path.join(__dirname, 'logs', argv.start);
  fs.writeFileSync(filePath, JSON.stringify(rounds));
}

function showTotal(rounds) {
  const roundsCount = rounds.length;
  const winsCount = rounds.reduce((acc, round) => {
    return round.win ? acc + 1 : acc;
  }, 0);
  const winsPercent = roundsCount ? Math.round(winsCount / roundsCount * 100) : 0;
  console.log(`Количество раундов: ${roundsCount}`);
  console.log(`Количество побед: ${winsCount} (${winsPercent}%)`);
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
