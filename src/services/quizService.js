import blocksData from '../data/blocks.json';

function emulateDelay(data, delay = 400) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(data)), delay);
  });
}

export async function fetchBlocks() {
  return emulateDelay(blocksData.blocks);
}

export async function fetchBlockById(blockId) {
  const block = blocksData.blocks.find((item) => item.id === blockId) || null;
  return emulateDelay(block);
}
