import chalk from 'chalk';

enum Color {
  Blue = '#4285f4',
  Green = '#34a853',
  Yellow = '#fbbc05',
  Red = '#ea4335'
}

export function fmtError(message: TemplateStringsArray, ...values: any) {
  const finalMessage = message.reduce((acc, cur, idx) => {
    acc += cur;
    acc += values[idx] !== undefined ? values[idx] : '';
    return acc;
  }, '');
  return chalk.hex(Color.Red).bold(finalMessage);
}
