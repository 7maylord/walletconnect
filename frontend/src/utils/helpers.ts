export const truncateAddress = (address: string) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
