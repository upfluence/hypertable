const NUMERIC_ONLY = /^\d$/i;
const AUTHORIZED_INPUTS = [
  'Backspace',
  'Delete',
  'ArrowLeft',
  'ArrowRight',
  'Tab',
  'Shift',
  'Control',
  'ArrowUp',
  'ArrowDown'
];

export function onlyNumeric(event: KeyboardEvent): void {
  _ensureValueFormat(event, NUMERIC_ONLY);
}

function _ensureValueFormat(event: KeyboardEvent, regexp: RegExp): void {
  if (['c', 'v', 'a'].includes(event.key) && (event.metaKey || event.ctrlKey)) {
    return;
  }

  if (![regexp.test(event.key)].every((c) => c) && !AUTHORIZED_INPUTS.find((key: string) => key === event.key)) {
    event.preventDefault();
  }
}
