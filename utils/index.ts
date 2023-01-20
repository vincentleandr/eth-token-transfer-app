export const truncateAddress = (address: string) => {
  const trimmedHead = address.slice(0, 6);
  const trimmedTail = address.slice(-1 * 4, address.length);

  return [trimmedHead, trimmedTail].join('...');
};
